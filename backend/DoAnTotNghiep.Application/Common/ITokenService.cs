using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Application.Common
{
    public interface ITokenService
    {
        Task RevokeAllAsync(Guid userId);
    }
}
