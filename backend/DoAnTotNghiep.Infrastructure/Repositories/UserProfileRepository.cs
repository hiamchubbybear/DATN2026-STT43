using DoAnTotNghiep.Application.Common.Extensions;
using DoAnTotNghiep.Domain.Enum;
using DoAnTotNghiep.Domain.Users;
using DoAnTotNghiep.Infrastructure.Persistence;
using MongoDB.Driver;

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

    public async Task<List<UserProfile>> GetCandidatesAsync(UserProfile me, int skip, int take)
    {
        var builder = Builders<UserProfile>.Filter;
        var myGender = me.Gender;
        var myLookingFor = me.LookingFor;
        var filter = builder.Ne(x => x.UserId, me.UserId);

        filter &= builder.Or(
            builder.Eq(x => x.LookingFor, GenderPreference.Everyone),
            builder.Eq(x => x.LookingFor, myGender.ToPreference())
        );

        if(myLookingFor != GenderPreference.Everyone)
        {
            filter &= builder.Eq(x => x.BasicInfo.Gender, myLookingFor.ToGender());
        }
        var minDob = DateTime.UtcNow.AddYears(-me.MaxAgePreference);
        var maxDob = DateTime.UtcNow.AddYears(-me.MinAgePreference);

        filter &= builder.Gte(x => x.BasicInfo.Dob, minDob) &
                  builder.Lte(x => x.BasicInfo.Dob, maxDob);
        return await _profiles
            .Find(filter)
            .Skip(skip)
            .Limit(take)
            .ToListAsync();


    }
}
