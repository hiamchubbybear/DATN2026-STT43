using DoAnTotNghiep.Application.Common;
using DoAnTotNghiep.Application.Exception;
using MediatR;

namespace DoAnTotNghiep.Application.Auth.VerifyResetToken;

public class Handler(ICacheService cache) : IRequestHandler<VerifyResetTokenCommand, bool>
{
    public async Task<bool> Handle(VerifyResetTokenCommand request, CancellationToken cancellationToken)
    {
        string email = request.Email;
        string token = request.Token;

        var cacheKey = $"ResetPassword_{email}";
        var cachedToken = await cache.GetAsync<string>(cacheKey);

        if (string.IsNullOrEmpty(cachedToken) || cachedToken != token)
        {
            throw new BadRequestException("Invalid or expired reset token");
        }

        return true;
    }
}
