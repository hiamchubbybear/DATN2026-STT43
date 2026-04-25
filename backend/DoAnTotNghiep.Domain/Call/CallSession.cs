using DoAnTotNghiep.Domain.Common;
using System;

namespace DoAnTotNghiep.Domain.Call;

public class CallSession : BaseEntity
{
    public Guid MatchId { get; private set; }
    public string CallerId { get; private set; } = string.Empty;
    public string ReceiverId { get; private set; } = string.Empty;
    public string CallType { get; private set; } = string.Empty; // "Audio", "Video"
    public string Status { get; private set; } = string.Empty; // "Initiated", "Ringing", "Accepted", "Completed", "Missed", "Rejected", "Failed"
    
    public DateTime? StartedAt { get; private set; }
    public DateTime? EndedAt { get; private set; }
    
    public string? EndReason { get; private set; } // e.g., "ICE_FAILED", "USER_HUNG_UP"
    public bool UsedTurnServer { get; private set; }

    private CallSession() { } // ORM

    public static CallSession Initiate(Guid matchId, string callerId, string receiverId, string callType)
    {
        return new CallSession
        {
            MatchId = matchId,
            CallerId = callerId,
            ReceiverId = receiverId,
            CallType = callType,
            Status = "Initiated"
        };
    }

    public void Accept()
    {
        Status = "Accepted";
        StartedAt = DateTime.UtcNow;
        SetUpdated();
    }

    public void End(string reason, bool turnUsed)
    {
        Status = "Completed";
        EndReason = reason;
        UsedTurnServer = turnUsed;
        EndedAt = DateTime.UtcNow;
        SetUpdated();
    }

    public void MarkFailed(string reason)
    {
        Status = "Failed";
        EndReason = reason;
        EndedAt = DateTime.UtcNow;
        SetUpdated();
    }
}
