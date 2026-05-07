using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Application.Common
{
    public interface IFileStorageService
    {
        Task DeleteAsync(string url);
        Task<string> UploadAsync(Stream stream, string key, string contentType);
    }
}
