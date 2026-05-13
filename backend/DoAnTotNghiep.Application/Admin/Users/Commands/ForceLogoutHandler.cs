using DoAnTotNghiep.Application.Common;
using MediatR;

namespace DoAnTotNghiep.Application.Admin.Users.Commands
{
    public class ForceLogoutHandler : IRequestHandler<ForceLogoutCommand>
    {
        private readonly ITokenService _token;

        public ForceLogoutHandler(ITokenService token)
        {
            _token = token;
        }

        public async Task Handle(ForceLogoutCommand request, CancellationToken ct)
        {
            await _token.RevokeAllAsync(request.UserId);
        }
    }
}
