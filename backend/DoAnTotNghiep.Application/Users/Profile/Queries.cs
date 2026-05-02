using MediatR;

namespace DoAnTotNghiep.Application.Users.Profile;

public record BasicInfoDto(string DisplayName, DateTime Dob, string Gender, List<string> Languages);
public record BackgroundDto(string Education, string Occupation);
public record LifestyleDto(string Drinking, string Smoking, string SocialLevel, string PersonalityType, List<string> LoveLanguage, List<string> Hobbies, List<string> Interests);
public record DatingStyleDto(List<string> FreeTimePrefer, List<string> DateStyle);
public record PhotoDto(Guid Id, string Url, int Order, bool IsPrimary);

public record UserProfileDto(
    Guid UserId, 
    BasicInfoDto BasicInfo,
    BackgroundDto Background,
    LifestyleDto Lifestyle,
    DatingStyleDto DatingStyle,
    List<PhotoDto> Photos,
    string Bio, 
    string InterestedIn, 
    double Latitude, 
    double Longitude, 
    string LocationName, 
    int MinAgePreference, 
    int MaxAgePreference, 
    int MaxDistanceKm);

public record GetMyProfileQuery(Guid UserId) : IRequest<UserProfileDto>;

public record UserSearchDto(Guid UserId, string DisplayName, string Email, string? AvatarUrl);
public record SearchUsersQuery() : IRequest<List<UserSearchDto>>;
