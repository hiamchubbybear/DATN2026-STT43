using DoAnTotNghiep.Application.Common;
using DoAnTotNghiep.Domain.Users;
using DoAnTotNghiep.Infrastructure.Persistence;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Infrastructure.Repositories;

public sealed class SwipeRepository : ISwipeRepository
{
    private readonly IMongoCollection<UserSwipe> _swipes;
    private readonly IMongoCollection<UserMatch> _matches;

    public SwipeRepository(MongoDbContext context)
    {
        _swipes = context.UserSwipes;
        _matches = context.UserMatches;
    }

    public async Task AddAsync(UserSwipe swipe)
    {
        await _swipes.InsertOneAsync(swipe);
    }

    public async Task AddMatchAsync(UserMatch match)
    {
        await _matches.InsertOneAsync(match);
    }

    public async Task<UserSwipe> GetSwipeAsync(Guid actorId, Guid targetId)
    {
        return await _swipes.Find(x => x.ActorId == actorId && x.TargetId == targetId).FirstOrDefaultAsync();
    }

    public async Task<List<Guid>> GetSwipedTargetIdsAsync(Guid actorId)
    {
        var swipes = await _swipes.Find(x => x.ActorId == actorId).ToListAsync();
        return swipes.Select(x => x.TargetId).ToList();
    }

    public async Task<bool> HasLikedAsync(Guid actorId, Guid targetId)
    {
        return await _swipes.Find(x => x.ActorId == actorId && x.TargetId == targetId && (x.Type == SwipeType.Like || x.Type == SwipeType.SuperLike)).AnyAsync();
    }

    public async Task<List<UserMatch>> GetMatchesAsync(Guid userId)
    {
        return await _matches.Find(x => x.UserOneId == userId || x.UserTwoId == userId)
            .SortByDescending(x => x.MatchedAt)
            .ToListAsync();
    }

    public async Task<List<UserSwipe>> GetLikesMeAsync(Guid targetId)
    {
        // Find swipes where TargetId is me, and Type is Like (1) or SuperLike (3)
        return await _swipes.Find(x => x.TargetId == targetId && (x.Type == SwipeType.Like || x.Type == SwipeType.SuperLike))
            .SortByDescending(x => x.CreatedAt)
            .ToListAsync();
    }
    
    public async Task ClearSwipesAsync(Guid userId)
    {
        await _swipes.DeleteManyAsync(x => x.ActorId == userId);
        // Also clear matches if resetting everything for looping
        await _matches.DeleteManyAsync(x => x.UserOneId == userId || x.UserTwoId == userId);
    }
}
