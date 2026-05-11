using DoAnTotNghiep.Domain.Common;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace DoAnTotNghiep.Domain.Users;

public enum SwipeType { Like = 1, Dislike = 2, SuperLike = 3 }

public class UserSwipe : BaseEntity
{
    [BsonRepresentation(BsonType.String)]
    public Guid SwiperId { get; private set; }

    [BsonRepresentation(BsonType.String)]
    public Guid TargetId { get; private set; }

    public SwipeType Type { get; private set; }

    public UserSwipe(Guid swiperId, Guid targetId, SwipeType type)
    {
        SwiperId = swiperId;
        TargetId = targetId;
        Type = type;
    }
}

public class UserMatch : BaseEntity
{
    [BsonRepresentation(BsonType.String)]
    public Guid User1Id { get; private set; }

    [BsonRepresentation(BsonType.String)]
    public Guid User2Id { get; private set; }

    public UserMatch(Guid user1Id, Guid user2Id)
    {
        User1Id = user1Id;
        User2Id = user2Id;
    }
}
