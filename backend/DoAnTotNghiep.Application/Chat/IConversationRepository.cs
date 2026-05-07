using DoAnTotNghiep.Domain.Chat;
using System.Threading;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Application.Chat;

public interface IConversationRepository
{
    Task<Conversation?> GetByParticipantsAsync(string user1Id, string user2Id, CancellationToken cancellationToken = default);
    Task<List<Conversation>> GetByUserIdAsync(string userId, CancellationToken cancellationToken = default);
    Task CreateAsync(Conversation conversation, CancellationToken cancellationToken = default);
    Task UpdateAsync(Conversation conversation, CancellationToken cancellationToken = default);
    Task<Conversation?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
}
