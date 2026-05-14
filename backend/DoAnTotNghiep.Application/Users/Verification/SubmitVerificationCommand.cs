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
            // 1. Check Front Image Quality & OCR
            using var frontStream = request.FrontImage.OpenReadStream();
            var frontDocResult = await _aiService.VerifyDocumentAsync(frontStream, request.FrontImage.FileName, cancellationToken);
            
            // 2. Check Back Image Quality & OCR
            using var backStream = request.BackImage.OpenReadStream();
            var backDocResult = await _aiService.VerifyDocumentAsync(backStream, request.BackImage.FileName, cancellationToken);

            if (frontDocResult != null && !frontDocResult.Success)
            {
                verification.Reject($"Front ID image: {frontDocResult.Message}");
            }
            else if (backDocResult != null && !backDocResult.Success)
            {
                verification.Reject($"Back ID image: {backDocResult.Message}");
            }
            else
            {
                // 3. Liveness & Face Comparison
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
                        comparison = compareResult,
                        front_ocr = frontDocResult?.OcrText,
                        back_ocr = backDocResult?.OcrText
                    });
                    
                    // 4. Check for explicit AI failure (dark image, no face)
                    if (!livenessResult.Success || livenessResult.FacesDetected == 0)
                    {
                        var msg = string.IsNullOrEmpty(livenessResult.Message) ? "No face detected in selfie" : livenessResult.Message;
                        verification.Reject(msg);
                    }
                    else if (!compareResult.Success)
                    {
                        verification.Reject(compareResult.Message);
                    }
                    else
                    {
                        // 5. Normal processing
                        var livenessFace = livenessResult.Results.FirstOrDefault();
                        var livenessScore = livenessFace?.Confidence ?? 0;
                        var livenessPass = livenessFace?.IsReal ?? false;

                        verification.SetAiResults(
                            livenessScore, 
                            livenessPass, 
                            compareResult.Similarity, 
                            compareResult.Match, 
                            detailsJson);
                        
                        // 6. Auto-reject if similarity or liveness is extremely low
                        if (compareResult.Similarity < 0.3 || (livenessFace != null && livenessScore < 0.2))
                        {
                            verification.Reject("Identity could not be confirmed. Please use a clearer photo.");
                        }
                    }
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
            var title = "Identity Verification";
            var body = verification.Status switch
            {
                VerificationStatus.Approved => "Your identity has been verified successfully! 🎉",
                VerificationStatus.Rejected => $"Verification failed: {verification.RejectReason} ❌",
                _ => "Your verification is being reviewed by our team. ⏳"
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

        // --- Handle Auto-Approval Account Update ---
        if (verification.Status == VerificationStatus.Approved)
        {
            var account = await _accounts.Find(a => a.Id == request.UserId).FirstOrDefaultAsync(cancellationToken);
            if (account != null)
            {
                account.MarkAsVerified();
                await _accounts.ReplaceOneAsync(a => a.Id == request.UserId, account, cancellationToken: cancellationToken);
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
