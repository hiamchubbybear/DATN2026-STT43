using MediatR;
using System;

namespace DoAnTotNghiep.Application.Chat.Queries;

public record GetOrCreateConversationQuery(string TargetUserId) : IRequest<Guid>;
