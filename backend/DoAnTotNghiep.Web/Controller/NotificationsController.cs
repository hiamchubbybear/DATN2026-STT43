using DoAnTotNghiep.Application.Common.Models;
using DoAnTotNghiep.Domain.Notifications;
using DoAnTotNghiep.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace DoAnTotNghiep.Web.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationsController(MongoDbContext db) : ControllerBase
{
    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
            ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            throw new UnauthorizedAccessException();

        return userId;
    }

    [HttpGet]
    public async Task<IActionResult> List(CancellationToken ct)
    {
        var userId = GetUserId();

        var items = await db.Notifications
            .Find(x => x.UserId == userId)
            .SortByDescending(x => x.CreatedAt)
            .Limit(200)
            .ToListAsync(ct);

        return Ok(ApiResponse<List<Notification>>.Succeeded(items));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var userId = GetUserId();

        var result = await db.Notifications.DeleteOneAsync(
            x => x.Id == id && x.UserId == userId,
            ct
        );

        if (result.DeletedCount == 0)
            return NotFound(ApiResponse<string>.Failed("Notification not found"));

        return Ok(ApiResponse<string>.Succeeded(string.Empty, "Deleted"));
    }

    [HttpPatch("{id:guid}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id, CancellationToken ct)
    {
        var userId = GetUserId();

        var update = Builders<Notification>.Update
            .Set(x => x.IsRead, true)
            .Set(x => x.ReadAt, DateTime.UtcNow);

        var result = await db.Notifications.UpdateOneAsync(
            x => x.Id == id && x.UserId == userId,
            update,
            cancellationToken: ct
        );

        if (result.ModifiedCount == 0)
            return NotFound(ApiResponse<string>.Failed("Notification not found or already read"));

        return Ok(ApiResponse<string>.Succeeded(string.Empty, "Marked as read"));
    }

    [HttpPost("read-all")]
    public async Task<IActionResult> MarkAllAsRead(CancellationToken ct)
    {
        var userId = GetUserId();

        var update = Builders<Notification>.Update
            .Set(x => x.IsRead, true)
            .Set(x => x.ReadAt, DateTime.UtcNow);

        await db.Notifications.UpdateManyAsync(
            x => x.UserId == userId && !x.IsRead,
            update,
            cancellationToken: ct
        );

        return Ok(ApiResponse<string>.Succeeded(string.Empty, "All notifications marked as read"));
    }
}

