using DoAnTotNghiep.Application.Common;
using DoAnTotNghiep.Domain.Enum;
using DoAnTotNghiep.Domain.Users;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;

namespace DoAnTotNghiep.Infrastructure.FraudDetection;

public class ScamDetectionBackgroundWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<ScamDetectionBackgroundWorker> _logger;

    public ScamDetectionBackgroundWorker(
        IServiceProvider serviceProvider,
        ILogger<ScamDetectionBackgroundWorker> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Scam Detection Background Sweep Service is starting.");

        // Wait 10 seconds after server startup before running the first sweep to avoid overloading database initialization
        await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            _logger.LogInformation("Starting periodic Scam Detection scan sweep...");

            try
            {
                using (var scope = _serviceProvider.CreateScope())
                {
                    var profileRepo = scope.ServiceProvider.GetRequiredService<IUserProfileRepository>();
                    var fraudService = scope.ServiceProvider.GetRequiredService<IFraudDetectionService>();

                    // 1. Fetch all users
                    var allProfiles = await profileRepo.ListAllAsync();
                    
                    // 2. Filter out already banned users to avoid unnecessary ML prediction network requests
                    var activeProfiles = allProfiles
                        .Where(p => p.Status != UserStatus.Banned)
                        .ToList();

                    _logger.LogInformation("Scanning {Count} active profiles for suspicious scam patterns...", activeProfiles.Count);

                    int flagCount = 0;
                    foreach (var profile in activeProfiles)
                    {
                        if (stoppingToken.IsCancellationRequested) break;

                        try
                        {
                            var result = await fraudService.ScoreAndModerateUserAsync(profile.UserId, stoppingToken);
                            if (result != null && result.Recommendation?.ToLower() != "none" && result.Recommendation?.ToLower() != "low")
                            {
                                flagCount++;
                                _logger.LogWarning("User {UserId} scored high risk ({Score:P2}). Automated action: {Recommendation}",
                                    profile.UserId, result.ScamProbability, result.Recommendation);
                            }
                        }
                        catch (Exception userEx)
                        {
                            _logger.LogError(userEx, "Error occurred scanning scam risk for User {UserId}", profile.UserId);
                        }
                    }

                    _logger.LogInformation("Scam Detection scan sweep completed. Flagged {Flagged} accounts.", flagCount);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Severe error occurred during Scam Detection scan sweep.");
            }

            // Sleep for 30 minutes before running the next sweep
            _logger.LogInformation("Next Scam Detection sweep scheduled in 30 minutes.");
            try
            {
                await Task.Delay(TimeSpan.FromMinutes(30), stoppingToken);
            }
            catch (OperationCanceledException)
            {
                // Prevent throwing if stoppingToken was signaled during delay
            }
        }
    }
}
