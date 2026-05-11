using MediatR;

namespace DoAnTotNghiep.Application.Users.Recommendation
{
    public record GetRecommendationsQuery(int Take = 20): IRequest<RecommendationResponse>;
}
