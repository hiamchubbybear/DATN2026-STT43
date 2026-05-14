using System;
using System.Collections.Generic;

namespace DoAnTotNghiep.Domain.Users;

public class UserReport
{
    public Guid Id { get; set; }
    public Guid ReporterId { get; set; }
    public Guid TargetUserId { get; set; }
    public string Reason { get; set; }
    public string Description { get; set; }
    public List<string> EvidencePhotos { get; set; }
    public DateTime CreatedAt { get; set; }
    public ReportStatus Status { get; set; }
    public string? AdminFeedback { get; set; }
    public string? ActionTaken { get; set; }
    public DateTime? ResolvedAt { get; set; }

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

    public void Resolve(string? feedback = null, string? action = null)
    {
        Status = ReportStatus.Resolved;
        AdminFeedback = feedback;
        ActionTaken = action;
        ResolvedAt = DateTime.UtcNow;
    }

    public void Dismiss(string? feedback = null)
    {
        Status = ReportStatus.Dismissed;
        AdminFeedback = feedback;
        ResolvedAt = DateTime.UtcNow;
    }
}

public enum ReportStatus
{
    Pending = 0,
    Resolved = 1,
    Dismissed = 2
}
