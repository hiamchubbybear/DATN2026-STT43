using DoAnTotNghiep.Domain.Common;

namespace DoAnTotNghiep.Domain.Users;

public class BlockedUser : BaseEntity
{
    public Guid BlockerId { get; private set; }
    public Guid BlockedId { get; private set; }
    public string? Reason { get; private set; }

    private BlockedUser() { }

    public BlockedUser(Guid blockerId, Guid blockedId, string? reason = null)
    {
        BlockerId = blockerId;
        BlockedId = blockedId;
        Reason = reason;
    }
}
