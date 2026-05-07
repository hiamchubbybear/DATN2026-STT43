using DoAnTotNghiep.Application.Common;
using DoAnTotNghiep.Application.Exception;
using DoAnTotNghiep.Domain.Users;
using MediatR;

namespace DoAnTotNghiep.Application.Users.Photos.SetPrimaryPhoto
{
    public record SetPrimaryPhotoCommand(Guid PhotoId) : IRequest<bool>;

    public class Handler : IRequestHandler<SetPrimaryPhotoCommand, bool>
    {
        private readonly IUserProfileRepository _repo;
        private readonly ICurrentUserService _current;
        private readonly ICacheService _cache;

        public Handler(IUserProfileRepository repo, ICurrentUserService current, ICacheService cache)
        {
            _repo = repo;
            _current = current;
            _cache = cache;
        }

        public async Task<bool> Handle(SetPrimaryPhotoCommand request, CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(_current.UserId!);
            var profile = await _repo.GetByUserIdAsync(userId);

            if (profile == null)
                throw new NotFoundException("Profile not found");

            profile.SetPrimaryPhoto(request.PhotoId);

            await _repo.UpdateAsync(profile);
            await _cache.RemoveAsync($"user:{userId}:photos");

            return true;
        }
    }
}
