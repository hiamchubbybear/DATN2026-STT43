using DoAnTotNghiep.Application.Common;
using DoAnTotNghiep.Domain.Enum;
using DoAnTotNghiep.Domain.Users;
using MediatR;
using Microsoft.Extensions.Logging;
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
    List<string> Interests,
    double? DistanceKm = null);

public class GetSwipeFeedHandler : IRequestHandler<GetSwipeFeedQuery, List<UserProfileDto>>
{
    private readonly IUserProfileRepository _profileRepository;
    private readonly ISwipeRepository _swipeRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<GetSwipeFeedHandler> _logger;

    public GetSwipeFeedHandler(
        IUserProfileRepository profileRepository,
        ISwipeRepository swipeRepository,
        ICurrentUserService currentUserService,
        ILogger<GetSwipeFeedHandler> logger)
    {
        _profileRepository = profileRepository;
        _swipeRepository   = swipeRepository;
        _currentUserService = currentUserService;
        _logger = logger;
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

        // 3. Primary fetch: try to get people nearby first
        var candidates = await _profileRepository.GetCandidatesAsync(
            me, 
            swipedIds, 
            0, 
            100, // Increase pool size
            relaxFilters: false,
            genderPreference: request.Gender,
            minAge: request.MinAge,
            maxAge: request.MaxAge,
            maxDistanceKm: request.Distance ?? 1000); // Default to a much larger distance if not specified

        // 4. Fallback: if still very few people, grab anyone available (Global Fallback)
        if (candidates.Count < 50)
        {
            _logger.LogInformation("[Feed] Few candidates found ({Count}) — mixing in relaxed results.", candidates.Count);
            var relaxed = await _profileRepository.GetCandidatesAsync(
                me, 
                swipedIds, 
                0, 
                100, 
                relaxFilters: true,
                genderPreference: request.Gender,
                minAge: request.MinAge,
                maxAge: request.MaxAge,
                maxDistanceKm: null);
                
            // Merge and keep unique by UserId
            var existingIds = candidates.Select(c => c.UserId).ToHashSet();
            foreach(var r in relaxed)
            {
                if (!existingIds.Contains(r.UserId))
                {
                    candidates.Add(r);
                }
            }
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
            .Take(50)
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
            p.Lifestyle.Interests.Concat(p.Lifestyle.Hobbies).Distinct().ToList(),
            CalculateDistance(me.Latitude, me.Longitude, p.Latitude, p.Longitude)
        )).ToList();
    }

    private static double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
    {
        var d1 = lat1 * (Math.PI / 180.0);
        var num1 = lon1 * (Math.PI / 180.0);
        var d2 = lat2 * (Math.PI / 180.0);
        var num2 = lon2 * (Math.PI / 180.0) - num1;
        var d3 = Math.Pow(Math.Sin((d2 - d1) / 2.0), 2.0) +
                 Math.Cos(d1) * Math.Cos(d2) * Math.Pow(Math.Sin(num2 / 2.0), 2.0);
        
        return Math.Round(6371 * (2.0 * Math.Atan2(Math.Sqrt(d3), Math.Sqrt(1.0 - d3))), 0);
    }

    private static int CalculateAge(DateTime dob)
    {
        var today = DateTime.Today;
        var age   = today.Year - dob.Year;
        if (dob.Date > today.AddYears(-age)) age--;
        return age;
    }
}
