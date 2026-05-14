using MediatR;

namespace DoAnTotNghiep.Application.Users.Commands.Login
{
    public class RefreshTokenCommand: IRequest<AuthResponse>
    {
        public string RefreshToken { get; set; } = null!;
    }
}
