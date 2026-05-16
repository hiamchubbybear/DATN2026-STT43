using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using System;

using DoAnTotNghiep.Application.Common;
using DoAnTotNghiep.Application.Chat;
using DoAnTotNghiep.Application.Notifications;
using DoAnTotNghiep.Domain.Chat;
using DoAnTotNghiep.Domain.Users;

namespace DoAnTotNghiep.Web.Hubs;

// [Authorize] - Tạm thời bỏ để debug kết nối
public class AppHub : Hub
{
    private readonly ILogger<AppHub> _logger;
    private readonly ICurrentUserService _currentUserService;
    private readonly IChatMessageQueue _chatMessageQueue;
    private readonly IConversationRepository _conversationRepository;
    private readonly INotificationService _notificationService;
    private readonly IUserProfileRepository _userProfileRepository;
    private readonly IFraudDetectionService _fraudDetectionService;
    private readonly IContentModerationService _contentModerationService;

    public AppHub(
        ILogger<AppHub> logger, 
        ICurrentUserService currentUserService, 
        IChatMessageQueue chatMessageQueue, 
        IConversationRepository conversationRepository,
        INotificationService notificationService,
        IUserProfileRepository userProfileRepository,
        IFraudDetectionService fraudDetectionService,
        IContentModerationService contentModerationService)
    {
        _logger = logger;
        _currentUserService = currentUserService;
        _chatMessageQueue = chatMessageQueue;
        _conversationRepository = conversationRepository;
        _notificationService = notificationService;
        _userProfileRepository = userProfileRepository;
        _fraudDetectionService = fraudDetectionService;
        _contentModerationService = contentModerationService;
    }

    public override async Task OnConnectedAsync()
    {
        // Extract userId from ICurrentUserService
        var userId = _currentUserService.UserId;

        if (!string.IsNullOrEmpty(userId))
        {
            _logger.LogInformation("User connected: {UserId}, ConnectionId: {ConnectionId}", userId, Context.ConnectionId);
            
            // Add to personal group for multi-device delivery routing
            await Groups.AddToGroupAsync(Context.ConnectionId, $"User_{userId}");
        }
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = _currentUserService.UserId;

        if (!string.IsNullOrEmpty(userId))
        {
            _logger.LogInformation("User disconnected: {UserId}, ConnectionId: {ConnectionId}", userId, Context.ConnectionId);
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"User_{userId}");
        }
        await base.OnDisconnectedAsync(exception);
    }

    // 1. Messaging
    public async Task SendMessage(Guid conversationId, string receiverId, string content, string reqId)
    {
        var senderIdStr = _currentUserService.UserId;
        if (string.IsNullOrEmpty(senderIdStr) || !Guid.TryParse(senderIdStr, out var senderId)) return;

        // Fraud detection check
        var (isSpam, reason) = await _fraudDetectionService.AnalyzeMessageAsync(senderId, content);
        if (isSpam)
        {
            _logger.LogWarning("Fraud detected for User {UserId}: {Reason}", senderId, reason);
            await Clients.Caller.SendAsync("Ack", new { reqId = reqId, status = "FAILED", reason = reason });
            
            // Push Notification to warn the sender about the "scan" result
            await _notificationService.SendPushToUserAsync(senderId, "⚠️ Cảnh báo hệ thống", 
                "Tin nhắn của bạn bị chặn do nghi ngờ spam. Vui lòng tuân thủ quy tắc cộng đồng.",
                new Dictionary<string, string> { { "type", "warning" } });
            return;
        }

        // Content moderation check
        var (isInappropriate, modReason) = await _contentModerationService.ModerateTextAsync(content);
        if (isInappropriate)
        {
            _logger.LogWarning("Inappropriate content blocked from User {UserId}: {Reason}", senderId, modReason);
            await Clients.Caller.SendAsync("Ack", new { reqId = reqId, status = "FAILED", reason = modReason });

            // Push Notification to warn about inappropriate content
            await _notificationService.SendPushToUserAsync(senderId, "⚠️ Cảnh báo nội dung", 
                "Nội dung tin nhắn không phù hợp và đã bị hệ thống chặn.",
                new Dictionary<string, string> { { "type", "warning" } });
            return;
        }

        // Create ChatMessage Domain Entity
        var chatMsg = ChatMessage.CreatePlaintext(conversationId, senderIdStr, reqId, content);

        // GUARANTEE PERSISTENCE: Enqueue to background worker first!
        await _chatMessageQueue.EnqueueMessageAsync(chatMsg);

        // Update last message in conversation
        var conversation = await _conversationRepository.GetByIdAsync(conversationId);
        if (conversation != null)
        {
            conversation.UpdateLastMessage(content);
            await _conversationRepository.UpdateAsync(conversation);
        }

        try
        {
            // Immediately ACK back to the sender for idempotency & snappy UI
            await Clients.Caller.SendAsync("Ack", new { reqId = reqId, status = "SUCCESS", conversationId = conversationId });

            // Route message to all active devices of the receiver via Redis Backplane
            await Clients.Group($"User_{receiverId}").SendAsync("ReceiveMessage", new 
            { 
                senderId = senderIdStr, 
                payload = content,
                reqId = reqId,
                conversationId = conversationId,
                timestamp = chatMsg.CreatedAt
            });

            // Send Push Notification to Receiver
            if (Guid.TryParse(receiverId, out var rId))
            {
                var senderProfile = await _userProfileRepository.GetByUserIdAsync(senderId);
                if (senderProfile != null)
                {
                    await _notificationService.SendPushToUserAsync(
                        rId,
                        senderProfile.BasicInfo.DisplayName,
                        content,
                        new Dictionary<string, string> 
                        { 
                            { "type", "chat" }, 
                            { "senderId", senderIdStr }, 
                            { "conversationId", conversationId.ToString() } 
                        }
                    );
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Real-time routing failed (Redis down?). Message was still saved to DB.");
        }
    }

    // 2. WebRTC: Offer
    public async Task SendOffer(string receiverId, object sdp)
    {
        var senderId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(senderId)) return;

        try { await Clients.Group($"User_{receiverId}").SendAsync("ReceiveOffer", new { senderId, sdp }); }
        catch (Exception ex) { _logger.LogWarning(ex, "Failed to send Offer"); }
    }

    // 3. WebRTC: Answer
    public async Task SendAnswer(string callerId, object sdp)
    {
        var senderId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(senderId)) return;

        try { await Clients.Group($"User_{callerId}").SendAsync("ReceiveAnswer", new { senderId, sdp }); }
        catch (Exception ex) { _logger.LogWarning(ex, "Failed to send Answer"); }
    }

    // 4. WebRTC: ICE Candidate
    public async Task SendIceCandidate(string receiverId, object candidate)
    {
        var senderId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(senderId)) return;

        try { await Clients.Group($"User_{receiverId}").SendAsync("ReceiveIceCandidate", new { senderId, candidate }); }
        catch (Exception ex) { _logger.LogWarning(ex, "Failed to send ICE Candidate"); }
    }
}
