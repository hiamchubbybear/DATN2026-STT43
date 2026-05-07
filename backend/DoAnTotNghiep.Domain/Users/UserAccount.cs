using System.Runtime.Serialization;
using DoAnTotNghiep.Domain.Common;
using DoAnTotNghiep.Domain.Enum;

namespace DoAnTotNghiep.Domain.Users;

public class UserAccount(string username, string email, string? hashPassword = null, AuthProvider provider = AuthProvider.Local, string? providerId = null) : BaseEntity
{
    public string Username { get; private set; } = username;
    public string? HashPassword { get; private set; } = hashPassword;
    public string Email { get; private set; } = email;
    public bool IsVerified { get; private set; } = false;
    public string Role { get; private set; } = "Client";
    public AuthProvider Provider { get; private set; } = provider;
    public string? ProviderId { get; private set; } = providerId;
    

    public void MarkAsVerified()
    {
        IsVerified = true;
        SetUpdated();
    }

    public void UpdatePassword(string newHashPassword)
    {
        HashPassword = newHashPassword;
        SetUpdated();
    }

    public void LinkWithGoogle(string providerId)
    {
        Provider = AuthProvider.Google;
        ProviderId = providerId;
        SetUpdated();
    }

}