using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Application.Users.Photos.DeletePhoto
{
    public record DeletePhotoCommand(Guid PhotoId) : IRequest;
}
