using DoAnTotNghiep.Domain.Users;
using MediatR;

namespace DoAnTotNghiep.Application.Users.Profile;

public class ProfileHandlers(
    IUserProfileRepository profileRepository,
    IUserVerificationRepository verificationRepository) : 
    IRequestHandler<GetMyProfileQuery, UserProfileDto>,
    IRequestHandler<UpdateBioCommand, bool>,
    IRequestHandler<UpdateLocationCommand, bool>,
    IRequestHandler<UpdatePreferencesCommand, bool>,
    IRequestHandler<UpdateBasicInfoCommand, bool>,
    IRequestHandler<UpdateBackgroundCommand, bool>,
    IRequestHandler<UpdateLifestyleCommand, bool>,
    IRequestHandler<UpdateDatingStyleCommand, bool>,
    IRequestHandler<UpdateProfileCommand, bool>,
    IRequestHandler<GetUserProfileQuery, UserProfileDto?>
{
    public async Task<UserProfileDto?> Handle(GetUserProfileQuery request, CancellationToken cancellationToken)
    {
        var profile = await profileRepository.GetByUserIdAsync(request.UserId);
        if (profile == null) return null;

        var verification = await verificationRepository.GetLatestByUserIdAsync(request.UserId);

        return new UserProfileDto(
            request.UserId,
            new BasicInfoDto(profile.BasicInfo.DisplayName, profile.BasicInfo.Dob, profile.BasicInfo.Gender, profile.BasicInfo.Languages),
            new BackgroundDto(profile.Background.Education, profile.Background.Occupation),
            new LifestyleDto(profile.Lifestyle.Drinking, profile.Lifestyle.Smoking, profile.Lifestyle.SocialLevel, profile.Lifestyle.PersonalityType, profile.Lifestyle.LoveLanguage, profile.Lifestyle.Hobbies, profile.Lifestyle.Interests),
            new DatingStyleDto(profile.DatingStyle.FreeTimePrefer, profile.DatingStyle.DateStyle),
            profile.Photos.Select(p => new PhotoDto(p.Id, p.Url, p.Order, p.IsPrimary)).ToList(),
            profile.Bio, 
            profile.InterestedIn,
            profile.Latitude, 
            profile.Longitude, 
            profile.LocationName,
            profile.MinAgePreference, 
            profile.MaxAgePreference, 
            profile.MaxDistanceKm,
            profile.LookingFor,
            profile.IsIdentityVerified,
            verification != null ? (int)verification.Status : null);
    }

    public async Task<UserProfileDto> Handle(GetMyProfileQuery request, CancellationToken cancellationToken)
    {
        var profile = await profileRepository.GetByUserIdAsync(request.UserId);
        if (profile == null)
        {
            profile = new UserProfile(request.UserId);
            await profileRepository.CreateAsync(profile);
        }

        var verification = await verificationRepository.GetLatestByUserIdAsync(request.UserId);

        return new UserProfileDto(
            request.UserId,
            new BasicInfoDto(profile.BasicInfo.DisplayName, profile.BasicInfo.Dob, profile.BasicInfo.Gender, profile.BasicInfo.Languages),
            new BackgroundDto(profile.Background.Education, profile.Background.Occupation),
            new LifestyleDto(profile.Lifestyle.Drinking, profile.Lifestyle.Smoking, profile.Lifestyle.SocialLevel, profile.Lifestyle.PersonalityType, profile.Lifestyle.LoveLanguage, profile.Lifestyle.Hobbies, profile.Lifestyle.Interests),
            new DatingStyleDto(profile.DatingStyle.FreeTimePrefer, profile.DatingStyle.DateStyle),
            profile.Photos.Select(p => new PhotoDto(p.Id, p.Url, p.Order, p.IsPrimary)).ToList(),
            profile.Bio, 
            profile.InterestedIn,
            profile.Latitude, 
            profile.Longitude, 
            profile.LocationName,
            profile.MinAgePreference, 
            profile.MaxAgePreference, 
            profile.MaxDistanceKm,
            profile.LookingFor,
            profile.IsIdentityVerified,
            verification != null ? (int)verification.Status : null);
    }

    private async Task<UserProfile> EnsureProfileExists(Guid userId)
    {
        var profile = await profileRepository.GetByUserIdAsync(userId);
        if (profile == null)
        {
            profile = new UserProfile(userId);
            await profileRepository.CreateAsync(profile);
        }
        return profile;
    }

    public async Task<bool> Handle(UpdateBioCommand request, CancellationToken cancellationToken)
    {
        var profile = await EnsureProfileExists(request.UserId);
        profile.UpdateBio(request.Bio, request.Gender, request.InterestedIn);
        await profileRepository.UpdateAsync(profile);
        return true;
    }

    public async Task<bool> Handle(UpdateLocationCommand request, CancellationToken cancellationToken)
    {
        var profile = await EnsureProfileExists(request.UserId);
        profile.UpdateLocation(request.Latitude, request.Longitude, request.LocationName);
        await profileRepository.UpdateAsync(profile);
        return true;
    }

    public async Task<bool> Handle(UpdatePreferencesCommand request, CancellationToken cancellationToken)
    {
        var profile = await EnsureProfileExists(request.UserId);
        profile.UpdatePreferences(request.MinAgePreference, request.MaxAgePreference, request.MaxDistanceKm, request.lookingFor);
        await profileRepository.UpdateAsync(profile);
        return true;
    }

    public async Task<bool> Handle(UpdateBasicInfoCommand request, CancellationToken cancellationToken)
    {
        var profile = await EnsureProfileExists(request.UserId);
        profile.UpdateBasicInfo(request.DisplayName, request.Dob, request.Gender, request.Languages);
        await profileRepository.UpdateAsync(profile);
        return true;
    }

    public async Task<bool> Handle(UpdateBackgroundCommand request, CancellationToken cancellationToken)
    {
        var profile = await EnsureProfileExists(request.UserId);
        profile.UpdateBackground(request.Education, request.Occupation);
        await profileRepository.UpdateAsync(profile);
        return true;
    }

    public async Task<bool> Handle(UpdateLifestyleCommand request, CancellationToken cancellationToken)
    {
        var profile = await EnsureProfileExists(request.UserId);
        profile.UpdateLifestyle(request.Drinking, request.Smoking, request.SocialLevel, request.PersonalityType, request.LoveLanguage, request.Hobbies, request.Interests);
        await profileRepository.UpdateAsync(profile);
        return true;
    }

    public async Task<bool> Handle(UpdateDatingStyleCommand request, CancellationToken cancellationToken)
    {
        var profile = await EnsureProfileExists(request.UserId);
        profile.UpdateDatingStyle(request.FreeTimePrefer, request.DateStyle);
        await profileRepository.UpdateAsync(profile);
        return true;
    }

    public async Task<bool> Handle(UpdateProfileCommand request, CancellationToken cancellationToken)
    {
        var profile = await EnsureProfileExists(request.UserId);
        
        profile.UpdateBasicInfo(
            request.DisplayName, 
            profile.BasicInfo.Dob, 
            request.Gender, 
            profile.BasicInfo.Languages
        );
        
        profile.UpdateBackground(request.Education, request.Occupation);
        profile.UpdateBio(request.Bio, request.Gender, request.InterestedIn);
        profile.UpdateLocation(request.Latitude, request.Longitude, request.LocationName);
        profile.UpdatePreferences(request.MinAgePreference, request.MaxAgePreference, request.MaxDistanceKm, request.lookingFor);
        await profileRepository.UpdateAsync(profile);
        return true;
    }
}
