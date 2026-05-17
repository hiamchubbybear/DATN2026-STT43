namespace DoAnTotNghiep.Application.Common;

/// <summary>
/// Sends a user's behavioral feature vector to the Python AI microservice
/// and returns a scam probability score with a recommended action.
/// </summary>
public interface IScamDetectionService
{
    /// <summary>
    /// Returns null when the AI service is unavailable (non-fatal).
    /// Callers should fall back to rule-based checks in that case.
    /// </summary>
    Task<ScamDetectionResultDto?> PredictAsync(ScamFeaturesDto features, CancellationToken ct = default);
}

// ── Request DTO ───────────────────────────────────────────────────────────────

/// <summary>
/// Behavioral signals aggregated from Redis and MongoDB by the C# backend.
/// Field names mirror the Python Pydantic model (camelCase).
/// </summary>
public class ScamFeaturesDto
{
    /// <summary>Average hourly swipe rate over the last 24 hours.</summary>
    public double SwipesPerHour { get; set; }

    /// <summary>Total spam links sent (running total from Redis).</summary>
    public int SpamLinkCount { get; set; }

    /// <summary>Total reports received from other users (from MongoDB UserReport).</summary>
    public int ReportCount { get; set; }

    /// <summary>Fraction of profile fields that are filled in (0.0–1.0).</summary>
    public double ProfileCompleteness { get; set; }

    /// <summary>Whether the user has uploaded at least one profile photo.</summary>
    public bool HasProfilePhoto { get; set; }

    /// <summary>Whether the user passed biometric face verification.</summary>
    public bool IsFaceVerified { get; set; }

    /// <summary>Whether the bio contains contact information (phone/social handle).</summary>
    public bool BioHasContact { get; set; }
}

// ── Response DTO ──────────────────────────────────────────────────────────────

/// <summary>
/// Scam prediction result returned by the Python AI microservice.
/// </summary>
public class ScamDetectionResultDto
{
    /// <summary>Model confidence that this is a scam account (0.0–1.0).</summary>
    public double ScamProbability { get; set; }

    /// <summary>One of: low | medium | high | critical.</summary>
    public string RiskLevel { get; set; } = "low";

    /// <summary>
    /// Readable names of individual rule thresholds that were exceeded,
    /// e.g. ["swipe_speed_burst", "multiple_reports"].
    /// </summary>
    public List<string> TriggeredRules { get; set; } = new();

    /// <summary>Suggested moderation action: none | warn | shadow_ban | ban.</summary>
    public string Recommendation { get; set; } = "none";
}
