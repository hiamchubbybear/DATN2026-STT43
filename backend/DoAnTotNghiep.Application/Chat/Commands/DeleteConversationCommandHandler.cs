using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Application.Chat.Commands;

public class DeleteConversationCommandHandler : IRequestHandler<DeleteConversationCommand>
{
    private readonly IConversationRepository _conversationRepository;
    private readonly IChatMessageRepository _messageRepository;

    public DeleteConversationCommandHandler(
        IConversationRepository conversationRepository,
        IChatMessageRepository messageRepository)
    {
        _conversationRepository = conversationRepository;
        _messageRepository = messageRepository;
    }

    public async Task Handle(DeleteConversationCommand request, CancellationToken cancellationToken)
    {
        // Delete messages first
        await _messageRepository.DeleteByConversationIdAsync(request.ConversationId, cancellationToken);
        
        // Then delete conversation
        await _conversationRepository.DeleteAsync(request.ConversationId, cancellationToken);
    }
}
