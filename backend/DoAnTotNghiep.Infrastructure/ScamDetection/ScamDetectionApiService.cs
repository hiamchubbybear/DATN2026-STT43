using System.Net.Http.Json;
using DoAnTotNghiep.Application.Common;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace DoAnTotNghiep.Infrastructure.ScamDetection;

/// <summary>
/// Calls the Python AI microservice's /api/v1/detect-scam endpoint.
/// Non-fatal: returns null on any HTTP or network error so that callers
/// can fall back to the rule-based FraudDetectionService.
/// </summary>
public class ScamDetectionApiService : IScamDetectionService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<ScamDetectionApiService> _logger;
    private readonly string _baseUrl;

    public ScamDetectionApiService(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<ScamDetectionApiService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _baseUrl = configuration["AiService:BaseUrl"] ?? "http://localhost:8000";
    }

    public async Task<ScamDetectionResultDto?> PredictAsync(
        ScamFeaturesDto features,
        CancellationToken ct = default)
    {
        try
        {
            var response = await _httpClient.PostAsJsonAsync(
                $"{_baseUrl}/api/v1/detect-scam",
                features,
                ct);

            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync(ct);
                _logger.LogError(
                    "Scam detection API returned {StatusCode}: {Body}",
                    response.StatusCode, body);
                return null;
            }

            return await response.Content
                .ReadFromJsonAsync<ScamDetectionResultDto>(cancellationToken: ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling scam detection API at {Url}", _baseUrl);
            return null;
        }
    }
}
