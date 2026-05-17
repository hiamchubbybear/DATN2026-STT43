using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using DoAnTotNghiep.Domain.Users;
using MediatR;

namespace DoAnTotNghiep.Application.Users.Commands;

public record UpdateFcmTokenCommand(Guid UserId, string FcmToken) : IRequest<bool>;

public class UpdateFcmTokenHandler : IRequestHandler<UpdateFcmTokenCommand, bool>
{
    private readonly ISessionRepository _sessionRepository;

    public UpdateFcmTokenHandler(ISessionRepository sessionRepository)
    {
        _sessionRepository = sessionRepository;
    }

    public async Task<bool> Handle(UpdateFcmTokenCommand request, CancellationToken cancellationToken)
    {
        var sessions = await _sessionRepository.GetActiveSessionsByUserId(request.UserId);
        if (sessions == null || !sessions.Any())
            return false;

        foreach (var session in sessions)
        {
            session.FcmToken = request.FcmToken;
            await _sessionRepository.UpdateSession(session);
        }

        return true;
    }
}
