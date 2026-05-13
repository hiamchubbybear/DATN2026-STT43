using DoAnTotNghiep.Domain.Enum;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Domain.Users
{
    public class UserSearchFilter
    {
        public int Page { get; set; }
        public int PageSize { get; set; }
        public string? Search { get; set; }
        public UserStatus? Status { get; set; }
    }
}
