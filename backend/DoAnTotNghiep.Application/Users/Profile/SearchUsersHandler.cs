using DoAnTotNghiep.Domain.Users;
using DoAnTotNghiep.Application.Common;
using MediatR;

namespace DoAnTotNghiep.Application.Users.Profile;

public class SearchUsersHandler(IUserRepository userRepository, IUserProfileRepository profileRepository, ICurrentUserService currentUser) 
    : IRequestHandler<SearchUsersQuery, List<UserSearchDto>>
{
    private readonly ICurrentUserService _currentUser = currentUser;

    public async Task<List<UserSearchDto>> Handle(SearchUsersQuery request, CancellationToken cancellationToken)
    {
        var users = await userRepository.ListAllAsync();
        var profiles = await profileRepository.ListAllAsync();
        
        var profileDict = profiles.ToDictionary(p => p.UserId, p => p);
        var currentUserId = Guid.TryParse(_currentUser.UserId, out var guid) ? guid : Guid.Empty;

        return users
            .Where(u => u.Id != currentUserId)
            .Select(u => {
                var profile = profileDict.GetValueOrDefault(u.Id);
                var displayName = profile?.BasicInfo.DisplayName ?? u.Username;
                var avatarUrl = profile?.Photos.OrderBy(p => p.Order).FirstOrDefault(p => p.IsPrimary)?.Url 
                                ?? profile?.Photos.OrderBy(p => p.Order).FirstOrDefault()?.Url;
                
                return new UserSearchDto(u.Id, displayName, u.Email, avatarUrl);
            }).ToList();
    }
}
