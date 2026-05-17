using DoAnTotNghiep.Application.Common;
using DoAnTotNghiep.Application.Exception;
using DoAnTotNghiep.Application.Users.Profile;
using DoAnTotNghiep.Domain.Users;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Application.Users.Recommendation
{
    public class GetRecommendationsHandler : IRequestHandler<GetRecommendationsQuery, RecommendationResponse>
    {
        private readonly IUserProfileRepository _repo;
        private readonly ICurrentUserService _current;
        private readonly ISeenUserService _seen;
        private readonly ICacheService _cache;
        private readonly IRecommendationScoringService _scoring;
        private readonly IGeoService _geo;
        private readonly ISwipeRepository _swipeRepo;

        public GetRecommendationsHandler(
            IUserProfileRepository profileRepo,
            ICurrentUserService current,
            ISeenUserService seen,
            ICacheService cache,
            IRecommendationScoringService scoring,
            IGeoService geo,
            ISwipeRepository swipeRepo)
        {
            _repo = profileRepo;
            _current = current;
            _seen = seen;
            _cache = cache;
            _scoring = scoring;
            _geo = geo;
            _swipeRepo = swipeRepo;
        }

        public async Task<RecommendationResponse> Handle(
            GetRecommendationsQuery request,
            CancellationToken ct)
        {
            if (string.IsNullOrEmpty(_current.UserId))
                return new RecommendationResponse(new List<GetRecommendationsDto>());

            var userId = Guid.Parse(_current.UserId);
            var cacheKey = $"rec:{userId}:{request.Take}";

            // Get excluded IDs (swiped/seen)
            var seenIds = await _seen.GetAllAsync(userId);
            var swipedIds = await _swipeRepo.GetSwipedTargetIdsAsync(userId);
            
            // Merge both lists
            var excludedIds = new HashSet<Guid>(seenIds);
            foreach (var id in swipedIds) excludedIds.Add(id);

            // Check Cache
            var cached = await _cache.GetAsync<RecommendationResponse>(cacheKey);
            if (cached != null)
            {
                // Filter out already seen users from cache
                var filteredResults = cached.Items
                    .Where(x => !excludedIds.Contains(x.UserId))
                    .ToList();

                if (filteredResults.Count >= request.Take / 2) // If still have enough items
                {
                    return new RecommendationResponse(filteredResults);
                }
                // If cache is too depleted, continue to fetch fresh data
            }

            var me = await _repo.GetByUserIdAsync(userId)
                ?? throw new NotFoundException("User not found");

            // 1. Primary Fetch: Strict filters
            var candidates = await _repo.GetCandidatesAsync(
                me,
                excludedIds.ToList(),
                0,
                request.Take * 5
            );

            // 2. Fallback Fetch: Relax filters if no one found
            if (!candidates.Any())
            {
                candidates = await _repo.GetCandidatesAsync(
                    me,
                    excludedIds.ToList(),
                    0,
                    request.Take * 5,
                    relaxFilters: true
                );
                
                if (candidates.Any())
                {
                    Console.WriteLine($"[Recommendation] Fallback triggered: Found {candidates.Count} users with relaxed filters.");
                }
            }

            var results = new List<GetRecommendationsDto>();

            foreach (var c in candidates)
            {
                if (ct.IsCancellationRequested)
                    break;

                // Double check distance (DB filter might be loose or skipped if me.Location is null)
                var distance = 0.0;
                var hasLocation = me.Latitude != 0 && c.Latitude != 0;
                
                if (hasLocation)
                {
                    distance = _geo.CalculateDistance(me, c);
                    if (distance > me.MaxDistanceKm)
                        continue;
                }

                var score = _scoring.CalculateScore(me, c, distance);

                results.Add(new GetRecommendationsDto(
                    c.UserId,
                    c.BasicInfo.DisplayName,
                    c.BasicInfo.Age,
                    c.Bio ?? "",
                    c.LocationName ?? "",
                    c.Photos.FirstOrDefault(p => p.IsPrimary)?.Url,
                    Math.Round(distance, 1),
                    Math.Round(score, 2),
                    c.IsIdentityVerified,
                    c.Photos.OrderBy(p => p.Order).Select(p => p.Url).ToList()
                ));

                if (results.Count >= request.Take * 3)
                    break;
            }

            var final = results
                .OrderByDescending(x => x.Score)
                .Take(request.Take * 2)
                .OrderBy(_ => Random.Shared.Next()) // Add some variety
                .Take(request.Take)
                .ToList();

            var response = new RecommendationResponse(final);

            // Store in cache for 3 minutes
            await _cache.SetAsync(cacheKey, response, TimeSpan.FromMinutes(3));

            return response;
        }
    }
}
