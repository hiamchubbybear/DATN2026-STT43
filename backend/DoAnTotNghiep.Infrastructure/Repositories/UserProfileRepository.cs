using DoAnTotNghiep.Domain.Enum;
using DoAnTotNghiep.Domain.Users;
using DoAnTotNghiep.Infrastructure.Persistence;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Infrastructure.Repositories;

public class UserProfileRepository : IUserProfileRepository
{
    private readonly IMongoCollection<UserProfile> _profiles;

    public UserProfileRepository(MongoDbContext context)
    {
        _profiles = context.UserProfiles;
    }

    public async Task<UserProfile> GetByUserIdAsync(Guid userId)
    {
        return await _profiles.Find(x => x.UserId == userId).FirstOrDefaultAsync();
    }

    public async Task CreateAsync(UserProfile profile)
    {
        await _profiles.InsertOneAsync(profile);
    }

    public async Task UpdateAsync(UserProfile profile)
    {
        var filter = Builders<UserProfile>.Filter.Eq(x => x.Id, profile.Id);
        await _profiles.ReplaceOneAsync(filter, profile);
    }

    public async Task<List<UserProfile>> ListAllAsync()
    {
        return await _profiles.Find(_ => true).ToListAsync();
    }

    // Batch fetch — replaces N single-document queries in the feed handler
    public async Task<List<UserProfile>> GetByUserIdsAsync(List<Guid> userIds)
    {
        return await _profiles
            .Find(x => userIds.Contains(x.UserId))
            .ToListAsync();
    }

    public async Task<List<UserProfile>> GetCandidatesAsync(
        UserProfile me,
        List<Guid> excludeUserIds,
        int skip,
        int take,
        bool relaxFilters = false,
        GenderPreference? genderPreference = null,
        int? minAge = null,
        int? maxAge = null,
        int? maxDistanceKm = null)
    {
        var builder = Builders<UserProfile>.Filter;
        var filters = new List<FilterDefinition<UserProfile>>();

        // 1. Exclude self + already-swiped users
        var excluded = new List<Guid> { me.UserId };
        if (excludeUserIds?.Any() == true)
            excluded.AddRange(excludeUserIds);

        filters.Add(builder.Nin(x => x.UserId, excluded));

        // 2. Gender preference filter
        var effectiveGenderPref = genderPreference ?? me.LookingFor;
        if (effectiveGenderPref != GenderPreference.Everyone
            && effectiveGenderPref != GenderPreference.None)
        {
            var targetGender = effectiveGenderPref == GenderPreference.Male ? Gender.Male : Gender.Female;
            filters.Add(builder.Eq(x => x.BasicInfo.Gender, targetGender));
        }

        // 3. Age preference filter
        if (!relaxFilters)
        {
            var effectiveMinAge = minAge ?? me.MinAgePreference;
            var effectiveMaxAge = maxAge ?? me.MaxAgePreference;
            
            var minDob = DateTime.UtcNow.AddYears(-(effectiveMaxAge + 1));
            var maxDob = DateTime.UtcNow.AddYears(-(effectiveMinAge - 1));
            filters.Add(builder.Gte(x => x.BasicInfo.Dob, minDob));
            filters.Add(builder.Lte(x => x.BasicInfo.Dob, maxDob));
        }

        var finalFilter = builder.And(filters);
        
        // Debug info
        Console.WriteLine($"[Repo] Filter: {effectiveGenderPref} | Relaxed: {relaxFilters}");

        // NOTE: "Reverse gender interest" filter removed intentionally for stability.
        
        return await _profiles
            .Find(finalFilter)
            .SortByDescending(x => x.CreatedAt)
            .Skip(skip)
            .Limit(take)
            .ToListAsync();
    }
}
