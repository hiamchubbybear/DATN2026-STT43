using Microsoft.AspNetCore.Http;

namespace DoAnTotNghiep.Application.Common;

public interface IFileService
{
    Task<string> UploadFileAsync(IFormFile file, string folder);
    Task DeleteFileAsync(string url);
}
