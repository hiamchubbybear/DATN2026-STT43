using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Application.Common
{
    public interface IBloomFilterService
    {
        Task<bool> MightContainAsync(string key, string value);
        Task AddAsync(string key, string value);
    }
}
