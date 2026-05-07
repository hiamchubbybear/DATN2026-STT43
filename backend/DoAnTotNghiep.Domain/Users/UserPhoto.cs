using DoAnTotNghiep.Domain.Common;

namespace DoAnTotNghiep.Domain.Users;

public class UserPhoto(Guid userId, string url, int order = 0, bool isPrimary = false) : BaseEntity
{
    public Guid UserId { get; private set; } = userId;
    public string Url { get; private set; } = url;
    public int Order { get; private set; } = order;
    public bool IsPrimary { get; private set; } = isPrimary;

    public void SetPrimary(bool isPrimary)
    {
        IsPrimary = isPrimary;
        SetUpdated();
    }

    public void UpdateOrder(int order)
    {
        Order = order;
        SetUpdated();
    }
}
