using DoAnTotNghiep.Application.Common.Models;
using MediatR;
using System;
using System.Collections.Generic;

namespace DoAnTotNghiep.Application.Chat.Queries;

public record GetMyConversationsQuery() : IRequest<List<ConversationDto>>;

public class ConversationDto
{
    public Guid Id { get; set; }
    public string OtherParticipantId { get; set; } = string.Empty;
    public string OtherParticipantName { get; set; } = string.Empty;
    public string? OtherParticipantAvatar { get; set; }
    public string? LastMessage { get; set; }
    public DateTime? LastMessageAt { get; set; }
    public int UnreadCount { get; set; }
}
