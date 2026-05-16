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
        _logger.LogInformation("[Feed] Query filters - Gender: {Gender}, MinAge: {MinAge}, MaxAge: {MaxAge}, Distance: {Distance}", 
            request.Gender, request.MinAge, request.MaxAge, request.Distance);

        var candidates = await _profileRepository.GetCandidatesAsync(
            me, 
            swipedIds, 
            0, 
            500, // Large pool for ranking
            relaxFilters: false,
            genderPreference: request.Gender,
            minAge: request.MinAge,
            maxAge: request.MaxAge,
            maxDistanceKm: request.Distance ?? 100); 

        // 4. Fallback: Only relax filters if we found NOTHING or if no manual filters are applied
        // and we still have very few people.
        bool hasManualFilters = request.Gender.HasValue || request.MinAge.HasValue || request.MaxAge.HasValue || request.Distance.HasValue;
        
        // 4. Fallback: Relax filters if we found NOTHING or very few people
        if (candidates.Count < 5)
        {
            _logger.LogInformation("[Feed] Only {Count} candidates found. Relaxing filters to provide more options...", candidates.Count);
            
            var relaxed = await _profileRepository.GetCandidatesAsync(
                me, 
                swipedIds, 
                0, 
                500, 
                relaxFilters: true,
                genderPreference: request.Gender,
                minAge: null, // Relax age
                maxAge: null, // Relax age
                maxDistanceKm: null); // Relax distance
                
            // Merge and keep unique by UserId
            var existingIds = candidates.Select(c => c.UserId).ToHashSet();
            foreach(var r in relaxed)
            {
                if (!existingIds.Contains(r.UserId))
                {
                    candidates.Add(r);
                    if (candidates.Count >= 20) break; // Don't take too many relaxed results
                }
            }
        }

        Console.WriteLine($"[Feed] Candidates found: {candidates.Count}");

        if (!candidates.Any()) return [];

        // 5. Multi-factor Scoring Algorithm
        var rng = new Random();
        var myTags = me.Lifestyle.Interests.Concat(me.Lifestyle.Hobbies).ToHashSet(StringComparer.OrdinalIgnoreCase);

        var ranked = candidates
            .Select(c => {
                // Base Score: Shared Interests (Each match = 10 points)
                double interestScore = c.Lifestyle.Interests
                                        .Concat(c.Lifestyle.Hobbies)
                                        .Count(tag => myTags.Contains(tag)) * 10.0;

                // Distance Score: Closer is better (Max 30 points)
                double distanceKm = CalculateDistance(me.Latitude, me.Longitude, c.Latitude, c.Longitude);
                double distanceScore = Math.Max(0, 30.0 * (1.0 - (distanceKm / (request.Distance ?? 100.0))));

                // Trust Score: Verified users get a boost (20 points)
                double trustScore = c.IsIdentityVerified ? 20.0 : 0;

                // Randomness: Small random factor for variety (Max 10 points)
                double randomness = rng.NextDouble() * 10.0;

                // Testing Boost: Give a huge boost to users named "meoo" for the user to find them easily
                double nameBoost = c.BasicInfo.DisplayName.Contains("meoo", StringComparison.OrdinalIgnoreCase) || 
                                   c.BasicInfo.DisplayName.Contains("meo", StringComparison.OrdinalIgnoreCase) ? 1000.0 : 0;

                return new {
                    Profile = c,
                    TotalScore = interestScore + distanceScore + trustScore + randomness + nameBoost
                };
            })
            .OrderByDescending(x => x.TotalScore)
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
