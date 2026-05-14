using DoAnTotNghiep.Application.Common;
using DoAnTotNghiep.Domain.Users;
using MediatR;

namespace DoAnTotNghiep.Application.Users.Commands.Logout;

public class LogoutCommandHandler : IRequestHandler<LogoutCommand, bool>
{
    private readonly ISessionRepository _sessionRepo;
    private readonly ICacheService _cacheService;

    public LogoutCommandHandler(ISessionRepository sessionRepo, ICacheService cacheService)
    {
        _sessionRepo = sessionRepo;
        _cacheService = cacheService;
    }

    public async Task<bool> Handle(LogoutCommand request, CancellationToken cancellationToken)
    {
        // 1. Thu hồi Refresh Token trong DB
        var session = await _sessionRepo.GetByRefreshToken(request.RefreshToken);
        if (session != null)
        {
            session.IsRevoked = true;
            await _sessionRepo.UpdateSession(session);
        }

        // 2. Blacklist Access Token trong Redis (TTL 15 phút - mặc định của Access Token)
        // Trong thực tế nên giải mã token để lấy thời gian hết hạn chính xác
        await _cacheService.SetAsync($"blacklist:{request.AccessToken}", "revoked", TimeSpan.FromMinutes(15));

        return true;
    }
}
