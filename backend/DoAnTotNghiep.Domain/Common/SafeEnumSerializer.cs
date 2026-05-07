using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Serializers;
using System;

namespace DoAnTotNghiep.Domain.Common;

public class SafeEnumSerializer<TEnum> : SerializerBase<TEnum> where TEnum : struct, System.Enum
{
    public override TEnum Deserialize(BsonDeserializationContext context, BsonDeserializationArgs args)
    {
        var type = context.Reader.GetCurrentBsonType();
        if (type == BsonType.String)
        {
            var s = context.Reader.ReadString();
            if (System.Enum.TryParse<TEnum>(s, true, out var result))
            {
                return result;
            }
        }
        else if (type == BsonType.Int32)
        {
            return (TEnum)(object)context.Reader.ReadInt32();
        }
        else
        {
            context.Reader.SkipValue();
        }

        return default;
    }

    public override void Serialize(BsonSerializationContext context, BsonSerializationArgs args, TEnum value)
    {
        context.Writer.WriteString(value.ToString());
    }
}
