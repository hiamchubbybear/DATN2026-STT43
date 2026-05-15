using DoAnTotNghiep.Application.Common.Models;
using DoAnTotNghiep.Application.Users.Swipes.GetSwipeFeed;
using DoAnTotNghiep.Application.Users.Swipes.SwipeAction;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Web.Controller;

[Authorize]
[ApiController]
[Route("api/v1/swipes")]
public class SwipeController : ControllerBase
{
    private readonly IMediator _mediator;

    public SwipeController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("feed")]
    public async Task<IActionResult> GetFeed([FromQuery] GetSwipeFeedQuery query)
    {
        var result = await _mediator.Send(query);
        return Ok(ApiResponse<List<UserProfileDto>>.Succeeded(result));
    }

    [HttpPost("action")]
    public async Task<IActionResult> SwipeAction([FromBody] SwipeActionCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(ApiResponse<SwipeActionResponse>.Succeeded(result));
    }

    [HttpGet("matches")]
    public async Task<IActionResult> GetMatches()
    {
        var userId = GetUserId();
        var result = await _mediator.Send(new DoAnTotNghiep.Application.Users.Swipes.GetMatches.GetMatchesQuery(userId));
        return Ok(ApiResponse<List<DoAnTotNghiep.Application.Users.Swipes.GetMatches.MatchDto>>.Succeeded(result));
    }

    [HttpPost("reset")]
    public async Task<IActionResult> ResetSwipes()
    {
        var result = await _mediator.Send(new DoAnTotNghiep.Application.Users.Swipes.ResetSwipes.ResetSwipesCommand());
        return Ok(ApiResponse<bool>.Succeeded(result));
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value
            ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            throw new System.UnauthorizedAccessException();
        }
        return userId;
    }
}
