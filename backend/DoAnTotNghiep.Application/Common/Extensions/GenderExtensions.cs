using DoAnTotNghiep.Domain.Enum;

namespace DoAnTotNghiep.Application.Common.Extensions;

public static class GenderExtensions
{
    public static GenderPreference ToPreference(this Gender gender)
    {
        return gender switch
        {
            Gender.Male => GenderPreference.Male,
            Gender.Female => GenderPreference.Female,
            _ => GenderPreference.Everyone
        };
    }
    public static Gender ToGender(this GenderPreference preference)
    {
        return preference switch
        {
            GenderPreference.Male => Gender.Male,
            GenderPreference.Female => Gender.Female,
            _ => Gender.Other
        };
    }
}