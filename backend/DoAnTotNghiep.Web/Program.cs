using System.Threading.Tasks;
using DoAnTotNghiep.Application;
using DoAnTotNghiep.Infrastructure;
using DoAnTotNghiep.Infrastructure.Persistence;
using DoAnTotNghiep.Web;
using DoAnTotNghiep.Web.Hubs;
using FluentValidation;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Prometheus;
using Serilog;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Serializers;

// Register MongoDB Guid Serializer globally before any other DB operations
#pragma warning disable CS0618 // Type or member is obsolete
BsonSerializer.RegisterSerializer(new GuidSerializer(GuidRepresentation.Standard));
#pragma warning restore CS0618
System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .Enrich.WithMachineName()
    .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj} {Properties:j}{NewLine}{Exception}")
    .CreateLogger();


builder.Host.UseSerilog();

var mongoSettings = builder.Configuration.GetSection("MongoDb").Get<MongoSettings>();
var redisSettings = builder.Configuration.GetSection("Redis").Get<RedisSettings>();
var secretKey = builder.Configuration["Key:SecretKey"] ?? throw new InvalidOperationException("SecretKey is missing in configuration");
builder.Services.Configure<KeySettings>(builder.Configuration.GetSection("Key"));
builder.Services.AddJwtAuthentication(secretKey);
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();
builder.Services.AddCors();
builder.Services.AddApplication();
builder.Services.AddSingleton(mongoSettings!);
builder.Services.AddSingleton(redisSettings!);
builder.Services.AddSingleton<MongoDbContext>();

builder.Services.AddHealthChecks()
    .AddMongoDb(_ => new MongoDB.Driver.MongoClient(mongoSettings!.ConnectionString), name: "mongodb", tags: ["db", "ready"])
    .AddRedis(redisSettings!.ConnectionString, name: "redis", tags: ["cache", "ready"]);

builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo { Title = "Mixer API - Mobile", Version = "v1" });
    c.SwaggerDoc("admin", new Microsoft.OpenApi.Models.OpenApiInfo { Title = "Mixer API - Admin Dashboard", Version = "admin" });
    
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.OpenApiSecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiSecurityReference
                {
                    Type = Microsoft.OpenApi.Models.OpenApiSecurityReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] { }
        }
    });
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

var redisConfig = StackExchange.Redis.ConfigurationOptions.Parse(redisSettings!.ConnectionString);
redisConfig.AbortOnConnectFail = false;
redisConfig.ConnectTimeout = 2000; // Short timeout for startup check

try 
{
    var muxer = StackExchange.Redis.ConnectionMultiplexer.Connect(redisConfig);
    builder.Services.AddSingleton<StackExchange.Redis.IConnectionMultiplexer>(muxer);

    if (muxer.IsConnected)
    {
        builder.Services.AddSignalR().AddStackExchangeRedis(options =>
        {
            options.Configuration = redisConfig;
            options.Configuration.ChannelPrefix = "PsyConnect";
        });
        Log.Information("Redis backplane enabled and connected.");
    }
    else
    {
        Log.Warning("Redis configured but not connected. Using local SignalR backplane.");
        builder.Services.AddSignalR();
    }
}
catch (Exception ex)
{
    Log.Warning("Redis connection failed! Using local SignalR. Error: {Msg}", ex.Message);
    builder.Services.AddSignalR();
}

// builder.Services.AddValidatorsFromAssemblyContaining<ResetPasswordValidator>();
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.DefaultIgnoreCondition =
        System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
});
Log.Information("Environment: {Env}", builder.Environment.EnvironmentName);
var app = builder.Build();
app.UseExceptionHandler();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Mixer API - Mobile");
        c.SwaggerEndpoint("/swagger/admin/swagger.json", "Mixer API - Admin");
    });
    // app.UseDeveloperExceptionPage();
}
else 
{
    app.UseHttpsRedirection();
}

app.UseSerilogRequestLogging();
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseRouting();

// Prometheus HTTP metrics - must be after UseRouting
app.UseHttpMetrics(options =>
{
    options.AddCustomLabel("endpoint", ctx => ctx.Request.Path.Value ?? "unknown");
});

// CORS should be before Auth
app.UseCors(x => x
    .SetIsOriginAllowed(_ => true)
    .AllowAnyMethod()
    .AllowAnyHeader()
    .AllowCredentials());

app.UseAuthentication();
app.UseAuthorization();

app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = async (context, report) =>
    {
        context.Response.ContentType = "application/json";
        var isHealthy = report.Status == HealthStatus.Healthy;
        var response = new
        {
            schemaVersion = 1,
            label = "Server",
            message = isHealthy ? "online" : "offline",
            color = isHealthy ? "brightgreen" : "red"
        };
        await context.Response.WriteAsJsonAsync(response);
    }
});

// Liveness: app is running (no dependency checks)
app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = _ => false // Only checks the app itself, no external deps
});

// Readiness: app can serve traffic (all dependencies up)
app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready"),
    ResponseWriter = async (context, report) =>
    {
        context.Response.ContentType = "application/json";
        var result = new
        {
            status = report.Status.ToString(),
            checks = report.Entries.Select(e => new
            {
                name = e.Key,
                status = e.Value.Status.ToString(),
                description = e.Value.Description,
                duration = e.Value.Duration.TotalMilliseconds
            })
        };
        context.Response.StatusCode = report.Status == HealthStatus.Healthy ? 200 : 503;
        await context.Response.WriteAsJsonAsync(result);
    }
});

// Prometheus metrics scrape endpoint
app.MapMetrics("/metrics");

app.MapControllers();
app.MapHub<AppHub>("/hubs/app");
app.MapFallbackToFile("index.html");


using (var scope = app.Services.CreateScope())
{
    var initializer = scope.ServiceProvider.GetRequiredService<MongoDbInitializer>();
    await initializer.InitializeAsync();
}

try
{
    Log.Information("Starting web host");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Host terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}