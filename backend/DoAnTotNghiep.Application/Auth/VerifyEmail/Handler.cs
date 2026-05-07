using DoAnTotNghiep.Application.Common;
using DoAnTotNghiep.Application.Exception;
using DoAnTotNghiep.Application.Users.Commands.Login;
using DoAnTotNghiep.Domain.Users;
using MediatR;

namespace DoAnTotNghiep.Application.Auth.VerifyEmail;

public class Handler(
    IUserRepository userRepository, 
    ICacheService cache, 
    IJwtService jwtService, 
    ISessionRepository sessionRepository,
    IUserProfileRepository profileRepository
) : IRequestHandler<VerifyEmailCommand, AuthResponse>
{
    public async Task<AuthResponse> Handle(VerifyEmailCommand request, CancellationToken cancellationToken)
    {
        var cacheKey = $"VerifyEmail_{request.Email}";
        var cachedToken = await cache.GetAsync<string>(cacheKey);
        
        if (string.IsNullOrEmpty(cachedToken) || cachedToken != request.Token)
            throw new BadRequestException("Invalid or expired verification token.");

        var user = await userRepository.GetByEmail(request.Email);
        if (user == null)
            throw new NotFoundException("User not found.");

        if (user.IsVerified)
            throw new BadRequestException("User is already verified.");

        user.MarkAsVerified();
        await userRepository.UpdateAsync(user);
        
        // Generate tokens for auto-login
        var accessToken = jwtService.GenerateAccessToken(user);
        var refreshToken = jwtService.GenerateRefreshToken();
        
        var profile = await profileRepository.GetByUserIdAsync(user.Id);
        
        // Create session
        var session = new Session(user.Id, "VerifiedDevice", "Unknown", "Mobile", null, refreshToken);
        await sessionRepository.CreateSession(session);
        
        await cache.RemoveAsync(cacheKey);

        return new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken.Token,
            IsProfileCompleted = profile != null,
            UserId = user.Id,
            Username = user.Username,
            Email = user.Email
        };
    }
}
