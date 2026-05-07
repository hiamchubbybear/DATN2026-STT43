using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Application.Users.Photos
{
    public class Validator : AbstractValidator<UploadPhotoCommand>
    {
        private readonly string[] _allowedExtensions = { ".jpg", ".jpeg", ".png", ".webp" };
        private readonly string[] _allowedMimeTypes = { "image/jpeg", "image/png", "image/webp" };

        public Validator()
        {
            RuleFor(x => x.File)
                .NotNull()
                .Must(file => _allowedMimeTypes.Contains(file.ContentType.ToLower()))
                .WithMessage("Only JPEG, PNG, and WEBP images are allowed.")
                .Must(file => _allowedExtensions.Contains(Path.GetExtension(file.FileName).ToLower()))
                .WithMessage("Invalid file extension.");

            RuleFor(x => x.File.Length)
                .LessThanOrEqualTo(10 * 1024 * 1024)
                .WithMessage("Max 10MB");
        }
    }
}
