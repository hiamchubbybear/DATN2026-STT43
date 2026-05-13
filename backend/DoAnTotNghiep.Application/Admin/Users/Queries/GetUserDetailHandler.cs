using DoAnTotNghiep.Application.Admin.Users.Dtos;
using DoAnTotNghiep.Application.Exception;
using DoAnTotNghiep.Domain.Users;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Application.Admin.Users.Queries
{
    public class GetUserDetailHandler : IRequestHandler<GetUserDetailQuery, UserDetailDto>
    {
        private readonly IUserProfileRepository _profileRepo;
        private readonly IUserRepository _userRepo;

        public GetUserDetailHandler(IUserProfileRepository profileRepo, IUserRepository userRepo)
        {
            _profileRepo = profileRepo;
            _userRepo = userRepo;
        }

        public async Task<UserDetailDto> Handle(GetUserDetailQuery request, CancellationToken ct)
        {
            var user = await _userRepo.GetByIdAsync(request.UserId)
                ?? throw new NotFoundException("User not found");
            var profile = await _profileRepo.GetByUserIdAsync(request.UserId)
                ?? throw new NotFoundException("User not found");

            return new UserDetailDto(
                profile.UserId,
                profile.BasicInfo.DisplayName,
                profile.BasicInfo.Age,
                user.Email ,
                profile.Bio ?? "",
                profile.LocationName,
                profile.Status.ToString(),
                profile.CreatedAt,
                profile.Photos.Select(p => p.Url).ToList()
            );
        }
    }
}
