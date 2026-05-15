using DoAnTotNghiep.Application.Common;
using DoAnTotNghiep.Domain.Users;
using DoAnTotNghiep.Infrastructure.Persistence;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Http;

namespace DoAnTotNghiep.Infrastructure.Security
{
    public class JwtService : IJwtService, ICurrentUserService
    {
        private const int EXPIRE_TIME = 3;
        private readonly string _secretKey;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public string? UserId => _httpContextAccessor.HttpContext?.User?.FindFirstValue(JwtRegisteredClaimNames.Sub) 
                                 ?? _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        public string? Email => _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Email);
        public string? Role => _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Role);
        public bool IsAuthenticated => _httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated ?? false;

        public JwtService(IOptions<KeySettings> keySettings, IHttpContextAccessor httpContextAccessor)
        {
            _secretKey = keySettings.Value.SecretKey;
            _httpContextAccessor = httpContextAccessor;
        }

        public string GenerateAccessToken(UserAccount user)
        {
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Iat,
                    DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(),
                    ClaimValueTypes.Integer64),

                new Claim(ClaimTypes.Role, user.Role ?? "Client"),
                new Claim(JwtRegisteredClaimNames.Email, user.Email ?? "")
            };
            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_secretKey));
            var creds = new SigningCredentials(
                key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                issuer: "Mixer",
                audience: "Mixer",
                claims: claims,
                expires: DateTime.UtcNow.AddDays(EXPIRE_TIME),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public RefreshToken GenerateRefreshToken()
        {
            var randomBytes = new byte[32];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomBytes);
            return new RefreshToken
            {
                Token = Convert.ToBase64String(randomBytes),
                ExpireDate = DateTime.Now.AddDays(EXPIRE_TIME * 2)
            };
        }
    }
}