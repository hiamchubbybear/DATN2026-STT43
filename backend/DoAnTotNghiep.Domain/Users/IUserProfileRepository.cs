
namespace DoAnTotNghiep.Domain.Users;

public interface IUserProfileRepository
{
    Task<UserProfile> GetByUserIdAsync(Guid userId);
    Task CreateAsync(UserProfile profile);
    Task UpdateAsync(UserProfile profile);
    Task<List<UserProfile>> ListAllAsync();
    Task<List<UserProfile>> GetCandidatesAsync(UserProfile me, int skip, int take);
}
