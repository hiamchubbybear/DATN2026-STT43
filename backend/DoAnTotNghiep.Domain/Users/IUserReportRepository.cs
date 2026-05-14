using System;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Domain.Users;

public interface IUserReportRepository
{
    Task CreateAsync(UserReport report);
    Task<UserReport?> GetByIdAsync(Guid id);
    Task UpdateAsync(UserReport report);
    Task<List<UserReport>> GetAllAsync();
    Task<List<UserReport>> GetByReporterIdAsync(Guid reporterId);
    Task<List<UserReport>> GetByTargetUserIdAsync(Guid targetUserId);
}
