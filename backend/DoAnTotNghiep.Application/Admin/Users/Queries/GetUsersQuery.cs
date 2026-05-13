using DoAnTotNghiep.Application.Admin.Users.Dtos;
using DoAnTotNghiep.Domain.Enum;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Application.Admin.Users.Queries
{
    public record GetUsersQuery(
        int Page = 1,
        int PageSize = 20,
        string? Search = null,
        UserStatus? Status = null
        ) : IRequest<List<UserAdminDto>>;
}
