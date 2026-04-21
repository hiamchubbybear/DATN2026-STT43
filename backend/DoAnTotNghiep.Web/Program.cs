using System.Threading.Tasks;
using DoAnTotNghiep.Application;
using DoAnTotNghiep.Infrastructure;
using DoAnTotNghiep.Infrastructure.Persistence;
using DoAnTotNghiep.Web;
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
var secretKey = builder.Configuration["Key:SecretKey"];
builder.Services.Configure<KeySettings>(builder.Configuration.GetSection("Key"));
builder.Services.AddJwtAuthentication(secretKey);
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
WebApplication.CreateBuilder(new WebApplicationOptions
{
    EnvironmentName = "Development"
});
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
// builder.Services.AddValidatorsFromAssemblyContaining<ResetPasswordValidator>();
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.DefaultIgnoreCondition =
        System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
});
Log.Information("Environment: {Env}", builder.Environment.EnvironmentName);
var app = builder.Build();
app.UseExceptionHandler();
app.UseSerilogRequestLogging();
app.UseDefaultFiles();
app.UseStaticFiles();
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
app.MapFallbackToFile("index.html");
app.UseHttpsRedirection();


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