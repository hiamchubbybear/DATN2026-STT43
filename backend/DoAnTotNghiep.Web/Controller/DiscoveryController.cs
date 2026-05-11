using DoAnTotNghiep.Application.Users.Recommendation;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DoAnTotNghiep.Web.Controller
{
    [ApiController]
    [Route("api/discovery")]
    [Authorize]
    public class DiscoveryController : ControllerBase
    {
        private readonly IMediator _mediator;

        public DiscoveryController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("recommendations")]
        public async Task<ActionResult<RecommendationResponse>> GetRecommendations(
            [FromQuery] int take = 20,
            CancellationToken ct = default)
        {
            if (take <= 0 || take > 50)
                return BadRequest("Take must be between 1 and 50");

            IRequest<RecommendationResponse> query = new GetRecommendationsQuery(take);

            var result = await _mediator.Send(query);

            return Ok(result);
        }
    }
}
