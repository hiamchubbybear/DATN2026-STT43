using DoAnTotNghiep.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using DoAnTotNghiep.Domain.Users;
using DoAnTotNghiep.Domain.Admin;
using DoAnTotNghiep.Domain.Enum;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using DoAnTotNghiep.Web.Hubs;
using MediatR;
using DoAnTotNghiep.Application.Users.Reports;
using System.Linq;

namespace DoAnTotNghiep.Web.Controller;

[ApiController]
[Route("api/admin")]
[ApiExplorerSettings(GroupName = "admin")]
[Tags("Admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly MongoDbContext _context;
    private readonly DoAnTotNghiep.Application.Common.IPasswordHasher _hasher;
    private readonly DoAnTotNghiep.Application.Notifications.INotificationService _notificationService;
    private readonly IHubContext<AppHub> _hubContext;
    private readonly IMediator _mediator;

    public AdminController(
        MongoDbContext context, 
        DoAnTotNghiep.Application.Common.IPasswordHasher hasher,
        DoAnTotNghiep.Application.Notifications.INotificationService notificationService,
        IHubContext<AppHub> hubContext,
        IMediator mediator)
    {
        _context = context;
        _hasher = hasher;
        _notificationService = notificationService;
        _hubContext = hubContext;
        _mediator = mediator;
    }

    private Guid GetAdminId()
    {
        var sub = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value 
                  ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return sub != null ? Guid.Parse(sub) : Guid.Empty;
    }

    private string GetAdminEmail()
    {
        return User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value ?? "system@mixer.com";
    }


    [HttpPost("users/{userId}/ban")]
    public async Task<IActionResult> BanUser(Guid userId, [FromBody] BanRequest request)
    {
        var user = await _context.UserAccounts.Find(u => u.Id == userId).FirstOrDefaultAsync();
        if (user == null) return NotFound();

        user.Ban(request.Reason, request.Until);
        await _context.UserAccounts.ReplaceOneAsync(u => u.Id == userId, user);

        var adminId = GetAdminId();
        var adminEmail = GetAdminEmail();
        var log = new AuditLog(adminId, adminEmail, "BAN_USER", userId.ToString(), request.Reason, HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown");
        await _context.AuditLogs.InsertOneAsync(log);

        return Ok();
    }

    [HttpPost("users/{userId}/unban")]
    public async Task<IActionResult> UnbanUser(Guid userId)
    {
        var user = await _context.UserAccounts.Find(u => u.Id == userId).FirstOrDefaultAsync();
        if (user == null) return NotFound();

        user.Unban();
        await _context.UserAccounts.ReplaceOneAsync(u => u.Id == userId, user);

        var adminId = GetAdminId();
        var adminEmail = GetAdminEmail();
        var log = new AuditLog(adminId, adminEmail, "UNBAN_USER", userId.ToString(), "User unbanned", "");
        await _context.AuditLogs.InsertOneAsync(log);

        return Ok();
    }

    [HttpGet("reports")]
    public async Task<IActionResult> GetReports()
    {
        var reports = await _context.UserReports.Find(_ => true).SortByDescending(r => r.CreatedAt).ToListAsync();

        // Collect all distinct User IDs (Reporters and Targets)
        var userIds = reports.Select(r => r.ReporterId)
            .Concat(reports.Select(r => r.TargetUserId))
            .Distinct()
            .ToList();

        // Fetch profiles and user accounts
        var profiles = await _context.UserProfiles.Find(p => userIds.Contains(p.UserId)).ToListAsync();
        var accounts = await _context.UserAccounts.Find(u => userIds.Contains(u.Id)).ToListAsync();

        var profileMap = profiles.ToDictionary(p => p.UserId);
        var accountMap = accounts.ToDictionary(a => a.Id);

        var enriched = reports.Select(r => {
            profileMap.TryGetValue(r.ReporterId, out var reporterProfile);
            accountMap.TryGetValue(r.ReporterId, out var reporterAccount);

            profileMap.TryGetValue(r.TargetUserId, out var targetProfile);
            accountMap.TryGetValue(r.TargetUserId, out var targetAccount);

            return new {
                r.Id,
                r.ReporterId,
                ReporterName = reporterProfile?.BasicInfo?.DisplayName ?? "Unknown User",
                ReporterEmail = reporterAccount?.Email ?? "No Email",
                ReporterAvatar = reporterProfile?.Photos?.OrderBy(x => x.Order).FirstOrDefault()?.Url,

                r.TargetUserId,
                TargetUserName = targetProfile?.BasicInfo?.DisplayName ?? "Unknown User",
                TargetUserEmail = targetAccount?.Email ?? "No Email",
                TargetUserAvatar = targetProfile?.Photos?.OrderBy(x => x.Order).FirstOrDefault()?.Url,

                r.Reason,
                r.Description,
                r.EvidencePhotos,
                r.CreatedAt,
                r.Status,
                r.AdminFeedback,
                r.ActionTaken,
                r.ResolvedAt
            };
        });

        return Ok(enriched);
    }

    [HttpPost("users")]
    public async Task<IActionResult> CreateUser([FromBody] AdminCreateUserRequest request)
    {
        // Check if user already exists
        var existing = await _context.UserAccounts.Find(u => u.Email == request.Email).FirstOrDefaultAsync();
        if (existing != null) return BadRequest(new { message = "Email already exists" });

        // Create Account
        var passwordHash = _hasher.Hash(request.Password);
        var user = new UserAccount(request.Email, passwordHash, AuthProvider.Local);
        user.SetRole(request.Role);
        user.MarkAsVerified();
        await _context.UserAccounts.InsertOneAsync(user);

        // Create Profile
        var profile = new UserProfile(user.Id);
        var gender = Enum.Parse<Gender>(request.Gender);
        profile.UpdateBasicInfo(request.DisplayName, DateTime.UtcNow.AddYears(-20), gender, ["Vietnamese"]);
        await _context.UserProfiles.InsertOneAsync(profile);

        // Log Action
        var adminId = GetAdminId();
        var adminEmail = GetAdminEmail();
        var log = new AuditLog(adminId, adminEmail, "CREATE_USER", user.Id.ToString(), $"Created user {request.Email}", "");
        await _context.AuditLogs.InsertOneAsync(log);

        return Ok(new { id = user.Id, email = user.Email });
    }

    [HttpPost("reports/{id}/resolve")]
    public async Task<IActionResult> ResolveReport(Guid id, [FromBody] ResolveReportRequest request)
    {
        var command = new ResolveReportCommand(
            id,
            request.AdminFeedback,
            request.BanUser,
            request.BanReason,
            request.BanUntil
        );

        var result = await _mediator.Send(command);
        if (!result) return NotFound();

        // Log Action
        var adminId = GetAdminId();
        var adminEmail = GetAdminEmail();
        var log = new AuditLog(adminId, adminEmail, "RESOLVE_REPORT", id.ToString(), $"Action: {(request.BanUser ? "Ban" : "Resolve")}, Feedback: {request.AdminFeedback}", "");
        await _context.AuditLogs.InsertOneAsync(log);

        return Ok();
    }

    [HttpPost("reports/{id}/dismiss")]
    public async Task<IActionResult> DismissReport(Guid id)
    {
        var report = await _context.UserReports.Find(r => r.Id == id).FirstOrDefaultAsync();
        if (report == null) return NotFound();

        report.Dismiss();
        await _context.UserReports.ReplaceOneAsync(r => r.Id == id, report);

        var adminId = GetAdminId();
        var adminEmail = GetAdminEmail();
        var log = new AuditLog(adminId, adminEmail, "DISMISS_REPORT", id.ToString(), "Report dismissed", "");
        await _context.AuditLogs.InsertOneAsync(log);

        return Ok();
    }

    [HttpGet("verifications/pending")]
    public async Task<IActionResult> GetPendingVerifications()
    {
        var list = await _context.UserVerifications.Find(v => v.Status == VerificationStatus.Pending).ToListAsync();
        return Ok(list);
    }

    [HttpPost("verifications/{id}/approve")]
    public async Task<IActionResult> ApproveVerification(Guid id)
    {
        var v = await _context.UserVerifications.Find(x => x.Id == id).FirstOrDefaultAsync();
        if (v == null) return NotFound();

        v.Approve();
        await _context.UserVerifications.ReplaceOneAsync(x => x.Id == id, v);

        var user = await _context.UserAccounts.Find(u => u.Id == v.UserId).FirstOrDefaultAsync();
        if (user != null)
        {
            user.MarkAsIdentityVerified();
            await _context.UserAccounts.ReplaceOneAsync(u => u.Id == user.Id, user);
        }

        var profile = await _context.UserProfiles.Find(p => p.UserId == v.UserId).FirstOrDefaultAsync();
        if (profile != null)
        {
            profile.MarkAsIdentityVerified();
            await _context.UserProfiles.ReplaceOneAsync(p => p.UserId == profile.UserId, profile);
        }

        var adminId = GetAdminId();
        var adminEmail = GetAdminEmail();
        var log = new AuditLog(adminId, adminEmail, "APPROVE_VERIFICATION", id.ToString(), $"Approved user {v.UserId}", "");
        await _context.AuditLogs.InsertOneAsync(log);

        return Ok();
    }

    [HttpPost("verifications/{id}/reject")]
    public async Task<IActionResult> RejectVerification(Guid id, [FromBody] RejectVerificationRequest request)
    {
        var v = await _context.UserVerifications.Find(x => x.Id == id).FirstOrDefaultAsync();
        if (v == null) return NotFound();

        v.Reject(request.Reason);
        await _context.UserVerifications.ReplaceOneAsync(x => x.Id == id, v);

        var adminId = GetAdminId();
        var adminEmail = GetAdminEmail();
        var log = new AuditLog(adminId, adminEmail, "REJECT_VERIFICATION", id.ToString(), $"Rejected user {v.UserId}. Reason: {request.Reason}", "");
        await _context.AuditLogs.InsertOneAsync(log);

        return Ok();
    }

    [HttpGet("configs")]
    public async Task<IActionResult> GetConfigs()
    {
        var configs = await _context.SystemConfigs.Find(_ => true).ToListAsync();
        return Ok(configs);
    }

    [HttpPut("configs/{key}")]
    public async Task<IActionResult> UpdateConfig(string key, [FromBody] string value)
    {
        var config = await _context.SystemConfigs.Find(c => c.Key == key).FirstOrDefaultAsync();
        if (config == null) return NotFound();

        config.UpdateValue(value);
        await _context.SystemConfigs.ReplaceOneAsync(c => c.Key == key, config);

        var adminId = GetAdminId();
        var adminEmail = GetAdminEmail();
        var log = new AuditLog(adminId, adminEmail, "UPDATE_CONFIG", key, $"New value: {value}", "");
        await _context.AuditLogs.InsertOneAsync(log);

        return Ok();
    }

    [HttpGet("audit-logs")]
    public async Task<IActionResult> GetAuditLogs()
    {
        var logs = await _context.AuditLogs.Find(_ => true).SortByDescending(l => l.CreatedAt).Limit(100).ToListAsync();
        return Ok(logs);
    }


    [HttpDelete("users/{userId}/photos/{photoId}")]
    public async Task<IActionResult> DeleteUserPhoto(Guid userId, Guid photoId)
    {
        var profile = await _context.UserProfiles.Find(p => p.UserId == userId).FirstOrDefaultAsync();
        if (profile == null) return NotFound();

        try 
        {
            profile.RemovePhoto(photoId); 
            await _context.UserProfiles.ReplaceOneAsync(p => p.UserId == userId, profile);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }

        var adminId = GetAdminId();
        var adminEmail = GetAdminEmail();
        var log = new AuditLog(adminId, adminEmail, "DELETE_PHOTO", $"{userId}/{photoId}", "Xóa ảnh vi phạm tiêu chuẩn", "");
        await _context.AuditLogs.InsertOneAsync(log);

        return Ok();
    }

    [HttpPost("broadcast")]
    public async Task<IActionResult> Broadcast([FromBody] BroadcastRequest request)
    {
        var totalUsers = await _context.UserAccounts.CountDocumentsAsync(_ => true);
        
        // Save to database for history
        var broadcast = new BroadcastNotification(request.Title, request.Content, "All", GetAdminId(), (int)totalUsers);
        await _context.BroadcastNotifications.InsertOneAsync(broadcast);

        // Also save to all users' local notifications lists
        var users = await _context.UserAccounts.Find(_ => true).ToListAsync();
        if (users != null && users.Any())
        {
            var notifs = users.Select(u => DoAnTotNghiep.Domain.Notifications.Notification.Create(
                u.Id, request.Title, request.Content, "broadcast")).ToList();
            await _context.Notifications.InsertManyAsync(notifs);
        }

        // Actually send push notification via Firebase
        await _notificationService.BroadcastNotificationAsync(request.Title, request.Content);

        // Send via SignalR for real-time popup
        await _hubContext.Clients.All.SendAsync("ReceiveNotification", new 
        { 
            title = request.Title, 
            message = request.Content,
            type = "BROADCAST",
            timestamp = DateTime.UtcNow
        });

        // Also send a SignalR Warning event to trigger the red dot on mobile
        await _hubContext.Clients.All.SendAsync("ReceiveWarning", new 
        { 
            title = request.Title, 
            message = request.Content,
            timestamp = DateTime.UtcNow
        });

        return Ok(new { sentTo = totalUsers, status = "Push & SignalR Sent" });
    }

    [HttpGet("broadcasts")]
    public async Task<IActionResult> GetBroadcastHistory()
    {
        var broadcasts = await _context.BroadcastNotifications
            .Find(_ => true)
            .SortByDescending(b => b.CreatedAt)
            .ToListAsync();
        return Ok(broadcasts);
    }

    [HttpPost("users/{userId}/push")]
    public async Task<IActionResult> SendUserPush(Guid userId, [FromBody] BroadcastRequest request)
    {
        // 1. Send via Firebase
        await _notificationService.SendPushToUserAsync(userId, request.Title, request.Content);

        // 2. Save persistent notification to database
        var notif = DoAnTotNghiep.Domain.Notifications.Notification.Create(
            userId,
            request.Title,
            request.Content,
            "admin"
        );
        await _context.Notifications.InsertOneAsync(notif);

        // 3. Send via SignalR for real-time popup & red dot
        await _hubContext.Clients.Group($"User_{userId}").SendAsync("ReceiveWarning", new 
        { 
            title = request.Title, 
            message = request.Content,
            timestamp = DateTime.UtcNow
        });

        return Ok(new { message = "Push notification, DB record, and SignalR event sent to user." });
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var totalUsers = await _context.UserAccounts.CountDocumentsAsync(_ => true);
        var totalMatches = await _context.UserMatches.CountDocumentsAsync(_ => true);
        var totalReports = await _context.UserReports.CountDocumentsAsync(_ => true);
        var pendingVerifications = await _context.UserVerifications.CountDocumentsAsync(v => v.Status == VerificationStatus.Pending);
        
        return Ok(new
        {
            totalUsers,
            totalMatches,
            totalReports,
            pendingVerifications,
            activeUsers = totalUsers // Simplified
        });
    }

    [HttpGet("stats/advanced")]
    public async Task<IActionResult> GetAdvancedStats()
    {
        // Mocking some data for the charts since we don't have historical aggregates yet
        var growth = new[] {
            new { day = "Mon", users = 12 },
            new { day = "Tue", users = 19 },
            new { day = "Wed", users = 15 },
            new { day = "Thu", users = 22 },
            new { day = "Fri", users = 30 },
            new { day = "Sat", users = 25 },
            new { day = "Sun", users = 35 }
        };

        var categories = new[] {
            new { name = "Harassment", value = 45 },
            new { name = "Spam", value = 25 },
            new { name = "Fake Account", value = 20 },
            new { name = "Inappropriate Content", value = 10 }
        };

        return Ok(new { growth, categories });
    }

    [HttpGet("health")]
    public async Task<IActionResult> GetHealth()
    {
        try 
        {
            // Check DB
            await _context.UserAccounts.CountDocumentsAsync(_ => false, new CountOptions { MaxTime = TimeSpan.FromSeconds(2) });
            
            return Ok(new {
                status = "Healthy",
                database = "Connected",
                serverTime = DateTime.UtcNow,
                version = "1.0.0"
            });
        }
        catch (Exception ex)
        {
            return Ok(new { status = "Unhealthy", database = "Disconnected", error = ex.Message });
        }
    }

    [HttpGet("monitoring/system-info")]
    public IActionResult GetSystemInfo()
    {
        var process = System.Diagnostics.Process.GetCurrentProcess();
        var memoryUsage = process.PrivateMemorySize64 / 1024 / 1024; // MB
        var uptime = DateTime.Now - process.StartTime;

        return Ok(new {
            memoryUsage = $"{memoryUsage} MB",
            uptime = $"{(int)uptime.TotalDays}d {uptime.Hours}h {uptime.Minutes}m",
            os = System.Runtime.InteropServices.RuntimeInformation.OSDescription,
            cpuCount = Environment.ProcessorCount
        });
    }

    [HttpGet("monitoring/logs")]
    public IActionResult GetLogs([FromQuery] int count = 50)
    {
        try 
        {
            var logPath = Path.Combine(AppContext.BaseDirectory, "logs");
            if (!Directory.Exists(logPath))
            {
                logPath = Path.Combine(Directory.GetCurrentDirectory(), "logs");
            }

            if (!Directory.Exists(logPath)) return Ok(new string[] { "Log directory not found" });

            var logFile = Directory.GetFiles(logPath, "mixer-*.log")
                .Concat(Directory.GetFiles(logPath, "app-*.log"))
                .OrderByDescending(f => f)
                .FirstOrDefault();

            if (logFile == null) return Ok(new string[] { "Log file not found" });

            // Read with shared access to avoid locking issues
            using var fs = new FileStream(logFile, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
            using var sr = new StreamReader(fs);
            
            var lines = new List<string>();
            string? line;
            while ((line = sr.ReadLine()) != null)
            {
                lines.Add(line);
            }

            return Ok(lines.TakeLast(count));
        }
        catch (Exception ex)
        {
            return Ok(new string[] { $"Error reading logs: {ex.Message}" });
        }
    }

    [HttpGet("reviews")]
    public async Task<IActionResult> GetAppReviews()
    {
        var reviews = await _context.AppReviews.Find(_ => true).SortByDescending(r => r.CreatedAt).ToListAsync();
        
        // Enrich with user info
        var userIds = reviews.Select(r => r.UserId).ToList();
        var profiles = await _context.UserProfiles.Find(p => userIds.Contains(p.UserId)).ToListAsync();
        var profileMap = profiles.ToDictionary(p => p.UserId);

        var enriched = reviews.Select(r => {
            profileMap.TryGetValue(r.UserId, out var p);
            return new {
                r.Id,
                r.UserId,
                r.Rating,
                r.Comment,
                r.CreatedAt,
                UserName = p?.BasicInfo?.DisplayName ?? "Unknown User",
                Avatar = p?.Photos?.OrderBy(x => x.Order).FirstOrDefault()?.Url
            };
        });

        return Ok(enriched);
    }
    [HttpPost("reviews/{id}/reply")]
    public async Task<IActionResult> ReplyToReview(Guid id, [FromBody] ReplyToReviewRequest request)
    {
        var review = await _context.AppReviews.Find(r => r.Id == id).FirstOrDefaultAsync();
        if (review == null) return NotFound();

        review.Reply(request.Reply);
        await _context.AppReviews.ReplaceOneAsync(r => r.Id == id, review);

        // Log the reply
        var adminId = GetAdminId();
        var adminEmail = GetAdminEmail();
        var log = new AuditLog(adminId, adminEmail, "REPLY_TO_REVIEW", id.ToString(), request.Reply, "");
        await _context.AuditLogs.InsertOneAsync(log);

        return Ok();
    }

    [HttpPost("users/{userId}/notify")]
    public async Task<IActionResult> SendUserNotification(Guid userId, [FromBody] BroadcastRequest request)
    {
        await _notificationService.SendPushToUserAsync(userId, request.Title, request.Content);
        
        var adminId = GetAdminId();
        var adminEmail = GetAdminEmail();
        var log = new AuditLog(adminId, adminEmail, "SEND_USER_NOTIFICATION", userId.ToString(), request.Content, request.Title);
        await _context.AuditLogs.InsertOneAsync(log);

        return Ok();
    }

    [HttpPost("users/{userId}/quick-ban")]
    public async Task<IActionResult> QuickBanUser(Guid userId, [FromBody] BanRequest request)
    {
        var user = await _context.UserAccounts.Find(u => u.Id == userId).FirstOrDefaultAsync();
        if (user == null) return NotFound();

        user.Ban(request.Reason, request.Until);
        await _context.UserAccounts.ReplaceOneAsync(u => u.Id == userId, user);

        var adminId = GetAdminId();
        var adminEmail = GetAdminEmail();
        var log = new AuditLog(adminId, adminEmail, "QUICK_BAN", userId.ToString(), request.Reason, "");
        await _context.AuditLogs.InsertOneAsync(log);

        return Ok();
    }

    [HttpGet("users/scam-scores")]
    public async Task<IActionResult> GetAllUserScamScores(
        [FromServices] DoAnTotNghiep.Application.Common.IFraudDetectionService fraudService,
        [FromServices] DoAnTotNghiep.Domain.Users.IUserProfileRepository profileRepo)
    {
        var allProfiles = await profileRepo.ListAllAsync();

        var userIds = allProfiles.Select(p => p.UserId).ToList();
        var accounts = await _context.UserAccounts.Find(u => userIds.Contains(u.Id)).ToListAsync();
        var accountMap = accounts.ToDictionary(a => a.Id);

        var semaphore = new System.Threading.SemaphoreSlim(20);
        var tasks = allProfiles.Select(async profile =>
        {
            await semaphore.WaitAsync();
            try
            {
                var features = await fraudService.GetScamFeaturesAsync(profile.UserId);

                // Safely attempt prediction — ML service may be offline
                DoAnTotNghiep.Application.Common.ScamDetectionResultDto? result = null;
                try { result = await fraudService.ScoreAndModerateUserAsync(profile.UserId); }
                catch { /* ML offline: return features without prediction */ }

                accountMap.TryGetValue(profile.UserId, out var account);
                return (object)new
                {
                    userId           = profile.UserId,
                    displayName      = profile.BasicInfo?.DisplayName ?? "Unknown",
                    email            = account?.Email ?? "No Email",
                    avatar           = profile.Photos?.OrderBy(x => x.Order).FirstOrDefault()?.Url,
                    status           = profile.Status.ToString(),
                    features = new
                    {
                        swipesPerHour       = features.SwipesPerHour,
                        spamLinkCount       = features.SpamLinkCount,
                        reportCount         = features.ReportCount,
                        profileCompleteness = features.ProfileCompleteness,
                        hasProfilePhoto     = features.HasProfilePhoto,
                        isFaceVerified      = features.IsFaceVerified,
                        bioHasContact       = features.BioHasContact
                    },
                    prediction = result == null ? null : (object)new
                    {
                        scamProbability = result.ScamProbability,
                        riskLevel       = result.RiskLevel,
                        recommendation  = result.Recommendation,
                        triggeredRules  = result.TriggeredRules
                    }
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"scam-scores: error for user {profile.UserId}: {ex.Message}");
                return (object?)null;
            }
            finally
            {
                semaphore.Release();
            }
        });

        var results = await System.Threading.Tasks.Task.WhenAll(tasks);
        var sorted = results
            .OfType<object>() // skip nulls from errored users
            .OrderByDescending(r => {
                dynamic d = r;
                try { return (double)(d.prediction?.scamProbability ?? 0.0); } catch { return 0.0; }
            })
            .ToList();

        return Ok(sorted);
    }

    [HttpGet("users/{userId}/scam-score")]
    public async Task<IActionResult> GetUserScamScore(Guid userId,
        [FromServices] DoAnTotNghiep.Application.Common.IFraudDetectionService fraudService)
    {
        var features = await fraudService.GetScamFeaturesAsync(userId);
        DoAnTotNghiep.Application.Common.ScamDetectionResultDto? result = null;
        try { result = await fraudService.ScoreAndModerateUserAsync(userId); } catch { }

        return Ok(new
        {
            userId,
            features = new
            {
                swipesPerHour           = features.SwipesPerHour,
                spamLinkCount           = features.SpamLinkCount,
                reportCount             = features.ReportCount,
                profileCompleteness     = features.ProfileCompleteness,
                hasProfilePhoto         = features.HasProfilePhoto,
                isFaceVerified          = features.IsFaceVerified,
                bioHasContact           = features.BioHasContact
            },
            prediction = result == null ? null : new
            {
                scamProbability  = result.ScamProbability,
                riskLevel        = result.RiskLevel,
                recommendation   = result.Recommendation,
                triggeredRules   = result.TriggeredRules
            }
        });
    }

    [HttpPost("scam/simulate")]
    public async Task<IActionResult> SimulateScamScore(
        [FromBody] DoAnTotNghiep.Application.Common.ScamFeaturesDto features,
        [FromServices] DoAnTotNghiep.Application.Common.IScamDetectionService scamService)
    {
        DoAnTotNghiep.Application.Common.ScamDetectionResultDto? result = null;
        try
        {
            result = await scamService.PredictAsync(features);
        }
        catch { /* Python offline */ }

        if (result == null)
        {
            double score = 0.0;

            // Positive risk signals
            if (features.SwipesPerHour > 200)      score += 0.30;
            else if (features.SwipesPerHour > 80)  score += 0.15;
            else if (features.SwipesPerHour > 40)  score += 0.05;

            if (features.SpamLinkCount > 5)        score += 0.25;
            else if (features.SpamLinkCount > 2)   score += 0.12;
            else if (features.SpamLinkCount > 0)   score += 0.04;

            if (features.ReportCount >= 5)         score += 0.25;
            else if (features.ReportCount >= 2)    score += 0.12;
            else if (features.ReportCount >= 1)    score += 0.05;

            if (features.BioHasContact)            score += 0.10;
            if (features.ProfileCompleteness < 0.2) score += 0.08;
            else if (features.ProfileCompleteness < 0.4) score += 0.03;

            // Trust signals
            if (features.IsFaceVerified)  score -= 0.15;
            if (features.HasProfilePhoto) score -= 0.05;

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
            if (features.SwipesPerHour > 80)        triggered.Add("swipe_speed_burst");
            if (features.SpamLinkCount > 0)         triggered.Add("spam_links_sent");
            if (features.ReportCount >= 2)          triggered.Add("multiple_reports");
            if (features.BioHasContact)             triggered.Add("bio_contact_leak");
            if (features.ProfileCompleteness < 0.3) triggered.Add("low_profile_completeness");
            if (!features.IsFaceVerified)           triggered.Add("not_face_verified");

            result = new DoAnTotNghiep.Application.Common.ScamDetectionResultDto
            {
                ScamProbability = Math.Round(score, 4),
                RiskLevel       = riskLevel,
                Recommendation  = recommendation,
                TriggeredRules  = triggered
            };
        }

        return Ok(new
        {
            features,
            prediction = result
        });
    }

}

public class AdminCreateUserRequest
{
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
    public string DisplayName { get; set; } = null!;
    public string Gender { get; set; } = null!;
    public string Role { get; set; } = "Client";
}

public class BanRequest
{
    public string Reason { get; set; } = null!;
    public DateTime? Until { get; set; }
}

public class BroadcastRequest
{
    public string Title { get; set; } = null!;
    public string Content { get; set; } = null!;
}

public class ResolveReportRequest
{
    public string? AdminFeedback { get; set; }
    public bool BanUser { get; set; }
    public string? BanReason { get; set; }
    public DateTime? BanUntil { get; set; }
}

public class RejectVerificationRequest
{
    public string Reason { get; set; } = null!;
}

public class ReplyToReviewRequest
{
    public string Reply { get; set; } = null!;
}
