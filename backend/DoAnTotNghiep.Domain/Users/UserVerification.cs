using DoAnTotNghiep.Domain.Common;

namespace DoAnTotNghiep.Domain.Users;

public class UserVerification : BaseEntity
{
    public Guid UserId { get; private set; }
    public string IdNumber { get; private set; } = null!;
    public string FullName { get; private set; } = null!;
    public string FrontImageUrl { get; private set; } = null!;
    public string BackImageUrl { get; private set; } = null!;
    public string SelfieImageUrl { get; private set; } = null!;
    public VerificationStatus Status { get; private set; } = VerificationStatus.Pending;
    public string? RejectReason { get; private set; }

    // Phone Verification
    public string? PhoneNumber { get; private set; }
    public bool IsPhoneVerified { get; private set; }
    public DateTime? PhoneVerifiedAt { get; private set; }

    // Face/Biometric Verification
    public string? FaceVector { get; private set; } // Mã hóa sinh trắc học
    public bool IsFaceVerified { get; private set; }

    // AI Verification Results
    public double? LivenessScore { get; private set; }
    public bool? IsLivenessVerified { get; private set; }
    public double? FaceSimilarityScore { get; private set; }
    public bool? IsFaceMatched { get; private set; }
    public string? AiVerificationDetails { get; private set; } // JSON blob
    public DateTime? AiVerifiedAt { get; private set; }

    private UserVerification() { }

    public UserVerification(Guid userId, string idNumber, string fullName, string frontImg, string backImg, string selfieImg)
    {
        UserId = userId;
        IdNumber = idNumber;
        FullName = fullName;
        FrontImageUrl = frontImg;
        BackImageUrl = backImg;
        SelfieImageUrl = selfieImg;
    }

    public void Approve() => Status = VerificationStatus.Approved;
    public void Reject(string reason)
    {
        Status = VerificationStatus.Rejected;
        RejectReason = reason;
    }

    public void SetAiResults(double livenessScore, bool livenessPass,
        double similarityScore, bool faceMatch, string details)
    {
        LivenessScore = livenessScore;
        IsLivenessVerified = livenessPass;
        FaceSimilarityScore = similarityScore;
        IsFaceMatched = faceMatch;
        AiVerificationDetails = details;
        AiVerifiedAt = DateTime.UtcNow;

        // Auto-approve if both pass with high confidence
        // Note: Thresholds could be configurable, but using 0.85 as suggested in plan
        if (livenessPass && faceMatch && livenessScore >= 0.85 && similarityScore >= 0.85)
        {
            Approve();
        }
        else if (!livenessPass || !faceMatch)
        {
            // Optional: Auto-reject if confidence is very low
            // For now, keep as Pending if it doesn't meet auto-approve threshold but isn't a definite fail
        }
    }
}

public enum VerificationStatus
{
    Pending = 0,
    Approved = 1,
    Rejected = 2
}
