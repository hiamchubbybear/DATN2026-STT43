using DoAnTotNghiep.Application.Users;
using DoAnTotNghiep.Domain.Token;
using DoAnTotNghiep.Domain.Users;
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
            }
        }
        catch
        {
            
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
    }
}
