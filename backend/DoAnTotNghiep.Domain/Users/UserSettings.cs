using DoAnTotNghiep.Domain.Common;

namespace DoAnTotNghiep.Domain.Users;

public class UserSettings : BaseEntity
{
    public Guid UserId { get; private set; }

    // Notification Settings
    public bool EnablePushNotifications { get; private set; } = true;
    public bool EnableEmailNotifications { get; private set; } = true;
    public bool NewMatchNotification { get; private set; } = true;
    public bool NewMessageNotification { get; private set; } = true;

    // Privacy Settings
    public bool ShowOnlineStatus { get; private set; } = true;
    public bool IncognitoMode { get; private set; } = false;
    public bool AllowDiscovery { get; private set; } = true;

    // App Preferences
    public string Theme { get; private set; } = "Light"; // Light, Dark, System
    public string Language { get; private set; } = "vi";

    private UserSettings() { }

    public UserSettings(Guid userId)
    {
        UserId = userId;
    }

    public void UpdateNotifications(bool push, bool email, bool match, bool message)
    {
        EnablePushNotifications = push;
        EnableEmailNotifications = email;
        NewMatchNotification = match;
        NewMessageNotification = message;
        SetUpdated();
    }

    public void UpdatePrivacy(bool showOnline, bool incognito, bool allowDiscovery)
    {
        ShowOnlineStatus = showOnline;
        IncognitoMode = incognito;
        AllowDiscovery = allowDiscovery;
        SetUpdated();
    }

    public void UpdateTheme(string theme)
    {
        Theme = theme;
        SetUpdated();
    }
}
