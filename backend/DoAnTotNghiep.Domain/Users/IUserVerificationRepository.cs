using DoAnTotNghiep.Domain.Users;

namespace DoAnTotNghiep.Domain.Users;

public interface IUserVerificationRepository
{
    Task<UserVerification?> GetLatestByUserIdAsync(Guid userId);
    Task CreateAsync(UserVerification verification);
    Task UpdateAsync(UserVerification verification);
    Task<List<UserVerification>> ListPendingAsync();
}
