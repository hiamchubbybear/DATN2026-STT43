using DoAnTotNghiep.Domain.Users;
using DoAnTotNghiep.Infrastructure.Persistence;
using MongoDB.Driver;

namespace DoAnTotNghiep.Infrastructure.Repositories;

public class UserReportRepository : IUserReportRepository
{
    private readonly MongoDbContext _context;

    public UserReportRepository(MongoDbContext context)
    {
        _context = context;
    }

    public async Task CreateAsync(UserReport report)
    {
        await _context.UserReports.InsertOneAsync(report);
    }

    public async Task<UserReport?> GetByIdAsync(Guid id)
    {
        return await _context.UserReports.Find(x => x.Id == id).FirstOrDefaultAsync();
    }

    public async Task UpdateAsync(UserReport report)
    {
        await _context.UserReports.ReplaceOneAsync(x => x.Id == report.Id, report);
    }

    public async Task<List<UserReport>> GetAllAsync()
    {
        return await _context.UserReports.Find(_ => true).ToListAsync();
    }

    public async Task<List<UserReport>> GetByReporterIdAsync(Guid reporterId)
    {
        return await _context.UserReports.Find(x => x.ReporterId == reporterId).ToListAsync();
    }

    public async Task<List<UserReport>> GetByTargetUserIdAsync(Guid targetUserId)
    {
        return await _context.UserReports.Find(x => x.TargetUserId == targetUserId).ToListAsync();
    }
}
