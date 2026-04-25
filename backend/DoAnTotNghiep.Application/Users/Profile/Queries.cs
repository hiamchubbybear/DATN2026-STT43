using MediatR;

namespace DoAnTotNghiep.Application.Users.Profile;

public record UserProfileDto(Guid UserId, string Bio, string Gender, string InterestedIn, double Latitude, double Longitude, string LocationName, int MinAgePreference, int MaxAgePreference, int MaxDistanceKm);

public record GetMyProfileQuery(Guid UserId) : IRequest<UserProfileDto>;

public record UserSearchDto(Guid UserId, string DisplayName, string Email);
public record SearchUsersQuery() : IRequest<List<UserSearchDto>>;
