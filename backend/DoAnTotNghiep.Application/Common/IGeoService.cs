using DoAnTotNghiep.Domain.Users;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Application.Common
{
    public interface IGeoService
    {
        double CalculateDistance(UserProfile me, UserProfile candidate);
    }
}
