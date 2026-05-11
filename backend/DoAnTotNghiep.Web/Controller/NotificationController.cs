using DoAnTotNghiep.Application.Admin.Notifications;
using DoAnTotNghiep.Application.Common.Models;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Web.Controllers;

[ApiController]
[Route("api/admin/notifications")]
// [Authorize(Roles = "Admin")] // Uncomment when roles are ready
public class NotificationController : ControllerBase
{
    private readonly IMediator _mediator;

    public NotificationController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("send")]
    public async Task<IActionResult> SendNotification([FromBody] SendAdminNotificationCommand command)
    {
        var result = await _mediator.Send(command);
        if (result)
        {
            return Ok(ApiResponse<string>.Succeeded(string.Empty, "Notification sent successfully"));
        }
        return BadRequest(ApiResponse<string>.Failed("Failed to send notification"));
    }
}
