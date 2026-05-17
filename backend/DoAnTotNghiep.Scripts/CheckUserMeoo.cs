using DoAnTotNghiep.Application.Common;
using DoAnTotNghiep.Domain.Users;
using MongoDB.Driver;
using System;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Scripts
{
    public class CheckUserMeoo
    {
        private readonly IMongoDbContext _context;
        public CheckUserMeoo(IMongoDbContext context)
        {
            _context = context;
        }

        public async Task RunAsync()
        {
            var userId = Guid.Parse("c8f90e97-180b-4765-ae75-2148302ef235");
            var profile = await _context.UserProfiles.Find(x => x.UserId == userId).FirstOrDefaultAsync();
            if (profile != null)
            {
                Console.WriteLine($"User: {profile.BasicInfo.DisplayName}");
                Console.WriteLine($"Gender: {profile.BasicInfo.Gender}");
                Console.WriteLine($"LookingFor: {profile.LookingFor}");
                Console.WriteLine($"Status: {profile.Status}");
                Console.WriteLine($"PhotoCount: {profile.Photos.Count}");
            }
            else
            {
                Console.WriteLine("User Meoo not found.");
            }
        }
    }
}
