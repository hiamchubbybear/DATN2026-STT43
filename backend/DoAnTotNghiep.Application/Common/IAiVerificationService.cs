namespace DoAnTotNghiep.Application.Common;

/// <summary>
/// Service for communicating with the AI anti-spoofing microservice.
/// </summary>
public interface IAiVerificationService
{
    /// <summary>
    /// Check if the face in the image is real (not a photo/screen spoof).
    /// </summary>
    Task<LivenessResultDto?> VerifyLivenessAsync(Stream imageStream, string fileName, CancellationToken ct = default);

    /// <summary>
    /// Compare the face in a selfie with the face on an ID card photo.
    /// </summary>
    Task<FaceCompareResultDto?> CompareFacesAsync(Stream selfieStream, string selfieName, Stream idPhotoStream, string idPhotoName, CancellationToken ct = default);

    /// <summary>
    /// Check ID document quality and extract OCR text.
    /// </summary>
    Task<DocumentVerifyResultDto?> VerifyDocumentAsync(Stream imageStream, string fileName, CancellationToken ct = default);
}

public class LivenessResultDto
{
    public bool Success { get; set; }
    public int FacesDetected { get; set; }
    public List<LivenessFaceDto> Results { get; set; } = new();
    public string Message { get; set; } = string.Empty;
}

public class LivenessFaceDto
{
    public bool IsReal { get; set; }
    public string Status { get; set; } = string.Empty;
    public double Confidence { get; set; }
    public double LogitDiff { get; set; }
    public double RealLogit { get; set; }
    public double SpoofLogit { get; set; }
}

public class FaceCompareResultDto
{
    public bool Success { get; set; }
    public bool Match { get; set; }
    public double Similarity { get; set; }
    public string Message { get; set; } = string.Empty;
}

public class DocumentVerifyResultDto
{
    public bool Success { get; set; }
    public bool IsClear { get; set; }
    public bool IsBright { get; set; }
    public double BlurScore { get; set; }
    public double BrightnessScore { get; set; }
    public List<string> OcrText { get; set; } = new();
    public string Message { get; set; } = string.Empty;
}
