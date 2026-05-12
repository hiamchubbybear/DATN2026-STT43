using System.Reflection;
using System.Text;
using DoAnTotNghiep.Application.Behaviors;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
namespace DoAnTotNghiep.Application;

public static class DependencyInjection
{
    
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly());
            cfg.AddOpenBehavior(typeof(LoggingBehavior<,>));
            cfg.AddOpenBehavior(typeof(ValidationBehavior<,>));
        });

        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());
        return services;
    }
    
    public static IServiceCollection AddJwtAuthentication(this IServiceCollection services, string secretKey)
    {
        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
            .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(secretKey)),
                NameClaimType = "sub",
                RoleClaimType = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
            };

            options.Events = new JwtBearerEvents
            {
                OnAuthenticationFailed = context =>
                {
                    Console.WriteLine($"--- AUTH FAILED: {context.Exception.Message} ---");
                    return Task.CompletedTask;
                },
                OnChallenge = context =>
                {
                    Console.WriteLine($"--- AUTH CHALLENGE: {context.Error}, {context.ErrorDescription} ---");
                    return Task.CompletedTask;
                },
                OnMessageReceived = context =>
                {
                    var accessToken = context.Request.Query["access_token"];

                    // If the request is for our hub...
                    var path = context.HttpContext.Request.Path;
                    if (path.StartsWithSegments("/hubs/app"))
                    {
                        if (!string.IsNullOrEmpty(accessToken))
                        {
                            Console.WriteLine($"--- SIGNALR AUTH: Token found in query for path {path} ---");
                            context.Token = accessToken;
                        }
                        else 
                        {
                            // If no query token, standard JWT middleware will check the Authorization header
                            // We just log for debugging
                            var authHeader = context.Request.Headers["Authorization"].ToString();
                            if (string.IsNullOrEmpty(authHeader))
                            {
                                Console.WriteLine($"--- SIGNALR AUTH: No token found in query or header for path {path} ---");
                            }
                            else
                            {
                                Console.WriteLine($"--- SIGNALR AUTH: Token found in header for path {path} ---");
                            }
                        }
                    }
                    return Task.CompletedTask;
                }
            };
        });
        
        return services;
    }
}