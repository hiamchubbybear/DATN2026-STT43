using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Application.Admin.Users.Dtos
{
    public record UserAdminDto(
        Guid UserId,
        string DisplayName,
        int Age,
        string Email,
        string Location,
        string Status,
        DateTime CreatedAt
        );
}
