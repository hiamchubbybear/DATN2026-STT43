using MediatR;
using System;

namespace DoAnTotNghiep.Application.Chat.Commands;

public record DeleteConversationCommand(Guid ConversationId) : IRequest;
