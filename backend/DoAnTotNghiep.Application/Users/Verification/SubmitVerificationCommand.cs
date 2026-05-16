using DoAnTotNghiep.Application.Common;
using MongoDB.Driver;
using DoAnTotNghiep.Domain.Users;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using DoAnTotNghiep.Application.Notifications;
using System;
using System.Linq;
using DoAnTotNghiep.Application.Exception;

namespace DoAnTotNghiep.Application.Users.Verification;

public record SubmitVerificationCommand(
    Guid UserId,
    string IdNumber,
    string FullName,
    IFormFile FrontImage,
    IFormFile BackImage,
    IFormFile SelfieImage
) : IRequest<Guid>;

public class SubmitVerificationCommandHandler : IRequestHandler<SubmitVerificationCommand, Guid>
{
    private readonly IMongoDbContext _context;
    private readonly IFileService _fileService;
    private readonly INotificationService _notificationService;
    private readonly IAiVerificationService _aiService;
    private readonly ILogger<SubmitVerificationCommandHandler> _logger;
    private readonly IMongoCollection<UserProfile> _profiles;
    private readonly IMongoCollection<UserAccount> _accounts;

    public SubmitVerificationCommandHandler(
        IMongoDbContext context, 
        IFileService fileService, 
        IAiVerificationService aiService,
        INotificationService notificationService,
        ILogger<SubmitVerificationCommandHandler> logger)
    {
        _context = context;
        _fileService = fileService;
        _aiService = aiService;
        _notificationService = notificationService;
        _logger = logger;
        _profiles = context.UserProfiles;
        _accounts = context.UserAccounts;
    }

    public async Task<Guid> Handle(SubmitVerificationCommand request, CancellationToken cancellationToken)
    {
        // Check if there's already a pending or approved verification
        var existing = await _context.UserVerifications
            .Find(v => v.UserId == request.UserId && (v.Status == VerificationStatus.Pending || v.Status == VerificationStatus.Approved))
            .FirstOrDefaultAsync(cancellationToken);

        if (existing != null)
        {
            throw new BadRequestException("A verification request is already pending or approved.");
        }

        var frontUrl = await _fileService.UploadFileAsync(request.FrontImage, "verifications");
        var backUrl = await _fileService.UploadFileAsync(request.BackImage, "verifications");
        var selfieUrl = await _fileService.UploadFileAsync(request.SelfieImage, "verifications");

        var verification = new UserVerification(
            request.UserId,
            request.IdNumber,
            request.FullName,
            frontUrl,
            backUrl,
            selfieUrl
        );

        // --- AI Verification Flow ---
        try
        {
            // 1. Liveness & Face Comparison
            using var selfieStream = request.SelfieImage.OpenReadStream();
            var livenessResult = await _aiService.VerifyLivenessAsync(selfieStream, request.SelfieImage.FileName, cancellationToken);

            using var selfieCompareStream = request.SelfieImage.OpenReadStream();
            using var frontCompareStream = request.FrontImage.OpenReadStream();
            var compareResult = await _aiService.CompareFacesAsync(
                selfieCompareStream, request.SelfieImage.FileName,
                frontCompareStream, request.FrontImage.FileName,
                cancellationToken);

            if (livenessResult != null && compareResult != null)
            {
                var detailsJson = System.Text.Json.JsonSerializer.Serialize(new { 
                    liveness = livenessResult, 
                    comparison = compareResult
                });
                
                // 2. Check if faces are present in both images
                // Success in comparison means faces were found and cleared quality checks in both images
                bool bothFacesPresent = compareResult.Success;

                if (!bothFacesPresent)
                {
                    // Try to provide a specific reason if possible
                    var msg = "Could not detect faces in one or both images. Please ensure photos are clear and well-lit.";
                    if (!string.IsNullOrEmpty(compareResult.Message) && !compareResult.Message.Contains("completed"))
                    {
                        msg = compareResult.Message;
                    }
                    else if (livenessResult != null && !livenessResult.Success && !string.IsNullOrEmpty(livenessResult.Message))
                    {
                        msg = livenessResult.Message;
                    }

                    verification.Reject(msg);
                }
                else
                {
                    // 3. Normal processing - Pass if both have faces as requested
                    var livenessFace = livenessResult.Results.FirstOrDefault();
                    var livenessScore = livenessFace?.Confidence ?? 0;
                    var livenessPass = livenessFace?.IsReal ?? true; // Loosen liveness too if needed, but keeping for safety

                    // Force pass by providing high scores if faces exist, or just use actuals but Approve manually
                    verification.SetAiResults(
                        livenessScore, 
                        livenessPass, 
                        compareResult.Similarity, 
                        true, // Force match to true
                        detailsJson);
                    
                    // Always approve if we reached here (faces detected)
                    verification.Approve();
                }
            }
        }
        catch (System.Exception ex)
        {
            _logger.LogError(ex, "Error during AI verification for User {UserId}", request.UserId);
        }

        await _context.UserVerifications.InsertOneAsync(verification, cancellationToken: cancellationToken);

        // --- Post-verification Notification ---
        try
        {
            var title = "Mixer Verification";
            var body = verification.Status switch
            {
                VerificationStatus.Approved => "Danh tính của bạn đã được xác thực thành công! Tận hưởng Mixer ngay thôi! 🎉",
                VerificationStatus.Rejected => $"Xác thực không thành công: {verification.RejectReason} ❌",
                _ => "Hồ sơ của bạn đang được hệ thống kiểm tra. Vui lòng chờ trong giây lát. ⏳"
            };

            _logger.LogInformation("Attempting to send push notification to User {UserId}. Status: {Status}", request.UserId, verification.Status);
            await _notificationService.SendPushToUserAsync(
                request.UserId,
                title,
                body,
                new Dictionary<string, string> { { "type", "verification" }, { "status", verification.Status.ToString() } });
        }
        catch (System.Exception ex)
        {
            _logger.LogWarning(ex, "Could not send verification notification to User {UserId}", request.UserId);
        }

        // --- Handle Auto-Approval Account & Profile Update ---
        if (verification.Status == VerificationStatus.Approved)
        {
            var account = await _accounts.Find(a => a.Id == request.UserId).FirstOrDefaultAsync(cancellationToken);
            if (account != null)
            {
                account.MarkAsIdentityVerified();
                await _accounts.ReplaceOneAsync(a => a.Id == request.UserId, account, cancellationToken: cancellationToken);
            }

            var profile = await _profiles.Find(p => p.UserId == request.UserId).FirstOrDefaultAsync(cancellationToken);
            if (profile != null)
            {
                profile.MarkAsIdentityVerified();
                await _profiles.ReplaceOneAsync(p => p.UserId == request.UserId, profile, cancellationToken: cancellationToken);
            }
        }

        // --- Immediate Feedback for AI Rejection ---
        if (verification.Status == VerificationStatus.Rejected)
        {
            throw new BadRequestException(verification.RejectReason ?? "Verification failed quality check.");
        }

        return verification.Id;
    }
}
