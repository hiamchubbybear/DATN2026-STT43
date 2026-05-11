using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Application.Common
{
    public interface ISeenUserService
    {
        Task<HashSet<Guid>> GetAllAsync(Guid userId);
        Task MarkSeenAsync(Guid userId, Guid targetUserId);
    }
}
