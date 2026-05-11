using DoAnTotNghiep.Domain.Common;
using System;

namespace DoAnTotNghiep.Domain.Users;

public class UserSwipe : BaseEntity
{
    public Guid ActorId { get; private set; }
    public Guid TargetId { get; private set; }
    public SwipeType Type { get; private set; }

    private UserSwipe() { } // For MongoDB serialization

    public UserSwipe(Guid actorId, Guid targetId, SwipeType type)
    {
        Id = Guid.NewGuid();
        ActorId = actorId;
        TargetId = targetId;
        Type = type;
        SetUpdated();
    }
}

public enum SwipeType
{
    Like = 1,
    Dislike = 2,
    SuperLike = 3
}
