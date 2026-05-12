using DoAnTotNghiep.Application.Common;
using DoAnTotNghiep.Application.Email;
using DoAnTotNghiep.Application.Exception;
using DoAnTotNghiep.Domain.Token;
using DoAnTotNghiep.Domain.Users;
using MediatR;

namespace DoAnTotNghiep.Application.Auth.ResendVerification;

public class Handler(
    IUserRepository userRepository,
    ICacheService cache,
    ITokenGenerator tokenGenerator,
    IEmailTemplateService emailTemplateService,
    IEmailService emailService
) : IRequestHandler<ResendVerificationCommand, object>
{
    private static readonly string CREATE_ACCOUNT = "CreateAccount";

    public async Task<object> Handle(ResendVerificationCommand request, CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByEmail(request.Email);
        if (user == null) throw new NotFoundException("User not found.");

        if (user.IsVerified) throw new BadRequestException("User is already verified.");

        string token = tokenGenerator.GenerateToken();
        var cacheKey = $"VerifyEmail_{request.Email}";
        
        await cache.SetAsync<string>(cacheKey, token, TimeSpan.FromHours(24));

        var body = await emailTemplateService.RenderAsync(CREATE_ACCOUNT,
            new { UserName = user.Email, Email = user.Email, Token = token });
        
        await emailService.SendAsync(
            user.Email,
            "Resend Verification - Welcome to DATN",
            body,
            true
        );

        return new {
            EmailVerificationToken = token,
            Message = "Verification email resent successfully."
        };
    }
}
