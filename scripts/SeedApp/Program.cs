using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;
using Newtonsoft.Json;
using BCrypt.Net;

namespace SeedApp
{
    class Program
    {
        static async Task Main(string[] args)
        {
            // Register global GuidSerializer for all Guids
            MongoDB.Bson.Serialization.BsonSerializer.RegisterSerializer(
                new MongoDB.Bson.Serialization.Serializers.GuidSerializer(GuidRepresentation.Standard));

            string connectionString = "mongodb+srv://chessy:d2YEPi7Y1MkXMcG0@tinder-clone.manxzke.mongodb.net/?appName=Tinder-Clone";
            string databaseName = "DoAnTotNghiepDb";

            // Config loading logic removed to ensure Atlas is used
            ConfigFound:
            Console.WriteLine($"🚀 CONNECTING TO MAIN DB: {databaseName}");
            Console.WriteLine($"DEBUG: Connecting to {connectionString} / Database: {databaseName}");

            var client = new MongoClient(connectionString);
            var database = client.GetDatabase(databaseName);
            var usersCollection = database.GetCollection<BsonDocument>("user_accounts");
            var profilesCollection = database.GetCollection<BsonDocument>("user_profiles");

            string[] possiblePaths = {
                "seed-users.json",
                "users.json",
                "../seed-users.json",
                "../users.json",
                "../../scripts/seed-users.json",
                "../../scripts/users.json"
            };

            string jsonPath = "";
            foreach (var path in possiblePaths)
            {
                if (File.Exists(path))
                {
                    jsonPath = path;
                    break;
                }
            }

            if (string.IsNullOrEmpty(jsonPath))
            {
                Console.WriteLine("Could not find users.json or seed-users.json");
                return;
            }

            Console.WriteLine($"Reading from: {Path.GetFullPath(jsonPath)}");
            var jsonData = File.ReadAllText(jsonPath);
            var seedData = JsonConvert.DeserializeObject<List<UserSeedModel>>(jsonData);

            if (seedData == null) 
            {
                Console.WriteLine("Failed to deserialize users.json");
                return;
            }

            Console.WriteLine($"Found {seedData.Count} users to seed.");
            
            Console.WriteLine("🧹 Clearing existing data...");
            await usersCollection.DeleteManyAsync(new BsonDocument());
            await profilesCollection.DeleteManyAsync(new BsonDocument());

            foreach (var data in seedData)
            {
                // Check if user already exists by email
                var filter = Builders<BsonDocument>.Filter.Eq("Email", data.Account.Email);
                var existingUser = await usersCollection.Find(filter).FirstOrDefaultAsync();
                
                if (existingUser != null)
                {
                    Console.WriteLine($"Skipping existing user: {data.Account.Email}");
                    continue;
                }

                var accountId = Guid.NewGuid();

                // 1. Create User Account
                var accountDoc = new BsonDocument
                {
                    { "_id", new BsonBinaryData(accountId, GuidRepresentation.Standard) },
                    { "Username", data.Account.Username },
                    { "Email", data.Account.Email },
                    { "HashPassword", BCrypt.Net.BCrypt.HashPassword(data.Account.Password) },
                    { "IsVerified", true },
                    { "Role", data.Account.Role },
                    { "Provider", 0 }, // Local
                    { "CreatedAt", DateTime.UtcNow },
                    { "UpdatedAt", DateTime.UtcNow }
                };

                // 2. Create User Profile
                var profileDoc = new BsonDocument
                {
                    { "_id", new BsonBinaryData(Guid.NewGuid(), GuidRepresentation.Standard) },
                    { "UserId", new BsonBinaryData(accountId, GuidRepresentation.Standard) },
                    { "Bio", data.Profile.Bio },
                    { "Latitude", data.Profile.Location.Lat },
                    { "Longitude", data.Profile.Location.Lng },
                    { "LocationName", data.Profile.Location.Name },
                    { "MinAgePreference", 18 },
                    { "MaxAgePreference", 100 },
                    { "MaxDistanceKm", 50 },
                    { "LookingFor", data.Profile.LookingFor > 0 ? data.Profile.LookingFor : new Random().Next(1, 4) },
                    { "CreatedAt", DateTime.UtcNow },
                    { "UpdatedAt", DateTime.UtcNow },
                    { "BasicInfo", new BsonDocument {
                        { "DisplayName", data.Profile.DisplayName },
                        { "Dob", DateTime.Parse(data.Profile.Dob) },
                        { "Gender", ParseGender(data.Profile.Gender) },
                        { "Languages", new BsonArray(data.Profile.Languages) }
                    }},
                    { "Background", new BsonDocument {
                        { "Education", data.Profile.Education },
                        { "Occupation", data.Profile.Occupation }
                    }},
                    { "Lifestyle", new BsonDocument {
                        { "Drinking", data.Profile.Drinking },
                        { "Smoking", data.Profile.Smoking },
                        { "SocialLevel", data.Profile.SocialLevel },
                        { "PersonalityType", data.Profile.PersonalityType },
                        { "LoveLanguage", new BsonArray(data.Profile.LoveLanguage) },
                        { "Hobbies", new BsonArray(data.Profile.Hobbies) },
                        { "Interests", new BsonArray(data.Profile.Interests) }
                    }},
                    { "DatingStyle", new BsonDocument {
                        { "FreeTimePrefer", new BsonArray(data.Profile.FreeTimePrefer) },
                        { "DateStyle", new BsonArray(data.Profile.DateStyle) }
                    }},
                    { "Photos", new BsonArray(data.Profile.Photos.ConvertAll(url => new BsonDocument {
                        { "Id", new BsonBinaryData(Guid.NewGuid(), GuidRepresentation.Standard) },
                        { "Url", url },
                        { "Order", data.Profile.Photos.IndexOf(url) },
                        { "IsPrimary", data.Profile.Photos.IndexOf(url) == 0 },
                        { "CreatedAt", DateTime.UtcNow }
                    }))}
                };

                try 
                {
                    await usersCollection.InsertOneAsync(accountDoc);
                    await profilesCollection.InsertOneAsync(profileDoc);
                    Console.WriteLine($"Successfully seeded: {data.Profile.DisplayName}");
                }
                catch (MongoWriteException ex) when (ex.WriteError.Code == 11000)
                {
                    Console.WriteLine($"Skipping duplicate: {data.Account.Email}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error seeding {data.Account.Email}: {ex.Message}");
                }
            }

            Console.WriteLine("Seeding completed!");
        }

