using DoAnTotNghiep.Domain.Common;

namespace DoAnTotNghiep.Domain.Admin;

public class BroadcastNotification : BaseEntity
{
    public string Title { get; private set; } = null!;
    public string Content { get; private set; } = null!;
    public string TargetPlatform { get; private set; } = null!; // "All", "iOS", "Android"
    public Guid SentBy { get; private set; }
    public int SentCount { get; private set; }

    private BroadcastNotification() { }

    public BroadcastNotification(string title, string content, string target, Guid adminId, int count)
    {
        Title = title;
        Content = content;
        TargetPlatform = target;
        SentBy = adminId;
        SentCount = count;
    }
}
