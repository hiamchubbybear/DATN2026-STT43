using DoAnTotNghiep.Domain.Common;
using MongoDB.Bson.Serialization.Attributes;

namespace DoAnTotNghiep.Domain.Users;

[BsonIgnoreExtraElements]
public class AppReview : BaseEntity
{
    public Guid UserId { get; private set; }
    public int Rating { get; private set; } // 1-5
    public string Comment { get; private set; }
    public string? AdminReply { get; private set; }
    public DateTime? RepliedAt { get; private set; }

    private AppReview() { }

    public AppReview(Guid userId, int rating, string comment)
    {
        UserId = userId;
        Rating = rating;
        Comment = comment;
    }

    public void Reply(string reply)
    {
        AdminReply = reply;
        RepliedAt = DateTime.UtcNow;
    }
}
