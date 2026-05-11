using DoAnTotNghiep.Domain.Users;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Application.Common;

public interface ISwipeRepository
{
    Task<List<Guid>> GetSwipedTargetIdsAsync(Guid actorId);
    Task<UserSwipe> GetSwipeAsync(Guid actorId, Guid targetId);
    Task AddAsync(UserSwipe swipe);
    Task AddMatchAsync(UserMatch match);
    Task<List<UserMatch>> GetMatchesAsync(Guid userId);
    Task<bool> HasLikedAsync(Guid actorId, Guid targetId);
}
