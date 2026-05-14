namespace DoAnTotNghiep.Application.Common;

public interface IContentModerationService
{
    /// <summary>
    /// Checks if text content contains prohibited words or patterns (phone numbers, social handles).
    /// </summary>
    Task<(bool IsInappropriate, string? Reason)> ModerateTextAsync(string content, CancellationToken ct = default);

    /// <summary>
    /// Checks if a profile bio is valid and appropriate.
    /// </summary>
    Task<(bool IsValid, string? Reason)> ValidateProfileBioAsync(string bio, CancellationToken ct = default);
}
