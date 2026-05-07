using DoAnTotNghiep.Application.Users.Commands.Login;
using MediatR;

namespace DoAnTotNghiep.Application.Auth.GoogleLogin;

public class GoogleLoginCommand : IRequest<AuthResponse>
{
    public string? IdToken { get; set; }
    public string? AccessToken { get; set; }
}
