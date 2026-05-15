using DoAnTotNghiep.Application.Common.Extensions;
using DoAnTotNghiep.Domain.Enum;
using DoAnTotNghiep.Domain.Users;
using DoAnTotNghiep.Infrastructure.Persistence;
using MongoDB.Driver;
using MongoDB.Bson.Serialization;
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
        filters.Add(builder.Eq(x => x.Status, UserStatus.Active));
        filters.Add(builder.Eq(x => x.IsIncognito, false));

        // 2. Gender preference filter
        var effectiveGenderPref = genderPreference ?? me.LookingFor;
        if (!relaxFilters && effectiveGenderPref != GenderPreference.Everyone
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
            
            var minDob = DateTime.UtcNow.AddYears(-effectiveMaxAge - 1).AddDays(1);
            var maxDob = DateTime.UtcNow.AddYears(-effectiveMinAge);
            filters.Add(builder.Gte(x => x.BasicInfo.Dob, minDob));
            filters.Add(builder.Lte(x => x.BasicInfo.Dob, maxDob));
        }

        // 4. Distance filter
        var effectiveDistance = maxDistanceKm ?? me.MaxDistanceKm;
        if (!relaxFilters && effectiveDistance > 0 && me.Location != null)
        {
            // GeoWithinCenterSphere is more robust in complex $and queries
            // distance in radians = distance / earth radius (approx 6378.1 km)
            double radians = (double)effectiveDistance / 6378.1;
            filters.Add(builder.GeoWithinCenterSphere(x => x.Location, me.Location.Coordinates[0], me.Location.Coordinates[1], radians));
        }

        var finalFilter = builder.And(filters);
        
        var query = _profiles.Find(finalFilter);
        
        // Note: GeoWithinCenterSphere allows combining with other sorts, unlike $near.
        query = query.SortByDescending(x => x.CreatedAt);

        return await query
            .Skip(skip)
            .Limit(take)
            .ToListAsync();
    }

    public async Task<List<UserProfile>> SearchAsync(UserSearchFilter filter)
    {
        var builder = Builders<UserProfile>.Filter;
        var filters = new List<FilterDefinition<UserProfile>>();

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            filters.Add(builder.Or(
                builder.Regex(x => x.BasicInfo.DisplayName, new MongoDB.Bson.BsonRegularExpression(search, "i")),
                builder.Regex(x => x.Email, new MongoDB.Bson.BsonRegularExpression(search, "i"))
            ));
        }

        if (filter.Status.HasValue)
        {
            filters.Add(builder.Eq(x => x.Status, filter.Status.Value));
        }

        var finalFilter = filters.Any() ? builder.And(filters) : builder.Empty;

        var query = _profiles.Find(finalFilter);

        var skip = (filter.Page - 1) * filter.PageSize;
        if (skip < 0) skip = 0;

        return await query
            .SortByDescending(x => x.CreatedAt)
            .Skip(skip)
            .Limit(filter.PageSize)
            .ToListAsync();
    }
}
