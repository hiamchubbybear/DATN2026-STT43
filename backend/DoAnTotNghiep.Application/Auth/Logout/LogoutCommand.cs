using MediatR;

namespace DoAnTotNghiep.Application.Users.Commands.Logout;

public class LogoutCommand : IRequest<bool>
{
    public string RefreshToken { get; set; } = null!;
    public string AccessToken { get; set; } = null!;
}
