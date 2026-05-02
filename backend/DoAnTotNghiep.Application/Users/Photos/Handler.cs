using DoAnTotNghiep.Application.Common;
using DoAnTotNghiep.Application.Exception;
using DoAnTotNghiep.Domain.Users;
using MediatR;


namespace DoAnTotNghiep.Application.Users.Photos
{
    public class Handler : IRequestHandler<UploadPhotoCommand, string>
    {
        private readonly IUserProfileRepository _repo;
        private readonly ICurrentUserService _currentUser;
        private readonly IFileStorageService _storage;
        private readonly ICacheService _cache;

        public Handler(
            IUserProfileRepository repo,
            ICurrentUserService currentUser,
            IFileStorageService storage,
            ICacheService cache)
        {
            _repo = repo;
            _currentUser = currentUser;
            _storage = storage;
            _cache = cache;
        }

        public async Task<string> Handle(UploadPhotoCommand request, CancellationToken cancellationToken)
        {
            var userId = _currentUser.UserId;

            var profile = await _repo.GetByUserIdAsync(Guid.TryParse(userId, out var guid) ? guid : throw new NotFoundException("Guid not found"));

            if (profile == null)
                throw new NotFoundException("Profile not found");

            if (profile.Photos.Count >= 6)
                throw new BadRequestException("Max 6 photos");

            var ext = Path.GetExtension(request.File.FileName);

            var key = $"users/{userId}/photos/{Guid.NewGuid()}{ext}";

            using var stream = request.File.OpenReadStream();

            var url = await _storage.UploadAsync(
                stream,
                key,
                request.File.ContentType);

            var photo = new Photo
            {
                Url = url,
                Order = profile.Photos.Count,
                IsPrimary = profile.Photos.Count == 0
            };

            profile.AddPhoto(photo);

            await _repo.UpdateAsync(profile);

            await _cache.RemoveAsync($"user:{userId}:photos");

            return url;
        }
    }
}
