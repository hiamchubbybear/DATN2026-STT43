namespace DoAnTotNghiep.Domain.Users;

public interface ISessionRepository
{
    Task CreateSession(Session session);
    Task<Session?> GetByRefreshToken(string refreshToken);
    Task UpdateSession(Session session);
}