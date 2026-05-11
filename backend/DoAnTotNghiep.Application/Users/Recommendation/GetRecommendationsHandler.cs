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
        private readonly IUserProfileRepository _profileRepo;
        private readonly ICurrentUserService _current;
        private readonly ISeenUserService _seen;
        private readonly ICacheService _cache;
        private readonly IRecommendationScoringService _scoring;
        private readonly IGeoService _geo;

        public GetRecommendationsHandler(
            IUserProfileRepository profileRepo,
            ICurrentUserService current,
            ISeenUserService seen,
            ICacheService cache,
            IRecommendationScoringService scoring,
            IGeoService geo)
        {
            _profileRepo = profileRepo;
            _current = current;
            _seen = seen;
            _cache = cache;
            _scoring = scoring;
            _geo = geo;
        }

        public async Task<RecommendationResponse> Handle(
            GetRecommendationsQuery request,
            CancellationToken ct)
        {
            var userId = Guid.Parse(_current.UserId!);
            var cacheKey = $"rec:{userId}:{request.Take}";

            // Get excluded IDs (swiped/seen)
            var seenIds = await _seen.GetAllAsync(userId);

            // Check Cache
            var cached = await _cache.GetAsync<RecommendationResponse>(cacheKey);
            if (cached != null)
            {
                // Filter out already seen users from cache
                var filteredResults = cached.Items
                    .Where(x => !seenIds.Contains(x.UserId))
                    .ToList();

                if (filteredResults.Count >= request.Take / 2) // If still have enough items
                {
                    return new RecommendationResponse(filteredResults);
                }
                // If cache is too depleted, continue to fetch fresh data
            }

            var me = await _profileRepo.GetByUserIdAsync(userId)
                ?? throw new NotFoundException("User not found");

            // 1. Primary Fetch: Strict filters
            var candidates = await _profileRepo.GetCandidatesAsync(
                me,
                seenIds.ToList(),
                0,
                request.Take * 5
            );

            // 2. Fallback Fetch: Relax filters if no one found
            if (!candidates.Any())
            {
                candidates = await _profileRepo.GetCandidatesAsync(
                    me,
                    seenIds.ToList(),
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

                // Double check distance (DB filter might be loose)
                var distance = _geo.CalculateDistance(me, c);
                if (distance > me.MaxDistanceKm)
                    continue;

                var score = _scoring.CalculateScore(me, c, distance);

                results.Add(new GetRecommendationsDto(
                    c.UserId,
                    c.BasicInfo.DisplayName,
                    c.BasicInfo.Age,
                    c.Bio ?? "",
                    c.LocationName ?? "",
                    c.Photos.FirstOrDefault(p => p.IsPrimary)?.ThumbnailUrl ?? c.Photos.FirstOrDefault(p => p.IsPrimary)?.Url,
                    Math.Round(distance, 1),
                    Math.Round(score, 2)
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
