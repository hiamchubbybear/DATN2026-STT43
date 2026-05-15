using DoAnTotNghiep.Domain.Common;
using System;
using System.Collections.Generic;

namespace DoAnTotNghiep.Domain.Chat;

public class ChatMessage : BaseEntity
{
    public Guid ConversationId { get; private set; }
    public string SenderId { get; private set; } = string.Empty;
    public string ClientMsgId { get; private set; } = string.Empty; // For idempotency
    
    // E2EE
    public bool IsEncrypted { get; private set; }
    public string Ciphertext { get; private set; } = string.Empty;
    public List<EncryptedKey> EncryptedKeys { get; private set; } = new();

    // Plaintext (if IsEncrypted = false)
    public string Content { get; private set; } = string.Empty;

    // Delivery and read status for multi-device
    public List<string> DeliveredToDeviceIds { get; private set; } = new();
    public List<string> ReadByDeviceIds { get; private set; } = new();

    private ChatMessage() { } // ORM

    public static ChatMessage CreatePlaintext(Guid conversationId, string senderId, string clientMsgId, string content)
    {
        return new ChatMessage
        {
            ConversationId = conversationId,
            SenderId = senderId,
            ClientMsgId = clientMsgId,
            IsEncrypted = false,
            Content = content
        };
    }

    public static ChatMessage CreateEncrypted(Guid conversationId, string senderId, string clientMsgId, string ciphertext, List<EncryptedKey> keys)
    {
        return new ChatMessage
        {
            ConversationId = conversationId,
            SenderId = senderId,
            ClientMsgId = clientMsgId,
            IsEncrypted = true,
            Ciphertext = ciphertext,
            EncryptedKeys = keys
        };
    }

    public void MarkAsDelivered(string deviceId)
    {
        if (!DeliveredToDeviceIds.Contains(deviceId))
        {
            DeliveredToDeviceIds.Add(deviceId);
            SetUpdated();
        }
    }

    public void MarkAsRead(string deviceId)
    {
        if (!ReadByDeviceIds.Contains(deviceId))
        {
            ReadByDeviceIds.Add(deviceId);
            SetUpdated();
        }
    }

    public void Encrypt(IEncryptionService encryptionService)
    {
        if (!string.IsNullOrEmpty(Content))
        {
            Content = encryptionService.Encrypt(Content);
        }
    }

    public void Decrypt(IEncryptionService encryptionService)
    {
        if (!string.IsNullOrEmpty(Content))
        {
            Content = encryptionService.Decrypt(Content);
        }
    }
}

public class EncryptedKey
{
    public string DeviceId { get; set; } = string.Empty;
    public string KeyId { get; set; } = string.Empty;
    public string EncryptedMessageKey { get; set; } = string.Empty;
}
