using DoAnTotNghiep.Application.Common.Models;
using DoAnTotNghiep.Application.Users.Photos;
using DoAnTotNghiep.Application.Users.Photos.DeletePhoto;
using DoAnTotNghiep.Application.Users.Photos.ReorderPhotos;
using DoAnTotNghiep.Application.Users.Photos.SetPrimaryPhoto;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace DoAnTotNghiep.Web.Controllers;

[ApiController]
[Route("api/users")]
public class UserController : ControllerBase
{
    private readonly IMediator _mediator;

    public UserController(IMediator mediator)
    {
        _mediator = mediator;
    }

    // Handlers will be mapped later
    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
            ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            Console.WriteLine("--- CLAIMS DEBUG ---");
            foreach (var claim in User.Claims)
            {
                Console.WriteLine($"Claim: {claim.Type} = {claim.Value}");
            }
            Console.WriteLine("--------------------");
            throw new UnauthorizedAccessException();
        }
        return userId;
    }

    [HttpGet("discover")]
    public async Task<IActionResult> GetAllUsers()
    {
        var result = await _mediator.Send(new Application.Users.Profile.SearchUsersQuery());
        return Ok(ApiResponse<List<Application.Users.Profile.UserSearchDto>>.Succeeded(result));
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetMyProfile()
    {
        var result = await _mediator.Send(new Application.Users.Profile.GetMyProfileQuery(GetUserId()));
        return Ok(ApiResponse<Application.Users.Profile.UserProfileDto>.Succeeded(result));
    }

    [Authorize]
    [HttpPatch("me/profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] Application.Users.Profile.UpdateProfileCommand command)
    {
        // Inject userId from token into the command
        var cmdWithUser = command with { UserId = GetUserId() };
        await _mediator.Send(cmdWithUser);
        return Ok(ApiResponse<string>.Succeeded(string.Empty, "Profile updated"));
    }

    [Authorize]
    [HttpPatch("me/preferences")]
    public async Task<IActionResult> UpdatePreferences([FromBody] Application.Users.Profile.UpdatePreferencesCommand command)
    {
        var cmdWithUser = command with { UserId = GetUserId() };
        await _mediator.Send(cmdWithUser);
        return Ok(ApiResponse<string>.Succeeded(string.Empty, "Preferences updated"));
    }

    [Authorize]
    [HttpPatch("me/location")]
    public async Task<IActionResult> UpdateLocation([FromBody] Application.Users.Profile.UpdateLocationCommand command)
    {
        var cmdWithUser = command with { UserId = GetUserId() };
        await _mediator.Send(cmdWithUser);
        return Ok(ApiResponse<string>.Succeeded(string.Empty, "Location updated"));
    }

    [Authorize]
    [HttpPatch("me/bio")]
    public async Task<IActionResult> UpdateBio([FromBody] Application.Users.Profile.UpdateBioCommand command)
    {
        var cmdWithUser = command with { UserId = GetUserId() };
        await _mediator.Send(cmdWithUser);
        return Ok(ApiResponse<string>.Succeeded(string.Empty, "Bio updated"));
    }

    [Authorize]
    [HttpPatch("me/basic-info")]
    public async Task<IActionResult> UpdateBasicInfo([FromBody] Application.Users.Profile.UpdateBasicInfoCommand command)
    {
        var cmdWithUser = command with { UserId = GetUserId() };
        await _mediator.Send(cmdWithUser);
        return Ok(ApiResponse<string>.Succeeded(string.Empty, "Basic info updated"));
    }

    [Authorize]
    [HttpPatch("me/background")]
    public async Task<IActionResult> UpdateBackground([FromBody] Application.Users.Profile.UpdateBackgroundCommand command)
    {
        var cmdWithUser = command with { UserId = GetUserId() };
        await _mediator.Send(cmdWithUser);
        return Ok(ApiResponse<string>.Succeeded(string.Empty, "Background updated"));
    }

    [Authorize]
    [HttpPatch("me/lifestyle")]
    public async Task<IActionResult> UpdateLifestyle([FromBody] Application.Users.Profile.UpdateLifestyleCommand command)
    {
        var cmdWithUser = command with { UserId = GetUserId() };
        await _mediator.Send(cmdWithUser);
        return Ok(ApiResponse<string>.Succeeded(string.Empty, "Lifestyle updated"));
    }

    [Authorize]
    [HttpPatch("me/dating-style")]
    public async Task<IActionResult> UpdateDatingStyle([FromBody] Application.Users.Profile.UpdateDatingStyleCommand command)
    {
        var cmdWithUser = command with { UserId = GetUserId() };
        await _mediator.Send(cmdWithUser);
        return Ok(ApiResponse<string>.Succeeded(string.Empty, "Dating style updated"));
    }

    [Authorize]
    [HttpPost("photos")]
    public async Task<IActionResult> UploadPhoto(IFormFile file)
    {
        var result = await _mediator.Send(new UploadPhotoCommand(file));

        return Ok(result);
    }
    
    [Authorize]
    [HttpDelete("photos/{photoId}")]
    public async Task<IActionResult> DeletePhoto(Guid photoId)
    {
        await _mediator.Send(new DeletePhotoCommand(photoId));
        return NoContent();
    }
    
    [Authorize]
    [HttpPatch("photos/reorder")]
    public async Task<IActionResult> Reorder(ReoderPhotosCommand command)
    {
        await _mediator.Send(command);
        return NoContent();
    }

    [Authorize]
    [HttpPatch("photos/{photoId}/primary")]
    public async Task<IActionResult> SetPrimary(Guid photoId)
    {
        await _mediator.Send(new SetPrimaryPhotoCommand(photoId));
        return NoContent();
    }
}
