using MediatR;

namespace DoAnTotNghiep.Application.Auth.Logout
{
    public class LogoutCommand: IRequest<bool>
    {
        public string RefreshToken { get; set; }
    }
}
