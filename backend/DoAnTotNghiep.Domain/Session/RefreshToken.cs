using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Domain.Users
{
    public class RefreshToken
    {
        public string Token { get; set; } = string.Empty;
        public DateTime ExpireDate { get; set; }
        public bool IsRevoked { get; set; }
        public DateTime? RevokedAt { get; set; }
        public bool IsActive => !IsRevoked && DateTime.UtcNow < ExpireDate;
        public void Revoke()
        {
            IsRevoked = true;
            RevokedAt = DateTime.UtcNow;
        }
    }
}
