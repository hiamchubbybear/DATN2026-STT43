using DoAnTotNghiep.Application.Common;
using DoAnTotNghiep.Application.Exception;
using DoAnTotNghiep.Domain.Users;
using MediatR;
using MongoDB.Driver;

namespace DoAnTotNghiep.Application.Users.Photos.ReorderPhotos
{
    public class Handler : IRequestHandler<ReoderPhotosCommand>
    {
        private readonly IUserProfileRepository _repo;
        private readonly ICurrentUserService _current;
        private readonly ICacheService _cache;

        public Handler(IUserProfileRepository repo, ICurrentUserService current, 
            ICacheService cache)
        {
            _repo = repo;
            _current = current;
            _cache = cache;
        }

        public async Task Handle(ReoderPhotosCommand request, CancellationToken cancellationToken)
        {
            if (!Guid.TryParse(_current.UserId, out var userId))
                throw new UnauthorizedException("Invalid user");
            var profile = await _repo.GetByUserIdAsync(userId);
            if (profile == null)
                throw new NotFoundException("Profile not found");
            profile.ReorderPhotos(request.PhotoIds);
            await _repo.UpdateAsync(profile);
            await _cache.RemoveAsync($"user:{userId}:photos");
        }
    }
}
