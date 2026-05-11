using DoAnTotNghiep.Application.Common;
using DoAnTotNghiep.Application.Notifications;
using DoAnTotNghiep.Domain.Users;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Application.Users.Swipes.SwipeAction;

public record SwipeActionCommand(Guid TargetId, SwipeType Type) : IRequest<SwipeActionResponse>;

public record SwipeActionResponse(bool IsMatch, Guid? MatchId = null);

public class SwipeActionHandler : IRequestHandler<SwipeActionCommand, SwipeActionResponse>
{
    private readonly ISwipeRepository _swipeRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly ICacheService _cacheService;
    private readonly INotificationService _notificationService;
    private readonly IUserProfileRepository _userProfileRepository;

    public SwipeActionHandler(
        ISwipeRepository swipeRepository,
        ICurrentUserService currentUserService,
        ICacheService cacheService,
        INotificationService notificationService,
        IUserProfileRepository userProfileRepository)
    {
        _swipeRepository = swipeRepository;
        _currentUserService = currentUserService;
        _cacheService = cacheService;
        _notificationService = notificationService;
        _userProfileRepository = userProfileRepository;
    }

    public async Task<SwipeActionResponse> Handle(SwipeActionCommand request, CancellationToken cancellationToken)
    {
        if (_currentUserService.UserId == null) return new SwipeActionResponse(false);
        var currentUserId = Guid.Parse(_currentUserService.UserId);

        // 1. Check if already swiped
        var existingSwipe = await _swipeRepository.GetSwipeAsync(currentUserId, request.TargetId);
        if (existingSwipe != null)
        {
            return new SwipeActionResponse(false);
        }

        // 2. Save Swipe
        var swipe = new UserSwipe(currentUserId, request.TargetId, request.Type);
        await _swipeRepository.AddAsync(swipe);

        // 3. Remove from cache feed
        var cacheKey = $"swipe_feed:{currentUserId}";
        var feed = await _cacheService.GetAsync<List<Guid>>(cacheKey);
        if (feed != null)
        {
            feed.Remove(request.TargetId);
            await _cacheService.SetAsync(cacheKey, feed, TimeSpan.FromHours(1));
        }

        // 4. Check for Match
        if (request.Type == SwipeType.Like || request.Type == SwipeType.SuperLike)
        {
            var isMutual = await _swipeRepository.HasLikedAsync(request.TargetId, currentUserId);
            if (isMutual)
            {
                var match = new UserMatch(currentUserId, request.TargetId);
                await _swipeRepository.AddMatchAsync(match);

                // Send Push Notifications
                var me = await _userProfileRepository.GetByUserIdAsync(currentUserId);
                var other = await _userProfileRepository.GetByUserIdAsync(request.TargetId);

                if (me != null && other != null)
                {
                    await _notificationService.SendPushToUserAsync(
                        request.TargetId, 
                        "🎉 Bạn có một tương hợp mới!", 
                        $"{me.BasicInfo.DisplayName} cũng đã thích bạn. Hãy bắt đầu trò chuyện ngay!",
                        new Dictionary<string, string> { { "type", "match" }, { "matchId", match.Id.ToString() } }
                    );

                    await _notificationService.SendPushToUserAsync(
                        currentUserId, 
                        "🎉 Bạn có một tương hợp mới!", 
                        $"{other.BasicInfo.DisplayName} cũng đã thích bạn. Hãy bắt đầu trò chuyện ngay!",
                        new Dictionary<string, string> { { "type", "match" }, { "matchId", match.Id.ToString() } }
                    );
                }
                
                return new SwipeActionResponse(true, match.Id);
            }
        }

        return new SwipeActionResponse(false);
    }
}
