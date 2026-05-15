using DoAnTotNghiep.Domain.Common;
using DoAnTotNghiep.Domain.Enum;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;

namespace DoAnTotNghiep.Domain.Users;

[BsonIgnoreExtraElements]
public class UserProfile(Guid userId) : BaseEntity
{
    [BsonConstructor]
    private UserProfile() : this(Guid.Empty) { }

    [BsonElement]
    public Guid UserId { get; private set; } = userId;
    public string Email { get; set; } = string.Empty;
    [BsonElement]
    public UserStatus Status { get; private set; } = UserStatus.Active;
    public DateTime? SuspendedUntil { get; private set; }
    public bool IsIdentityVerified { get; private set; } = false;

    [BsonElement]
    public BasicInfo BasicInfo { get; private set; } = new();
    
    [BsonElement]
    public Background Background { get; private set; } = new();
    
    [BsonElement]
    public Lifestyle Lifestyle { get; private set; } = new();
    
    [BsonElement]
    public DatingStyle DatingStyle { get; private set; } = new();
    
    [BsonElement]
    public List<Photo> Photos { get; set; } = [];

    [BsonElement]
    public string Bio { get; private set; } = string.Empty;
    
    public Gender Gender => BasicInfo.Gender;
    
    [BsonElement]
    public string InterestedIn { get; private set; } = string.Empty;

    [BsonElement]
    public double Latitude { get; private set; } = 0;
    
    [BsonElement]
    public double Longitude { get; private set; } = 0;
    
    [BsonElement]
    public Point Location { get; private set; } = new(0, 0);
    
    [BsonElement]
    public string LocationName { get; private set; } = string.Empty;

    [BsonElement]
    public GenderPreference LookingFor { get; private set; } = GenderPreference.Everyone;
    
    [BsonElement]
    public int MinAgePreference { get; private set; } = 18;
    
    [BsonElement]
    public int MaxAgePreference { get; private set; } = 100;
    
    [BsonElement]
    public int MaxDistanceKm { get; private set; } = 50;

    public void Ban()
    {
        Status = UserStatus.Banned;
        SetUpdated();
    }

    public void Restore()
    {
        Status = UserStatus.Active;
        SuspendedUntil = null;
        SetUpdated();
    }

    public void Suspend(int days)
    {
        Status = UserStatus.Suspended;
        SuspendedUntil = DateTime.UtcNow.AddDays(days);
        SetUpdated();
    }

    public void ShadowBan()
    {
        Status = UserStatus.ShadowBanned;
        SetUpdated();
    }

    public void MarkAsIdentityVerified()
    {
        IsIdentityVerified = true;
        SetUpdated();
    }


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
        BasicInfo.Gender = gender;
        InterestedIn = interestedIn?.Trim() ?? string.Empty;
        SetUpdated();
    }

    public void UpdateLocation(double latitude, double longitude, string locationName)
    {
        if (latitude < -90 || latitude > 90)
            throw new ArgumentException("Invalid latitude");

        if (longitude < -180 || longitude > 180)
            throw new ArgumentException("Invalid longitude");
        Latitude = latitude;
        Longitude = longitude;
        Location = new Point(longitude, latitude);
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
        if (photo == null)
            throw new ArgumentNullException(nameof(photo));

        if (!Photos.Any())
        {
            photo.SetPrimary(true);
        }
        else
        {
            if (photo.IsPrimary)
            {
                foreach (var p in Photos)
                    p.SetPrimary(false);
            }
            else
            {
                if (!Photos.Any(p => p.IsPrimary))
                    photo.SetPrimary(true);
            }
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

[BsonIgnoreExtraElements]
public class BasicInfo
{
    public string DisplayName { get; set; } = string.Empty;
    public DateTime Dob { get; set; }

    [BsonSerializer(typeof(SafeEnumSerializer<Gender>))]
    public Gender Gender { get; set; } = Gender.Other;
    public int Age => DateTime.Now.Year - Dob.Year - (DateTime.UtcNow.DayOfYear < Dob.DayOfYear ? 1 : 0);
    public List<string> Languages { get; set; } = new();

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

[BsonIgnoreExtraElements]
public class Background
{
    public string Education { get; set; } = string.Empty;
    public string Occupation { get; set; } = string.Empty;

    public void Update(string education, string occupation)
    {
        Education = education?.Trim() ?? "";
        Occupation = occupation?.Trim() ?? "";
    }
}

[BsonIgnoreExtraElements]
public class Lifestyle
{
    public string Drinking { get; set; } = string.Empty;
    public string Smoking { get; set; } = string.Empty;
    public string SocialLevel { get; set; } = string.Empty;
    public string PersonalityType { get; set; } = string.Empty;

    public List<string> LoveLanguage { get; set; } = new();
    public List<string> Hobbies { get; set; } = new();
    public List<string> Interests { get; set; } = new();

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

[BsonIgnoreExtraElements]
public class DatingStyle
{
    public List<string> FreeTimePrefer { get; set; } = new();
    public List<string> DateStyle { get; set; } = new();

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
