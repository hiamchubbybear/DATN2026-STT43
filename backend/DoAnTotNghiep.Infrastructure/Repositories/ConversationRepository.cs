using DoAnTotNghiep.Application.Chat;
using DoAnTotNghiep.Domain.Chat;
using DoAnTotNghiep.Domain.Common;
using DoAnTotNghiep.Infrastructure.Persistence;
using MongoDB.Driver;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Infrastructure.Repositories;

public class ConversationRepository : IConversationRepository
{
    private readonly MongoDbContext _context;
    private readonly IEncryptionService _encryptionService;

    public ConversationRepository(MongoDbContext context, IEncryptionService encryptionService)
    {
        _context = context;
        _encryptionService = encryptionService;
    }

    public async Task<Conversation?> GetByParticipantsAsync(string user1Id, string user2Id, CancellationToken cancellationToken = default)
    {
        var filter = Builders<Conversation>.Filter.And(
            Builders<Conversation>.Filter.All(x => x.ParticipantIds, new[] { user1Id, user2Id }),
            Builders<Conversation>.Filter.Size(x => x.ParticipantIds, 2)
        );

        var result = await _context.Conversations.Find(filter).FirstOrDefaultAsync(cancellationToken);
        result?.Decrypt(_encryptionService);
        return result;
    }

    public async Task<List<Conversation>> GetByUserIdAsync(string userId, CancellationToken cancellationToken = default)
    {
        var filter = Builders<Conversation>.Filter.AnyEq(x => x.ParticipantIds, userId);
        var results = await _context.Conversations.Find(filter).ToListAsync(cancellationToken);
        results.ForEach(c => c.Decrypt(_encryptionService));
        return results;
    }

    public async Task CreateAsync(Conversation conversation, CancellationToken cancellationToken = default)
    {
        conversation.Encrypt(_encryptionService);
        await _context.Conversations.InsertOneAsync(conversation, null, cancellationToken);
    }

    public async Task UpdateAsync(Conversation conversation, CancellationToken cancellationToken = default)
    {
        conversation.Encrypt(_encryptionService);
        await _context.Conversations.ReplaceOneAsync(x => x.Id == conversation.Id, conversation, cancellationToken: cancellationToken);
    }

    public async Task<Conversation?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var result = await _context.Conversations.Find(x => x.Id == id).FirstOrDefaultAsync(cancellationToken);
        result?.Decrypt(_encryptionService);
        return result;
    }
    
    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        await _context.Conversations.DeleteOneAsync(x => x.Id == id, cancellationToken);
    }
}
