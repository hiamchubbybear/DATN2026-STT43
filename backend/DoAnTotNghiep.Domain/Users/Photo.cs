using MongoDB.Bson.Serialization.Attributes;

namespace DoAnTotNghiep.Domain.Users;

[BsonIgnoreExtraElements]
public class Photo
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Url { get; set; } = default!;
    public string? ThumbnailUrl { get; set; }
    public int Order { get; set; }
    public bool IsPrimary { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public void SetPrimary(bool value)
    {
        IsPrimary = value;
    }
    public void SetOrder(int order)
    {
        Order = order;
    }
}