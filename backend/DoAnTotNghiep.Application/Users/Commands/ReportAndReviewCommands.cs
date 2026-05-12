using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using DoAnTotNghiep.Domain.Users;
using MediatR;

namespace DoAnTotNghiep.Application.Users.Commands;

public record ReportUserCommand(
    Guid ReporterId,
    Guid TargetUserId,
    string Reason,
    string Description,
    List<string> EvidencePhotos) : IRequest<bool>;

public class ReportUserHandler : IRequestHandler<ReportUserCommand, bool>
{
    private readonly IFeedbackRepository _feedbackRepository;

    public ReportUserHandler(IFeedbackRepository feedbackRepository)
    {
        _feedbackRepository = feedbackRepository;
    }

    public async Task<bool> Handle(ReportUserCommand request, CancellationToken cancellationToken)
    {
        var report = new UserReport(
            request.ReporterId,
            request.TargetUserId,
            request.Reason,
            request.Description,
            request.EvidencePhotos);

        await _feedbackRepository.AddReportAsync(report);
        return true;
    }
}

public record SubmitAppReviewCommand(
    Guid UserId,
    int Rating,
    string Comment) : IRequest<bool>;

public class SubmitAppReviewHandler : IRequestHandler<SubmitAppReviewCommand, bool>
{
    private readonly IFeedbackRepository _feedbackRepository;

    public SubmitAppReviewHandler(IFeedbackRepository feedbackRepository)
    {
        _feedbackRepository = feedbackRepository;
    }

    public async Task<bool> Handle(SubmitAppReviewCommand request, CancellationToken cancellationToken)
    {
        var review = new AppReview(request.UserId, request.Rating, request.Comment);
        await _feedbackRepository.AddReviewAsync(review);
        return true;
    }
}
