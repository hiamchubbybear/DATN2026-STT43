using DoAnTotNghiep.Domain.Enum;
using MediatR;

namespace DoAnTotNghiep.Application.Users.CompleteProfile;

public class CompleteProfileCommand : IRequest<bool>
{
    public Guid UserId { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public DateTime Dob { get; set; }
    public Gender Gender { get; set; } 
    public List<string> Languages { get; set; } = new();
    
    // Optional background info for first setup
    public string? Education { get; set; }
    public string? Occupation { get; set; }

    // Bio & Preferences
    public string? Bio { get; set; }
    public string? InterestedIn { get; set; }

    // Lifestyle
    public string? Drinking { get; set; }
    public string? Smoking { get; set; }
    public string? SocialLevel { get; set; }
    public string? PersonalityType { get; set; }
    public List<string>? LoveLanguage { get; set; }
    public List<string>? Hobbies { get; set; }
    public List<string>? Interests { get; set; }

    // Dating Style
    public List<string>? FreeTimePrefer { get; set; }
    public List<string>? DateStyle { get; set; }
}
