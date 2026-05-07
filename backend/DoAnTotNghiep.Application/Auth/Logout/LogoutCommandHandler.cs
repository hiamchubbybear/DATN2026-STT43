using DoAnTotNghiep.Domain.Users;
using MediatR;

namespace DoAnTotNghiep.Application.Auth.Logout
{
    public class LogoutCommandHandler : IRequestHandler<LogoutCommand, bool>
    {
        private readonly ISessionRepository _repository;

        public LogoutCommandHandler(ISessionRepository repository)
        {
            _repository = repository;
        }
        public async Task<bool> Handle(LogoutCommand request, CancellationToken cancellationToken)
        {
            var session = await _repository.GetByRefreshToken(request.RefreshToken);
            if (session == null)
            {
                return false;
            }
            session.RefreshToken.Revoke();

            await _repository.UpdateSession(session);

            return true;
        }
    }
}
