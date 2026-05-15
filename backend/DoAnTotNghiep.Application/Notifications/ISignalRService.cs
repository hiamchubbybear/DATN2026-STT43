using System;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Application.Notifications;

public interface ISignalRService
{
    Task SendWarningAsync(Guid userId, string title, string message);
}
