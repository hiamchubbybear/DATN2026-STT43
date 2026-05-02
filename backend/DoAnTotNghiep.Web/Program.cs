using System.Threading.Tasks;
using DoAnTotNghiep.Application;
using DoAnTotNghiep.Infrastructure;
using DoAnTotNghiep.Infrastructure.Persistence;
using DoAnTotNghiep.Web;
using DoAnTotNghiep.Web.Hubs;
using FluentValidation;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
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
    .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}")
    .CreateLogger();

builder.Host.UseSerilog();

var mongoSettings = builder.Configuration.GetSection("MongoDb").Get<MongoSettings>();
var redisSettings = builder.Configuration.GetSection("Redis").Get<RedisSettings>();
var secretKey = builder.Configuration["Key:SecretKey"] ?? throw new InvalidOperationException("SecretKey is missing in configuration");
builder.Services.Configure<KeySettings>(builder.Configuration.GetSection("Key"));
builder.Services.AddJwtAuthentication(secretKey);
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();
builder.Services.AddApplication();
builder.Services.AddSingleton(mongoSettings!);
builder.Services.AddSingleton(redisSettings!);
builder.Services.AddSingleton<MongoDbContext>();

builder.Services.AddHealthChecks()
    .AddMongoDb(_ => new MongoDB.Driver.MongoClient(mongoSettings!.ConnectionString), name: "mongodb")
    .AddRedis(redisSettings!.ConnectionString, name: "redis");
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddControllers();

try 
{
    var redisConfig = StackExchange.Redis.ConfigurationOptions.Parse(redisSettings!.ConnectionString);
    redisConfig.AbortOnConnectFail = true; // Fail fast for the check
    redisConfig.ConnectTimeout = 2000;
    
    // Ping Redis to see if it's alive
    using var muxer = StackExchange.Redis.ConnectionMultiplexer.Connect(redisConfig);
    
    builder.Services.AddSignalR().AddStackExchangeRedis(options =>
    {
        var finalConfig = StackExchange.Redis.ConfigurationOptions.Parse(redisSettings!.ConnectionString);
        finalConfig.AbortOnConnectFail = false;
        finalConfig.ChannelPrefix = "PsyConnect";
        options.Configuration = finalConfig;
    });
    Log.Information("Redis is online. SignalR Redis Backplane enabled.");
}
catch (Exception ex)
{
    Log.Warning("Redis is offline! Falling back to In-Memory SignalR (Single Node Mode). Error: {Msg}", ex.Message);
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

// CORS should be before Auth
app.UseCors(x => x
    .AllowAnyOrigin()
    .AllowAnyMethod()
    .AllowAnyHeader());

app.UseAuthentication();
app.UseAuthorization();

app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = async (context, report) =>
    {
        context.Response.ContentType = "application/json";
        var isHealthy = report.Status == Microsoft.Extensions.Diagnostics.HealthChecks.HealthStatus.Healthy;
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