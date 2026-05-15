using DoAnTotNghiep.Domain.Notifications;
using DoAnTotNghiep.Infrastructure.Persistence;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Infrastructure.Repositories;

public class NotificationRepository(MongoDbContext db) : INotificationRepository
{
    public async Task AddAsync(Notification notification)
    {
        await db.Notifications.InsertOneAsync(notification);
    }
}
