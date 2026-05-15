using MongoDB.Bson.Serialization.Attributes;

namespace DoAnTotNghiep.Domain.Common;

public class Point
{
    [BsonElement("type")]
    public string Type { get; set; } = "Point";

    [BsonElement("coordinates")]
    public double[] Coordinates { get; set; } = new double[2];

    public Point() { }

    public Point(double longitude, double latitude)
    {
        Type = "Point";
        Coordinates = new[] { longitude, latitude };
    }
}
