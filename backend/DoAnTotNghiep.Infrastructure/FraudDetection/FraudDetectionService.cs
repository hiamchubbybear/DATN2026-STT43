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
        try 
        {
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
        }
        catch (Exception ex)
        {
            Console.WriteLine($"FraudDetection: Redis error (Mass messaging check): {ex.Message}");
        }

        return (false, null);
    }

    public async Task<bool> IsSwipingTooFastAsync(Guid userId, CancellationToken ct = default)
    {
        try 
        {
            var db = _redis.GetDatabase();
            var now = DateTime.UtcNow;
            
            // 1. Minute-level check (Stricter: 120/min)
            var minKey = $"fast_swipe:min:{userId}:{now:yyyyMMddHHmm}";
            long minCount = await db.StringIncrementAsync(minKey);
            if (minCount == 1) await db.KeyExpireAsync(minKey, TimeSpan.FromMinutes(2));
            if (minCount > 120) return true;

            // 2. Burst check (Very fast: 10 swipes in 3 seconds)
            // Using a simple bucketed approach for performance
            var burstKey = $"fast_swipe:burst:{userId}:{now.Ticks / (TimeSpan.TicksPerSecond * 3)}";
            long burstCount = await db.StringIncrementAsync(burstKey);
            if (burstCount == 1) await db.KeyExpireAsync(burstKey, TimeSpan.FromSeconds(5));
            if (burstCount > 10) return true;

            return false;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"FraudDetection: Redis error (Swipe check): {ex.Message}");
            return false;
        }
    }

    public async Task<bool> HasSuspiciousDevicePatternAsync(Guid userId, string currentDeviceId, CancellationToken ct = default)
    {
        try 
        {
            var db = _redis.GetDatabase();
            var key = $"user_devices:{userId}";
            
            await db.SetAddAsync(key, currentDeviceId);
            await db.KeyExpireAsync(key, TimeSpan.FromDays(7));

            long deviceCount = await db.SetLengthAsync(key);
            return deviceCount > 3; // Suspicious if > 3 devices in a week
        }
        catch (Exception ex)
        {
            Console.WriteLine($"FraudDetection: Redis error (Device check): {ex.Message}");
            return false;
        }
    }

    public async Task<bool> IsHighRiskUserAsync(Guid userId, CancellationToken ct = default)
    {
        var reports = await _reportRepository.GetByTargetUserIdAsync(userId);
        return reports.Count >= 3; // High risk if 3 or more reports
    }
}
