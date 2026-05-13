using MediatR;

namespace DoAnTotNghiep.Application.Admin.Users.Commands
{
    public record ForceLogoutCommand(Guid UserId) : IRequest;
}
