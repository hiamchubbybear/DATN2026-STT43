using DoAnTotNghiep.Application.Common;
using DoAnTotNghiep.Domain.Users;
using MongoDB.Driver;
using System;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Scripts
{
    public class RestoreMeoo
    {
        private readonly IMongoDbContext _context;
        public RestoreMeoo(IMongoDbContext context)
        {
            _context = context;
        }

        public async Task RunAsync()
        {
            var userId = Guid.Parse("c8f90e97-180b-4765-ae75-2148302ef235");
            var profile = await _context.UserProfiles.Find(x => x.UserId == userId).FirstOrDefaultAsync();
            if (profile != null)
            {
                profile.Restore();
                await _context.UserProfiles.ReplaceOneAsync(x => x.Id == profile.Id, profile);
                Console.WriteLine("User Meoo restored to Active status.");
            }
            else
            {
                Console.WriteLine("User Meoo not found.");
            }
        }
    }
}
