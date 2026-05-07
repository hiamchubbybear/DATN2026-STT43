namespace DoAnTotNghiep.Infrastructure.Risk;

/// <summary>
/// Bound to the <c>RiskScoring</c> section of <c>appsettings.json</c>.
///
/// Defaults are tuned so that a missing or partial config (e.g. AI service
/// not yet deployed) leaves the chat path fully functional but unscored.
/// </summary>
public class RiskScoringOptions
{
    public const string SectionName = "RiskScoring";

    public string BaseUrl { get; set; } = string.Empty;

    public string InternalToken { get; set; } = string.Empty;

    public int TimeoutMs { get; set; } = 800;

    public int PerAttemptTimeoutMs { get; set; } = 300;

    public int RetryCount { get; set; } = 1;

    public bool Enabled { get; set; } = true;

    public double ThresholdMedium { get; set; } = 0.5;

    public double ThresholdHigh { get; set; } = 0.8;

    public double ThresholdCritical { get; set; } = 0.95;
}
