using MediatR;
using DoAnTotNghiep.Domain.Users;

namespace DoAnTotNghiep.Application.Users.Reports;

public record GetMyReportsQuery(Guid UserId) : IRequest<List<UserReport>>;

public class GetMyReportsQueryHandler : IRequestHandler<GetMyReportsQuery, List<UserReport>>
{
    private readonly IUserReportRepository _reportRepository;

    public GetMyReportsQueryHandler(IUserReportRepository reportRepository)
    {
        _reportRepository = reportRepository;
    }

    public async Task<List<UserReport>> Handle(GetMyReportsQuery request, CancellationToken cancellationToken)
    {
        return await _reportRepository.GetByReporterIdAsync(request.UserId);
    }
}
