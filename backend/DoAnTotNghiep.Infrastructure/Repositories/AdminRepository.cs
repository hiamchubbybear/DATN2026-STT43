using DoAnTotNghiep.Domain.Admin;
using DoAnTotNghiep.Domain.MasterData;
using DoAnTotNghiep.Domain.Users;
using DoAnTotNghiep.Infrastructure.Persistence;
using MongoDB.Driver;

namespace DoAnTotNghiep.Infrastructure.Repositories;

public interface IAdminRepository
{
    Task<List<AuditLog>> GetAuditLogsAsync();
    Task<List<SystemConfig>> GetConfigsAsync();
    Task UpdateConfigAsync(string key, string value);
    Task<List<UserVerification>> GetPendingVerificationsAsync();
    Task VerifyUserAsync(Guid verificationId, bool approve, string? reason);
}

public class AdminRepository : IAdminRepository
{
    private readonly MongoDbContext _context;

    public AdminRepository(MongoDbContext context)
    {
        _context = context;
    }

    public async Task<List<AuditLog>> GetAuditLogsAsync() 
        => await _context.AuditLogs.Find(_ => true).SortByDescending(l => l.CreatedAt).ToListAsync();

    public async Task<List<SystemConfig>> GetConfigsAsync() 
        => await _context.SystemConfigs.Find(_ => true).ToListAsync();

    public async Task UpdateConfigAsync(string key, string value)
    {
        var update = Builders<SystemConfig>.Update.Set(c => c.Value, value).Set(c => c.UpdatedAt, DateTime.UtcNow);
        await _context.SystemConfigs.UpdateOneAsync(c => c.Key == key, update);
    }

    public async Task<List<UserVerification>> GetPendingVerificationsAsync()
        => await _context.UserVerifications.Find(v => v.Status == VerificationStatus.Pending).ToListAsync();

    public async Task VerifyUserAsync(Guid verificationId, bool approve, string? reason)
    {
        var verification = await _context.UserVerifications.Find(v => v.Id == verificationId).FirstOrDefaultAsync();
        if (verification == null) return;

        if (approve) verification.Approve();
        else verification.Reject(reason ?? "Rejected by admin");

        await _context.UserVerifications.ReplaceOneAsync(v => v.Id == verificationId, verification);
    }
}
