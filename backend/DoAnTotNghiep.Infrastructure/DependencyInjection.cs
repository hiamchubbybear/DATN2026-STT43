using DoAnTotNghiep.Application.Common;
using DoAnTotNghiep.Application.Email;
using DoAnTotNghiep.Domain.Token;
using DoAnTotNghiep.Infrastructure.Persistence;
using DoAnTotNghiep.Infrastructure.Persistence.Redis;
using DoAnTotNghiep.Infrastructure.Persistence.Email.Template;
using DoAnTotNghiep.Infrastructure.Persistence.Storage;
using DoAnTotNghiep.Infrastructure.Repositories;
using DoAnTotNghiep.Infrastructure.Security;
using DoAnTotNghiep.Application.Chat;
using DoAnTotNghiep.Infrastructure.Chat;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using DoAnTotNghiep.Application.Users.Recommendation.Services;
using DoAnTotNghiep.Infrastructure.Persistence.Geo;
using DoAnTotNghiep.Infrastructure.Persistence.Redis;

namespace DoAnTotNghiep.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton<MongoDbContext>();
        services.AddSingleton<MongoDbInitializer>();
        services.AddScoped<ISwipeRepository, SwipeRepository>();
        services.AddScoped<IBloomFilterService, BloomFilterService>();
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
        services.AddTransient<IPasswordResetToken, PasswordResetTokenRepository>();
        services.AddTransient<ITokenGenerator, TokenGenerateService>();
        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        var redisSettings = configuration.GetSection("Redis").Get<RedisSettings>();
        
        services.AddScoped<IRecommendationScoringService, RecommendationScoringService>();
        services.AddScoped<IGeoService, GeoService>();
        services.AddScoped<ISeenUserService, SeenUserService>();

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

        return services;
    }
}