using DoAnTotNghiep.Application.Common;
using DoAnTotNghiep.Application.Email;
using DoAnTotNghiep.Application.Exception;
using DoAnTotNghiep.Application.Users;
using DoAnTotNghiep.Domain.Token;
using DoAnTotNghiep.Domain.Users;
using MediatR;

namespace DoAnTotNghiep.Application.Auth.ForgotAccount
{
    public class Handler(
        ICacheService cache,
        IUserRepository userRepository,
        IEmailService emailService,
        IEmailTemplateService emailTemplateService,
        ITokenGenerator tokenGenerator
    ) : IRequestHandler<ForgotPasswordCommand, Unit>
    {
        private static readonly String FORGOT_PASSWORD = "ForgotPassword";
        private static readonly int EXPIRE_TIME_FORGOT_PASSWORD_TOKEN = 10;

        public async Task<Unit> Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
        {
            var existing = await userRepository.GetByEmail(request.Email);
            if (existing == null)
                throw new NotFoundException("User not found");
            String email = existing.Email;
            String token = tokenGenerator.GenerateToken();
            var cacheKey = $"ResetPassword_{email}";
            
            await cache.SetAsync<string>(cacheKey, token, TimeSpan.FromMinutes(EXPIRE_TIME_FORGOT_PASSWORD_TOKEN));
            
            var body = await emailTemplateService.RenderAsync(FORGOT_PASSWORD,
                new
                {
                    Resetlink = "", Token = token, ExpireMinutes = EXPIRE_TIME_FORGOT_PASSWORD_TOKEN,
                    UserName = existing.Email
                });
            await emailService.SendAsync(
                email,
                "Bạn quên mật khẩu ?",
                body,
                true
            );
            return Unit.Value;
        }
    }
}