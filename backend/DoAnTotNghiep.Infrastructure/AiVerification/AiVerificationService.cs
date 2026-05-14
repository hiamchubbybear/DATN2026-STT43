using System.Net.Http.Json;
using DoAnTotNghiep.Application.Common;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;

namespace DoAnTotNghiep.Infrastructure.AiVerification;

public class AiVerificationService : IAiVerificationService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<AiVerificationService> _logger;
    private readonly string _baseUrl;

    public AiVerificationService(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<AiVerificationService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _baseUrl = configuration["AiService:BaseUrl"] ?? "http://localhost:8000";
    }

    public async Task<LivenessResultDto?> VerifyLivenessAsync(Stream imageStream, string fileName, CancellationToken ct = default)
    {
        try
        {
            using var content = new MultipartFormDataContent();
            using var streamContent = new StreamContent(imageStream);
            content.Add(streamContent, "image", fileName);

            var response = await _httpClient.PostAsync($"{_baseUrl}/api/v1/verify-liveness", content, ct);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync(ct);
                _logger.LogError("AI Liveness API error: {StatusCode}, {Error}", response.StatusCode, error);
                return null;
            }

            return await response.Content.ReadFromJsonAsync<LivenessResultDto>(cancellationToken: ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling AI Liveness API");
            return null;
        }
    }

    public async Task<FaceCompareResultDto?> CompareFacesAsync(Stream selfieStream, string selfieName, Stream idPhotoStream, string idPhotoName, CancellationToken ct = default)
    {
        try
        {
            using var content = new MultipartFormDataContent();
            
            using var selfieContent = new StreamContent(selfieStream);
            content.Add(selfieContent, "selfie", selfieName);

            using var idContent = new StreamContent(idPhotoStream);
            content.Add(idContent, "id_photo", idPhotoName);

            var response = await _httpClient.PostAsync($"{_baseUrl}/api/v1/compare-faces", content, ct);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync(ct);
                _logger.LogError("AI Face Compare API error: {StatusCode}, {Error}", response.StatusCode, error);
                return null;
            }

            return await response.Content.ReadFromJsonAsync<FaceCompareResultDto>(cancellationToken: ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling AI Face Compare API");
            return null;
        }
    }

    public async Task<DocumentVerifyResultDto?> VerifyDocumentAsync(Stream imageStream, string fileName, CancellationToken ct = default)
    {
        try
        {
            using var content = new MultipartFormDataContent();
            using var streamContent = new StreamContent(imageStream);
            content.Add(streamContent, "image", fileName);

            var response = await _httpClient.PostAsync($"{_baseUrl}/api/v1/verify-document", content, ct);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync(ct);
                _logger.LogError("AI Document Verify API error: {StatusCode}, {Error}", response.StatusCode, error);
                return null;
            }

            return await response.Content.ReadFromJsonAsync<DocumentVerifyResultDto>(cancellationToken: ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling AI Document Verify API");
            return null;
        }
    }
}
