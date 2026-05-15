using DoAnTotNghiep.Domain.Common;

namespace DoAnTotNghiep.Application.Exception;

public class TooManyRequestsException(string message) : AppException(message, 429, Error_Code.TOO_MANY_REQUESTS);
