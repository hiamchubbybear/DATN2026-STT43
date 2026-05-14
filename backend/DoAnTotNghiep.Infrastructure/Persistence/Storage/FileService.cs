using DoAnTotNghiep.Application.Common;
using Microsoft.AspNetCore.Http;

namespace DoAnTotNghiep.Infrastructure.Persistence.Storage;

public class FileService : IFileService
{
    private readonly IFileStorageService _storageService;

    public FileService(IFileStorageService storageService)
    {
        _storageService = storageService;
    }

    public async Task<string> UploadFileAsync(IFormFile file, string folder)
    {
        if (file == null || file.Length == 0)
            return string.Empty;

        var fileName = $"{folder}/{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        using var stream = file.OpenReadStream();
        return await _storageService.UploadAsync(stream, fileName, file.ContentType);
    }

    public async Task DeleteFileAsync(string url)
    {
        if (string.IsNullOrEmpty(url)) return;
        await _storageService.DeleteAsync(url);
    }
}
