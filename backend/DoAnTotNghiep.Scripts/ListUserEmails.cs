using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Scripts
{
    public class ListUserEmails
    {
        public async Task RunAsync()
        {
            var client = new MongoClient("mongodb://localhost:27017");
            var db = client.GetDatabase("DoAnTotNghiep");
            var users = db.GetCollection<dynamic>("Users");
            var profiles = db.GetCollection<dynamic>("UserProfiles");

            var allUsers = await users.Find(Builders<dynamic>.Filter.Empty).Limit(10).ToListAsync();
            Console.WriteLine("--- Top 10 Users for Testing ---");
            foreach (var user in allUsers)
            {
                Console.WriteLine($"Email: {user.Email}, Role: {user.Role}");
            }
        }
    }
}
