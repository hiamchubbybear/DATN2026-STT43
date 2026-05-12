using System;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Domain.Users;

public interface IFeedbackRepository
{
    Task AddReportAsync(UserReport report);
    Task AddReviewAsync(AppReview review);
}
