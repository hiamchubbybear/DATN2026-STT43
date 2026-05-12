using DoAnTotNghiep.Domain.Common;

namespace DoAnTotNghiep.Web.ExceptionHandler;

public class ApiErrorResponse
{
    public string Title { get; set; } = default!;
    public int Status { get; set; }
    public string? Detail { get; set; }
    public string? Message { get; set; }
    public Error_Code ErrorCode { get; set; }

    public IDictionary<string, string[]>? Errors { get; set; }

    public string? TraceId { get; set; }
}

