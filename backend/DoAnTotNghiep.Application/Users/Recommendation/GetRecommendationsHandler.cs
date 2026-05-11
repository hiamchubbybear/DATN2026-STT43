using DoAnTotNghiep.Application.Common;
using DoAnTotNghiep.Application.Users.Profile;
using DoAnTotNghiep.Application.Exception;
using DoAnTotNghiep.Domain.Users;
using MediatR;

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

        public GetRecommendationsHandler(
            IUserProfileRepository profileRepo,
            ICurrentUserService current,
            ISeenUserService seen,
            ICacheService cache,
            IRecommendationScoringService scoring,
            IGeoService geo)
        {
            _repo = profileRepo;
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

            // cache
            var cached = await _cache.GetAsync<RecommendationResponse>(cacheKey);
            if (cached != null)
                return cached;

            var me = await _repo.GetByUserIdAsync(userId)
                ?? throw new NotFoundException("User not found");

            var candidates = await _repo.GetCandidatesAsync(
                me,
                0,
                request.Take * 5
            );

            var seenIds = await _seen.GetAllAsync(userId);

            var results = new List<GetRecommendationsDto>(request.Take * 2);

            foreach (var c in candidates)
            {
                if (ct.IsCancellationRequested)
                    break;

                if (seenIds.Contains(c.UserId))
                    continue;

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
                    c.Photos.FirstOrDefault(p => p.IsPrimary)?.ThumbnailUrl,
                    Math.Round(distance, 1),
                    Math.Round(score, 2)
                ));

                if (results.Count >= request.Take * 3)
                    break;
            }

            var final = results
                .OrderByDescending(x => x.Score)
                .Take(request.Take * 2)
                .OrderBy(_ => Random.Shared.Next()) // random 1 lần thôi
                .Take(request.Take)
                .ToList();

            var response = new RecommendationResponse(final);

            await _cache.SetAsync(cacheKey, response, TimeSpan.FromMinutes(3));

            return response;
        }

        

       
    }
}
