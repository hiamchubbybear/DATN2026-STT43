using DoAnTotNghiep.Application.Chat;
using DoAnTotNghiep.Domain.Chat;
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

    public ConversationRepository(MongoDbContext context)
    {
        _context = context;
    }

    public async Task<Conversation?> GetByParticipantsAsync(string user1Id, string user2Id, CancellationToken cancellationToken = default)
    {
        var filter = Builders<Conversation>.Filter.And(
            Builders<Conversation>.Filter.All(x => x.ParticipantIds, new[] { user1Id, user2Id }),
            Builders<Conversation>.Filter.Size(x => x.ParticipantIds, 2)
        );

        return await _context.Conversations.Find(filter).FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<List<Conversation>> GetByUserIdAsync(string userId, CancellationToken cancellationToken = default)
    {
        var filter = Builders<Conversation>.Filter.AnyEq(x => x.ParticipantIds, userId);
        return await _context.Conversations.Find(filter).ToListAsync(cancellationToken);
    }

    public async Task CreateAsync(Conversation conversation, CancellationToken cancellationToken = default)
    {
        await _context.Conversations.InsertOneAsync(conversation, null, cancellationToken);
    }

    public async Task UpdateAsync(Conversation conversation, CancellationToken cancellationToken = default)
    {
        await _context.Conversations.ReplaceOneAsync(x => x.Id == conversation.Id, conversation, cancellationToken: cancellationToken);
    }

    public async Task<Conversation?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Conversations.Find(x => x.Id == id).FirstOrDefaultAsync(cancellationToken);
    }
    
    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        await _context.Conversations.DeleteOneAsync(x => x.Id == id, cancellationToken);
    }
}
