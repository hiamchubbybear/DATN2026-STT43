using DoAnTotNghiep.Application.Users.Profile;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Application.Users.Recommendation
{
    public record GetRecommendationsQuery(int Skip, int Take): IRequest<List<UserProfileDto>>;
}
