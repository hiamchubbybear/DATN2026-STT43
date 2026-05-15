using MediatR;

namespace DoAnTotNghiep.Application.Auth.DeleteAccount;

public class DeleteAccountCommand(string email, string password) : IRequest<string>
{
    public string Email { get; set; } = email;
    public string Password { get; set; } = password;
}
