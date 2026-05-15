using System;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Domain.Notifications;

public interface INotificationRepository
{
    Task AddAsync(Notification notification);
}
