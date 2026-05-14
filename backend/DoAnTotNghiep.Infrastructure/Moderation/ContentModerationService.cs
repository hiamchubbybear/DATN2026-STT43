using System.Text.RegularExpressions;
using DoAnTotNghiep.Application.Common;

namespace DoAnTotNghiep.Infrastructure.Moderation;

public class ContentModerationService : IContentModerationService
{
    // Patterns for contact info (Phone numbers, Zalo, FB, IG handles)
    private static readonly Regex ContactInfoRegex = new Regex(@"(\d{8,12})|(@[a-zA-Z0-9._]+)|(zalo|fb|ig|messenger|phone|sdt|liên hệ)", RegexOptions.Compiled | RegexOptions.IgnoreCase);
    
    // Prohibited keywords (Profanity, Scam, Inappropriate)
    private static readonly string[] ProhibitedKeywords = { "sex", "escort", "money", "loan", "vay tiền", "tài xỉu", "đánh bạc" };

    public Task<(bool IsInappropriate, string? Reason)> ModerateTextAsync(string content, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(content))
            return Task.FromResult((false, (string?)null));

        // 1. Check for contact info
        if (ContactInfoRegex.IsMatch(content))
        {
            return Task.FromResult((true, (string?)"Contact information is not allowed in public content."));
        }

        // 2. Check for prohibited keywords
        foreach (var keyword in ProhibitedKeywords)
        {
            if (content.Contains(keyword, StringComparison.OrdinalIgnoreCase))
            {
                return Task.FromResult((true, (string?)$"Prohibited content detected: {keyword}"));
            }
        }

        return Task.FromResult((false, (string?)null));
    }

    public async Task<(bool IsValid, string? Reason)> ValidateProfileBioAsync(string bio, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(bio))
            return (true, null);

        if (bio.Length < 10)
            return (false, "Bio is too short. Please tell us more about yourself!");

        return await ModerateTextAsync(bio, ct);
    }
}
