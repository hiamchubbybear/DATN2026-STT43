using DoAnTotNghiep.Application.Common;
using DoAnTotNghiep.Domain.Users;

namespace DoAnTotNghiep.Application.Users.Recommendation.Services
{
    public class RecommendationScoringService : IRecommendationScoringService
    {
        public double CalculateScore(UserProfile me, UserProfile candidate, double distance)
        {
            double score = 0;
            score += Math.Max(0, 50 - distance);
            var commonInterests = me.Lifestyle.Interests
                .Intersect(candidate.Lifestyle.Interests)
                .Count();
            score += commonInterests * 10;
            var commonHobbies = me.Lifestyle.Hobbies
                .Intersect(candidate.Lifestyle.Hobbies)
                .Count();
            score += commonHobbies * 5;
            var commonLang = me.BasicInfo.Languages
                .Intersect(candidate.BasicInfo.Languages)
                .Count();
            score += commonLang * 3;
            return score;
        }

        
    }
}
