using DoAnTotNghiep.Application.Common;
using DoAnTotNghiep.Application.Email;
using DoAnTotNghiep.Application.Risk;
using DoAnTotNghiep.Domain.Token;
using DoAnTotNghiep.Infrastructure.Persistence;
using DoAnTotNghiep.Infrastructure.Persistence.Email.Template;
using DoAnTotNghiep.Infrastructure.Persistence.Storage;
using DoAnTotNghiep.Infrastructure.Repositories;
using DoAnTotNghiep.Infrastructure.Risk;
using DoAnTotNghiep.Infrastructure.Security;
using DoAnTotNghiep.Application.Chat;
using DoAnTotNghiep.Infrastructure.Chat;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Http.Resilience;
using Microsoft.Extensions.Options;
using Polly;

namespace DoAnTotNghiep.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton<MongoDbContext>();
        services.AddSingleton<MongoDbInitializer>();
        services.AddScoped<Domain.Users.IUserRepository, Repositories.UserRepository>();
        services.AddScoped<Domain.Users.ISessionRepository, Repositories.UserSessionRepository>();
        services.AddScoped<IJwtService, JwtService>();
        services.AddScoped<Domain.Users.IUserProfileRepository, Repositories.UserProfileRepository>();
        services.AddScoped<IChatMessageRepository, ChatMessageRepository>();
        services.AddSingleton<IChatMessageQueue, ChatMessageQueue>();
        services.AddHostedService<ChatPersistenceBackgroundService>();
        services.AddScoped<IPasswordHasher, BCryptPasswordHasher>();
        services.AddScoped<IEmailService, MailKitEmailService>();
        services.AddScoped<IGoogleAuthService, GoogleAuthService>();
        services.AddScoped<IEmailTemplateService, EmailTemplateService>();
        services.AddTransient<IPasswordResetToken, PasswordResetTokenRepository>();
        services.AddTransient<ITokenGenerator, TokenGenerateService>();
        
        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        var redisSettings = configuration.GetSection("Redis").Get<RedisSettings>();
        
        services.AddMemoryCache();
        services.AddSingleton<ICacheService>(sp => 
        {
            var memoryCache = sp.GetRequiredService<IMemoryCache>();
            return new RedisContext(redisSettings ?? new RedisSettings(), memoryCache);
        });
        var smtpSettings = configuration.GetSection("Smtp");
        services.Configure<EmailSettings>(smtpSettings);


        var r2 = configuration.GetSection("CloudflareR2").Get<R2Settings>();
        services.AddSingleton(r2);
        services.AddScoped<IFileStorageService,R2StorageService>();

        AddRiskScoring(services, configuration);

        return services;
    }

    private static void AddRiskScoring(IServiceCollection services, IConfiguration configuration)
    {
        var section = configuration.GetSection(RiskScoringOptions.SectionName);
        services.Configure<RiskScoringOptions>(section);

        var riskOptions = section.Get<RiskScoringOptions>() ?? new RiskScoringOptions();

        services.AddHttpClient<IRiskScoringService, RiskScoringClient>((sp, client) =>
        {
            var opts = sp.GetRequiredService<IOptions<RiskScoringOptions>>().Value;
            if (Uri.TryCreate(opts.BaseUrl, UriKind.Absolute, out var baseUri))
            {
                client.BaseAddress = baseUri;
            }
            client.Timeout = Timeout.InfiniteTimeSpan; // Resilience pipeline owns timeouts.
            if (!string.IsNullOrEmpty(opts.InternalToken))
            {
                client.DefaultRequestHeaders.Remove(RiskScoringClient.InternalTokenHeader);
                client.DefaultRequestHeaders.Add(RiskScoringClient.InternalTokenHeader, opts.InternalToken);
            }
        })
        .AddResilienceHandler("risk-scoring", builder =>
        {
            // Outermost: total per-call budget. If exceeded, the call fails fast and the
            // RiskScoringClient catch block returns null (graceful degradation).
            builder.AddTimeout(TimeSpan.FromMilliseconds(Math.Max(1, riskOptions.TimeoutMs)));

            builder.AddRetry(new HttpRetryStrategyOptions
            {
                MaxRetryAttempts = Math.Max(0, riskOptions.RetryCount),
                BackoffType = DelayBackoffType.Exponential,
                UseJitter = true,
                Delay = TimeSpan.FromMilliseconds(50),
            });

            builder.AddCircuitBreaker(new HttpCircuitBreakerStrategyOptions
            {
                FailureRatio = 0.5,
                MinimumThroughput = 5,
                SamplingDuration = TimeSpan.FromSeconds(10),
                BreakDuration = TimeSpan.FromSeconds(15),
            });

            // Innermost: per-attempt timeout. Shorter than total so retries can fire.
            builder.AddTimeout(TimeSpan.FromMilliseconds(Math.Max(1, riskOptions.PerAttemptTimeoutMs)));
        });
    }
}