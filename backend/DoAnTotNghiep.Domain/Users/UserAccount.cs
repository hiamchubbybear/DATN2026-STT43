using System.Runtime.Serialization;
using DoAnTotNghiep.Domain.Common;
using DoAnTotNghiep.Domain.Enum;
using MongoDB.Bson.Serialization.Attributes;

namespace DoAnTotNghiep.Domain.Users;

[BsonIgnoreExtraElements]
public class UserAccount(string email, string? hashPassword = null, AuthProvider provider = AuthProvider.Local, string? providerId = null) : BaseEntity
{
    [BsonConstructor]
    private UserAccount() : this(null!) { }

    public string? HashPassword { get; private set; } = hashPassword;
    public string Email { get; private set; } = email;
    public bool IsVerified { get; private set; } = false;
    public string Role { get; private set; } = "Client";
    public AuthProvider Provider { get; private set; } = provider;
    public string? ProviderId { get; private set; } = providerId;
    public bool IsIdentityVerified { get; private set; } = false;
    
    public bool IsBanned { get; private set; } = false;
    public DateTime? BannedUntil { get; private set; }
    public string? BanReason { get; private set; }

    public void Ban(string reason, DateTime? until = null)
    {
        IsBanned = true;
        BanReason = reason;
        BannedUntil = until;
        SetUpdated();
    }

    public void Unban()
    {
        IsBanned = false;
        BanReason = null;
        BannedUntil = null;
        SetUpdated();
    }

    public void MarkAsVerified()
    {
        IsVerified = true;
        SetUpdated();
    }

    public void MarkAsIdentityVerified()
    {
        IsIdentityVerified = true;
        SetUpdated();
    }

    public void UpdatePassword(string newHashPassword)
    {
        HashPassword = newHashPassword;
        SetUpdated();
    }

    public void SetRole(string role)
    {
        Role = role;
        SetUpdated();
    }

    public void LinkWithGoogle(string providerId)
    {
        Provider = AuthProvider.Google;
        ProviderId = providerId;
        SetUpdated();
    }

}