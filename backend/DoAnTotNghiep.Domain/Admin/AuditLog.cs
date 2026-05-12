using DoAnTotNghiep.Domain.Common;

namespace DoAnTotNghiep.Domain.Admin;

public class AuditLog : BaseEntity
{
    public Guid ActorId { get; private set; } // Admin Id
    public string ActorEmail { get; private set; } = null!;
    public string Action { get; private set; } = null!; // e.g., "BAN_USER", "DELETE_PHOTO"
    public string TargetId { get; private set; } = null!; // The Id of the object being acted upon
    public string Details { get; private set; } = null!; // e.g., "Banned user because of spam"
    public string IpAddress { get; private set; } = null!;

    private AuditLog() { }

    public AuditLog(Guid actorId, string actorEmail, string action, string targetId, string details, string ipAddress)
    {
        ActorId = actorId;
        ActorEmail = actorEmail;
        Action = action;
        TargetId = targetId;
        Details = details;
        IpAddress = ipAddress;
    }
}
