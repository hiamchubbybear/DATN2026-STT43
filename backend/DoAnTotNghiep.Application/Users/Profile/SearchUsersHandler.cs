using DoAnTotNghiep.Domain.Users;
using MediatR;

namespace DoAnTotNghiep.Application.Users.Profile;

public class SearchUsersHandler(IUserRepository userRepository, IUserProfileRepository profileRepository) 
    : IRequestHandler<SearchUsersQuery, List<UserSearchDto>>
{
    public async Task<List<UserSearchDto>> Handle(SearchUsersQuery request, CancellationToken cancellationToken)
    {
        var users = await userRepository.ListAllAsync();
        var profiles = await profileRepository.ListAllAsync();
        
        var profileDict = profiles.ToDictionary(p => p.UserId, p => p.BasicInfo.DisplayName);

        return users.Select(u => new UserSearchDto(
            u.Id, 
            profileDict.TryGetValue(u.Id, out var displayName) && !string.IsNullOrEmpty(displayName) 
                ? displayName 
                : u.Username, 
            u.Email
        )).ToList();
    }
}
