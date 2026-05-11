using DoAnTotNghiep.Application.Observability;
using Prometheus;

namespace DoAnTotNghiep.Infrastructure.Observability;

/// <summary>
/// Implements business metrics using Prometheus counters and histograms.
/// </summary>
public class PrometheusMetricsService : IMetricsService
{
    // --- Swipe Metrics ---
    private static readonly Counter SwipeActionsTotal = Metrics.CreateCounter(
        "swipe_actions_total",
        "Total number of swipe actions performed.",
        labelNames: ["type"] // Like, Dislike, SuperLike
    );

    private static readonly Counter MatchesCreatedTotal = Metrics.CreateCounter(
        "matches_created_total",
        "Total number of mutual matches created."
    );

    // --- Notification Metrics ---
    private static readonly Counter NotificationsSentTotal = Metrics.CreateCounter(
        "notifications_sent_total",
        "Total number of notifications sent.",
        labelNames: ["channel"] // push, email
    );

    // --- Auth Metrics ---
    private static readonly Counter LoginAttemptsTotal = Metrics.CreateCounter(
        "login_attempts_total",
        "Total login attempts.",
        labelNames: ["success", "method"] // true/false, email/google
    );

    // --- Implementations ---
    public void RecordSwipeAction(string swipeType)
        => SwipeActionsTotal.WithLabels(swipeType.ToLowerInvariant()).Inc();

    public void RecordMatchCreated()
        => MatchesCreatedTotal.Inc();

    public void RecordNotificationSent(string channel)
        => NotificationsSentTotal.WithLabels(channel.ToLowerInvariant()).Inc();

    public void RecordLoginAttempt(bool success, string method)
        => LoginAttemptsTotal.WithLabels(success.ToString().ToLowerInvariant(), method.ToLowerInvariant()).Inc();
}
