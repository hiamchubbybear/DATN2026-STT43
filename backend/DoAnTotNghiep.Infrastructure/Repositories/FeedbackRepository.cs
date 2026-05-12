using DoAnTotNghiep.Domain.Users;
using DoAnTotNghiep.Infrastructure.Persistence;
using MongoDB.Driver;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Infrastructure.Repositories;

public class FeedbackRepository : IFeedbackRepository
{
    private readonly MongoDbContext _context;

    public FeedbackRepository(MongoDbContext context)
    {
        _context = context;
    }

    public async Task AddReportAsync(UserReport report)
    {
        await _context.UserReports.InsertOneAsync(report);
    }

    public async Task AddReviewAsync(AppReview review)
    {
        await _context.AppReviews.InsertOneAsync(review);
    }
}
