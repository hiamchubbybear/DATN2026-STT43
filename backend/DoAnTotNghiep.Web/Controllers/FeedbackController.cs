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

    [HttpPost("report")]
    public async Task<IActionResult> ReportUser([FromBody] ReportUserRequest request)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
        var command = new ReportUserCommand(
            userId,
            request.TargetUserId,
            request.Reason,
            request.Description,
            request.EvidencePhotos);

        var result = await _mediator.Send(command);
        return result ? Ok() : BadRequest();
    }

    [HttpPost("review")]
    public async Task<IActionResult> SubmitReview([FromBody] SubmitReviewRequest request)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
        var command = new SubmitAppReviewCommand(userId, request.Rating, request.Comment);

        var result = await _mediator.Send(command);
        return result ? Ok() : BadRequest();
    }
}

public record ReportUserRequest(Guid TargetUserId, string Reason, string Description, List<string> EvidencePhotos);
public record SubmitReviewRequest(int Rating, string Comment);
