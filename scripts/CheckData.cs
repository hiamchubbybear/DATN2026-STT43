using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Driver;

namespace CheckData
{
    class Program
    {
        static async Task Main(string[] args)
        {
            string connectionString = "mongodb+srv://chessy:d2YEPi7Y1MkXMcG0@tinder-clone.manxzke.mongodb.net/?appName=Tinder-Clone";
            string databaseName = "DoAnTotNghiepDb";

            var client = new MongoClient(connectionString);
            var database = client.GetDatabase(databaseName);
            var profilesCollection = database.GetCollection<BsonDocument>("user_profiles");

            var count = await profilesCollection.CountDocumentsAsync(_ => true);
            Console.WriteLine($"Total profiles: {count}");

            var lookingForStats = await profilesCollection.Aggregate()
                .Group(new BsonDocument { { "_id", "$LookingFor" }, { "count", new BsonDocument("$sum", 1) } })
                .ToListAsync();

            Console.WriteLine("LookingFor Stats:");
            foreach (var stat in lookingForStats)
            {
                Console.WriteLine($" - {stat["_id"]}: {stat["count"]}");
            }

            var genderStats = await profilesCollection.Aggregate()
                .Group(new BsonDocument { { "_id", "$BasicInfo.Gender" }, { "count", new BsonDocument("$sum", 1) } })
                .ToListAsync();

            Console.WriteLine("Gender Stats:");
            foreach (var stat in genderStats)
            {
                Console.WriteLine($" - {stat["_id"]}: {stat["count"]}");
            }
        }
    }
}
