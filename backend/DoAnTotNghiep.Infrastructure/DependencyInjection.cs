using DoAnTotNghiep.Application.Common;
using DoAnTotNghiep.Domain.Common;
using DoAnTotNghiep.Application.Email;
using DoAnTotNghiep.Application.Notifications;
using DoAnTotNghiep.Application.Observability;
using DoAnTotNghiep.Domain.Token;
using DoAnTotNghiep.Infrastructure.Persistence;
using DoAnTotNghiep.Infrastructure.Persistence.Redis;
using DoAnTotNghiep.Infrastructure.Persistence.Email.Template;
using DoAnTotNghiep.Infrastructure.Persistence.Storage;
using DoAnTotNghiep.Infrastructure.Repositories;
using DoAnTotNghiep.Infrastructure.Notifications;
using DoAnTotNghiep.Infrastructure.Observability;
using DoAnTotNghiep.Infrastructure.Security;
using DoAnTotNghiep.Application.Chat;
using DoAnTotNghiep.Infrastructure.Chat;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using DoAnTotNghiep.Application.Users.Recommendation.Services;
using DoAnTotNghiep.Infrastructure.Persistence.Geo;
using StackExchange.Redis;

namespace DoAnTotNghiep.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton<IMongoDbContext, MongoDbContext>();
        services.AddScoped<MongoDbInitializer>();
        services.AddScoped<ISwipeRepository, SwipeRepository>();
        services.AddScoped<Domain.Users.IUserRepository, Repositories.UserRepository>();
        services.AddScoped<Domain.Users.ISessionRepository, Repositories.UserSessionRepository>();
        services.AddScoped<IJwtService, JwtService>();
        services.AddScoped<Domain.Users.IUserProfileRepository, Repositories.UserProfileRepository>();
        services.AddScoped<IChatMessageRepository, ChatMessageRepository>();
        services.AddScoped<IConversationRepository, ConversationRepository>();
        services.AddSingleton<IChatMessageQueue, ChatMessageQueue>();
        services.AddHostedService<ChatPersistenceBackgroundService>();
        services.AddScoped<IPasswordHasher, BCryptPasswordHasher>();
        services.AddScoped<IEmailService, MailKitEmailService>();
        services.AddScoped<IGoogleAuthService, GoogleAuthService>();
        services.AddScoped<IEmailTemplateService, EmailTemplateService>();
        services.AddScoped<INotificationService, FirebaseNotificationService>();
        services.AddTransient<IPasswordResetToken, PasswordResetTokenRepository>();
        services.AddTransient<ITokenGenerator, TokenGenerateService>();
        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddScoped<Domain.Users.IFeedbackRepository, Repositories.FeedbackRepository>();
        services.AddScoped<Domain.Users.IUserReportRepository, Repositories.UserReportRepository>();
        services.AddScoped<Domain.Notifications.INotificationRepository, Repositories.NotificationRepository>();
        services.AddScoped<Domain.Users.IUserVerificationRepository, Repositories.UserVerificationRepository>();
        services.AddScoped<ITokenService, Persistence.Token.TokenService>();
        
        var redisSettings = configuration.GetSection("Redis").Get<RedisSettings>();
        
        // Register IConnectionMultiplexer only if not already registered (to avoid conflicts with Program.cs)
        if (services.All(x => x.ServiceType != typeof(IConnectionMultiplexer)))
        {
            services.AddSingleton<IConnectionMultiplexer>(sp =>
                ConnectionMultiplexer.Connect(redisSettings?.ConnectionString ?? "localhost:6379"));
        }
        services.AddScoped<IRecommendationScoringService, RecommendationScoringService>();
        services.AddScoped<IGeoService, GeoService>();
        services.AddScoped<ISeenUserService, SeenUserService>();
        services.AddSingleton<IMetricsService, PrometheusMetricsService>();

        services.AddMemoryCache();
        services.AddSingleton<ICacheService>(sp =>
        {
            var memoryCache = sp.GetRequiredService<IMemoryCache>();
            return new RedisContext(redisSettings ?? new RedisSettings(), memoryCache);
        });
        var smtpSettings = configuration.GetSection("Smtp");
        services.Configure<EmailSettings>(smtpSettings);


        var r2 = configuration.GetSection("CloudflareR2").Get<R2Settings>() ?? new R2Settings();
        services.AddSingleton(r2);
        services.AddScoped<IFileStorageService, R2StorageService>();
        services.AddScoped<IFileService, FileService>();
        services.AddScoped<IFraudDetectionService, FraudDetection.FraudDetectionService>();
        services.AddScoped<IContentModerationService, Moderation.ContentModerationService>();
        
        services.AddHttpClient<IAiVerificationService, AiVerification.AiVerificationService>();
        services.AddSingleton<IEncryptionService, EncryptionService>();

        return services;
    }
}
