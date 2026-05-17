namespace DoAnTotNghiep.Application.Common;

public interface IFraudDetectionService
{
    /// <summary>
    /// Checks if a message contains spam links or follows mass messaging patterns.
    /// </summary>
    Task<(bool IsSpam, string? Reason)> AnalyzeMessageAsync(Guid userId, string content, CancellationToken ct = default);

    /// <summary>
    /// Checks if a user is swiping too fast.
    /// </summary>
    Task<bool> IsSwipingTooFastAsync(Guid userId, CancellationToken ct = default);

    /// <summary>
    /// Checks if a user has multiple active sessions from different devices.
    /// </summary>
    Task<bool> HasSuspiciousDevicePatternAsync(Guid userId, string currentDeviceId, CancellationToken ct = default);

    /// <summary>
    /// Checks if a user is "high risk" based on accumulated reports.
    /// </summary>
    Task<bool> IsHighRiskUserAsync(Guid userId, CancellationToken ct = default);

    /// <summary>
    /// Aggregates all 7 behavioral signals for a user into a ScamFeaturesDto.
    /// </summary>
    Task<ScamFeaturesDto> GetScamFeaturesAsync(Guid userId, CancellationToken ct = default);

    /// <summary>
    /// Scores a user with the ML model and automatically applies moderation if needed.
    /// </summary>
    Task<ScamDetectionResultDto?> ScoreAndModerateUserAsync(Guid userId, CancellationToken ct = default);
}
