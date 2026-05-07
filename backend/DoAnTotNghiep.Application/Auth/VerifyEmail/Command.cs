using DoAnTotNghiep.Application.Users.Commands.Login;
using MediatR;

namespace DoAnTotNghiep.Application.Auth.VerifyEmail;

public class VerifyEmailCommand : IRequest<AuthResponse>
{
    public required string Email { get; set; }
    public required string Token { get; set; }
}
