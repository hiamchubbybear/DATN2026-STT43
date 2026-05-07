using DoAnTotNghiep.Application.Common;
using DoAnTotNghiep.Application.Email;
using DoAnTotNghiep.Domain.Token;
using DoAnTotNghiep.Infrastructure.Persistence;
using DoAnTotNghiep.Infrastructure.Persistence.Redis;
using DoAnTotNghiep.Infrastructure.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Caching.Memory;
using DoAnTotNghiep.Infrastructure.Persistence.Email.Template;
using DoAnTotNghiep.Infrastructure.Repositories;

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
        services.AddScoped<IPasswordHasher, BCryptPasswordHasher>();
        services.AddScoped<IEmailService, MailKitEmailService>();
        services.AddScoped<IGoogleAuthService, GoogleAuthService>();
        services.AddScoped<IEmailTemplateService, EmailTemplateService>();
        services.AddTransient<IPasswordResetToken, PasswordResetTokenRepository>();
        services.AddTransient<ITokenGenerator, TokenGenerateService>();
        var redisSettings = configuration.GetSection("Redis").Get<RedisSettings>();
        
        services.AddMemoryCache();
        services.AddSingleton<ICacheService>(sp => 
        {
            var memoryCache = sp.GetRequiredService<IMemoryCache>();
            return new RedisContext(redisSettings ?? new RedisSettings(), memoryCache);
        });
        var smtpSettings = configuration.GetSection("Smtp");
        services.Configure<EmailSettings>(smtpSettings);

        return services;
    }
}