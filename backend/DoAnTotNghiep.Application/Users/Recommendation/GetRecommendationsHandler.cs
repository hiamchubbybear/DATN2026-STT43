using DoAnTotNghiep.Application.Common;
using DoAnTotNghiep.Application.Users.Profile;
using DoAnTotNghiep.Domain.Users;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Application.Users.Recommendation
{
    public class GetRecommendationsHandler : IRequestHandler<GetRecommendationsQuery, List<UserProfileDto>>
    {
        private readonly IUserProfileRepository _profileRepo;
        private readonly ISwipeRepository _swipeRepo;
        private readonly ICurrentUserService _current;
        private readonly IBloomFilterService _bloom;

        public GetRecommendationsHandler(
            IUserProfileRepository profileRepo,
            ISwipeRepository swipeRepo,
            ICurrentUserService current,
            IBloomFilterService bloom)
        {
            _profileRepo = profileRepo;
            _swipeRepo = swipeRepo;
            _current = current;
            _bloom = bloom;
        }

        public async Task<List<UserProfileDto>> Handle(
            GetRecommendationsQuery request,
            CancellationToken ct)
        {
            var userId = Guid.Parse(_current.UserId!);
            var me = await _profileRepo.GetByUserIdAsync(userId);

            var candidates = await _profileRepo.GetCandidatesAsync(
                me,
                request.Skip,
                request.Take * 3 
            );
            var result = new List<(UserProfile profile, double score)>();
            foreach (var candidate in candidates)
            {
                var bloomKey = $"swipe:{userId}";
                var seen = await _bloom.MightContainAsync(bloomKey, candidate.UserId.ToString());
                if (seen) continue;
                var score = CalculateScore(me, candidate);
                result.Add((candidate, score));
            }

            var sorted = result
                .OrderByDescending(x => x.score)
                .Take(request.Take)
                .Select(x => Map(x.profile))
                .ToList();

            return sorted;
        }

        private double CalculateScore(UserProfile me, UserProfile other)
        {
            double score = 0;

            var distance = GeoDistance(me, other);
            score += (1 - distance / me.MaxDistanceKm) * 40;

            var age = GetAge(other);
            if (age >= me.MinAgePreference && age <= me.MaxAgePreference)
                score += 20;

            var common = me.Lifestyle.Interests
                .Intersect(other.Lifestyle.Interests)
                .Count();

            score += common * 5;

            if (other.Photos.Any())
                score += 10;

            return score;
        }

        private double GeoDistance(UserProfile a, UserProfile b)
        {
            var dx = a.Latitude - b.Latitude;
            var dy = a.Longitude - b.Longitude;
            return Math.Sqrt(dx * dx + dy * dy) * 111;
        }
        private int GetAge(UserProfile p)
        {
            return DateTime.UtcNow.Year - p.BasicInfo.Dob.Year;
        }
        private UserProfileDto Map(UserProfile p)
        {
            return new UserProfileDto(
                p.UserId,
                new BasicInfoDto(
                    p.BasicInfo.DisplayName,
                    p.BasicInfo.Dob,
                    p.BasicInfo.Gender,
                    p.BasicInfo.Languages),
                new BackgroundDto(
                    p.Background.Education,
                    p.Background.Occupation),
                new LifestyleDto(
                    p.Lifestyle.Drinking,
                    p.Lifestyle.Smoking,
                    p.Lifestyle.SocialLevel,
                    p.Lifestyle.PersonalityType,
                    p.Lifestyle.LoveLanguage,
                    p.Lifestyle.Hobbies,
                    p.Lifestyle.Interests),
                new DatingStyleDto(
                    p.DatingStyle.FreeTimePrefer,
                    p.DatingStyle.DateStyle),
                new List<PhotoDto>(
                    p.Photos.Select(photo => new PhotoDto(
                        photo.Id,
                        photo.Url,
                        photo.Order,
                        photo.IsPrimary))),
                p.Bio ?? string.Empty,
                p.InterestedIn ?? string.Empty,
                p.Latitude,
                p.Longitude,
                p.LocationName ?? string.Empty,
                p.MinAgePreference,
                p.MaxAgePreference,
                p.MaxDistanceKm
                );
        }
    }
}
