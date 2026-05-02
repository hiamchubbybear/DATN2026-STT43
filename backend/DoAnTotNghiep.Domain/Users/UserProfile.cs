using DoAnTotNghiep.Domain.Common;

namespace DoAnTotNghiep.Domain.Users;

public class UserProfile(Guid userId) : BaseEntity
{
    public Guid UserId { get; private set; } = userId;

    public BasicInfo BasicInfo { get; private set; } = new();
    public Background Background { get; private set; } = new();
    public Lifestyle Lifestyle { get; private set; } = new();
    public DatingStyle DatingStyle { get; private set; } = new();

    public List<Photo> Photos { get; set; } = [];

    // Existing fields for ProfileHandlers
    public string Bio { get; private set; } = string.Empty;
    public string Gender => BasicInfo.Gender;
    public string InterestedIn { get; private set; } = string.Empty;
    public double Latitude { get; private set; } = 0;
    public double Longitude { get; private set; } = 0;
    public string LocationName { get; private set; } = string.Empty;
    public int MinAgePreference { get; private set; } = 18;
    public int MaxAgePreference { get; private set; } = 100;
    public int MaxDistanceKm { get; private set; } = 50;


    public void UpdateBasicInfo(string displayName, DateTime dob, string gender, List<string> languages)
    {
        BasicInfo = new BasicInfo
        {
            DisplayName = displayName,
            Dob = dob,
            Gender = gender,
            Languages = languages
        };
        SetUpdated();
    }

    public void UpdateBackground(string education, string occupation)
    {
        Background = new Background
        {
            Education = education,
            Occupation = occupation
        };
        SetUpdated();
    }

    public void UpdateLifestyle(string drinking, string smoking, string socialLevel, string personalityType, List<string> loveLanguage, List<string> hobbies, List<string> interests)
    {
        Lifestyle = new Lifestyle
        {
            Drinking = drinking,
            Smoking = smoking,
            SocialLevel = socialLevel,
            PersonalityType = personalityType,
            LoveLanguage = loveLanguage,
            Hobbies = hobbies,
            Interests = interests
        };
        SetUpdated();
    }

    public void UpdateDatingStyle(List<string> freeTimePrefer, List<string> dateStyle)
    {
        DatingStyle = new DatingStyle
        {
            FreeTimePrefer = freeTimePrefer,
            DateStyle = dateStyle
        };
        SetUpdated();
    }

    public void UpdateBio(string bio, string gender, string interestedIn)
    {
        Bio = bio;
        BasicInfo = new BasicInfo
        {
            DisplayName = BasicInfo.DisplayName,
            Dob = BasicInfo.Dob,
            Gender = gender,
            Languages = BasicInfo.Languages
        };
        InterestedIn = interestedIn;
        SetUpdated();
    }

    public void UpdateLocation(double latitude, double longitude, string locationName)
    {
        Latitude = latitude;
        Longitude = longitude;
        LocationName = locationName;
        SetUpdated();
    }

    public void UpdatePreferences(int minAge, int maxAge, int distance)
    {
        MinAgePreference = minAge;
        MaxAgePreference = maxAge;
        MaxDistanceKm = distance;
        SetUpdated();
    }
}

public class BasicInfo
{
    public string DisplayName { get; set; } = string.Empty;
    public DateTime Dob { get; set; }
    public string Gender { get; set; } = string.Empty; // 'Male', 'Female', 'Other'
    public List<string> Languages { get; set; } = new();
}

public class Background
{
    public string Education { get; set; } = string.Empty;
    public string Occupation { get; set; } = string.Empty;
}

public class Lifestyle
{
    public string Drinking { get; set; } = string.Empty;
    public string Smoking { get; set; } = string.Empty;
    public string SocialLevel { get; set; } = string.Empty;
    public string PersonalityType { get; set; } = string.Empty;
    public List<string> LoveLanguage { get; set; } = new();
    public List<string> Hobbies { get; set; } = new();
    public List<string> Interests { get; set; } = new();
}

public class DatingStyle
{
    public List<string> FreeTimePrefer { get; set; } = new();
    public List<string> DateStyle { get; set; } = new();
}
