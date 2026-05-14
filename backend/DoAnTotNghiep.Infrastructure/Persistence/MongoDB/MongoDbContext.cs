using DoAnTotNghiep.Application.Common;
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

public class MongoDbContext : IMongoDbContext
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
    private readonly IPasswordHasher _hasher;

    public MongoDbInitializer(MongoSettings settings, IPasswordHasher hasher)
    {
        var client = new MongoClient(settings.ConnectionString);
        _database = client.GetDatabase(settings.Database);
        _hasher = hasher;
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
        var adminEmail = "admin@mixer.com";
        var adminUser = await userCol.Find(u => u.Email == adminEmail).FirstOrDefaultAsync();

        // BCrypt hash for 'Admin@123'
        string adminPasswordHash = _hasher.Hash("Admin@123");

        if (adminUser == null)
        {
            var admin = new UserAccount(adminEmail, adminPasswordHash, AuthProvider.Local);
            admin.SetRole("Admin");
            admin.MarkAsVerified();
            await userCol.InsertOneAsync(admin);
        }
        else if (adminUser.Role != "Admin")
        {
            adminUser.SetRole("Admin");
            adminUser.MarkAsVerified();
            adminUser.UpdatePassword(adminPasswordHash); // Reset password to Admin@123 for existing invalid admin
            await userCol.ReplaceOneAsync(u => u.Id == adminUser.Id, adminUser);
        }

        // 4. Seed Mock Data for Admin Testing
        var profileCol = _database.GetCollection<UserProfile>("user_profiles");
        var reportCol = _database.GetCollection<UserReport>("user_reports");

        if (await profileCol.CountDocumentsAsync(_ => true) == 0)
        {
            var adminProfile = new UserProfile(adminUser?.Id ?? Guid.NewGuid());
            adminProfile.UpdateBasicInfo("System Admin", new DateTime(1990, 1, 1), Gender.Other, ["English", "Vietnamese"]);
            adminProfile.UpdateBio("Hệ thống Mixer Admin", Gender.Other, "Everyone");
            await profileCol.InsertOneAsync(adminProfile);

            // Create 50 fake users and reports for testing
            var names = new[] { "Nguyễn Văn A", "Trần Thị B", "Lê Văn C", "Phạm Thị D", "Hoàng Văn E", "Vũ Thị F", "Đặng Văn G", "Bùi Thị H", "Lý Văn I", "Phan Thị J" };
            var avatars = new[] { 
                "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200", 
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
                "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200",
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"
            };

            for (int i = 1; i <= 50; i++)
            {
                var uId = Guid.NewGuid();
                var u = new UserAccount($"user{i}@example.com", adminPasswordHash, AuthProvider.Local);
                if (i % 5 == 0) u.Ban("Spamming");
                if (i % 3 == 0) u.MarkAsVerified();
                await userCol.InsertOneAsync(u);

                var p = new UserProfile(u.Id);
                var gender = i % 2 == 0 ? Gender.Female : Gender.Male;
                var displayName = $"{names[i % names.Length]} {i}";
                p.UpdateBasicInfo(displayName, new DateTime(1995, (i % 12) + 1, (i % 28) + 1), gender, ["Vietnamese", "English"]);
                p.UpdateLocation(10.762622 + (i * 0.001), 106.660172 + (i * 0.001), "Hồ Chí Minh, Việt Nam");
                
                // Add a photo
                var photo = new Photo { 
                    Url = avatars[i % avatars.Length], 
                    IsPrimary = true,
                    Order = 0
                };
                p.AddPhoto(photo);
                
                await profileCol.InsertOneAsync(p);

                if (i % 10 == 0)
                {
                    var r = new UserReport(adminUser?.Id ?? Guid.NewGuid(), u.Id, "Harassment", $"Báo cáo vi phạm thứ {i}", []);
                    await reportCol.InsertOneAsync(r);
                }
            }
        }
    }
}
