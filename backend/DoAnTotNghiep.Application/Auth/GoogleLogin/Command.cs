using DoAnTotNghiep.Application.Users.Commands.Login;
using MediatR;

namespace DoAnTotNghiep.Application.Auth.GoogleLogin;

public class GoogleLoginCommand : IRequest<AuthResponse>
{
    public string? IdToken { get; set; }
    public string? AccessToken { get; set; }
    public string? DeviceId { get; set; }
    public string? DeviceName { get; set; }
    public string? Platform { get; set; }
    public string? AppVersion { get; set; }
    public string? FcmToken { get; set; }
    public string? IpAddress { get; set; }
}
