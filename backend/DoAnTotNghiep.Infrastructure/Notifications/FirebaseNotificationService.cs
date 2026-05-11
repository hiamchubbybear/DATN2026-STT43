using DoAnTotNghiep.Application.Notifications;
using DoAnTotNghiep.Application.Observability;
using DoAnTotNghiep.Domain.Users;
using FirebaseAdmin;
using FirebaseAdmin.Messaging;
using Google.Apis.Auth.OAuth2;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Infrastructure.Notifications;

public class FirebaseNotificationService : INotificationService
{
    private readonly ISessionRepository _sessionRepository;
    private readonly IMetricsService _metrics;
    private readonly FirebaseMessaging? _messaging;

    public FirebaseNotificationService(
        ISessionRepository sessionRepository,
        IMetricsService metrics,
        IConfiguration configuration)
    {
        _sessionRepository = sessionRepository;
        _metrics = metrics;

        if (FirebaseApp.DefaultInstance == null)
        {
            var configPath = configuration["Firebase:ServiceAccountPath"];
            if (!string.IsNullOrEmpty(configPath) && File.Exists(configPath))
            {
                FirebaseApp.Create(new AppOptions
                {
                    Credential = GoogleCredential.FromFile(configPath)
                });
            }
            else
            {
                Console.WriteLine("[FCM] Warning: Firebase ServiceAccountPath not configured or file not found. Push notifications disabled.");
            }
        }

        if (FirebaseApp.DefaultInstance != null)
            _messaging = FirebaseMessaging.GetMessaging(FirebaseApp.DefaultInstance);
    }

    public async Task SendPushNotificationAsync(string pushToken, string title, string body, Dictionary<string, string>? data = null)
    {
        if (_messaging == null) return;

        try
        {
            await _messaging.SendAsync(new Message
            {
                Token = pushToken,
                Notification = new Notification { Title = title, Body = body },
                Data = data
            });
            _metrics.RecordNotificationSent("push");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[FCM] Push failed: {ex.Message}");
        }
    }

    public async Task SendPushToUserAsync(Guid userId, string title, string body, Dictionary<string, string>? data = null)
    {
        var tokens = await _sessionRepository.GetPushTokensByUserId(userId);
        if (tokens == null || !tokens.Any()) return;

        foreach (var token in tokens)
            await SendPushNotificationAsync(token, title, body, data);
    }

    public async Task BroadcastNotificationAsync(string title, string body, Dictionary<string, string>? data = null)
    {
        if (_messaging == null) return;

        await _messaging.SendAsync(new Message
        {
            Topic = "all",
            Notification = new Notification { Title = title, Body = body },
            Data = data
        });
        _metrics.RecordNotificationSent("push_broadcast");
    }
}
