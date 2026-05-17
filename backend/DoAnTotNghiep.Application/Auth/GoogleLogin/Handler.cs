using DoAnTotNghiep.Application.Common;
using DoAnTotNghiep.Application.Exception;
using DoAnTotNghiep.Application.Users.Commands.Login;
using DoAnTotNghiep.Domain.Enum;
using DoAnTotNghiep.Domain.Users;
using MediatR;

namespace DoAnTotNghiep.Application.Auth.GoogleLogin;

public class GoogleLoginHandler : IRequestHandler<GoogleLoginCommand, AuthResponse>
{
    private readonly IGoogleAuthService _googleAuthService;
    private readonly IUserRepository _userRepository;
    private readonly IJwtService _jwtService;
    private readonly IUserProfileRepository _profileRepository;
    private readonly ISessionRepository _sessionRepository;

    public GoogleLoginHandler(
        IGoogleAuthService googleAuthService, 
        IUserRepository userRepository, 
        IJwtService jwtService, 
        IUserProfileRepository profileRepository,
        ISessionRepository sessionRepository)
    {
        _googleAuthService = googleAuthService;
        _userRepository = userRepository;
        _jwtService = jwtService;
        _profileRepository = profileRepository;
        _sessionRepository = sessionRepository;
    }

    public async Task<AuthResponse> Handle(GoogleLoginCommand request, CancellationToken cancellationToken)
    {
        GoogleJsonWebSignaturePayload? payload = null;

        if (!string.IsNullOrEmpty(request.IdToken))
        {
            payload = await _googleAuthService.VerifyGoogleTokenAsync(request.IdToken);
        }
        else if (!string.IsNullOrEmpty(request.AccessToken))
        {
            payload = await _googleAuthService.VerifyAccessTokenAsync(request.AccessToken);
        }

        if (payload == null)
            throw new UnauthorizedException("Invalid Google token or access token");

        var user = await _userRepository.GetByEmail(payload.Email);

        if (user == null)
        {
            user = new UserAccount(
                email: payload.Email,
                hashPassword: null,
                provider: AuthProvider.Google,
                providerId: payload.Subject
            );
            user.MarkAsVerified();
            await _userRepository.CreateAccount(user);
        }
        else
        {
            if (user.IsBanned)
            {
                if (user.BannedUntil.HasValue && user.BannedUntil.Value <= DateTime.UtcNow)
                {
                    user.Unban();
                    await _userRepository.UpdateAsync(user);
                }
                else
                {
                    var msg = "Tài khoản của bạn đã bị khóa." + 
                              (user.BannedUntil.HasValue ? $" Đến: {user.BannedUntil.Value.ToLocalTime():dd/MM/yyyy HH:mm}." : "") + 
                              (string.IsNullOrEmpty(user.BanReason) ? "" : $" Lý do: {user.BanReason}");
                    throw new ForbiddenException(msg);
                }
            }

            if (user.Provider != AuthProvider.Google)
            {
                // Account merging: user registered locally, now logging in with Google.
                // We update their Provider info to link the accounts securely.
                user.LinkWithGoogle(payload.Subject);
                user.MarkAsVerified();
            }
        }

        var accessToken = _jwtService.GenerateAccessToken(user);
        var refreshToken = _jwtService.GenerateRefreshToken();

        var profile = await _profileRepository.GetByUserIdAsync(user.Id);

        var session = new Session(
            user.Id,
            request.DeviceId,
            request.DeviceName,
            request.IpAddress,
            request.Platform,
            request.AppVersion,
            request.FcmToken,
            refreshToken
        );
        await _sessionRepository.CreateSession(session);

        return new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken.Token,
            IsProfileCompleted = profile != null,
            UserId = user.Id,
            Email = user.Email
        };
    }
}
