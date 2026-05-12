using System.ComponentModel.DataAnnotations;
using DoAnTotNghiep.Application;
using DoAnTotNghiep.Domain.Common;
using DoAnTotNghiep.Web.ExceptionHandler;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using ValidationException = DoAnTotNghiep.Web.ExceptionHandler.ValidationException;

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

        if (exception is AppException appEx)
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

            if (appEx is ValidationException valEx)
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