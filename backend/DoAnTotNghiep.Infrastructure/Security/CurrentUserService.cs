using Microsoft.AspNetCore.Http;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using DoAnTotNghiep.Application.Common;
namespace DoAnTotNghiep.Infrastructure.Security;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _ctx;

    public CurrentUserService(IHttpContextAccessor ctx)
        => _ctx = ctx;

    private ClaimsPrincipal? User => _ctx.HttpContext?.User;

    public string? UserId => User?.FindFirst(JwtRegisteredClaimNames.Sub)?.Value 
                             ?? User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    public string? Email => User?.FindFirst(JwtRegisteredClaimNames.Email)?.Value;
    public string? Role => User?.FindFirst(ClaimTypes.Role)?.Value;
    public bool IsAuthenticated =>
        _ctx.HttpContext?.User?.Identity?.IsAuthenticated
        ?? false;
}