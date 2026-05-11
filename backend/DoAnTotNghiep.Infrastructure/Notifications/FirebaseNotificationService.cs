using FirebaseAdmin;
using FirebaseAdmin.Messaging;
using Google.Apis.Auth.OAuth2;
using DoAnTotNghiep.Application.Notifications;
using DoAnTotNghiep.Domain.Users;
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
    private readonly FirebaseMessaging _messaging;

    public FirebaseNotificationService(ISessionRepository sessionRepository, IConfiguration configuration)
    {
        _sessionRepository = sessionRepository;

        if (FirebaseApp.DefaultInstance == null)
        {
            var configPath = configuration["Firebase:ServiceAccountPath"];
            if (!string.IsNullOrEmpty(configPath) && File.Exists(configPath))
            {
                FirebaseApp.Create(new AppOptions()
                {
                    Credential = GoogleCredential.FromFile(configPath)
                });
            }
            else
            {
                // Fallback or warning - in real world you MUST have this config
                Console.WriteLine("Warning: Firebase ServiceAccountPath not found or file does not exist.");
            }
        }

        if (FirebaseApp.DefaultInstance != null)
        {
            _messaging = FirebaseMessaging.GetMessaging(FirebaseApp.DefaultInstance);
        }
    }

    public async Task SendPushNotificationAsync(string pushToken, string title, string body, Dictionary<string, string>? data = null)
    {
        if (_messaging == null) return;

        var message = new Message()
        {
            Token = pushToken,
            Notification = new Notification()
            {
                Title = title,
                Body = body
            },
            Data = data
        };

        try
        {
            await _messaging.SendAsync(message);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error sending push notification: {ex.Message}");
        }
    }

    public async Task SendPushToUserAsync(Guid userId, string title, string body, Dictionary<string, string>? data = null)
    {
        var tokens = await _sessionRepository.GetPushTokensByUserId(userId);
        if (tokens == null || !tokens.Any()) return;

        foreach (var token in tokens)
        {
            await SendPushNotificationAsync(token, title, body, data);
        }
    }

    public async Task BroadcastNotificationAsync(string title, string body, Dictionary<string, string>? data = null)
    {
        if (_messaging == null) return;

        var message = new Message()
        {
            Topic = "all",
            Notification = new Notification()
            {
                Title = title,
                Body = body
            },
            Data = data
        };

        await _messaging.SendAsync(message);
    }
}
