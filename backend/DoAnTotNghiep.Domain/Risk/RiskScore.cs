using System;
using System.Collections.Generic;

namespace DoAnTotNghiep.Domain.Risk;

public class RiskScore
{
    public double Score { get; private set; }
    public List<string> Labels { get; private set; } = new();
    public string ModelVersion { get; private set; } = string.Empty;
    public DateTime ScoredAt { get; private set; }
    public List<RiskExplanation> Explanations { get; private set; } = new();

    private RiskScore() { }

    public RiskScore(
        double score,
        IEnumerable<string> labels,
        string modelVersion,
        DateTime scoredAt,
        IEnumerable<RiskExplanation> explanations)
    {
        if (double.IsNaN(score) || score < 0d || score > 1d)
        {
            throw new ArgumentOutOfRangeException(nameof(score), score, "Score must be in [0, 1].");
        }
        if (string.IsNullOrWhiteSpace(modelVersion))
        {
            throw new ArgumentException("Model version is required.", nameof(modelVersion));
        }

        Score = score;
        Labels = new List<string>(labels);
        ModelVersion = modelVersion;
        ScoredAt = scoredAt;
        Explanations = new List<RiskExplanation>(explanations);
    }

    public RiskLevel GetLevel(double mediumThreshold, double highThreshold, double criticalThreshold)
    {
        if (Score >= criticalThreshold) return RiskLevel.Critical;
        if (Score >= highThreshold) return RiskLevel.High;
        if (Score >= mediumThreshold) return RiskLevel.Medium;
        return RiskLevel.Low;
    }
}
