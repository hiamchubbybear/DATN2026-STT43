using System.Text.RegularExpressions;
using DoAnTotNghiep.Application.Common;
using StackExchange.Redis;
using System;
using DoAnTotNghiep.Domain.Users;

namespace DoAnTotNghiep.Infrastructure.FraudDetection;

public class FraudDetectionService : IFraudDetectionService
{
    private readonly IConnectionMultiplexer _redis;
    private readonly IUserReportRepository _reportRepository;
    private static readonly Regex UrlRegex = new Regex(@"(https?:\/\/[^\s]+)", RegexOptions.Compiled | RegexOptions.IgnoreCase);
    private static readonly string[] SpamKeywords = { "free money", "crypto investment", "win prize", "scam", "telegram.me", "t.me" };

    public FraudDetectionService(IConnectionMultiplexer redis, IUserReportRepository reportRepository)
    {
        _redis = redis;
        _reportRepository = reportRepository;
    }

    public async Task<(bool IsSpam, string? Reason)> AnalyzeMessageAsync(Guid userId, string content, CancellationToken ct = default)
    {
        // 1. Check for spam links
        if (UrlRegex.IsMatch(content))
        {
            return (true, "Contains external link (Potential Spam)");
        }

        // 2. Check for spam keywords
        foreach (var keyword in SpamKeywords)
        {
            if (content.Contains(keyword, StringComparison.OrdinalIgnoreCase))
            {
                return (true, $"Contains suspicious keyword: {keyword}");
            }
        }

        // 3. Mass messaging detection (Rate limiting)
        var db = _redis.GetDatabase();
        var key = $"mass_msg:{userId}:{DateTime.UtcNow:yyyyMMddHH}"; // Hourly key
        
        long count = await db.StringIncrementAsync(key);
        if (count == 1)
        {
            await db.KeyExpireAsync(key, TimeSpan.FromHours(1));
        }

        if (count > 50) // Threshold from plan
        {
            return (true, "Mass messaging detected (>50 msgs/hour)");
        }

        return (false, null);
    }

    public async Task<bool> IsSwipingTooFastAsync(Guid userId, CancellationToken ct = default)
    {
        var db = _redis.GetDatabase();
        var key = $"fast_swipe:{userId}:{DateTime.UtcNow:yyyyMMddHHmm}"; // Per minute key
        
        long count = await db.StringIncrementAsync(key);
        if (count == 1)
        {
            await db.KeyExpireAsync(key, TimeSpan.FromMinutes(5));
        }

        return count > 100; // Threshold: 100 swipes/minute (can be adjusted)
    }

    public async Task<bool> HasSuspiciousDevicePatternAsync(Guid userId, string currentDeviceId, CancellationToken ct = default)
    {
        var db = _redis.GetDatabase();
        var key = $"user_devices:{userId}";
        
        await db.SetAddAsync(key, currentDeviceId);
        await db.KeyExpireAsync(key, TimeSpan.FromDays(7));

        long deviceCount = await db.SetLengthAsync(key);
        return deviceCount > 3; // Suspicious if > 3 devices in a week
    }

    public async Task<bool> IsHighRiskUserAsync(Guid userId, CancellationToken ct = default)
    {
        var reports = await _reportRepository.GetByTargetUserIdAsync(userId);
        return reports.Count >= 3; // High risk if 3 or more reports
    }
}
