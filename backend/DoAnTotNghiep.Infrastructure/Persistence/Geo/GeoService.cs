using DoAnTotNghiep.Application.Common;
using DoAnTotNghiep.Domain.Users;

namespace DoAnTotNghiep.Infrastructure.Persistence.Geo
{
    public class GeoService : IGeoService
    {
        private const double EarthRadiusKm = 6371.0;
        public double CalculateDistance(UserProfile me, UserProfile candidate)
        {
            double dLat = ToRad(candidate.Latitude - me.Latitude);
            double dLon = ToRad(candidate.Longitude - me.Longitude);

            double lat1 = ToRad(me.Latitude);
            double lat2 = ToRad(candidate.Latitude);

            double sinDLat = Math.Sin(dLat / 2);
            double sinDLon = Math.Sin(dLon / 2);
            
            double h = sinDLat * sinDLat + Math.Cos(lat1) * Math.Cos(lat2) * sinDLon * sinDLon;
            
            double c = 2 * Math.Atan2(Math.Sqrt(h), Math.Sqrt(1 - h));
            
            return EarthRadiusKm * c;
        }

        private double ToRad(double angle) => angle * Math.PI / 180.0;
    }
}
