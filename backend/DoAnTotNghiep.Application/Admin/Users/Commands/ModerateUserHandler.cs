using DoAnTotNghiep.Application.Exception;
using DoAnTotNghiep.Domain.Enum;
using DoAnTotNghiep.Domain.Users;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Application.Admin.Users.Commands
{
    public class ModerateUserHandler : IRequestHandler<ModerateUserCommand>
    {
        private readonly IUserProfileRepository _repo;

        public ModerateUserHandler(IUserProfileRepository repo)
        {
            _repo = repo;
        }

        public async Task Handle(ModerateUserCommand request, CancellationToken ct)
        {
            var user = await _repo.GetByUserIdAsync(request.UserId)
                ?? throw new NotFoundException("User not found");

            switch (request.Action)
            {
                case ModerateAction.Ban:
                    user.Ban();
                    break;

                case ModerateAction.Unban:
                case ModerateAction.Restore:
                    user.Restore();
                    break;

                case ModerateAction.Suspend:
                    user.Suspend(request.DurationDays ?? 7);
                    break;

                case ModerateAction.ShadowBan:
                    user.ShadowBan();
                    break;
            }

            await _repo.UpdateAsync(user);
        }
    }
}