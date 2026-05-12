using DoAnTotNghiep.Application.Behaviors;
using MediatR;

namespace DoAnTotNghiep.Application.Users;

public class CreateAccountCommand : IRequest<object>
{
    public required string Email { get; set; }
    [SensitiveData]
    public required string Password { get; set; }
}
