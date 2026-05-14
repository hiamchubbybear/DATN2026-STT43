using FluentValidation;
using DoAnTotNghiep.Application.Users.Commands.Logout;

namespace DoAnTotNghiep.Application.Auth.Logout
{
    public class Validator : AbstractValidator<LogoutCommand>
    {
        public Validator()
        {
            RuleFor(x => x.RefreshToken)
                .NotEmpty().WithMessage("Refresh token is required.");
        }
    }
}
