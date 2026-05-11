using System;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Driver;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new MongoClient("mongodb+srv://chessy:d2YEPi7Y1MkXMcG0@tinder-clone.manxzke.mongodb.net/?appName=Tinder-Clone");
        var db = client.GetDatabase("DoAnTotNghiepDb");
        
        if (args.Length > 0 && args[0] == "clear")
        {
            Console.WriteLine("Clearing all data...");
            await db.GetCollection<BsonDocument>("user_profiles").DeleteManyAsync(new BsonDocument());
            await db.GetCollection<BsonDocument>("user_accounts").DeleteManyAsync(new BsonDocument());
            await db.GetCollection<BsonDocument>("user_swipes").DeleteManyAsync(new BsonDocument());
            await db.GetCollection<BsonDocument>("user_matches").DeleteManyAsync(new BsonDocument());
            Console.WriteLine("Data cleared!");
        }
        else 
        {
            var col = db.GetCollection<BsonDocument>("user_profiles");
            var result = await col.UpdateManyAsync(new BsonDocument(), new BsonDocument("$set", new BsonDocument("LookingFor", 3)));
            Console.WriteLine($"Updated {result.ModifiedCount} profiles to LookingFor=Everyone");
        }
    }
}
