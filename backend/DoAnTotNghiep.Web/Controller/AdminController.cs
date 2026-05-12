using DoAnTotNghiep.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using DoAnTotNghiep.Domain.Users;
using DoAnTotNghiep.Domain.Admin;
using Microsoft.AspNetCore.Authorization;

namespace DoAnTotNghiep.Web.Controller;

[ApiController]
[Route("api/admin")]
[ApiExplorerSettings(GroupName = "admin")]
[Tags("Admin")]
// [Authorize(Roles = "Admin")] // Bật lại sau khi setup Role Admin
public class AdminController : ControllerBase
{
    private readonly MongoDbContext _context;

    public AdminController(MongoDbContext context)
    {
        _context = context;
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var users = await _context.UserAccounts.Find(_ => true)
            .Skip((page - 1) * pageSize)
            .Limit(pageSize)
            .ToListAsync();

        var total = await _context.UserAccounts.CountDocumentsAsync(_ => true);

        return Ok(new { total, users, page, pageSize });
    }

    [HttpPost("users/{userId}/ban")]
    public async Task<IActionResult> BanUser(Guid userId, [FromBody] BanRequest request)
    {
        var user = await _context.UserAccounts.Find(u => u.Id == userId).FirstOrDefaultAsync();
        if (user == null) return NotFound();

        user.Ban(request.Reason, request.Until);
        await _context.UserAccounts.ReplaceOneAsync(u => u.Id == userId, user);

        // Log action
        var adminId = Guid.Empty; // Lấy từ User claims sau
        var log = new AuditLog(adminId, "Admin", "BAN_USER", userId.ToString(), request.Reason, HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown");
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

        return Ok();
    }

    [HttpGet("reports")]
    public async Task<IActionResult> GetReports()
    {
        var reports = await _context.UserReports.Find(_ => true).ToListAsync();
        return Ok(reports);
    }

    [HttpPost("reports/{id}/resolve")]
    public async Task<IActionResult> ResolveReport(Guid id)
    {
        var report = await _context.UserReports.Find(r => r.Id == id).FirstOrDefaultAsync();
        if (report == null) return NotFound();

        // Giả sử có status Resolved trong domain
        // report.Resolve();
        // await _context.UserReports.ReplaceOneAsync(r => r.Id == id, report);

        var log = new AuditLog(Guid.Empty, "Admin", "RESOLVE_REPORT", id.ToString(), "Báo cáo đã được xử lý", "");
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

        // Update UserAccount status if needed
        var user = await _context.UserAccounts.Find(u => u.Id == v.UserId).FirstOrDefaultAsync();
        if (user != null)
        {
            user.MarkAsVerified();
            await _context.UserAccounts.ReplaceOneAsync(u => u.Id == user.Id, user);
        }

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

        return Ok();
    }

    [HttpGet("audit-logs")]
    public async Task<IActionResult> GetAuditLogs()
    {
        var logs = await _context.AuditLogs.Find(_ => true).SortByDescending(l => l.CreatedAt).Limit(100).ToListAsync();
        return Ok(logs);
    }

    [HttpGet("stats/advanced")]
    public async Task<IActionResult> GetAdvancedStats()
    {
        // Mock dữ liệu biểu đồ cho UI chuyên nghiệp
        var growth = new[]
        {
            new { day = "T2", users = 120, matches = 45 },
            new { day = "T3", users = 150, matches = 52 },
            new { day = "T4", users = 180, matches = 61 },
            new { day = "T5", users = 170, matches = 58 },
            new { day = "T6", users = 210, matches = 75 },
            new { day = "T7", users = 250, matches = 90 },
            new { day = "CN", users = 300, matches = 110 }
        };

        var categories = new[]
        {
            new { label = "Quấy rối", value = 65 },
            new { label = "Ảnh giả", value = 25 },
            new { label = "Lừa đảo", value = 10 }
        };

        return Ok(new { growth, categories });
    }

    [HttpDelete("users/{userId}/photos/{photoId}")]
    public async Task<IActionResult> DeleteUserPhoto(Guid userId, string photoId)
    {
        var profile = await _context.UserProfiles.Find(p => p.UserId == userId).FirstOrDefaultAsync();
        if (profile == null) return NotFound();

        // Giả sử có phương thức RemovePhoto trong domain
        // profile.RemovePhoto(photoId); 
        // await _context.UserProfiles.ReplaceOneAsync(p => p.UserId == userId, profile);

        var log = new AuditLog(Guid.Empty, "Admin", "DELETE_PHOTO", $"{userId}/{photoId}", "Xóa ảnh vi phạm tiêu chuẩn", "");
        await _context.AuditLogs.InsertOneAsync(log);

        return Ok();
    }

    [HttpPost("broadcast")]
    public async Task<IActionResult> Broadcast([FromBody] BroadcastRequest request)
    {
        var totalUsers = await _context.UserAccounts.CountDocumentsAsync(_ => true);
        
        var broadcast = new BroadcastNotification(request.Title, request.Content, "All", Guid.Empty, (int)totalUsers);
        await _context.BroadcastNotifications.InsertOneAsync(broadcast);

        // Logic gửi Push qua FCM sẽ ở đây...

        return Ok(new { sentTo = totalUsers });
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var totalUsers = await _context.UserAccounts.CountDocumentsAsync(_ => true);
        var totalMatches = await _context.UserMatches.CountDocumentsAsync(_ => true);
        var totalReports = await _context.UserReports.CountDocumentsAsync(_ => true);
        
        return Ok(new
        {
            totalUsers,
            totalMatches,
            totalReports,
            activeUsers = 0 // Mock cho UI
        });
    }
}

public class BanRequest
{
    public string Reason { get; set; }
    public DateTime? Until { get; set; }
}

public class BroadcastRequest
{
    public string Title { get; set; }
    public string Content { get; set; }
}
