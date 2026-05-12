using DoAnTotNghiep.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using DoAnTotNghiep.Domain.Users;
using Microsoft.AspNetCore.Authorization;
using DoAnTotNghiep.Application.Common;

namespace DoAnTotNghiep.Web.Controller;

[ApiController]
[Route("api/settings")]
// [Authorize]
public class SettingsController : ControllerBase
{
    private readonly MongoDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public SettingsController(MongoDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    public async Task<IActionResult> GetSettings()
    {
        var userId = Guid.Parse(_currentUserService.UserId ?? Guid.Empty.ToString());
        var settings = await _context.UserSettings.Find(s => s.UserId == userId).FirstOrDefaultAsync();
        
        if (settings == null)
        {
            settings = new UserSettings(userId);
            await _context.UserSettings.InsertOneAsync(settings);
        }

        return Ok(settings);
    }

    [HttpPatch("notifications")]
    public async Task<IActionResult> UpdateNotifications([FromBody] NotificationSettingsRequest request)
    {
        var userId = Guid.Parse(_currentUserService.UserId ?? Guid.Empty.ToString());
        var settings = await _context.UserSettings.Find(s => s.UserId == userId).FirstOrDefaultAsync();
        if (settings == null) return NotFound();

        settings.UpdateNotifications(request.Push, request.Email, request.Match, request.Message);
        await _context.UserSettings.ReplaceOneAsync(s => s.UserId == userId, settings);

        return Ok(settings);
    }

    [HttpPost("block/{targetId}")]
    public async Task<IActionResult> BlockUser(Guid targetId, [FromQuery] string? reason)
    {
        var userId = Guid.Parse(_currentUserService.UserId ?? Guid.Empty.ToString());
        var block = new BlockedUser(userId, targetId, reason);
        await _context.BlockedUsers.InsertOneAsync(block);

        return Ok();
    }

    [HttpGet("blocked")]
    public async Task<IActionResult> GetBlockedUsers()
    {
        var userId = Guid.Parse(_currentUserService.UserId ?? Guid.Empty.ToString());
        var list = await _context.BlockedUsers.Find(b => b.BlockerId == userId).ToListAsync();
        return Ok(list);
    }
}

public class NotificationSettingsRequest
{
    public bool Push { get; set; }
    public bool Email { get; set; }
    public bool Match { get; set; }
    public bool Message { get; set; }
}
