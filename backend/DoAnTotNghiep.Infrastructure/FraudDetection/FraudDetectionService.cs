using System.Text.RegularExpressions;
using DoAnTotNghiep.Application.Common;
using StackExchange.Redis;
using System;
using DoAnTotNghiep.Domain.Users;
using DoAnTotNghiep.Domain.Admin;
using DoAnTotNghiep.Domain.Enum;
using MongoDB.Driver;

namespace DoAnTotNghiep.Infrastructure.FraudDetection;

public class FraudDetectionService : IFraudDetectionService
{
    private readonly IConnectionMultiplexer _redis;
    private readonly IUserReportRepository _reportRepository;
    private readonly IUserProfileRepository _userProfileRepository;
    private readonly IMongoDbContext _db;
    private readonly IScamDetectionService _scamDetectionService;
    private static readonly Regex UrlRegex = new Regex(@"(https?:\/\/[^\s]+)", RegexOptions.Compiled | RegexOptions.IgnoreCase);
    private static readonly string[] SpamKeywords = { "free money", "crypto investment", "win prize", "scam", "telegram.me", "t.me" };

    // Circuit-breaker: skip Redis calls instantly when connection is known-bad (avoids 5s timeout × N users)
    private bool IsRedisAvailable => _redis.IsConnected;

    public FraudDetectionService(
        IConnectionMultiplexer redis,
        IUserReportRepository reportRepository,
        IUserProfileRepository userProfileRepository,
        IMongoDbContext db,
        IScamDetectionService scamDetectionService)
    {
        _redis = redis;
        _reportRepository = reportRepository;
        _userProfileRepository = userProfileRepository;
        _db = db;
        _scamDetectionService = scamDetectionService;
    }

    public async Task<(bool IsSpam, string? Reason)> AnalyzeMessageAsync(Guid userId, string content, CancellationToken ct = default)
    {
        if (UrlRegex.IsMatch(content))
        {
            if (IsRedisAvailable)
            {
                try
                {
                    var db = _redis.GetDatabase();
                    await db.StringIncrementAsync($"spam_links_count:{userId}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"FraudDetection: Redis error incrementing spam links: {ex.Message}");
                }
            }
            return (true, "Contains external link (Potential Spam)");
        }

        foreach (var keyword in SpamKeywords)
        {
            if (content.Contains(keyword, StringComparison.OrdinalIgnoreCase))
                return (true, $"Contains suspicious keyword: {keyword}");
        }

        if (IsRedisAvailable)
        {
            try
            {
                var db = _redis.GetDatabase();
                var key = $"mass_msg:{userId}:{DateTime.UtcNow:yyyyMMddHH}";
                long count = await db.StringIncrementAsync(key);
                if (count == 1) await db.KeyExpireAsync(key, TimeSpan.FromHours(1));
                if (count > 50) return (true, "Mass messaging detected (>50 msgs/hour)");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"FraudDetection: Redis error (Mass messaging check): {ex.Message}");
            }
        }

        return (false, null);
    }

