using DoAnTotNghiep.Application.Common;
using StackExchange.Redis;

namespace DoAnTotNghiep.Infrastructure.Persistence.Token
{
    public class TokenService : ITokenService
    {
        private readonly IDatabase _redis;

        public TokenService(IConnectionMultiplexer redis)
        {
            _redis = redis.GetDatabase();
        }

        public async Task RevokeAllAsync(Guid userId)
        {
            var key = $"user:{userId}:tokens";
            await _redis.KeyDeleteAsync(key);
        }
       
    }
}
