using DoAnTotNghiep.Application.Notifications;
using DoAnTotNghiep.Web.Hubs;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Web.Services;

public class SignalRService : ISignalRService
{
    private readonly IHubContext<AppHub> _hubContext;

    public SignalRService(IHubContext<AppHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task SendWarningAsync(Guid userId, string title, string message)
    {
        await _hubContext.Clients.Group($"User_{userId}").SendAsync("ReceiveWarning", new
        {
            title = title,
            message = message,
            timestamp = DateTime.UtcNow
        });
    }
}
