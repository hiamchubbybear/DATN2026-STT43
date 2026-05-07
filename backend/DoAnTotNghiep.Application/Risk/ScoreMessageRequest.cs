using System;

namespace DoAnTotNghiep.Application.Risk;

/// <summary>
/// Input for <see cref="IRiskScoringService.ScoreMessageAsync"/>. Mirrors
/// <c>POST /v1/score/message</c> on the AI service (see <c>AI_PLAN.md §5.1</c>).
/// </summary>
public sealed record ScoreMessageRequest(
    Guid MessageId,
    Guid ConversationId,
    Guid SenderId,
    Guid ReceiverId,
    string Text,
    string? Lang = null,
    MessageContext? Context = null);

public sealed record MessageContext(
    int? ConversationAgeSeconds = null,
    int? MessagesInConversation = null,
    double? SenderAccountAgeDays = null,
    int? SenderPriorReports = null);
