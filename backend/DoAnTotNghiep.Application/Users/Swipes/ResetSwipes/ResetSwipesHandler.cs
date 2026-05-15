using DoAnTotNghiep.Application.Common;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Application.Users.Swipes.ResetSwipes;

public record ResetSwipesCommand : IRequest<bool>;

public class ResetSwipesHandler : IRequestHandler<ResetSwipesCommand, bool>
{
    private readonly ISwipeRepository _swipeRepository;
    private readonly ICurrentUserService _currentUserService;

    public ResetSwipesHandler(ISwipeRepository swipeRepository, ICurrentUserService currentUserService)
    {
        _swipeRepository = swipeRepository;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(ResetSwipesCommand request, CancellationToken cancellationToken)
    {
        if (_currentUserService.UserId == null) return false;
        var userId = Guid.Parse(_currentUserService.UserId);
        
        Console.WriteLine($"[Swipe] Resetting swipes for user: {userId}");
        await _swipeRepository.ClearSwipesAsync(userId);
        Console.WriteLine($"[Swipe] Reset completed for user: {userId}");
        return true;
    }
}
