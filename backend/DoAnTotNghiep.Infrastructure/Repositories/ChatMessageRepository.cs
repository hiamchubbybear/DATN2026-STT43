using DoAnTotNghiep.Application.Chat;
using DoAnTotNghiep.Domain.Chat;
using DoAnTotNghiep.Infrastructure.Persistence;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Infrastructure.Repositories;

public class ChatMessageRepository : IChatMessageRepository
{
    private readonly MongoDbContext _context;

    public ChatMessageRepository(MongoDbContext context)
    {
        _context = context;
    }

    public async Task<List<ChatMessage>> GetHistoryAsync(Guid conversationId, DateTime? before, int limit, CancellationToken cancellationToken)
    {
        var filterBuilder = Builders<ChatMessage>.Filter;
        var filter = filterBuilder.Eq(x => x.ConversationId, conversationId);

        if (before.HasValue)
        {
            filter &= filterBuilder.Lt(x => x.CreatedAt, before.Value);
        }

        return await _context.ChatMessages
            .Find(filter)
            .SortByDescending(x => x.CreatedAt)
            .Limit(limit)
            .ToListAsync(cancellationToken);
    }
}