    public async Task<bool> IsSwipingTooFastAsync(Guid userId, CancellationToken ct = default)
    {
        if (!IsRedisAvailable) return false;
        try
        {
            var db = _redis.GetDatabase();
            var now = DateTime.UtcNow;

            var hourKey = $"swipe_count:hour:{userId}:{now:yyyyMMddHH}";
            long hourCount = await db.StringIncrementAsync(hourKey);
            if (hourCount == 1) await db.KeyExpireAsync(hourKey, TimeSpan.FromHours(25));

            var minKey = $"fast_swipe:min:{userId}:{now:yyyyMMddHHmm}";
            long minCount = await db.StringIncrementAsync(minKey);
            if (minCount == 1) await db.KeyExpireAsync(minKey, TimeSpan.FromMinutes(2));
            if (minCount > 300) return true;

            var burstKey = $"fast_swipe:burst:{userId}:{now.Ticks / (TimeSpan.TicksPerSecond * 3)}";
            long burstCount = await db.StringIncrementAsync(burstKey);
            if (burstCount == 1) await db.KeyExpireAsync(burstKey, TimeSpan.FromSeconds(5));
            if (burstCount > 30) return true;

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
        if (!IsRedisAvailable) return false;
        try
        {
            var db = _redis.GetDatabase();
            var key = $"user_devices:{userId}";
            await db.SetAddAsync(key, currentDeviceId);
            await db.KeyExpireAsync(key, TimeSpan.FromDays(7));
            long deviceCount = await db.SetLengthAsync(key);
            return deviceCount > 3;
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
        return reports.Count >= 3;
    }

    public async Task<ScamFeaturesDto> GetScamFeaturesAsync(Guid userId, CancellationToken ct = default)
    {
        // 1. Try to load cached/mock values first to preserve demo baseline
        double cachedSwipes = 0.0;
        int cachedSpam = 0;
        bool hasCached = false;
        try
        {
            var database = _db.UserAccounts.Database;
            var fraudCol = database.GetCollection<MongoDB.Bson.BsonDocument>("fraud_detection_users");
            var filter = Builders<MongoDB.Bson.BsonDocument>.Filter.Eq("userId", MongoDB.Bson.BsonValue.Create(userId));
            var cached = await fraudCol.Find(filter).FirstOrDefaultAsync(ct);
            if (cached != null)
            {
                cachedSwipes = cached.Contains("swipesPerHour") ? Convert.ToDouble(cached["swipesPerHour"]) : 0.0;
                cachedSpam = cached.Contains("spamLinkCount") ? Convert.ToInt32(cached["spamLinkCount"]) : 0;
                hasCached = true;
            }
        }
        catch { }

        // 2. Fetch live data from Profile, Redis, and Reports
        var profile = await _userProfileRepository.GetByUserIdAsync(userId);

        // Swipes per hour
        double swipesPerHour = 0.0;
        if (IsRedisAvailable)
        {
            try
            {
                var db = _redis.GetDatabase();
                var now = DateTime.UtcNow;
                var hourKey = $"swipe_count:hour:{userId}:{now:yyyyMMddHH}";
                var swipeCountString = await db.StringGetAsync(hourKey);
                if (double.TryParse(swipeCountString, out var parsedSwipes))
                    swipesPerHour = parsedSwipes;
            }
            catch { }
        }
        // If Redis doesn't have it but we have a demo/mock value cached, use the cached value
        if (swipesPerHour == 0.0 && hasCached)
        {
            swipesPerHour = cachedSwipes;
        }

        // Spam link count
        int spamLinkCount = 0;
        if (IsRedisAvailable)
        {
            try
            {
                var db = _redis.GetDatabase();
                var spamCountVal = await db.StringGetAsync($"spam_links_count:{userId}");
                if (int.TryParse(spamCountVal, out var parsedSpamCount))
                    spamLinkCount = parsedSpamCount;
            }
            catch { }
        }
        // If Redis doesn't have it but we have a demo/mock value cached, use the cached value
        if (spamLinkCount == 0 && hasCached)
        {
            spamLinkCount = cachedSpam;
        }

        // Report count
        int reportCount = 0;
        try
        {
            var reports = await _reportRepository.GetByTargetUserIdAsync(userId);
            reportCount = reports?.Count ?? 0;
        }
        catch { }

        // Profile features
        double completeness = 0.0;
        bool hasProfilePhoto = false;
        bool isFaceVerified = false;
        bool bioHasContact = false;

        if (profile != null)
        {
            double fields = 5, filled = 0;
            if (!string.IsNullOrWhiteSpace(profile.Bio)) filled++;
            if (profile.Photos?.Count > 0) filled++;
            if (profile.BasicInfo != null && !string.IsNullOrWhiteSpace(profile.BasicInfo.DisplayName) && profile.BasicInfo.Dob != default) filled++;
            if (profile.Background != null && (!string.IsNullOrWhiteSpace(profile.Background.Education) || !string.IsNullOrWhiteSpace(profile.Background.Occupation))) filled++;
            if (profile.Lifestyle != null && (!string.IsNullOrWhiteSpace(profile.Lifestyle.Drinking) || !string.IsNullOrWhiteSpace(profile.Lifestyle.Smoking) || profile.Lifestyle.Hobbies?.Count > 0)) filled++;
            completeness = Math.Round(filled / fields, 2);

            hasProfilePhoto = profile.Photos?.Count > 0;
            isFaceVerified = profile.IsIdentityVerified;
            if (!string.IsNullOrWhiteSpace(profile.Bio))
            {
                var contactRegex = new Regex(@"(\+?\d{9,13})|(@\w{3,})|(\b(zalo|phone|tele|telegram|whatsapp|sđt|sdt|line|wechat|snap|snapchat|facebook|fb|ig|instagram|gmail|email)\b)", RegexOptions.Compiled | RegexOptions.IgnoreCase);
                bioHasContact = contactRegex.IsMatch(profile.Bio);
            }
        }

        var dto = new ScamFeaturesDto
        {
            SwipesPerHour = swipesPerHour,
            SpamLinkCount = spamLinkCount,
            ReportCount = reportCount,
            ProfileCompleteness = completeness,
            HasProfilePhoto = hasProfilePhoto,
            IsFaceVerified = isFaceVerified,
            BioHasContact = bioHasContact
        };

        // 3. Upsert this new live status back into fraud_detection_users collection!
        try
        {
            var database = _db.UserAccounts.Database;
            var fraudCol = database.GetCollection<MongoDB.Bson.BsonDocument>("fraud_detection_users");
            
            var updateDoc = new MongoDB.Bson.BsonDocument
            {
                { "userId", MongoDB.Bson.BsonValue.Create(userId) },
                { "swipesPerHour", dto.SwipesPerHour },
                { "spamLinkCount", dto.SpamLinkCount },
                { "reportCount", dto.ReportCount },
                { "profileCompleteness", dto.ProfileCompleteness },
                { "hasProfilePhoto", dto.HasProfilePhoto },
                { "isFaceVerified", dto.IsFaceVerified },
                { "bioHasContact", dto.BioHasContact },
                { "lastUpdated", DateTime.UtcNow }
            };

            var filter = Builders<MongoDB.Bson.BsonDocument>.Filter.Eq("userId", MongoDB.Bson.BsonValue.Create(userId));
            await fraudCol.ReplaceOneAsync(filter, updateDoc, new ReplaceOptions { IsUpsert = true }, ct);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"FraudDetection: Error syncing to fraud_detection_users: {ex.Message}");
        }

        return dto;
    }

    /// <summary>
    /// Rule-based fallback scorer used when the ML microservice is offline.
    /// Mirrors the XGBoost model's top feature importances for demo-ready output.
    /// </summary>
    private static ScamDetectionResultDto RuleBasedFallbackScore(ScamFeaturesDto f)
    {
        double score = 0.0;

        // Positive risk contributors
        if (f.SwipesPerHour > 200)      score += 0.30;
        else if (f.SwipesPerHour > 80)  score += 0.15;
        else if (f.SwipesPerHour > 40)  score += 0.05;

        if (f.SpamLinkCount > 5)        score += 0.25;
        else if (f.SpamLinkCount > 2)   score += 0.12;
        else if (f.SpamLinkCount > 0)   score += 0.04;

        if (f.ReportCount >= 5)         score += 0.25;
        else if (f.ReportCount >= 2)    score += 0.12;
        else if (f.ReportCount >= 1)    score += 0.05;

        if (f.BioHasContact)            score += 0.10;
        if (f.ProfileCompleteness < 0.2) score += 0.08;
        else if (f.ProfileCompleteness < 0.4) score += 0.03;

        // Trust indicators (reduce risk)
        if (f.IsFaceVerified)  score -= 0.15;
        if (f.HasProfilePhoto) score -= 0.05;

        score = Math.Clamp(score, 0.0, 1.0);

        string riskLevel = score switch
        {
            >= 0.75 => "critical",
            >= 0.50 => "high",
            >= 0.25 => "medium",
            _       => "low"
        };

        string recommendation = score switch
        {
            >= 0.75 => "ban",
            >= 0.50 => "shadow_ban",
            >= 0.25 => "warn",
            _       => "none"
        };

        var triggered = new List<string>();
        if (f.SwipesPerHour > 80)        triggered.Add("swipe_speed_burst");
        if (f.SpamLinkCount > 0)         triggered.Add("spam_links_sent");
        if (f.ReportCount >= 2)          triggered.Add("multiple_reports");
        if (f.BioHasContact)             triggered.Add("bio_contact_leak");
        if (f.ProfileCompleteness < 0.3) triggered.Add("low_profile_completeness");
        if (!f.IsFaceVerified)           triggered.Add("not_face_verified");

        return new ScamDetectionResultDto
        {
            ScamProbability = Math.Round(score, 4),
            RiskLevel       = riskLevel,
            Recommendation  = recommendation,
            TriggeredRules  = triggered
        };
    }

    public async Task<ScamDetectionResultDto?> ScoreAndModerateUserAsync(Guid userId, CancellationToken ct = default)
    {
        var profile = await _userProfileRepository.GetByUserIdAsync(userId);
        if (profile == null) return null;
        if (profile.Status == UserStatus.Banned) return null;

        var features = await GetScamFeaturesAsync(userId, ct);

        // Try XGBoost ML microservice; fall back to rule-based scorer for demo/offline
        ScamDetectionResultDto? mlResult = null;
        try { mlResult = await _scamDetectionService.PredictAsync(features, ct); }
        catch { /* ML offline – use rule engine */ }

        var result = mlResult ?? RuleBasedFallbackScore(features);

        // Auto-moderation only for confirmed high-risk users
        var recommendation = result.Recommendation?.ToLower();
        if (recommendation == "ban" || recommendation == "shadow_ban" || recommendation == "suspend")
        {
            var account = await _db.UserAccounts.Find(a => a.Id == userId).FirstOrDefaultAsync(ct);
            if (account != null)
            {
                string auditAction = "ML_AUTO_MODERATION";
                string source = mlResult != null ? "XGBoost-ML" : "RuleEngine";
                string auditDetails = $"Score: {result.ScamProbability:P2}. Action: {result.Recommendation}. Source: {source}.";

                if (recommendation == "ban")
                {
                    account.Ban($"System: Auto-flagged for spam/scam ({result.ScamProbability:P0} confidence).", null);
                    profile.Ban();
                    await _db.UserSessions.DeleteManyAsync(s => s.UserId == userId, ct);
                    auditAction = "ML_AUTO_BAN";
                    auditDetails += " Account permanently banned and sessions revoked.";
                }
                else if (recommendation == "shadow_ban")
                {
                    profile.ShadowBan();
                    auditAction = "ML_AUTO_SHADOW_BAN";
                    auditDetails += " User shadow-banned.";
                }

                await _db.UserAccounts.ReplaceOneAsync(a => a.Id == userId, account, cancellationToken: ct);
                await _userProfileRepository.UpdateAsync(profile);

                var log = new AuditLog(Guid.Empty, "system-ml@mixer.com", auditAction, userId.ToString(), auditDetails, "system-ml");
                await _db.AuditLogs.InsertOneAsync(log, cancellationToken: ct);
            }
        }

        return result;
    }
}
