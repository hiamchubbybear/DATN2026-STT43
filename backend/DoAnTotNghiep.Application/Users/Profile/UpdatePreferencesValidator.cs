using FluentValidation;

namespace DoAnTotNghiep.Application.Users.Profile
{
    public class UpdatePreferencesValidator : AbstractValidator<UpdatePreferencesCommand>
    {
        public UpdatePreferencesValidator()
        {
            RuleFor(x => x.MinAgePreference)
                .InclusiveBetween(18, 100).WithMessage("Minimum age preference must be between 18 and 100.");

            RuleFor(x => x.MaxAgePreference)
                .InclusiveBetween(18, 100).WithMessage("Maximum age preference must be between 18 and 100.")
                .GreaterThanOrEqualTo(x => x.MinAgePreference).WithMessage("Maximum age must be greater than or equal to minimum age.");

            RuleFor(x => x.MaxDistanceKm)
                .GreaterThan(0).WithMessage("Maximum distance must be greater than 0.");
        }
    }
}
