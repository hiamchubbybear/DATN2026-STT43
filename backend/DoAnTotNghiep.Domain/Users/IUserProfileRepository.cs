using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Domain.Users;

public interface IUserProfileRepository
{
    Task<UserProfile> GetByUserIdAsync(Guid userId);
    Task CreateAsync(UserProfile profile);
    Task UpdateAsync(UserProfile profile);
    Task<List<UserProfile>> ListAllAsync();
    Task<List<UserProfile>> GetCandidatesAsync(
        UserProfile me, 
        List<Guid> excludeUserIds, 
        int skip, 
        int take, 
        bool relaxFilters = false,
        DoAnTotNghiep.Domain.Enum.GenderPreference? genderPreference = null,
        int? minAge = null,
        int? maxAge = null,
        int? maxDistanceKm = null);
    Task<List<UserProfile>> GetByUserIdsAsync(List<Guid> userIds);
    Task<List<UserProfile>> SearchAsync(UserSearchFilter filter);
}
