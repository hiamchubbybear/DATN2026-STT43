using DoAnTotNghiep.Domain.Common;
using System;
using System.Collections.Generic;

namespace DoAnTotNghiep.Domain.Chat;

public class Conversation : BaseEntity
{
    public List<string> ParticipantIds { get; private set; } = new();
    public string? LastMessage { get; private set; }
    public DateTime? LastMessageAt { get; private set; }

    private Conversation() { }

    public static Conversation CreateP2P(string user1Id, string user2Id)
    {
        return new Conversation
        {
            ParticipantIds = new List<string> { user1Id, user2Id },
            LastMessageAt = DateTime.UtcNow
        };
    }

    public void UpdateLastMessage(string message)
    {
        LastMessage = message;
        LastMessageAt = DateTime.UtcNow;
        SetUpdated();
    }
}
