using DoAnTotNghiep.Application.Chat.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Web.Controller;

[ApiController]
[Route("api/v1/chat")]
[Authorize]
public class ChatController : ControllerBase
{
    private readonly IMediator _mediator;

    public ChatController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("{conversationId}/history")]
    public async Task<IActionResult> GetChatHistory(Guid conversationId, [FromQuery] DateTime? before, [FromQuery] int limit = 50)
    {
        var query = new GetChatHistoryQuery(conversationId, before, limit);
        var result = await _mediator.Send(query);
        return Ok(result);
    }
}
