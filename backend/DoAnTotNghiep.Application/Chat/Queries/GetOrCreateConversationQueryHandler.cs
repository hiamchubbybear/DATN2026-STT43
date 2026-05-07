using DoAnTotNghiep.Application.Common;
using DoAnTotNghiep.Domain.Chat;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Application.Chat.Queries;

public class GetOrCreateConversationQueryHandler : IRequestHandler<GetOrCreateConversationQuery, Guid>
{
    private readonly IConversationRepository _repository;
    private readonly ICurrentUserService _currentUserService;

    public GetOrCreateConversationQueryHandler(IConversationRepository repository, ICurrentUserService currentUserService)
    {
        _repository = repository;
        _currentUserService = currentUserService;
    }

    public async Task<Guid> Handle(GetOrCreateConversationQuery request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(currentUserId)) throw new UnauthorizedAccessException();

        var conversation = await _repository.GetByParticipantsAsync(currentUserId, request.TargetUserId, cancellationToken);

        if (conversation == null)
        {
            conversation = Conversation.CreateP2P(currentUserId, request.TargetUserId);
            await _repository.CreateAsync(conversation, cancellationToken);
        }

        return conversation.Id;
    }
}
