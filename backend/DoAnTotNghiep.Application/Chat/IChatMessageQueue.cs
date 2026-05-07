using DoAnTotNghiep.Domain.Chat;
using System.Threading;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Application.Chat;

public interface IChatMessageQueue
{
    ValueTask EnqueueMessageAsync(ChatMessage message);
    ValueTask<ChatMessage> DequeueMessageAsync(CancellationToken cancellationToken);
}
