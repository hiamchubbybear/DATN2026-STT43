using Microsoft.AspNetCore.Mvc;
using DoAnTotNghiep.Application.Users;
using DoAnTotNghiep.Application.Auth.ResetPassword;
using DoAnTotNghiep.Application.Auth.ChangePassword;
using DoAnTotNghiep.Application.Auth.VerifyEmail;
using DoAnTotNghiep.Application.Auth.ResendVerification;
using DoAnTotNghiep.Application.Auth.DeleteAccount;
using DoAnTotNghiep.Application.Common.Models;
using DoAnTotNghiep.Application.Users.Commands.Login;
using DoAnTotNghiep.Application.Auth.VerifyResetToken;
using MediatR;
using DoAnTotNghiep.Application.Auth.Logout;

namespace DoAnTotNghiep.Web.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;

    public AuthController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginCommand command)
    {
        var response = await _mediator.Send(command);
        return Ok(ApiResponse<AuthResponse>.Succeeded(response, "Login successful"));
    }

    [HttpPost("google-login")]
    public async Task<IActionResult> GoogleLogin(DoAnTotNghiep.Application.Auth.GoogleLogin.GoogleLoginCommand command)
    {
        var response = await _mediator.Send(command);
        return Ok(ApiResponse<AuthResponse>.Succeeded(response, "Google login successful"));
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh(RefreshTokenCommand command)
    {
        var response = await _mediator.Send(command);
        return Ok(ApiResponse<AuthResponse>.Succeeded(response, "Token refreshed successfully"));
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(CreateAccountCommand request)
    {
        var response = await _mediator.Send(request);
        return Ok(ApiResponse<object>.Succeeded(response, "User registered successfully"));
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordCommand request)
    {
        await _mediator.Send(request);
        return Ok(ApiResponse<string>.Succeeded(string.Empty, "If the email exists, a reset link has been sent."));
    }

    [HttpPost("verify-reset-token")]
    public async Task<IActionResult> VerifyResetToken(VerifyResetTokenCommand request)
    {
        var result = await _mediator.Send(request);
        return Ok(ApiResponse<bool>.Succeeded(result, "Token is valid."));
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(ResetPasswordCommand request)
    {
        var userId = await _mediator.Send(request);
        return Ok(ApiResponse<string>.Succeeded(userId, "Password has been successfully reset."));
    }

    [HttpPatch("change-password")]
    public async Task<IActionResult> ChangePassword(ChangePasswordCommand request)
    {
        var result = await _mediator.Send(request);
        return Ok(ApiResponse<string>.Succeeded(result, "Password has been successfully changed."));
    }

    [HttpPost("verify-email")]
    public async Task<IActionResult> VerifyEmail(VerifyEmailCommand request)
    {
        var result = await _mediator.Send(request);
        return Ok(ApiResponse<AuthResponse>.Succeeded(result, "Email verified successfully."));
    }

    [HttpPost("resend-verification")]
    public async Task<IActionResult> ResendVerification(ResendVerificationCommand request)
    {
        var result = await _mediator.Send(request);
        return Ok(ApiResponse<object>.Succeeded(result, "Verification email resent."));
    }

    [HttpDelete("delete-account")]
    public async Task<IActionResult> DeleteAccount(DeleteAccountCommand request)
    {
        var result = await _mediator.Send(request);
        return Ok(ApiResponse<string>.Succeeded(result, "Account deleted successfully."));
    }
    [HttpPost("logout")]
    public async Task<IActionResult> Logout(LogoutCommand request)
    {
        var result = await _mediator.Send(request);
        if (!result)
        {
            return BadRequest(ApiResponse<string>.Failed("Invalid refresh token."));
        }
        return Ok(ApiResponse<string>.Succeeded(string.Empty, "Logged out successfully."));
    }
}
