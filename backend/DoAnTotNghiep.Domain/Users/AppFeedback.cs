using DoAnTotNghiep.Domain.Common;

namespace DoAnTotNghiep.Domain.Users;

public class AppFeedback : BaseEntity
{
    public Guid UserId { get; private set; }
    public string Title { get; private set; } = null!;
    public string Content { get; private set; } = null!;
    public string Category { get; private set; } = null!; // Bug, Suggestion, UI/UX
    public FeedbackStatus Status { get; private set; } = FeedbackStatus.New;

    private AppFeedback() { }

    public AppFeedback(Guid userId, string title, string content, string category)
    {
        UserId = userId;
        Title = title;
        Content = content;
        Category = category;
    }

    public void MarkAsInReview() => Status = FeedbackStatus.InReview;
    public void MarkAsResolved() => Status = FeedbackStatus.Resolved;
}

public enum FeedbackStatus
{
    New = 0,
    InReview = 1,
    Resolved = 2
}
