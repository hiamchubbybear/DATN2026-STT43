using DoAnTotNghiep.Application.Common;
using StackExchange.Redis;

namespace DoAnTotNghiep.Infrastructure.Persistence.Redis
{
    public class SeenUserService : ISeenUserService
    {
        private readonly IDatabase _redis;
        public SeenUserService(IConnectionMultiplexer connection)
        {
            _redis = connection.GetDatabase();
        }
        private static string Key(Guid userId) => $"user:{userId}:seen";

        public async Task<HashSet<Guid>> GetAllAsync(Guid userId)
        {
            var values = await _redis.SetMembersAsync(Key(userId));
            return values
                .Select(x => Guid.Parse(x!))
                .ToHashSet();
        }

        
        public async Task MarkSeenAsync(Guid userId, Guid targetUserId)
        {
            var key = Key(userId);
            await _redis.SetAddAsync(key, targetUserId.ToString());
            await _redis.KeyExpireAsync(key, TimeSpan.FromDays(7));
        }
    }
}
