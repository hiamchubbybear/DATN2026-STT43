using DoAnTotNghiep.Application.Common;
using StackExchange.Redis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Infrastructure.Persistence.Redis
{
    public class BloomFilterService : IBloomFilterService
    {
        private readonly ICacheService _cache;
        public BloomFilterService(ICacheService cache)
        {
            _cache = cache;
        }
        public async Task<bool> MightContainAsync(string key, string value)
        {
            var set = await _cache.GetAsync<HashSet<string>>(key);

            if (set == null) return false;

            return set.Contains(value);
        }
        public async Task AddAsync(string key, string value)
        {
            var set = await _cache.GetAsync<HashSet<string>>(key) ?? new HashSet<string>();
            set.Add(value);
            await _cache.SetAsync(key, set, TimeSpan.FromDays(7));
        }
    }
}
