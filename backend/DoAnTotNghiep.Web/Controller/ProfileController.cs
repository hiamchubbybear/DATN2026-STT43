using DoAnTotNghiep.Application.Common.Models;
using DoAnTotNghiep.Application.Users.CompleteProfile;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;

namespace DoAnTotNghiep.Web.Controllers;

[ApiController]
[Route("api/v1/profile")]
[Authorize]
public class ProfileController(IMediator mediator) : ControllerBase
{
    [HttpPost("setup")]
    public async Task<IActionResult> CompleteProfile(CompleteProfileCommand command)
    {
        // Ensure user is setting their own profile
        var userIdClaim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
            ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        command.UserId = userId;
        var result = await mediator.Send(command);
        return Ok(ApiResponse<bool>.Succeeded(result, "Profile completed successfully."));
    }
}
