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
        var notMe = builder.Ne(x => x.UserId, me.UserId);
        var genderFilter = me.LookingFor switch
        {
            GenderPreference.Male =>
                builder.Eq(x => x.Gender, Gender.Male),

            GenderPreference.Female =>
                builder.Eq(x => x.Gender, Gender.Female),

            GenderPreference.Everyone =>
                builder.In(x => x.Gender, new[]
                {
                Gender.Male,
                Gender.Female,
                Gender.Other
                }),

            _ => builder.Empty
        };

        var myGenderAsPreference = me.Gender switch
        {
            Gender.Male => GenderPreference.Male,
            Gender.Female => GenderPreference.Female,
            _ => GenderPreference.Everyone
        };

        var reverseFilter = builder.Or(
            builder.Eq(x => x.LookingFor, GenderPreference.Everyone),
            builder.Eq(x => x.LookingFor, myGenderAsPreference)
        );

        var minDob = DateTime.UtcNow.AddYears(-me.MaxAgePreference);
        var maxDob = DateTime.UtcNow.AddYears(-me.MinAgePreference);

        var ageFilter = builder.And(
            builder.Gte(x => x.BasicInfo.Dob, minDob),
            builder.Lte(x => x.BasicInfo.Dob, maxDob)
        );

        var filter = builder.And(
            notMe,
            genderFilter,
            reverseFilter,
            ageFilter
        );

        return await _profiles
            .Find(filter)
            .Skip(skip)
            .Limit(take)
            .ToListAsync();


    }
}
