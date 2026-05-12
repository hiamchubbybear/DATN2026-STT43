using DoAnTotNghiep.Domain.Common;

namespace DoAnTotNghiep.Domain.Chat;

public class CallSession : BaseEntity
{
    public Guid MatchId { get; private set; }
    public Guid CallerId { get; private set; }
    public Guid ReceiverId { get; private set; }
    public string CallType { get; private set; } = null!; // "audio", "video"
    public string Status { get; private set; } = null!; // "initiating", "ringing", "ongoing", "completed", "missed", "rejected"
    public DateTime? StartedAt { get; private set; }
    public DateTime? EndedAt { get; private set; }

    private CallSession() { }

    public CallSession(Guid matchId, Guid callerId, Guid receiverId, string callType)
    {
        MatchId = matchId;
        CallerId = callerId;
        ReceiverId = receiverId;
        CallType = callType;
        Status = "initiating";
    }

    public void Accept()
    {
        Status = "ongoing";
        StartedAt = DateTime.UtcNow;
    }

    public void End()
    {
        Status = "completed";
        EndedAt = DateTime.UtcNow;
    }
}
