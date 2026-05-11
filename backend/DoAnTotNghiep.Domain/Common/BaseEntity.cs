using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace DoAnTotNghiep.Domain.Common;

public abstract class BaseEntity
{
    [BsonId]
    public Guid Id { get; protected set; } = Guid.NewGuid();

    public DateTime CreatedAt { get; protected set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; protected set; }

    public void SetUpdated()
    {
        UpdatedAt = DateTime.UtcNow;
    }
}
