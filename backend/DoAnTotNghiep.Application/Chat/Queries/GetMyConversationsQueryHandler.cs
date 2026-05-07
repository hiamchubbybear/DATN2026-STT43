using DoAnTotNghiep.Application.Chat;
using DoAnTotNghiep.Application.Common;
using DoAnTotNghiep.Domain.Users;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Application.Chat.Queries;

public class GetMyConversationsQueryHandler : IRequestHandler<GetMyConversationsQuery, List<ConversationDto>>
{
    private readonly IConversationRepository _conversationRepository;
    private readonly IUserProfileRepository _userProfileRepository;
    private readonly ICurrentUserService _currentUserService;

    public GetMyConversationsQueryHandler(
        IConversationRepository conversationRepository,
        IUserProfileRepository userProfileRepository,
        ICurrentUserService currentUserService)
    {
        _conversationRepository = conversationRepository;
        _userProfileRepository = userProfileRepository;
        _currentUserService = currentUserService;
    }

    public async Task<List<ConversationDto>> Handle(GetMyConversationsQuery request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(currentUserId)) throw new UnauthorizedAccessException();

        // 1. Get all conversations where current user is a participant
        // For simplicity, we'll need a new method in repository
        var conversations = await _conversationRepository.GetByUserIdAsync(currentUserId, cancellationToken);

        var result = new List<ConversationDto>();

        foreach (var conv in conversations)
        {
            var otherId = conv.ParticipantIds.FirstOrDefault(id => id != currentUserId);
            if (otherId == null) continue;

            if (!Guid.TryParse(otherId, out var otherGuid)) continue;

            var otherProfile = await _userProfileRepository.GetByUserIdAsync(otherGuid);

            result.Add(new ConversationDto
            {
                Id = conv.Id,
                OtherParticipantId = otherId,
                OtherParticipantName = otherProfile?.BasicInfo?.DisplayName ?? "Unknown User",
                OtherParticipantAvatar = otherProfile?.Photos?.FirstOrDefault(p => p.IsPrimary)?.Url,
                LastMessage = conv.LastMessage,
                LastMessageAt = conv.LastMessageAt
            });
        }

        return result.OrderByDescending(x => x.LastMessageAt).ToList();
    }
}
