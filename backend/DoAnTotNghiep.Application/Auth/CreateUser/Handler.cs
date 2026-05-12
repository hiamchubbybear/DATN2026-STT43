using DoAnTotNghiep.Application.Common;
using DoAnTotNghiep.Application.Email;
using DoAnTotNghiep.Application.Exception;
using DoAnTotNghiep.Application.Users;
using DoAnTotNghiep.Domain.Users;
using MediatR;
using DoAnTotNghiep.Domain.Token;

namespace DoAnTotNghiep.Application.CreateUser
{
    public class Handler(
        IUserRepository userRepository,
        IPasswordHasher ipasswordHasher,
        IEmailService emailService,
        IEmailTemplateService emailTemplateService,
        ICacheService cache,
        ITokenGenerator tokenGenerator
    ) : IRequestHandler<CreateAccountCommand, object>
    {
        private static readonly String FORGOT_PASSWORD = "ForgotPassword";
        private static readonly String CREATE_ACCOUNT = "CreateAccount";

        public async Task<object> Handle(CreateAccountCommand request, CancellationToken cancellationToken)
        {
            var existing = await userRepository.GetByEmail(request.Email);
            if (existing != null)
                throw new ConflictException("Email already exists");

            var passwordHash = ipasswordHasher.Hash(password: request.Password);
            string email = request.Email;
            var user = new UserAccount(
                hashPassword: passwordHash,
                email: email
            );
            await userRepository.CreateAccount(user);
            
            string token = tokenGenerator.GenerateToken();
            var cacheKey = $"VerifyEmail_{email}";
            
            await cache.SetAsync<string>(cacheKey, token, TimeSpan.FromHours(24));

            var body = await emailTemplateService.RenderAsync(CREATE_ACCOUNT,
                new { UserName = email, Email = email, Token = token });
            await emailService.SendAsync(
                email,
                "Xác thực tài khoản - DATN 2026",
                body,
                true
            );
            return new { 
                UserId = user.Id,
                EmailVerificationToken = token,
                Message = "User registered successfully"
            };
        }
    }
}