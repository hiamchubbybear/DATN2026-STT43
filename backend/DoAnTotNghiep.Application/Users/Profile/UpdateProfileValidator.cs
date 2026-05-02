using FluentValidation;

namespace DoAnTotNghiep.Application.Users.Profile
{
    public class UpdateProfileValidator : AbstractValidator<UpdateProfileCommand>
    {
        public UpdateProfileValidator()
        {
            // Basic Info rules
            RuleFor(x => x.DisplayName)
                .NotEmpty().WithMessage("Display name is required.")
                .MaximumLength(50).WithMessage("Display name must not exceed 50 characters.");

            // Bio rules
            RuleFor(x => x.Bio)
                .MaximumLength(500).WithMessage("Bio must not exceed 500 characters.");

            RuleFor(x => x.Gender)
                .NotEmpty().WithMessage("Gender is required.");

            RuleFor(x => x.InterestedIn)
                .NotEmpty().WithMessage("InterestedIn is required.");

            // Location rules
            RuleFor(x => x.Latitude)
                .InclusiveBetween(-90, 90).WithMessage("Latitude must be between -90 and 90.");

            RuleFor(x => x.Longitude)
                .InclusiveBetween(-180, 180).WithMessage("Longitude must be between -180 and 180.");

            RuleFor(x => x.LocationName)
                .NotEmpty().WithMessage("Location name is required.");

            // Preferences rules
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
