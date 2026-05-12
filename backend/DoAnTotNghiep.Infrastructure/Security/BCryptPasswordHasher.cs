using DoAnTotNghiep.Application.Common;

namespace DoAnTotNghiep.Infrastructure.Security;

using BCrypt.Net;

public class BCryptPasswordHasher : IPasswordHasher
{
    public string Hash(string password)
    {
        return BCrypt.HashPassword(password);
    }

    public bool Verify(string password, string hash)
    {
        if (string.IsNullOrWhiteSpace(password) || string.IsNullOrWhiteSpace(hash))
        {
            return false;
        }

        return BCrypt.Verify(password, hash);
    }
}