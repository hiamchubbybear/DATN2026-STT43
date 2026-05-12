using System.ComponentModel.DataAnnotations;
using DoAnTotNghiep.Application;
using DoAnTotNghiep.Domain.Common;
using DoAnTotNghiep.Web.ExceptionHandler;
using FluentValidation;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using AppValidationException = DoAnTotNghiep.Web.ExceptionHandler.ValidationException;

public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;
    private readonly IHostEnvironment _env;

    public GlobalExceptionHandler(
        ILogger<GlobalExceptionHandler> logger,
        IHostEnvironment env)
    {
        _logger = logger;
        _env = env;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext context,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var traceId = context.TraceIdentifier;

        ApiErrorResponse response;

        if (exception is FluentValidation.ValidationException fluentValidationEx)
        {
            var errors = fluentValidationEx.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(e => e.ErrorMessage).Distinct().ToArray()
                );

            response = new ApiErrorResponse
            {
                Title = "Bad Request",
                Status = 400,
                Detail = fluentValidationEx.Message,
                Message = string.Join(" ", errors.SelectMany(x => x.Value)),
                ErrorCode = Error_Code.VALIDATION_FAILED,
                TraceId = traceId,
                Errors = errors
            };

            if (string.IsNullOrWhiteSpace(response.Message))
            {
                response.Message = "Du lieu nhap vao khong hop le.";
            }

            LogWarning(exception, traceId);
        }
        else if (exception is AppException appEx)
        {
            response = new ApiErrorResponse
            {
                Title = GetTitle(appEx.StatusCode),
                Status = appEx.StatusCode,
                Detail = appEx.Message,
                Message = appEx.Message,
                ErrorCode = appEx.ErrorCode,
                TraceId = traceId
            };

            if (appEx is AppValidationException valEx)
            {
                response.Errors = valEx.Errors;
                // Aggregate errors for a more useful message
                var errorMessages = valEx.Errors.SelectMany(x => x.Value);
                response.Message = string.Join(" ", errorMessages);
                if (string.IsNullOrEmpty(response.Message))
                {
                    response.Message = "Dữ liệu nhập vào không hợp lệ.";
                }
            }

            LogWarning(exception, traceId);
        }
        else
        {
            response = new ApiErrorResponse
            {
                Title = "Internal Server Error",
                Status = 500,
                Detail = _env.IsDevelopment()
                    ? exception.ToString()
                    : "Đã có lỗi hệ thống xảy ra.",
                Message = "Đã có lỗi hệ thống xảy ra. Vui lòng thử lại sau.",
                ErrorCode = Error_Code.UNKNOWN_ERROR,
                TraceId = traceId
            };

            LogError(exception, traceId);
        }

        context.Response.StatusCode = response.Status;

        await context.Response.WriteAsJsonAsync(response, cancellationToken);

        return true;
    }

    private void LogWarning(Exception ex, string traceId)
    {
        _logger.LogWarning(ex,
            "Handled | TraceId: {TraceId} | {Message}",
            traceId,
            ex.Message);
    }

    private void LogError(Exception ex, string traceId)
    {
        _logger.LogError(ex,
            "Unhandled | TraceId: {TraceId} | {Message}",
            traceId,
            ex.Message);
    }

    private static string GetTitle(int statusCode)
    {
        return statusCode switch
        {
            400 => "Bad Request",
            401 => "Unauthorized",
            403 => "Forbidden",
            404 => "Not Found",
            409 => "Conflict",
            _ => "Error"
        };
    }
}