using DoAnTotNghiep.Application.Risk;
using DoAnTotNghiep.Domain.Risk;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Infrastructure.Risk;

/// <summary>
/// Typed <see cref="HttpClient"/> over the FastAPI scam-detection service.
/// Resilience (retry, circuit breaker, timeouts) is composed in DI via
/// <c>AddResilienceHandler</c>; this class only handles serialization,
/// authentication and graceful degradation.
/// </summary>
public sealed class RiskScoringClient : IRiskScoringService
{
    internal const string InternalTokenHeader = "X-Internal-Token";
    internal const string ScoreMessagePath = "/v1/score/message";

    private readonly HttpClient _httpClient;
    private readonly RiskScoringOptions _options;
    private readonly ILogger<RiskScoringClient> _logger;

    public RiskScoringClient(
        HttpClient httpClient,
        IOptions<RiskScoringOptions> options,
        ILogger<RiskScoringClient> logger)
    {
        _httpClient = httpClient;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<RiskScore?> ScoreMessageAsync(
        ScoreMessageRequest request,
        CancellationToken cancellationToken = default)
    {
        if (!_options.Enabled || _httpClient.BaseAddress is null)
        {
            return null;
        }

        try
        {
            var dto = new ScoreMessageRequestDto
            {
                MessageId = request.MessageId,
                ConversationId = request.ConversationId,
                SenderId = request.SenderId,
                ReceiverId = request.ReceiverId,
                Text = request.Text,
                Lang = request.Lang,
                Context = request.Context is { } c
                    ? new MessageContextDto
                    {
                        ConversationAgeSeconds = c.ConversationAgeSeconds,
                        MessagesInConversation = c.MessagesInConversation,
                        SenderAccountAgeDays = c.SenderAccountAgeDays,
                        SenderPriorReports = c.SenderPriorReports,
                    }
                    : null,
            };

            using var response = await _httpClient
                .PostAsJsonAsync(ScoreMessagePath, dto, cancellationToken)
                .ConfigureAwait(false);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning(
                    "RiskScoringClient: AI service returned {StatusCode} for message {MessageId}",
                    (int)response.StatusCode,
                    request.MessageId);
                return null;
            }

            var body = await response.Content
                .ReadFromJsonAsync<ScoreMessageResponseDto>(cancellationToken: cancellationToken)
                .ConfigureAwait(false);

            if (body is null)
            {
                _logger.LogWarning(
                    "RiskScoringClient: empty body for message {MessageId}",
                    request.MessageId);
                return null;
            }

            return new RiskScore(
                score: body.Score,
                labels: body.Labels ?? new List<string>(),
                modelVersion: string.IsNullOrWhiteSpace(body.ModelVersion) ? "unknown" : body.ModelVersion,
                scoredAt: DateTime.UtcNow,
                explanations: body.Explanations is null
                    ? new List<RiskExplanation>()
                    : body.Explanations.ConvertAll(e => new RiskExplanation
                    {
                        Feature = e.Feature,
                        Weight = e.Weight,
                    }));
        }
        catch (Exception ex) when (
            ex is HttpRequestException
                or TaskCanceledException
                or OperationCanceledException
                or TimeoutException
                or JsonException)
        {
            _logger.LogWarning(
                ex,
                "RiskScoringClient: failed to score message {MessageId}; degrading gracefully",
                request.MessageId);
            return null;
        }
    }

    private sealed class ScoreMessageRequestDto
    {
        [JsonPropertyName("message_id")] public Guid MessageId { get; set; }
        [JsonPropertyName("conversation_id")] public Guid ConversationId { get; set; }
        [JsonPropertyName("sender_id")] public Guid SenderId { get; set; }
        [JsonPropertyName("receiver_id")] public Guid ReceiverId { get; set; }
        [JsonPropertyName("text")] public string Text { get; set; } = string.Empty;
        [JsonPropertyName("lang")] public string? Lang { get; set; }
        [JsonPropertyName("context")] public MessageContextDto? Context { get; set; }
    }

    private sealed class MessageContextDto
    {
        [JsonPropertyName("conversation_age_seconds")] public int? ConversationAgeSeconds { get; set; }
        [JsonPropertyName("messages_in_conversation")] public int? MessagesInConversation { get; set; }
        [JsonPropertyName("sender_account_age_days")] public double? SenderAccountAgeDays { get; set; }
        [JsonPropertyName("sender_prior_reports")] public int? SenderPriorReports { get; set; }
    }

    private sealed class ScoreMessageResponseDto
    {
        [JsonPropertyName("message_id")] public Guid MessageId { get; set; }
        [JsonPropertyName("score")] public double Score { get; set; }
        [JsonPropertyName("labels")] public List<string>? Labels { get; set; }
        [JsonPropertyName("model_version")] public string? ModelVersion { get; set; }
        [JsonPropertyName("explanations")] public List<ExplanationDto>? Explanations { get; set; }
    }

    private sealed class ExplanationDto
    {
        [JsonPropertyName("feature")] public string Feature { get; set; } = string.Empty;
        [JsonPropertyName("weight")] public double Weight { get; set; }
    }
}
