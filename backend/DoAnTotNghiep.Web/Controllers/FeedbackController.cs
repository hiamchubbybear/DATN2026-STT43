using System;
using System.Threading.Tasks;
using DoAnTotNghiep.Application.Users.Commands;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DoAnTotNghiep.Web.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class FeedbackController : ControllerBase
{
    private readonly IMediator _mediator;

    public FeedbackController(IMediator mediator)
    {
        _mediator = mediator;
    }

    // Moved to UserController for better organization
    
    [HttpPost("review")]
    public async Task<IActionResult> SubmitReview([FromBody] SubmitReviewRequest request)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

        var userId = Guid.Parse(userIdStr);
        var command = new SubmitAppReviewCommand(userId, request.Rating, request.Comment);

        var result = await _mediator.Send(command);
        return result ? Ok() : BadRequest();
    }
}


public record SubmitReviewRequest(int Rating, string Comment);
