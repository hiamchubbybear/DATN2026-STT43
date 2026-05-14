using MediatR;
using DoAnTotNghiep.Domain.Users;
using DoAnTotNghiep.Domain.Common;

namespace DoAnTotNghiep.Application.Users.Reports;

public record ResolveReportCommand(
    Guid ReportId,
    string? AdminFeedback,
    bool BanUser,
    string? BanReason,
    DateTime? BanUntil = null
) : IRequest<bool>;

public class ResolveReportCommandHandler : IRequestHandler<ResolveReportCommand, bool>
{
    private readonly IUserReportRepository _reportRepository;
    private readonly IUserRepository _userRepository;

    public ResolveReportCommandHandler(IUserReportRepository reportRepository, IUserRepository userRepository)
    {
        _reportRepository = reportRepository;
        _userRepository = userRepository;
    }

    public async Task<bool> Handle(ResolveReportCommand request, CancellationToken cancellationToken)
    {
        var report = await _reportRepository.GetByIdAsync(request.ReportId);
        if (report == null) return false;

        if (request.BanUser)
        {
            var targetUser = await _userRepository.GetByIdAsync(report.TargetUserId);
            if (targetUser != null)
            {
                targetUser.Ban(request.BanReason ?? report.Reason, request.BanUntil);
                await _userRepository.UpdateAsync(targetUser);
            }
        }

        report.Resolve(request.AdminFeedback, request.BanUser ? "Banned" : "Resolved");
        await _reportRepository.UpdateAsync(report);

        return true;
    }
}
