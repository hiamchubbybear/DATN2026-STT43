using DoAnTotNghiep.Domain.Enum;
using MediatR;

namespace DoAnTotNghiep.Application.Admin.Users.Commands
{
    public enum ModerateAction
    {
        Ban,
        Unban,
        Suspend,
        ShadowBan,
        Restore
    }
    public record ModerateUserCommand(
        Guid UserId,
        ModerateAction Action,
        string Reason,
        int? DurationDays
        ) : IRequest;
}
