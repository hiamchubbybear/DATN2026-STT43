namespace DoAnTotNghiep.Application.Common;

public interface IGoogleAuthService
{
    Task<GoogleJsonWebSignaturePayload?> VerifyGoogleTokenAsync(string idToken);
    Task<GoogleJsonWebSignaturePayload?> VerifyAccessTokenAsync(string accessToken);
}

public class GoogleJsonWebSignaturePayload
{
    public string Email { get; set; } = string.Empty;
    public string GivenName { get; set; } = string.Empty;
    public string FamilyName { get; set; } = string.Empty;
    public string Picture { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
}
