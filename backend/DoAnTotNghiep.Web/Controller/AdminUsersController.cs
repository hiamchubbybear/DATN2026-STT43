using DoAnTotNghiep.Application.Admin.Users.Commands;
using DoAnTotNghiep.Application.Admin.Users.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DoAnTotNghiep.Web.Controller
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/admin/users")]
    public class AdminUsersController : ControllerBase
    {
        private readonly IMediator _mediator;

        public AdminUsersController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers([FromQuery] GetUsersQuery query)
        {
            var result = await _mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetDetail(Guid userId)
        {
            var result = await _mediator.Send(new GetUserDetailQuery(userId));
            return Ok(result);
        }

        [HttpPost("{userId}/moderate")]
        public async Task<IActionResult> Moderate(Guid userId, [FromBody] ModerateUserCommand body)
        {
            await _mediator.Send(body with { UserId = userId });
            return Ok();
        }

        [HttpPost("{userId}/force-logout")]
        public async Task<IActionResult> ForceLogout(Guid userId)
        {
            await _mediator.Send(new ForceLogoutCommand(userId));
            return Ok();
        }
    }
}
