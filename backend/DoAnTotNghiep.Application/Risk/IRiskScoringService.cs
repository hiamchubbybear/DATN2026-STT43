using System.Threading;
using System.Threading.Tasks;
using DoAnTotNghiep.Domain.Risk;

namespace DoAnTotNghiep.Application.Risk;

/// <summary>
/// Abstraction over the AI scam-detection service. Implementations MUST
/// degrade gracefully: when the service is disabled, unreachable, or returns
/// an error, return <c>null</c> so the chat / profile pipelines continue to
/// function. The caller is responsible for treating <c>null</c> as
/// "not scored" rather than "low risk".
/// </summary>
public interface IRiskScoringService
{
    Task<RiskScore?> ScoreMessageAsync(
        ScoreMessageRequest request,
        CancellationToken cancellationToken = default);
}
