using MongoDB.Driver;
using DoAnTotNghiep.Domain.Users;
using DoAnTotNghiep.Infrastructure.Persistence;

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
}
