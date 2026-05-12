using DoAnTotNghiep.Application.Users;
using DoAnTotNghiep.Domain.Notifications;
using DoAnTotNghiep.Domain.Token;
using DoAnTotNghiep.Domain.Users;
using DoAnTotNghiep.Domain.Enum;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Serializers;
using MongoDB.Driver;

namespace DoAnTotNghiep.Infrastructure.Persistence;

public class MongoDbContext
{
    static MongoDbContext()
    {
        try
        {
            // Register global GuidSerializer for all Guids
            BsonSerializer.RegisterSerializer(new GuidSerializer(GuidRepresentation.Standard));

            // For MongoDB Driver 3.x, we should register class maps carefully
            if (!BsonClassMap.IsClassMapRegistered(typeof(DoAnTotNghiep.Domain.Common.BaseEntity)))
            {
                BsonClassMap.RegisterClassMap<DoAnTotNghiep.Domain.Common.BaseEntity>(cm =>
                {
                    cm.AutoMap();
                    cm.MapIdProperty(c => c.Id)
                        .SetSerializer(new GuidSerializer(GuidRepresentation.Standard));
                });

                BsonClassMap.RegisterClassMap<DoAnTotNghiep.Domain.Users.UserProfile>(cm =>
                {
                    cm.AutoMap();
                    cm.MapProperty(c => c.UserId)
                        .SetSerializer(new GuidSerializer(GuidRepresentation.Standard));
                });

                BsonClassMap.RegisterClassMap<DoAnTotNghiep.Domain.Users.UserAccount>(cm =>
                {
                    cm.AutoMap();
                });

                BsonClassMap.RegisterClassMap<DoAnTotNghiep.Domain.Chat.ChatMessage>(cm =>
                {
                    cm.AutoMap();
                    cm.MapProperty(c => c.ConversationId)
                        .SetSerializer(new GuidSerializer(GuidRepresentation.Standard));
                });

                BsonClassMap.RegisterClassMap<DoAnTotNghiep.Domain.Chat.Conversation>(cm =>
                {
                    cm.AutoMap();
                });

                BsonClassMap.RegisterClassMap<DoAnTotNghiep.Domain.Users.UserSwipe>(cm =>
                {
                    cm.AutoMap();
                    cm.MapProperty(c => c.ActorId)
                        .SetSerializer(new GuidSerializer(GuidRepresentation.Standard));
                    cm.MapProperty(c => c.TargetId)
                        .SetSerializer(new GuidSerializer(GuidRepresentation.Standard));
                });

                BsonClassMap.RegisterClassMap<DoAnTotNghiep.Domain.Users.UserMatch>(cm =>
                {
                    cm.AutoMap();
                    cm.MapProperty(c => c.UserOneId)
                        .SetSerializer(new GuidSerializer(GuidRepresentation.Standard));
                    cm.MapProperty(c => c.UserTwoId)
                        .SetSerializer(new GuidSerializer(GuidRepresentation.Standard));
                });

                BsonClassMap.RegisterClassMap<DoAnTotNghiep.Domain.Admin.AuditLog>(cm =>
                {
                    cm.AutoMap();
                    cm.MapProperty(c => c.ActorId)
                        .SetSerializer(new GuidSerializer(GuidRepresentation.Standard));
                });

                BsonClassMap.RegisterClassMap<DoAnTotNghiep.Domain.Admin.SystemConfig>(cm =>
                {
                    cm.AutoMap();
                });

                BsonClassMap.RegisterClassMap<DoAnTotNghiep.Domain.MasterData.MasterHobby>(cm =>
                {
                    cm.AutoMap();
                });
            }
        }
        catch
        {
            // Ignore if already registered
        }
    }

    private readonly IMongoDatabase _database;

    public MongoDbContext(MongoSettings settings)
    {
        var client = new MongoClient(settings.ConnectionString);
        _database = client.GetDatabase(settings.Database);
    }

    public IMongoCollection<UserAccount> UserAccounts => _database.GetCollection<UserAccount>("user_accounts");
    public IMongoCollection<Session> UserSessions => _database.GetCollection<Session>("user_sessions");

    public IMongoCollection<PasswordResetToken> PasswordResetToken =>
        _database.GetCollection<PasswordResetToken>("password_reset_token");
    public IMongoCollection<UserProfile> UserProfiles => _database.GetCollection<UserProfile>("user_profiles");
    public IMongoCollection<DoAnTotNghiep.Domain.Chat.ChatMessage> ChatMessages => _database.GetCollection<DoAnTotNghiep.Domain.Chat.ChatMessage>("chat_messages");
    public IMongoCollection<Notification> Notifications => _database.GetCollection<Notification>("notifications");
    public IMongoCollection<DoAnTotNghiep.Domain.Chat.Conversation> Conversations => _database.GetCollection<DoAnTotNghiep.Domain.Chat.Conversation>("conversations");
    public IMongoCollection<UserSwipe> UserSwipes => _database.GetCollection<UserSwipe>("user_swipes");
    public IMongoCollection<UserMatch> UserMatches => _database.GetCollection<UserMatch>("user_matches");
    public IMongoCollection<UserReport> UserReports => _database.GetCollection<UserReport>("user_reports");
    public IMongoCollection<AppReview> AppReviews => _database.GetCollection<AppReview>("app_reviews");
    
