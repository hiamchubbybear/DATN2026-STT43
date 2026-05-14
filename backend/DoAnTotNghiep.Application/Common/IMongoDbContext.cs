using DoAnTotNghiep.Domain.Users;
using DoAnTotNghiep.Domain.Notifications;
using DoAnTotNghiep.Domain.Token;
using DoAnTotNghiep.Domain.Chat;
using DoAnTotNghiep.Domain.Admin;
using DoAnTotNghiep.Domain.MasterData;
using MongoDB.Driver;

namespace DoAnTotNghiep.Application.Common;

public interface IMongoDbContext
{
    IMongoCollection<UserAccount> UserAccounts { get; }
    IMongoCollection<Session> UserSessions { get; }
    IMongoCollection<PasswordResetToken> PasswordResetToken { get; }
    IMongoCollection<UserProfile> UserProfiles { get; }
    IMongoCollection<ChatMessage> ChatMessages { get; }
    IMongoCollection<Notification> Notifications { get; }
    IMongoCollection<Conversation> Conversations { get; }
    IMongoCollection<UserSwipe> UserSwipes { get; }
    IMongoCollection<UserMatch> UserMatches { get; }
    IMongoCollection<UserReport> UserReports { get; }
    IMongoCollection<AppReview> AppReviews { get; }
    IMongoCollection<AuditLog> AuditLogs { get; }
    IMongoCollection<SystemConfig> SystemConfigs { get; }
    IMongoCollection<MasterHobby> MasterHobbies { get; }
    IMongoCollection<UserVerification> UserVerifications { get; }
    IMongoCollection<UserSubscription> UserSubscriptions { get; }
    IMongoCollection<UserSettings> UserSettings { get; }
    IMongoCollection<BlockedUser> BlockedUsers { get; }
    IMongoCollection<AppFeedback> AppFeedbacks { get; }
    IMongoCollection<BroadcastNotification> BroadcastNotifications { get; }
    IMongoCollection<CallSession> CallSessions { get; }
}
