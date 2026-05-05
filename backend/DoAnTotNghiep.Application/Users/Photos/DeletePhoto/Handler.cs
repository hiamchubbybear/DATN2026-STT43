using DoAnTotNghiep.Application.Common;
using DoAnTotNghiep.Application.Exception;
using DoAnTotNghiep.Domain.Users;
using MediatR;

namespace DoAnTotNghiep.Application.Users.Photos.DeletePhoto
{
    public class Handler : IRequestHandler<DeletePhotoCommand>
    {
        private readonly IUserProfileRepository _repo;
        private readonly ICurrentUserService _current;
        private readonly IFileStorageService _storage;
        private readonly ICacheService _cache;

        public Handler(IUserProfileRepository repo, ICurrentUserService current, 
            IFileStorageService storage, ICacheService cache)
        {
            _repo = repo;
            _current = current;
            _storage = storage;
            _cache = cache;
        }

        public async Task Handle(DeletePhotoCommand request, CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(_current.UserId!);
            var profile = await _repo.GetByUserIdAsync(userId);

            if (profile == null)
                throw new NotFoundException("Profile not found");

            var photo = profile.Photos
                .FirstOrDefault(x => x.Id == request.PhotoId);

            if (photo == null)
                throw new NotFoundException("Photo not found");

            await _storage.DeleteAsync(photo.Url);

            profile.RemovePhoto(photo.Id);

            if (!string.IsNullOrEmpty(photo.ThumbnailUrl))
            {
                await _storage.DeleteAsync(photo.ThumbnailUrl);
            }

            profile.RemovePhoto(photo.Id);

            await _repo.UpdateAsync(profile);

            await _cache.RemoveAsync($"user:{userId}:photos");
        }
    }
}
