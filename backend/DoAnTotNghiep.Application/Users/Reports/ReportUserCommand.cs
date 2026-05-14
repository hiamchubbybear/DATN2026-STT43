using MediatR;
using Microsoft.AspNetCore.Http;
using DoAnTotNghiep.Domain.Users;
using DoAnTotNghiep.Application.Common;

namespace DoAnTotNghiep.Application.Users.Reports;

public record ReportUserCommand(
    Guid ReporterId,
    Guid TargetUserId,
    string Reason,
    string Description,
    List<IFormFile>? EvidenceFiles
) : IRequest<Guid>;

public class ReportUserCommandHandler : IRequestHandler<ReportUserCommand, Guid>
{
    private readonly IUserReportRepository _reportRepository;
    private readonly IFileStorageService _storageService;

    public ReportUserCommandHandler(IUserReportRepository reportRepository, IFileStorageService storageService)
    {
        _reportRepository = reportRepository;
        _storageService = storageService;
    }

    public async Task<Guid> Handle(ReportUserCommand request, CancellationToken cancellationToken)
    {
        var evidenceUrls = new List<string>();

        if (request.EvidenceFiles != null && request.EvidenceFiles.Any())
        {
            foreach (var file in request.EvidenceFiles)
            {
                var extension = Path.GetExtension(file.FileName);
                var key = $"reports/{Guid.NewGuid()}{extension}";
                using var stream = file.OpenReadStream();
                var url = await _storageService.UploadAsync(stream, key, file.ContentType);
                evidenceUrls.Add(url);
            }
        }

        var report = new UserReport(
            request.ReporterId,
            request.TargetUserId,
            request.Reason,
            request.Description,
            evidenceUrls
        );

        await _reportRepository.CreateAsync(report);

        return report.Id;
    }
}
