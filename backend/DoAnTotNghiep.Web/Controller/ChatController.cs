using DoAnTotNghiep.Application.Chat.Queries;
using DoAnTotNghiep.Application.Common.Models;
using DoAnTotNghiep.Domain.Chat;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Web.Controllers;

[ApiController]
[Route("api/chat")]
[Authorize]
public class ChatController : ControllerBase
{
    private readonly IMediator _mediator;

    public ChatController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("conversations")]
    public async Task<IActionResult> GetMyConversations()
    {
        var query = new GetMyConversationsQuery();
        var result = await _mediator.Send(query);
        return Ok(ApiResponse<List<ConversationDto>>.Succeeded(result));
    }

    [HttpGet("{conversationId}/history")]
    public async Task<IActionResult> GetChatHistory(Guid conversationId, [FromQuery] DateTime? before, [FromQuery] int limit = 50)
    {
        var query = new GetChatHistoryQuery(conversationId, before, limit);
        var result = await _mediator.Send(query);
        return Ok(ApiResponse<List<ChatMessage>>.Succeeded(result));
    }

    [HttpGet("conversation/{targetUserId}")]
    public async Task<IActionResult> GetOrCreateConversation(string targetUserId)
    {
        var query = new GetOrCreateConversationQuery(targetUserId);
        var result = await _mediator.Send(query);
        return Ok(ApiResponse<Guid>.Succeeded(result));
    }
}
