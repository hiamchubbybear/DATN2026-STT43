using DoAnTotNghiep.Application.Common;
using DoAnTotNghiep.Domain.Enum;
using DoAnTotNghiep.Domain.Users;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Application.Users.Swipes.GetSwipeFeed;

public record GetSwipeFeedQuery(
    GenderPreference? Gender = null,
    int? MinAge = null,
    int? MaxAge = null,
    int? Distance = null
) : IRequest<List<UserProfileDto>>;

public record UserProfileDto(
    Guid UserId,
    string DisplayName,
    int Age,
    string Bio,
    List<string> Photos,
    string LocationName,
    string Occupation,
    List<string> Interests);

public class GetSwipeFeedHandler : IRequestHandler<GetSwipeFeedQuery, List<UserProfileDto>>
{
    private readonly IUserProfileRepository _profileRepository;
    private readonly ISwipeRepository _swipeRepository;
    private readonly ICurrentUserService _currentUserService;

    public GetSwipeFeedHandler(
        IUserProfileRepository profileRepository,
        ISwipeRepository swipeRepository,
        ICurrentUserService currentUserService)
    {
        _profileRepository = profileRepository;
        _swipeRepository   = swipeRepository;
        _currentUserService = currentUserService;
    }

    public async Task<List<UserProfileDto>> Handle(GetSwipeFeedQuery request, CancellationToken cancellationToken)
    {
        Console.WriteLine($"[Feed] Request received - Gender: {request.Gender}, MinAge: {request.MinAge}, MaxAge: {request.MaxAge}, Distance: {request.Distance}");
        
        if (_currentUserService.UserId == null) return [];

        var currentUserId = Guid.Parse(_currentUserService.UserId);

        // 1. Load current user's profile (needed for preference filters)
        var me = await _profileRepository.GetByUserIdAsync(currentUserId);
        if (me == null)
        {
            Console.WriteLine($"[Feed] Profile not found for userId: {currentUserId}");
            return [];
        }

        // 2. Get IDs the user already swiped (to exclude from feed)
        var swipedIds = await _swipeRepository.GetSwipedTargetIdsAsync(currentUserId);

        // 3. Primary fetch: apply gender + age filters
        var candidates = await _profileRepository.GetCandidatesAsync(
            me, 
            swipedIds, 
            0, 
            50, 
            relaxFilters: false,
            genderPreference: request.Gender,
            minAge: request.MinAge,
            maxAge: request.MaxAge,
            maxDistanceKm: request.Distance);

        // 4. Fallback: relax all filters if primary returned nothing
        if (!candidates.Any())
        {
            Console.WriteLine($"[Feed] No candidates with strict filters — retrying with relaxed filters.");
            candidates = await _profileRepository.GetCandidatesAsync(
                me, 
                swipedIds, 
                0, 
                50, 
                relaxFilters: true,
                genderPreference: request.Gender,
                minAge: request.MinAge,
                maxAge: request.MaxAge,
                maxDistanceKm: request.Distance);
        }

        Console.WriteLine($"[Feed] Candidates found: {candidates.Count}");

        if (!candidates.Any()) return [];

        // 5. Score by shared interests/hobbies (in-memory, O(n) with HashSet)
        var myTags = me.Lifestyle.Interests.Concat(me.Lifestyle.Hobbies).ToHashSet(StringComparer.OrdinalIgnoreCase);

        var ranked = candidates
            .Select(c => new
            {
                Profile = c,
                Score   = c.Lifestyle.Interests
                           .Concat(c.Lifestyle.Hobbies)
                           .Count(tag => myTags.Contains(tag))
            })
            .OrderByDescending(x => x.Score)
            .Take(10)
            .Select(x => x.Profile)
            .ToList();

        // 6. Map to DTO directly — no extra DB round-trips needed
        return ranked.Select(p => new UserProfileDto(
            p.UserId,
            p.BasicInfo.DisplayName,
            CalculateAge(p.BasicInfo.Dob),
            p.Bio,
            p.Photos.OrderBy(x => x.Order).Select(x => x.ThumbnailUrl ?? x.Url).ToList(),
            p.LocationName,
            p.Background.Occupation,
            p.Lifestyle.Interests.Concat(p.Lifestyle.Hobbies).Distinct().ToList()
        )).ToList();
    }

    private static int CalculateAge(DateTime dob)
    {
        var today = DateTime.Today;
        var age   = today.Year - dob.Year;
        if (dob.Date > today.AddYears(-age)) age--;
        return age;
    }
}
