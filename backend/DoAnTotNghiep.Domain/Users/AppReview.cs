using System;

namespace DoAnTotNghiep.Domain.Users;

public class AppReview
{
    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public int Rating { get; private set; } // 1-5
    public string Comment { get; private set; }
    public DateTime CreatedAt { get; private set; }

    public AppReview(Guid userId, int rating, string comment)
    {
        Id = Guid.NewGuid();
        UserId = userId;
        Rating = rating;
        Comment = comment;
        CreatedAt = DateTime.UtcNow;
    }
}
