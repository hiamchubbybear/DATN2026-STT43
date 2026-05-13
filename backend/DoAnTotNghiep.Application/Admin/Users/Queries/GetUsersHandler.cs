using DoAnTotNghiep.Application.Admin.Users.Dtos;
using DoAnTotNghiep.Domain.Users;
using MediatR;

namespace DoAnTotNghiep.Application.Admin.Users.Queries
{
    public class GetUsersHandler : IRequestHandler<GetUsersQuery, List<UserAdminDto>>
    {
        private readonly IUserProfileRepository _repo;
        public GetUsersHandler(IUserProfileRepository repo)
        {
            _repo = repo;
        }

        public async Task<List<UserAdminDto>> Handle(GetUsersQuery request, CancellationToken ct)
        {
            var filter = new UserSearchFilter
            {
                Page = request.Page,
                PageSize = request.PageSize,
                Search = request.Search,
                Status = request.Status
            };
            var users = await _repo.SearchAsync(filter);

            return users.Select(x => new UserAdminDto(
                x.UserId,
                x.BasicInfo.DisplayName,
                x.BasicInfo.Age,
                x.Email ?? "",
                x.LocationName,
                x.Status.ToString(),
                x.CreatedAt
            )).ToList();
        }
    }
}
