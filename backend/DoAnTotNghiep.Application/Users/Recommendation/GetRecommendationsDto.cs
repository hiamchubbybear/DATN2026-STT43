namespace DoAnTotNghiep.Application.Users.Recommendation
{
    public record GetRecommendationsDto(
        Guid UserId,
        string? DisplayName,
        int Age,
        string Bio,
        string LocationName,
        string? ThumbnailUrl,
        double DistanceKm,
        double Score,
        bool IsIdentityVerified,
        List<string> Photos = null
        );
}
