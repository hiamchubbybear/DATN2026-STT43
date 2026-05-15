using DoAnTotNghiep.Application.Common;
using DoAnTotNghiep.Application.Exception;
using DoAnTotNghiep.Application.Notifications;
using DoAnTotNghiep.Application.Observability;
using DoAnTotNghiep.Domain.Users;
using MediatR;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Application.Users.Swipes.SwipeAction;

public record SwipeActionCommand(Guid TargetId, SwipeType Type) : IRequest<SwipeActionResponse>;
public record SwipeActionResponse(bool IsMatch, Guid? MatchId = null);

public class SwipeActionHandler : IRequestHandler<SwipeActionCommand, SwipeActionResponse>
{
    private readonly ISwipeRepository _swipeRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly ICacheService _cacheService;
    private readonly INotificationService _notificationService;
    private readonly ISignalRService _signalRService;
    private readonly IUserProfileRepository _userProfileRepository;
    private readonly IUserReportRepository _reportRepository;
    private readonly DoAnTotNghiep.Domain.Notifications.INotificationRepository _notificationRepository;
    private readonly IMetricsService _metrics;
    private readonly IFraudDetectionService _fraudDetectionService;
    private readonly ILogger<SwipeActionHandler> _logger;

    public SwipeActionHandler(
        ISwipeRepository swipeRepository,
        ICurrentUserService currentUserService,
        ICacheService cacheService,
        INotificationService notificationService,
        ISignalRService signalRService,
        IUserProfileRepository userProfileRepository,
        IUserReportRepository reportRepository,
        DoAnTotNghiep.Domain.Notifications.INotificationRepository notificationRepository,
        IMetricsService metrics,
        IFraudDetectionService fraudDetectionService,
        ILogger<SwipeActionHandler> logger)
    {
        _swipeRepository = swipeRepository;
        _currentUserService = currentUserService;
        _cacheService = cacheService;
        _notificationService = notificationService;
        _signalRService = signalRService;
        _userProfileRepository = userProfileRepository;
        _reportRepository = reportRepository;
        _notificationRepository = notificationRepository;
        _metrics = metrics;
        _fraudDetectionService = fraudDetectionService;
        _logger = logger;
    }

    public async Task<SwipeActionResponse> Handle(SwipeActionCommand request, CancellationToken cancellationToken)
    {
        if (_currentUserService.UserId == null) return new SwipeActionResponse(false);
        var currentUserId = Guid.Parse(_currentUserService.UserId);

        // 0. Fraud detection check (Fast swiping)
        if (await _fraudDetectionService.IsSwipingTooFastAsync(currentUserId, cancellationToken))
        {
            _logger.LogWarning("Spam detected for User {UserId}: Swiping too fast", currentUserId);

            /* 
            // Commented out to reduce spam as requested
            await _notificationService.SendPushToUserAsync(
                currentUserId,
                "⚠️ Cảnh báo hành vi!",
                "Bạn đang quẹt quá nhanh. Vui lòng chậm lại để đảm bảo cộng đồng văn minh. Hành vi này đã được ghi nhận.",
                new Dictionary<string, string> { { "type", "warning" } }
            );
            */

            // Send Real-time SignalR Warning
            await _signalRService.SendWarningAsync(
                currentUserId,
                "⚠️ Cảnh báo hệ thống",
                "Bạn đang quẹt quá nhanh. Vui lòng chậm lại. Hành vi này đã được ghi nhận vào hồ sơ."
            );

            // Save persistent notification to database
            var dbNotif = DoAnTotNghiep.Domain.Notifications.Notification.Create(
                currentUserId,
                "Cảnh báo hành vi",
                "Bạn đã quẹt quá nhanh nhiều lần. Hành vi này vi phạm chính sách cộng đồng và đã được báo cáo cho quản trị viên.",
                "warning"
            );
            await _notificationRepository.AddAsync(dbNotif);

            // Auto-flag: Create a system report
            var report = new UserReport(
                Guid.Empty, // System Reporter
                currentUserId,
                "Hệ thống: Phát hiện Spam",
                "Người dùng vi phạm quy định về tốc độ quẹt thẻ (Fast Swiping Detection). Hệ thống đã tự động gắn cờ.",
                new List<string>()
            );
            await _reportRepository.CreateAsync(report);

            throw new TooManyRequestsException("Slow down! You're swiping too fast. A warning has been sent.");
        }

        // 1. Check if already swiped
        var existingSwipe = await _swipeRepository.GetSwipeAsync(currentUserId, request.TargetId);
        if (existingSwipe != null)
        {
            return new SwipeActionResponse(false);
        }

        // 2. Save Swipe
        var swipe = new UserSwipe(currentUserId, request.TargetId, request.Type);
        await _swipeRepository.AddAsync(swipe);
        _metrics.RecordSwipeAction(request.Type.ToString());

        // 3. Remove from cache feed
        var cacheKey = $"swipe_feed:{currentUserId}";
        var feed = await _cacheService.GetAsync<List<Guid>>(cacheKey);
        if (feed != null)
        {
            feed.Remove(request.TargetId);
            await _cacheService.SetAsync(cacheKey, feed, TimeSpan.FromHours(1));
        }

        // 4. Check for Match
        if (request.Type == SwipeType.Like || request.Type == SwipeType.SuperLike)
        {
            var isMutual = await _swipeRepository.HasLikedAsync(request.TargetId, currentUserId);
            if (isMutual)
            {
                var match = new UserMatch(currentUserId, request.TargetId);
                await _swipeRepository.AddMatchAsync(match);
                _metrics.RecordMatchCreated();

                // Send Push Notifications
                var me = await _userProfileRepository.GetByUserIdAsync(currentUserId);
                var other = await _userProfileRepository.GetByUserIdAsync(request.TargetId);

                if (me != null && other != null)
                {
                    await _notificationService.SendPushToUserAsync(
                        request.TargetId, 
                        "🎉 Bạn có một tương hợp mới!", 
                        $"{me.BasicInfo.DisplayName} cũng đã thích bạn. Hãy bắt đầu trò chuyện ngay!",
                        new Dictionary<string, string> { { "type", "match" }, { "matchId", match.Id.ToString() } }
                    );

                    await _notificationService.SendPushToUserAsync(
                        currentUserId, 
                        "🎉 Bạn có một tương hợp mới!", 
                        $"{other.BasicInfo.DisplayName} cũng đã thích bạn. Hãy bắt đầu trò chuyện ngay!",
                        new Dictionary<string, string> { { "type", "match" }, { "matchId", match.Id.ToString() } }
                    );
                }
                
                return new SwipeActionResponse(true, match.Id);
            }
        }

        return new SwipeActionResponse(false);
    }
}
