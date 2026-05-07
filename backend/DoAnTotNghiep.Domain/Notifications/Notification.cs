using DoAnTotNghiep.Domain.Common;

namespace DoAnTotNghiep.Domain.Notifications;

public class Notification(Guid userId) : BaseEntity
{
    public Guid UserId { get; private set; } = userId;
    public string Title { get; private set; } = string.Empty;
    public string Content { get; private set; } = string.Empty;
    public string Type { get; private set; } = "info";

    public static Notification Create(
        Guid userId,
        string title,
        string content,
        string type,
        DateTime? createdAtUtc = null)
    {
        return new Notification(userId)
        {
            Title = title?.Trim() ?? string.Empty,
            Content = content?.Trim() ?? string.Empty,
            Type = string.IsNullOrWhiteSpace(type) ? "info" : type.Trim().ToLowerInvariant(),
            CreatedAt = createdAtUtc ?? DateTime.UtcNow,
        };
    }
}

