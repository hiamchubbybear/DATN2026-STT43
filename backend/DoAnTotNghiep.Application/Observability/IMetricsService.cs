namespace DoAnTotNghiep.Application.Observability;

/// <summary>
/// Business-level metrics service for tracking domain events.
/// </summary>
public interface IMetricsService
{
    // Swipe metrics
    void RecordSwipeAction(string swipeType); // Like, Dislike, SuperLike
    void RecordMatchCreated();

    // Notification metrics
    void RecordNotificationSent(string channel); // push, email

    // Auth metrics
    void RecordLoginAttempt(bool success, string method); // email, google
}
