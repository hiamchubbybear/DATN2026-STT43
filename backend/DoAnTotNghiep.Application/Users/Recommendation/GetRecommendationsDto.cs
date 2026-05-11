namespace DoAnTotNghiep.Application.Users.Recommendation
{
    public record GetRecommendationsDto(
        Guid UsertId,
        string? DisplayName,
        int Age,
        string Bio,
        string LocationName,
        string? ThumbnailUrl,
        double DistanceKm,
        double Score
        );
}
