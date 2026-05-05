namespace DoAnTotNghiep.Domain.Users;

public class Photo
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Url { get; set; } = default!;
    public string? ThumbnailUrl { get; private set; }
    public int Order { get; set; }
    public bool IsPrimary { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public void SetPrimary(bool value)
    {
        IsPrimary = value;
    }
    public void SetOrder(int order)
    {
        Order = order;
    }
}