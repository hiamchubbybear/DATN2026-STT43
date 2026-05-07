using MediatR;

namespace DoAnTotNghiep.Application.Auth.VerifyResetToken;

public class VerifyResetTokenCommand : IRequest<bool>
{
    public required string Email { get; set; }
    public required string Token { get; set; }
}
