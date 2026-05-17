using DoAnTotNghiep.Domain.Users;
using DoAnTotNghiep.Infrastructure.Persistence;
using MongoDB.Driver;

namespace DoAnTotNghiep.Infrastructure.Repositories;

public class UserVerificationRepository : IUserVerificationRepository
{
    private readonly IMongoCollection<UserVerification> _verifications;

    public UserVerificationRepository(MongoDbContext context)
    {
        _verifications = context.UserVerifications;
    }

    public async Task<UserVerification?> GetLatestByUserIdAsync(Guid userId)
    {
        return await _verifications
            .Find(x => x.UserId == userId)
            .SortByDescending(x => x.CreatedAt)
            .FirstOrDefaultAsync();
    }

    public async Task CreateAsync(UserVerification verification)
    {
        await _verifications.InsertOneAsync(verification);
    }

    public async Task UpdateAsync(UserVerification verification)
    {
        var filter = Builders<UserVerification>.Filter.Eq(x => x.Id, verification.Id);
        await _verifications.ReplaceOneAsync(filter, verification);
    }

    public async Task<List<UserVerification>> ListPendingAsync()
    {
        return await _verifications
            .Find(x => x.Status == VerificationStatus.Pending)
            .SortByDescending(x => x.CreatedAt)
            .ToListAsync();
    }
}
