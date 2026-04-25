using DoAnTotNghiep.Application.Chat;
using DoAnTotNghiep.Domain.Chat;
using System.Threading;
using System.Threading.Channels;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Infrastructure.Chat;

public class ChatMessageQueue : IChatMessageQueue
{
    private readonly Channel<ChatMessage> _queue;

    public ChatMessageQueue()
    {
        var options = new BoundedChannelOptions(10000)
        {
            FullMode = BoundedChannelFullMode.Wait
        };
        _queue = Channel.CreateBounded<ChatMessage>(options);
    }

    public async ValueTask EnqueueMessageAsync(ChatMessage message)
    {
        await _queue.Writer.WriteAsync(message);
    }

    public async ValueTask<ChatMessage> DequeueMessageAsync(CancellationToken cancellationToken)
    {
        return await _queue.Reader.ReadAsync(cancellationToken);
    }
}
