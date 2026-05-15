using DoAnTotNghiep.Application.Chat;
using DoAnTotNghiep.Domain.Chat;
using DoAnTotNghiep.Domain.Common;
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
    private readonly IEncryptionService _encryptionService;

    public ChatMessageRepository(MongoDbContext context, IEncryptionService encryptionService)
    {
        _context = context;
        _encryptionService = encryptionService;
    }

    public async Task<List<ChatMessage>> GetHistoryAsync(Guid conversationId, DateTime? before, int limit, CancellationToken cancellationToken)
    {
        var filterBuilder = Builders<ChatMessage>.Filter;
        var filter = filterBuilder.Eq(x => x.ConversationId, conversationId);

        if (before.HasValue)
        {
            filter &= filterBuilder.Lt(x => x.CreatedAt, before.Value);
        }

        var messages = await _context.ChatMessages
            .Find(filter)
            .SortByDescending(x => x.CreatedAt)
            .Limit(limit)
            .ToListAsync(cancellationToken);

        messages.ForEach(m => m.Decrypt(_encryptionService));
        return messages;
    }

    public async Task DeleteByConversationIdAsync(Guid conversationId, CancellationToken cancellationToken = default)
    {
        await _context.ChatMessages.DeleteManyAsync(x => x.ConversationId == conversationId, cancellationToken);
    }
}
