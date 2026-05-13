using DoAnTotNghiep.Application.Admin.Users.Dtos;
using MediatR;

namespace DoAnTotNghiep.Application.Admin.Users.Queries
{
    public record GetUserDetailQuery(Guid UserId) : IRequest<UserDetailDto>;
}
