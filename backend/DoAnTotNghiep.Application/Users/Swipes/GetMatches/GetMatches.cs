using DoAnTotNghiep.Application.Common;
using DoAnTotNghiep.Application.Users.Profile;
using DoAnTotNghiep.Domain.Users;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Application.Users.Swipes.GetMatches
{
    public record MatchDto(
        Guid UserId,
        string DisplayName,
        string AvatarUrl,
        DateTime MatchedAt,
        bool IsIdentityVerified
    );

    public record GetMatchesQuery(Guid UserId) : IRequest<List<MatchDto>>;

    public class GetMatchesHandler : IRequestHandler<GetMatchesQuery, List<MatchDto>>
    {
        private readonly ISwipeRepository _swipeRepository;
        private readonly IUserProfileRepository _profileRepository;

        public GetMatchesHandler(ISwipeRepository swipeRepository, IUserProfileRepository profileRepository)
        {
            _swipeRepository = swipeRepository;
            _profileRepository = profileRepository;
        }

        public async Task<List<MatchDto>> Handle(GetMatchesQuery request, CancellationToken cancellationToken)
        {
            var matches = await _swipeRepository.GetMatchesAsync(request.UserId);
            var result = new List<MatchDto>();

            foreach (var match in matches)
            {
                var otherUserId = match.UserOneId == request.UserId ? match.UserTwoId : match.UserOneId;
                var profile = await _profileRepository.GetByUserIdAsync(otherUserId);
                
                if (profile != null)
                {
                    result.Add(new MatchDto(
                        otherUserId,
                        profile.BasicInfo.DisplayName,
                        profile.Photos.FirstOrDefault(p => p.IsPrimary)?.Url ?? "",
                        match.MatchedAt,
                        profile.IsIdentityVerified
                    ));
                }
            }

            return result;
        }
    }
}
