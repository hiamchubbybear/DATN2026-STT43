using DoAnTotNghiep.Application.Notifications;
using DoAnTotNghiep.Application.Observability;
using DoAnTotNghiep.Domain.Users;
using FirebaseAdmin;
using FirebaseAdmin.Messaging;
using Google.Apis.Auth.OAuth2;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Infrastructure.Notifications;

public class FirebaseNotificationService : INotificationService
{
    private readonly ISessionRepository _sessionRepository;
    private readonly IMetricsService _metrics;
    private readonly ILogger<FirebaseNotificationService> _logger;
    private readonly HttpClient _httpClient;
    private readonly FirebaseMessaging? _messaging;

    public FirebaseNotificationService(
        ISessionRepository sessionRepository,
        IMetricsService metrics,
        IConfiguration configuration,
        ILogger<FirebaseNotificationService> logger,
        IHttpClientFactory httpClientFactory)
    {
        _sessionRepository = sessionRepository;
        _metrics = metrics;
        _logger = logger;
        _httpClient = httpClientFactory.CreateClient();

        if (FirebaseApp.DefaultInstance == null)
        {
            var configPath = configuration["Firebase:ServiceAccountPath"];
            if (string.IsNullOrEmpty(configPath))
            {
                _logger.LogWarning("[FCM] Firebase:ServiceAccountPath is not configured.");
                return;
            }

            var fullPath = Path.IsPathRooted(configPath) 
                ? configPath 
                : Path.Combine(AppDomain.CurrentDomain.BaseDirectory, configPath);

            if (File.Exists(fullPath))
            {
                try 
                {
                    FirebaseApp.Create(new AppOptions
                    {
                        Credential = GoogleCredential.FromFile(fullPath)
                    });
                    _logger.LogInformation("[FCM] Firebase initialized successfully.");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "[FCM] Error initializing Firebase");
                }
            }
            else
            {
                _logger.LogWarning("[FCM] Firebase service account file not found at {Path}. Push notifications disabled.", fullPath);
            }
        }

        if (FirebaseApp.DefaultInstance != null)
            _messaging = FirebaseMessaging.GetMessaging(FirebaseApp.DefaultInstance);
    }

    public async Task SendPushNotificationAsync(string pushToken, string title, string body, Dictionary<string, string>? data = null)
    {
        if (string.IsNullOrEmpty(pushToken)) return;

        // 1. Detect Expo Push Token
        if (pushToken.StartsWith("ExponentPushToken["))
        {
            await SendExpoNotificationAsync(pushToken, title, body, data);
            return;
        }

        // 2. Standard Firebase Push
        if (_messaging == null)
        {
            _logger.LogWarning("[FCM] Firebase not initialized. Cannot send push to {Token}", pushToken);
            return;
        }

        try
        {
            await _messaging.SendAsync(new Message
            {
                Token = pushToken,
                Notification = new Notification { Title = title, Body = body },
                Android = new AndroidConfig 
                { 
                    Notification = new AndroidNotification { Icon = "ic_launcher", Color = "#EE3F57" } 
                },
                Data = data
            });
            _logger.LogInformation("[FCM] Successfully sent push to token: {Token}", pushToken);
            _metrics.RecordNotificationSent("push");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[FCM] Push failed for token {Token}", pushToken);
        }
    }

    private async Task SendExpoNotificationAsync(string expoToken, string title, string body, Dictionary<string, string>? data = null)
    {
        try
        {
            var payload = new
            {
                to = expoToken,
                title = title,
                body = body,
                data = data,
                sound = "default"
            };

            var response = await _httpClient.PostAsJsonAsync("https://exp.host/--/api/v2/push/send", payload);
            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("[Expo] Successfully sent push to token: {Token}", expoToken);
                _metrics.RecordNotificationSent("push_expo");
            }
            else
            {
                var error = await response.Content.ReadAsStringAsync();
                _logger.LogError("[Expo] Push failed for token {Token}. Status: {Status}, Error: {Error}", 
                    expoToken, response.StatusCode, error);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Expo] Push failed for token {Token}", expoToken);
        }
    }

    public async Task SendPushToUserAsync(Guid userId, string title, string body, Dictionary<string, string>? data = null)
    {
        var tokens = await _sessionRepository.GetFcmTokensByUserId(userId);
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
            Android = new AndroidConfig 
            { 
                Notification = new AndroidNotification { Icon = "ic_launcher", Color = "#EE3F57" } 
            },
            Data = data
        });
        _metrics.RecordNotificationSent("push_broadcast");
    }
}
