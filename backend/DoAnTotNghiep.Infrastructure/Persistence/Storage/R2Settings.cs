using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Infrastructure.Persistence.Storage
{
    public class R2Settings
    {
        public string AccessKey { get; set; } = default!;
        public string SecretKey { get; set; } = default!;
        public string Endpoint { get; set; } = default!;
        public string BucketName { get; set; } = default!;
        public string PublicBaseUrl { get; set; } = default!;
    }
}
