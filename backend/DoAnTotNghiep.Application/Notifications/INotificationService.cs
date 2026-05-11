using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Application.Notifications;

public interface INotificationService
{
    Task SendPushNotificationAsync(string pushToken, string title, string body, Dictionary<string, string>? data = null);
    Task SendPushToUserAsync(Guid userId, string title, string body, Dictionary<string, string>? data = null);
    Task BroadcastNotificationAsync(string title, string body, Dictionary<string, string>? data = null);
}
