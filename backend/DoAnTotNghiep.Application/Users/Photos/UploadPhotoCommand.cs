using MediatR;
using Microsoft.AspNetCore.Http;

namespace DoAnTotNghiep.Application.Users.Photos
{
    public record UploadPhotoCommand(IFormFile File) : IRequest<string>;
}
