using DoAnTotNghiep.Domain.Chat;
using MediatR;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Application.Chat.Queries;

public class GetChatHistoryQueryHandler : IRequestHandler<GetChatHistoryQuery, List<ChatMessage>>
{
    private readonly IChatMessageRepository _repository;

    public GetChatHistoryQueryHandler(IChatMessageRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<ChatMessage>> Handle(GetChatHistoryQuery request, CancellationToken cancellationToken)
    {
        return await _repository.GetHistoryAsync(request.ConversationId, request.Before, request.Limit, cancellationToken);
    }
}
