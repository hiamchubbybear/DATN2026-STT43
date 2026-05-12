using DoAnTotNghiep.Domain.Common;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace DoAnTotNghiep.Domain.Users;

public class Session : BaseEntity
{
    [BsonRepresentation(BsonType.String)]
    public Guid UserId { get; set; }
    public string? DeviceId { get; set; }
    public string? DeviceName { get; set; }
    public string? Platform { get; set; }
    public string? AppVersion { get; set; }
    public string? FcmToken { get; set; } // Renamed from PushToken
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public bool IsRevoked { get; set; }

    // E2EE Keys
    public string? IdentityKey { get; set; }
    public string? SignedPreKey { get; set; }
    public string? Signature { get; set; }

    public RefreshToken RefreshToken { get; set; } = null!;

    public Session(Guid userId, string? deviceId, string? deviceName, string? ipAddress, string? platform, string? appVersion, string? fcmToken, RefreshToken refreshToken)
    {
        UserId = userId;
        DeviceId = deviceId;
        DeviceName = deviceName;
        IpAddress = ipAddress;
        Platform = platform;
        AppVersion = appVersion;
        FcmToken = fcmToken;
        RefreshToken = refreshToken;
    }
}