        private static int ParseGender(string genderStr)
        {
            if (int.TryParse(genderStr, out int genderInt)) return genderInt;
            if (genderStr.Equals("Male", StringComparison.OrdinalIgnoreCase)) return 1;
            if (genderStr.Equals("Female", StringComparison.OrdinalIgnoreCase)) return 2;
            return 3; // Other/Everyone
        }
    }

    public class UserSeedModel
    {
        public AccountModel Account { get; set; } = default!;
        public ProfileModel Profile { get; set; } = default!;
    }

    public class AccountModel
    {
        public string Username { get; set; } = default!;
        public string Email { get; set; } = default!;
        public string Password { get; set; } = default!;
        public string Role { get; set; } = default!;
    }

    public class ProfileModel
    {
        public string DisplayName { get; set; } = default!;
        public string Dob { get; set; } = default!;
        public string Gender { get; set; } = default!;
        public int LookingFor { get; set; }
        public List<string> Languages { get; set; } = default!;
        public string Bio { get; set; } = default!;
        public string Education { get; set; } = default!;
        public string Occupation { get; set; } = default!;
        public string Drinking { get; set; } = default!;
        public string Smoking { get; set; } = default!;
        public string SocialLevel { get; set; } = default!;
        public string PersonalityType { get; set; } = default!;
        public List<string> LoveLanguage { get; set; } = default!;
        public List<string> Hobbies { get; set; } = default!;
        public List<string> Interests { get; set; } = default!;
        public List<string> FreeTimePrefer { get; set; } = default!;
        public List<string> DateStyle { get; set; } = default!;
        public LocationModel Location { get; set; } = default!;
        public List<string> Photos { get; set; } = default!;
    }

    public class LocationModel
    {
        public double Lat { get; set; }
        public double Lng { get; set; }
        public string Name { get; set; } = default!;
    }
}
