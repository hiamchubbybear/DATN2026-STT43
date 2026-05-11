using System.Net.Http.Json;
using DoAnTotNghiep.Application.Common;
using Google.Apis.Auth;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace DoAnTotNghiep.Infrastructure.Security;

public class GoogleAuthService : IGoogleAuthService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<GoogleAuthService> _logger;
    private readonly HttpClient _httpClient;

    public GoogleAuthService(IConfiguration configuration, ILogger<GoogleAuthService> logger)
    {
        _configuration = configuration;
        _logger = logger;
        _httpClient = new HttpClient();
    }

    public async Task<GoogleJsonWebSignaturePayload?> VerifyGoogleTokenAsync(string idToken)
    {
        try
        {
            var clientId = _configuration.GetValue<string>("Oauth2:Google:ClientId");
            var iosClientId = "792593212502-gtpc459mcq4qe1gqm4q4b57m1e0ouq26.apps.googleusercontent.com";
            
            var settings = new GoogleJsonWebSignature.ValidationSettings();
            var audiences = new List<string>();
            if (!string.IsNullOrEmpty(clientId)) audiences.Add(clientId);
            if (!string.IsNullOrEmpty(iosClientId)) audiences.Add(iosClientId);
            
            if (audiences.Any())
            {
                settings.Audience = audiences;
            }
            
            var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, settings);
            if (payload == null) return null;

            return new GoogleJsonWebSignaturePayload
            {
                Email = payload.Email,
                GivenName = payload.GivenName ?? string.Empty,
                FamilyName = payload.FamilyName ?? string.Empty,
                Picture = payload.Picture ?? string.Empty,
                Subject = payload.Subject
            };
        }
        catch (InvalidJwtException ex)
        {
            _logger.LogError(ex, "Invalid Google ID token.");
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying Google ID token.");
            return null;
        }
    }

    public async Task<GoogleJsonWebSignaturePayload?> VerifyAccessTokenAsync(string accessToken)
    {
        try
        {
            var response = await _httpClient.GetAsync($"https://www.googleapis.com/oauth2/v3/userinfo?access_token={accessToken}");
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Failed to verify Google access token. Status: {Status}", response.StatusCode);
                return null;
            }

            var payload = await response.Content.ReadFromJsonAsync<GoogleUserInfoDto>();
            if (payload == null) return null;

            return new GoogleJsonWebSignaturePayload
            {
                Email = payload.Email,
                GivenName = payload.GivenName ?? string.Empty,
                FamilyName = payload.FamilyName ?? string.Empty,
                Picture = payload.Picture ?? string.Empty,
                Subject = payload.Sub
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying Google access token.");
            return null;
        }
    }

    private class GoogleUserInfoDto
    {
        public string Sub { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string GivenName { get; set; } = string.Empty;
        public string FamilyName { get; set; } = string.Empty;
        public string Picture { get; set; } = string.Empty;
    }
}
