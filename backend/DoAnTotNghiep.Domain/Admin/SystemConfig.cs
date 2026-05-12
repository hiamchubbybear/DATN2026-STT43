using DoAnTotNghiep.Domain.Common;

namespace DoAnTotNghiep.Domain.Admin;

public class SystemConfig : BaseEntity
{
    public string Key { get; private set; } = null!; // e.g., "MIN_AGE", "MAINTENANCE_MODE"
    public string Value { get; private set; } = null!;
    public string Description { get; private set; } = null!;

    private SystemConfig() { }

    public SystemConfig(string key, string value, string description)
    {
        Key = key;
        Value = value;
        Description = description;
    }

    public void UpdateValue(string newValue)
    {
        Value = newValue;
        SetUpdated();
    }
}
