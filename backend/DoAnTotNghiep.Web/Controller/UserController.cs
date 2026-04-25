using DoAnTotNghiep.Application.Common.Models;
using DoAnTotNghiep.Application.Users.Photos;
using DoAnTotNghiep.Application.Users.Photos.DeletePhoto;
using DoAnTotNghiep.Application.Users.Photos.ReorderPhotos;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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
        // Mocking user id for now if Authorization is not properly injected
        // In a real scenario: return Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
        // Using a hardcoded dev user for now if we can't parse it
        return Guid.Parse("00000000-0000-0000-0000-000000000000"); // TODO: Update with real JWT Claim parsing
    }

    [HttpGet("discover")]
    public async Task<IActionResult> GetAllUsers()
    {
        var result = await _mediator.Send(new Application.Users.Profile.SearchUsersQuery());
        return Ok(ApiResponse<List<Application.Users.Profile.UserSearchDto>>.Succeeded(result));
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMyProfile()
    {
        var result = await _mediator.Send(new Application.Users.Profile.GetMyProfileQuery(GetUserId()));
        return Ok(ApiResponse<Application.Users.Profile.UserProfileDto>.Succeeded(result));
    }

    [HttpPatch("me/profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] Application.Users.Profile.UpdateProfileCommand command)
    {
        // Inject userId from token into the command
        var cmdWithUser = command with { UserId = GetUserId() };
        await _mediator.Send(cmdWithUser);
        return Ok(ApiResponse<string>.Succeeded(string.Empty, "Profile updated"));
    }

    [HttpPatch("me/preferences")]
    public async Task<IActionResult> UpdatePreferences([FromBody] Application.Users.Profile.UpdatePreferencesCommand command)
    {
        var cmdWithUser = command with { UserId = GetUserId() };
        await _mediator.Send(cmdWithUser);
        return Ok(ApiResponse<string>.Succeeded(string.Empty, "Preferences updated"));
    }

    [HttpPatch("me/location")]
    public async Task<IActionResult> UpdateLocation([FromBody] Application.Users.Profile.UpdateLocationCommand command)
    {
        var cmdWithUser = command with { UserId = GetUserId() };
        await _mediator.Send(cmdWithUser);
        return Ok(ApiResponse<string>.Succeeded(string.Empty, "Location updated"));
    }

    [HttpPatch("me/bio")]
    public async Task<IActionResult> UpdateBio([FromBody] Application.Users.Profile.UpdateBioCommand command)
    {
        var cmdWithUser = command with { UserId = GetUserId() };
        await _mediator.Send(cmdWithUser);
        return Ok(ApiResponse<string>.Succeeded(string.Empty, "Bio updated"));
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

}
