using DoAnTotNghiep.Domain.Common;

namespace DoAnTotNghiep.Domain.Users;

public class UserProfile(Guid userId) : BaseEntity
{
    public Guid UserId { get; private set; } = userId;

    // Allow MongoDB to deserialize legacy `Photos` field.
    public List<Photo> Photos { get; private set; } = [];
    public string Bio { get; private set; } = string.Empty;
    public string Gender { get; private set; } = string.Empty;
    public string InterestedIn { get; private set; } = string.Empty;


    public double Latitude { get; private set; } = 0;
    public double Longitude { get; private set; } = 0;
    public string LocationName { get; private set; } = string.Empty;


    public int MinAgePreference { get; private set; } = 18;
    public int MaxAgePreference { get; private set; } = 100;
    public int MaxDistanceKm { get; private set; } = 50;

    public void UpdateBio(string bio, string gender, string interestedIn)
    {
        Bio = bio;
        Gender = gender;
        InterestedIn = interestedIn;
        SetUpdated();
    }

    public void UpdateLocation(double lat, double lon, string locationName)
    {
        Latitude = lat;
        Longitude = lon;
        LocationName = locationName;
        SetUpdated();
    }

    public void UpdatePreferences(int minAge, int maxAge, int maxDistance)
    {
        MinAgePreference = minAge;
        MaxAgePreference = maxAge;
        MaxDistanceKm = maxDistance;
        SetUpdated();
    }
}
