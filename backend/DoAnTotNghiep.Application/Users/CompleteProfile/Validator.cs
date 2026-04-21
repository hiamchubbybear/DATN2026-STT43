using FluentValidation;
using System;

namespace DoAnTotNghiep.Application.Users.CompleteProfile
{
    public class Validator : AbstractValidator<CompleteProfileCommand>
    {
        public Validator()
        {
            RuleFor(x => x.DisplayName)
                .NotEmpty().WithMessage("Display name is required.")
                .Length(3, 50).WithMessage("Display name must be between 3 and 50 characters.");

            RuleFor(x => x.Dob)
                .NotEmpty().WithMessage("Date of birth is required.")
                .Must(BeAtLeast18).WithMessage("You must be at least 18 years old.");

            RuleFor(x => x.Gender)
                .NotEmpty().WithMessage("Gender is required.");
        }

        private bool BeAtLeast18(DateTime dob)
        {
            var today = DateTime.Today;
            var age = today.Year - dob.Year;
            if (dob.Date > today.AddYears(-age)) age--;
            return age >= 18;
        }
    }
}
