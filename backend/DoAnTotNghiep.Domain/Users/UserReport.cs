using System;
using System.Collections.Generic;

namespace DoAnTotNghiep.Domain.Users;

public class UserReport
{
    public Guid Id { get; private set; }
    public Guid ReporterId { get; private set; }
    public Guid TargetUserId { get; private set; }
    public string Reason { get; private set; }
    public string Description { get; private set; }
    public List<string> EvidencePhotos { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public ReportStatus Status { get; private set; }

    public UserReport(Guid reporterId, Guid targetUserId, string reason, string description, List<string> evidencePhotos)
    {
        Id = Guid.NewGuid();
        ReporterId = reporterId;
        TargetUserId = targetUserId;
        Reason = reason;
        Description = description;
        EvidencePhotos = evidencePhotos ?? new List<string>();
        CreatedAt = DateTime.UtcNow;
        Status = ReportStatus.Pending;
    }

    public void Resolve() => Status = ReportStatus.Resolved;
    public void Dismiss() => Status = ReportStatus.Dismissed;
}

public enum ReportStatus
{
    Pending = 0,
    Resolved = 1,
    Dismissed = 2
}
