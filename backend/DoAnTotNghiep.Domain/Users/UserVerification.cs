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
}

public enum VerificationStatus
{
    Pending = 0,
    Approved = 1,
    Rejected = 2
}
