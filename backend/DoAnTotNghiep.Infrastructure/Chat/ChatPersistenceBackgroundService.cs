using DoAnTotNghiep.Application.Chat;
using DoAnTotNghiep.Domain.Common;
using DoAnTotNghiep.Infrastructure.Persistence;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Infrastructure.Chat;

public class ChatPersistenceBackgroundService : BackgroundService
{
    private readonly IChatMessageQueue _queue;
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<ChatPersistenceBackgroundService> _logger;

    public ChatPersistenceBackgroundService(
        IChatMessageQueue queue,
        IServiceProvider serviceProvider,
        ILogger<ChatPersistenceBackgroundService> logger)
    {
        _queue = queue;
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Chat Persistence Background Service is starting.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var message = await _queue.DequeueMessageAsync(stoppingToken);

                using (var scope = _serviceProvider.CreateScope())
                {
                    var encryptionService = scope.ServiceProvider.GetRequiredService<IEncryptionService>();
                    message.Encrypt(encryptionService);

                    var mongoContext = scope.ServiceProvider.GetRequiredService<MongoDbContext>();
                    await mongoContext.ChatMessages.InsertOneAsync(message, cancellationToken: stoppingToken);
                    _logger.LogInformation("Persisted encrypted chat message {MsgId} to MongoDB", message.Id);
                }
            }
            catch (OperationCanceledException)
            {
                // Prevent throwing if stoppingToken was signaled
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred executing Chat Message persistence.");
            }
        }
    }
}
