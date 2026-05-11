using DoAnTotNghiep.Domain.Chat;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Application.Chat;

public interface IChatMessageRepository
{
    Task<List<ChatMessage>> GetHistoryAsync(Guid conversationId, DateTime? before, int limit, CancellationToken cancellationToken);
    Task DeleteByConversationIdAsync(Guid conversationId, CancellationToken cancellationToken = default);
}
