namespace DoAnTotNghiep.Domain.Users;

public interface IUserRepository
{
    Task CreateAccount(UserAccount user);
    Task<UserAccount?> GetByEmail(string email);

    Task<UserAccount?> ResetPassword(String newHashedPassword, String email);



    Task Create(UserAccount user);
    Task UpdateAsync(UserAccount user);
    Task DeleteAccount(string userId);
    Task<UserAccount> GetByIdAsync(Guid userId);
    Task<List<UserAccount>> ListAllAsync();
}
