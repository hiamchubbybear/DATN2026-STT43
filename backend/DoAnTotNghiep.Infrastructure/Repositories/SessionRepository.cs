using DoAnTotNghiep.Domain.Users;
using DoAnTotNghiep.Infrastructure.Persistence;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Infrastructure.Repositories;

public class UserSessionRepository : ISessionRepository
{
    private readonly IMongoCollection<Session> _sessions;

    public UserSessionRepository(MongoDbContext context)
    {
        _sessions = context.UserSessions;
    }

    public Task CreateSession(Session session)
    {
        return _sessions.InsertOneAsync(session);
    }

    public async Task<Session?> GetByRefreshToken(string refreshToken)
    {
        return await _sessions.Find(s => s.RefreshToken.Token == refreshToken).FirstOrDefaultAsync();
    }

    public async Task UpdateSession(Session session)
    {
        await _sessions.ReplaceOneAsync(x => x.Id == session.Id, session);
    }

    public async Task<List<string>> GetFcmTokensByUserId(Guid userId)
    {
        var sessions = await _sessions
            .Find(x => x.UserId == userId && !x.IsRevoked && !string.IsNullOrEmpty(x.FcmToken))
            .ToListAsync();
        return sessions.Select(x => x.FcmToken!).Distinct().ToList();
    }
}