    // Admin & Master Data
    public IMongoCollection<DoAnTotNghiep.Domain.Admin.AuditLog> AuditLogs => _database.GetCollection<DoAnTotNghiep.Domain.Admin.AuditLog>("audit_logs");
    public IMongoCollection<DoAnTotNghiep.Domain.Admin.SystemConfig> SystemConfigs => _database.GetCollection<DoAnTotNghiep.Domain.Admin.SystemConfig>("system_configs");
    public IMongoCollection<DoAnTotNghiep.Domain.MasterData.MasterHobby> MasterHobbies => _database.GetCollection<DoAnTotNghiep.Domain.MasterData.MasterHobby>("master_hobbies");
    public IMongoCollection<UserVerification> UserVerifications => _database.GetCollection<UserVerification>("user_verifications");
    public IMongoCollection<DoAnTotNghiep.Domain.Admin.UserSubscription> UserSubscriptions => _database.GetCollection<DoAnTotNghiep.Domain.Admin.UserSubscription>("user_subscriptions");
    public IMongoCollection<UserSettings> UserSettings => _database.GetCollection<UserSettings>("user_settings");
    public IMongoCollection<BlockedUser> BlockedUsers => _database.GetCollection<BlockedUser>("blocked_users");
    public IMongoCollection<AppFeedback> AppFeedbacks => _database.GetCollection<AppFeedback>("app_feedbacks");
    public IMongoCollection<DoAnTotNghiep.Domain.Admin.BroadcastNotification> BroadcastNotifications => _database.GetCollection<DoAnTotNghiep.Domain.Admin.BroadcastNotification>("broadcast_notifications");
    public IMongoCollection<DoAnTotNghiep.Domain.Chat.CallSession> CallSessions => _database.GetCollection<DoAnTotNghiep.Domain.Chat.CallSession>("call_sessions");
}

public class MongoDbInitializer
{
    private readonly IMongoDatabase _database;

    public MongoDbInitializer(MongoSettings settings)
    {
        var client = new MongoClient(settings.ConnectionString);
        _database = client.GetDatabase(settings.Database);
    }

    public async Task InitializeAsync()
    {
        var usersCollection = _database.GetCollection<UserAccount>("user_accounts");
        await usersCollection.Indexes.CreateOneAsync(new CreateIndexModel<UserAccount>(
            Builders<UserAccount>.IndexKeys.Ascending(u => u.Email),
            new CreateIndexOptions { Unique = true }
        ));
        var tokensCollection = _database.GetCollection<PasswordResetToken>("password_reset_token");

        await tokensCollection.Indexes.CreateOneAsync(new CreateIndexModel<PasswordResetToken>(
            Builders<PasswordResetToken>.IndexKeys.Ascending(u => u.UserId)
        ));

        await tokensCollection.Indexes.CreateOneAsync(new CreateIndexModel<PasswordResetToken>(
            Builders<PasswordResetToken>.IndexKeys.Ascending(u => u.ExpiresAt),
            new CreateIndexOptions { ExpireAfter = TimeSpan.Zero }
        ));

        var sessionCollection = _database.GetCollection<Session>("user_sessions");
        await sessionCollection.Indexes.CreateOneAsync(new CreateIndexModel<Session>(
            Builders<Session>.IndexKeys.Ascending(u => u.CreatedAt)));

        await SeedMasterDataAsync();
    }

    private async Task SeedMasterDataAsync()
    {
        // 1. Seed Master Hobbies
        var hobbiesCol = _database.GetCollection<DoAnTotNghiep.Domain.MasterData.MasterHobby>("master_hobbies");
        if (await hobbiesCol.CountDocumentsAsync(_ => true) == 0)
        {
            var hobbies = new List<DoAnTotNghiep.Domain.MasterData.MasterHobby>
            {
                new("Bóng đá", "Thể thao", "soccer"),
                new("Cầu lông", "Thể thao", "badminton"),
                new("Gym", "Thể thao", "dumbbell"),
                new("Nghe nhạc", "Âm nhạc", "music"),
                new("Chơi đàn", "Âm nhạc", "guitar"),
                new("Đọc sách", "Giải trí", "book"),
                new("Du lịch", "Giải trí", "airplane"),
                new("Nấu ăn", "Giải trí", "chef-hat"),
                new("Chụp ảnh", "Nghệ thuật", "camera"),
                new("Vẽ", "Nghệ thuật", "palette")
            };
            await hobbiesCol.InsertManyAsync(hobbies);
        }

        // 2. Seed System Configs
        var configCol = _database.GetCollection<DoAnTotNghiep.Domain.Admin.SystemConfig>("system_configs");
        if (await configCol.CountDocumentsAsync(_ => true) == 0)
        {
            var configs = new List<DoAnTotNghiep.Domain.Admin.SystemConfig>
            {
                new("MIN_AGE", "18", "Tuổi tối thiểu đăng ký"),
                new("MAX_DISTANCE", "100", "Khoảng cách tìm kiếm tối đa mặc định (km)"),
                new("MAINTENANCE_MODE", "false", "Bật/Tắt chế độ bảo trì hệ thống"),
                new("MAX_PHOTOS", "6", "Số lượng ảnh tối đa mỗi profile")
            };
            await configCol.InsertManyAsync(configs);
        }

        // 3. Seed Users
        var userCol = _database.GetCollection<UserAccount>("user_accounts");
        if (await userCol.CountDocumentsAsync(_ => true) == 0)
        {
            var admin = new UserAccount("admin@mixer.com", "AQAAAAIAAYagAAAAEG...", AuthProvider.Local);
            // Cần set role admin thủ công hoặc qua constructor nếu có
            var user1 = new UserAccount("user1@gmail.com", null, AuthProvider.Local);
            var user2 = new UserAccount("user2@gmail.com", null, AuthProvider.Local);
            await userCol.InsertManyAsync(new[] { admin, user1, user2 });

            // 4. Seed Matches
            var matchCol = _database.GetCollection<UserMatch>("user_matches");
            await matchCol.InsertOneAsync(new UserMatch(user1.Id, user2.Id));
        }
    }
}
