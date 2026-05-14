using DoAnTotNghiep.Application.Common;
using DoAnTotNghiep.Domain.Users;
using MediatR;
using MongoDB.Driver;

namespace DoAnTotNghiep.Application.Users.Verification;

public record GetMyVerificationQuery(Guid UserId) : IRequest<UserVerification?>;

public class GetMyVerificationQueryHandler : IRequestHandler<GetMyVerificationQuery, UserVerification?>
{
    private readonly IMongoDbContext _context;

    public GetMyVerificationQueryHandler(IMongoDbContext context)
    {
        _context = context;
    }

    public async Task<UserVerification?> Handle(GetMyVerificationQuery request, CancellationToken cancellationToken)
    {
        return await _context.UserVerifications
            .Find(v => v.UserId == request.UserId)
            .SortByDescending(v => v.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);
    }
}
