using DoAnTotNghiep.Domain.Chat;
using MediatR;
using System;
using System.Collections.Generic;

namespace DoAnTotNghiep.Application.Chat.Queries;

public record GetChatHistoryQuery(Guid ConversationId, DateTime? Before, int Limit = 50) : IRequest<List<ChatMessage>>;
