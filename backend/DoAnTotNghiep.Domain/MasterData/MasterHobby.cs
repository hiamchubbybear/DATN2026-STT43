using DoAnTotNghiep.Domain.Common;

namespace DoAnTotNghiep.Domain.MasterData;

public class MasterHobby : BaseEntity
{
    public string Name { get; private set; } = null!;
    public string Category { get; private set; } = null!; // e.g., Sports, Music, Art
    public string Icon { get; private set; } = null!; // e.g., "football", "music-note"
    public bool IsActive { get; private set; } = true;

    private MasterHobby() { }

    public MasterHobby(string name, string category, string icon)
    {
        Name = name;
        Category = category;
        Icon = icon;
    }

    public void Deactivate() => IsActive = false;
    public void Activate() => IsActive = true;
}
