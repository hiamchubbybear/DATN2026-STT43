using DoAnTotNghiep.Domain.Common;

namespace DoAnTotNghiep.Domain.Admin;

public class UserSubscription : BaseEntity
{
    public Guid UserId { get; private set; }
    public SubscriptionType Type { get; private set; }
    public DateTime StartDate { get; private set; }
    public DateTime EndDate { get; private set; }
    public bool IsActive => DateTime.UtcNow >= StartDate && DateTime.UtcNow <= EndDate;

    private UserSubscription() { }

    public UserSubscription(Guid userId, SubscriptionType type, int durationDays)
    {
        UserId = userId;
        Type = type;
        StartDate = DateTime.UtcNow;
        EndDate = DateTime.UtcNow.AddDays(durationDays);
    }
}

public enum SubscriptionType
{
    Free = 0,
    Gold = 1,
    Platinum = 2
}
