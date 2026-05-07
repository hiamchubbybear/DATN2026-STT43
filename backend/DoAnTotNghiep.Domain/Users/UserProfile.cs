using DoAnTotNghiep.Domain.Common;
using DoAnTotNghiep.Domain.Enum;

namespace DoAnTotNghiep.Domain.Users;

public class UserProfile(Guid userId) : BaseEntity
{
    public Guid UserId { get; private set; } = userId;

    public BasicInfo BasicInfo { get; private set; } = new();
    public Background Background { get; private set; } = new();
    public Lifestyle Lifestyle { get; private set; } = new();
    public DatingStyle DatingStyle { get; private set; } = new();


    public List<Photo> Photos { get; private set; } = [];

    // Existing fields for ProfileHandlers

    public string Bio { get; private set; } = string.Empty;
    public Gender Gender => BasicInfo.Gender;
    public string InterestedIn { get; private set; } = string.Empty;

    public double Latitude { get; private set; } = 0;
    public double Longitude { get; private set; } = 0;
    public string LocationName { get; private set; } = string.Empty;

    public GenderPreference LookingFor { get; private set; } = GenderPreference.Everyone;
    public int MinAgePreference { get; private set; } = 18;
    public int MaxAgePreference { get; private set; } = 100;
    public int MaxDistanceKm { get; private set; } = 50;


    public void UpdateBasicInfo(string displayName, DateTime dob, Gender gender, List<string> languages)
    {
        BasicInfo.Update(displayName, dob, gender, languages);
        SetUpdated();
    }

    public void UpdateBackground(string education, string occupation)
    {
        Background.Update(education, occupation);
        SetUpdated();
    }

    public void UpdateLifestyle(string drinking, string smoking, string socialLevel, string personalityType, List<string> loveLanguage, List<string> hobbies, List<string> interests)
    {
        Lifestyle.Update(drinking, smoking, socialLevel, personalityType, loveLanguage, hobbies, interests);
        SetUpdated();
    }

    public void UpdateDatingStyle(List<string> freeTimePrefer, List<string> dateStyle)
    {
        DatingStyle.Update(freeTimePrefer, dateStyle);
        SetUpdated();
    }

    public void UpdateBio(string bio, Gender gender, string interestedIn)
    {
        Bio = bio?.Trim() ?? string.Empty;
        SetUpdated();
    }

    public void UpdateLocation(double latitude, double longitude, string locationName)
    {
        Latitude = latitude;
        Longitude = longitude;
        LocationName = locationName?.Trim() ?? string.Empty;
        SetUpdated();
    }

    public void UpdatePreferences(int minAge, int maxAge, int distance, GenderPreference lookingFor)
    {
        if (minAge < 18)
            throw new ArgumentException("Min age must >= 18");
        if (maxAge < minAge)
            throw new ArgumentException("Invalid age range");
        if (distance <= 0)
            throw new ArgumentException("Distance must > 0");
        LookingFor = lookingFor;
        MinAgePreference = minAge;
        MaxAgePreference = maxAge;
        MaxDistanceKm = distance;
        SetUpdated();
    }

    public void AddPhoto(Photo photo)
    {
        if (!Photos.Any())
        {
            photo.SetPrimary(true);
        }

        photo.SetOrder(Photos.Count);
        Photos.Add(photo);
        SetUpdated();
    }

    public void RemovePhoto(Guid photoId)
    {
        var photo = Photos.FirstOrDefault(x => x.Id == photoId);
        if (photo == null)
            throw new Exception("Photo not found");

        if (Photos.Count == 1)
            throw new Exception("Cannot delete last photo");

        var wasPrimary = photo.IsPrimary;

        Photos.Remove(photo);

        // nếu xoá primary → set lại
        if (wasPrimary)
        {
            Photos[0].SetPrimary(true);
        }
        ReorderInternal();
        SetUpdated();
    }

    public void ReorderPhotos(List<Guid> orderedIds)
    {
        if (orderedIds.Count != Photos.Count)
            throw new Exception("Invalid reorder data");

        var map = Photos.ToDictionary(x => x.Id);

        var sorted = new List<Photo>();

        for (int i = 0; i < orderedIds.Count; i++)
        {
            if (!map.ContainsKey(orderedIds[i]))
                throw new Exception("Invalid photo");

            var photo = map[orderedIds[i]];
            photo.SetOrder(i);
            photo.SetPrimary(i == 0);

            sorted.Add(photo);
        }

        Photos.Clear();
        Photos.AddRange(sorted);

        SetUpdated();
    }

    private void ReorderInternal()
    {
        for (int i = 0; i < Photos.Count; i++)
        {
            Photos[i].SetOrder(i);
        }
    }

    public void SetPrimaryPhoto(Guid photoId)
    {
        var target = Photos.FirstOrDefault(x => x.Id == photoId);
        if (target == null)
            throw new Exception("Photo not found");

        if (target.IsPrimary) return;

        foreach (var p in Photos)
        {
            p.SetPrimary(false);
        }

        target.SetPrimary(true);
        Photos.Remove(target);
        Photos.Insert(0, target);
        ReorderInternal();
        SetUpdated();
    }
}

public class BasicInfo
{
    public string DisplayName { get; private set; } = string.Empty;
    public DateTime Dob { get; private set; }
    public Gender Gender { get; private set; } = Gender.Other;
    public List<string> Languages { get; private set; } = new();

    public void Update(string name, DateTime dob, Gender gender, List<string> languages)
    {
        DisplayName = name?.Trim() ?? "";
        Dob = dob;
        Gender = gender;

        Languages = (languages ?? [])
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(x => x.Trim().ToLower())
            .Distinct()
            .ToList();
    }
}

public class Background
{
    public string Education { get; private set; } = string.Empty;
    public string Occupation { get; private set; } = string.Empty;

    public void Update(string education, string occupation)
    {
        Education = education?.Trim() ?? "";
        Occupation = occupation?.Trim() ?? "";
    }
}
public class Lifestyle
{
    public string Drinking { get; private set; } = string.Empty;
    public string Smoking { get; private set; } = string.Empty;
    public string SocialLevel { get; private set; } = string.Empty;
    public string PersonalityType { get; private set; } = string.Empty;

    public List<string> LoveLanguage { get; private set; } = new();
    public List<string> Hobbies { get; private set; } = new();
    public List<string> Interests { get; private set; } = new();

    public void Update(
        string drinking,
        string smoking,
        string socialLevel,
        string personalityType,
        List<string> loveLanguage,
        List<string> hobbies,
        List<string> interests)
    {
        Drinking = drinking ?? "";
        Smoking = smoking ?? "";
        SocialLevel = socialLevel ?? "";
        PersonalityType = personalityType ?? "";

        LoveLanguage = Normalize(loveLanguage);
        Hobbies = Normalize(hobbies);
        Interests = Normalize(interests);
    }

    private static List<string> Normalize(List<string>? list)
    {
        return (list ?? [])
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(x => x.Trim().ToLower())
            .Distinct()
            .ToList();
    }
}

public class DatingStyle
{
    public List<string> FreeTimePrefer { get; private set; } = new();
    public List<string> DateStyle { get; private set; } = new();

    public void Update(List<string> freeTimePrefer, List<string> dateStyle)
    {
        FreeTimePrefer = Normalize(freeTimePrefer);
        DateStyle = Normalize(dateStyle);
    }

    private static List<string> Normalize(List<string>? list)
    {
        return (list ?? [])
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(x => x.Trim().ToLower())
            .Distinct()
            .ToList();
    }
}
