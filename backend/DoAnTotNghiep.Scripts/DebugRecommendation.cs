using DoAnTotNghiep.Application.Common;
using DoAnTotNghiep.Domain.Users;
using DoAnTotNghiep.Domain.Enum;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Scripts
{
    public class DebugRecommendation
    {
        private readonly IMongoDbContext _context;
        public DebugRecommendation(IMongoDbContext context)
        {
            _context = context;
        }

        public async Task RunAsync(Guid currentUserId, string targetDisplayName)
        {
            var me = await _context.UserProfiles.Find(x => x.UserId == currentUserId).FirstOrDefaultAsync();
            if (me == null) {
                Console.WriteLine("Current user not found.");
                return;
            }

            var target = await _context.UserProfiles.Find(x => x.BasicInfo.DisplayName == targetDisplayName).FirstOrDefaultAsync();
            if (target == null) {
                Console.WriteLine($"Target user '{targetDisplayName}' not found.");
                return;
            }

            Console.WriteLine($"--- Debugging Recommendation for {me.BasicInfo.DisplayName} looking for {targetDisplayName} ---");
            Console.WriteLine($"Me: Gender={me.BasicInfo.Gender}, LookingFor={me.LookingFor}, MaxDist={me.MaxDistanceKm}");
            Console.WriteLine($"Target: Gender={target.BasicInfo.Gender}, LookingFor={target.LookingFor}, Status={target.Status}");

            // 1. Status Check
            bool statusOk = target.Status == UserStatus.Active || target.Status == UserStatus.ShadowBanned;
            Console.WriteLine($"1. Status OK: {statusOk} (Status is {target.Status})");

            // 2. Gender Check (Me looking for Target)
            bool genderMatch1 = false;
            if (me.LookingFor == GenderPreference.Everyone) genderMatch1 = true;
            else if (me.LookingFor == GenderPreference.Male && target.BasicInfo.Gender == Gender.Male) genderMatch1 = true;
            else if (me.LookingFor == GenderPreference.Female && target.BasicInfo.Gender == Gender.Female) genderMatch1 = true;
            Console.WriteLine($"2. Me looking for Target: {genderMatch1} (Me wants {me.LookingFor}, Target is {target.BasicInfo.Gender})");

            // 3. Reciprocal Gender Check (Target looking for Me)
            bool genderMatch2 = false;
            if (target.LookingFor == GenderPreference.Everyone) genderMatch2 = true;
            else if (target.LookingFor == GenderPreference.Male && me.BasicInfo.Gender == Gender.Male) genderMatch2 = true;
            else if (target.LookingFor == GenderPreference.Female && me.BasicInfo.Gender == Gender.Female) genderMatch2 = true;
            Console.WriteLine($"3. Target looking for Me: {genderMatch2} (Target wants {target.LookingFor}, Me is {me.BasicInfo.Gender})");

            // 4. Distance Check
            double distance = CalculateDistance(me, target);
            bool distOk = distance <= me.MaxDistanceKm || (me.Latitude == 0 || target.Latitude == 0);
            Console.WriteLine($"4. Distance OK: {distOk} (Distance: {distance:F2}km, Max: {me.MaxDistanceKm}km)");

            // 5. Photo Check
            bool photoOk = target.Photos.Count > 0;
            Console.WriteLine($"5. Photo OK: {photoOk} (Count: {target.Photos.Count})");

            Console.WriteLine($"--- FINAL RESULT: {(statusOk && genderMatch1 && genderMatch2 && distOk && photoOk ? "SHOULD SHOW" : "FILTERED OUT")} ---");
        }

        private double CalculateDistance(UserProfile me, UserProfile target)
        {
            if (me.Latitude == 0 || target.Latitude == 0) return 0;
            double dLat = ToRad(target.Latitude - me.Latitude);
            double dLon = ToRad(target.Longitude - me.Longitude);
            double a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                       Math.Cos(ToRad(me.Latitude)) * Math.Cos(ToRad(target.Latitude)) *
                       Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
            double c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            return 6371.0 * c;
        }
        private double ToRad(double angle) => angle * Math.PI / 180.0;
    }
}
