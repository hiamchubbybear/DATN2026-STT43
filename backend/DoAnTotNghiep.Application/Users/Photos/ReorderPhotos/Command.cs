using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Application.Users.Photos.ReorderPhotos
{
    public record ReorderPhotosCommand(List<Guid> PhotoIds) : IRequest;
}
