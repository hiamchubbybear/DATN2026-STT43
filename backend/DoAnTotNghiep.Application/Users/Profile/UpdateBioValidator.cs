using FluentValidation;

namespace DoAnTotNghiep.Application.Users.Profile
{
    public class UpdateBioValidator : AbstractValidator<UpdateBioCommand>
    {
        public UpdateBioValidator()
        {
            RuleFor(x => x.Bio)
                .MaximumLength(500).WithMessage("Bio must not exceed 500 characters.");

            RuleFor(x => x.Gender)
                .NotEmpty().WithMessage("Gender is required.");

            RuleFor(x => x.InterestedIn)
                .NotEmpty().WithMessage("InterestedIn is required.");
        }
    }
}
