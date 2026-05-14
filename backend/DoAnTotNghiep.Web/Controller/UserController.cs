using DoAnTotNghiep.Application.Common.Models;
using DoAnTotNghiep.Application.Users.Photos;
using DoAnTotNghiep.Application.Users.Photos.DeletePhoto;
using DoAnTotNghiep.Application.Users.Photos.ReorderPhotos;
using DoAnTotNghiep.Application.Users.Photos.SetPrimaryPhoto;
using DoAnTotNghiep.Application.Users.Reports;
using DoAnTotNghiep.Application.Users.Verification;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using DoAnTotNghiep.Domain.Users;
using DoAnTotNghiep.Application.Common;

namespace DoAnTotNghiep.Web.Controllers;

[ApiController]
[Route("api/users")]
public class UserController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IMongoDbContext _context;

    public UserController(IMediator mediator, IMongoDbContext context)
    {
        _mediator = mediator;
        _context = context;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
            ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
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
    [HttpGet("{userId}")]
    public async Task<IActionResult> GetUserProfile(Guid userId)
    {
        var result = await _mediator.Send(new Application.Users.Profile.GetUserProfileQuery(userId));
        if (result == null) return NotFound(ApiResponse<string>.Failed("Profile not found"));
        return Ok(ApiResponse<Application.Users.Profile.UserProfileDto>.Succeeded(result));
    }

    [Authorize]
    [HttpPatch("me/profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] Application.Users.Profile.UpdateProfileCommand command)
    {
        var cmdWithUser = command with { UserId = GetUserId() };
        await _mediator.Send(cmdWithUser);
        return Ok(ApiResponse<string>.Succeeded(string.Empty, "Profile updated"));
    }

    [Authorize]
    [HttpPost("report")]
    public async Task<IActionResult> ReportUser([FromForm] UserReportSubmitRequest request)
    {
        var command = new ReportUserCommand(
            GetUserId(),
            request.TargetUserId,
            request.Reason,
            request.Description,
            request.EvidenceFiles
        );

        var reportId = await _mediator.Send(command);
        return Ok(ApiResponse<Guid>.Succeeded(reportId, "Report submitted successfully"));
    }

    [Authorize]
    [HttpGet("reports")]
    public async Task<IActionResult> GetMyReports()
    {
        var result = await _mediator.Send(new GetMyReportsQuery(GetUserId()));
        return Ok(ApiResponse<List<UserReport>>.Succeeded(result));
    }

    [Authorize]
    [HttpPost("verify")]
    public async Task<IActionResult> SubmitVerification([FromForm] SubmitVerificationRequest request)
    {
        var command = new SubmitVerificationCommand(
            GetUserId(),
            request.IdNumber,
            request.FullName,
            request.FrontImage,
            request.BackImage,
            request.SelfieImage
        );

        var result = await _mediator.Send(command);
        return Ok(ApiResponse<Guid>.Succeeded(result, "Verification request submitted"));
    }

    [Authorize]
    [HttpGet("verify/status")]
    public async Task<IActionResult> GetMyVerificationStatus()
    {
        var result = await _mediator.Send(new GetMyVerificationQuery(GetUserId()));
        return Ok(ApiResponse<UserVerification?>.Succeeded(result));
    }

    [Authorize]
    [HttpPost("review")]
    public async Task<IActionResult> SubmitAppReview([FromBody] SubmitAppReviewRequest request)
    {
        var review = new AppReview(GetUserId(), request.Rating, request.Comment);
        await _context.AppReviews.InsertOneAsync(review);
        return Ok(ApiResponse<Guid>.Succeeded(review.Id, "Review submitted"));
    }
}

public class SubmitAppReviewRequest
{
    public int Rating { get; set; }
    public string Comment { get; set; } = null!;
}

public class UserReportSubmitRequest
{
    public Guid TargetUserId { get; set; }
    public string Reason { get; set; } = null!;
    public string Description { get; set; } = null!;
    public List<IFormFile>? EvidenceFiles { get; set; }
}

public class SubmitVerificationRequest
{
    public string IdNumber { get; set; } = null!;
    public string FullName { get; set; } = null!;
    public IFormFile FrontImage { get; set; } = null!;
    public IFormFile BackImage { get; set; } = null!;
    public IFormFile SelfieImage { get; set; } = null!;
}
