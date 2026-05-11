using DoAnTotNghiep.Domain.Common;
using System;

namespace DoAnTotNghiep.Domain.Users;

public class UserMatch : BaseEntity
{
    public Guid UserOneId { get; private set; }
    public Guid UserTwoId { get; private set; }
    public DateTime MatchedAt { get; private set; }

    private UserMatch() { }

    public UserMatch(Guid userOneId, Guid userTwoId)
    {
        Id = Guid.NewGuid();
        // Ensure consistent ordering to avoid duplicate matches (UserA-UserB and UserB-UserA)
        if (userOneId.CompareTo(userTwoId) < 0)
        {
            UserOneId = userOneId;
            UserTwoId = userTwoId;
        }
        else
        {
            UserOneId = userTwoId;
            UserTwoId = userOneId;
        }
        MatchedAt = DateTime.UtcNow;
        SetUpdated();
    }
}
