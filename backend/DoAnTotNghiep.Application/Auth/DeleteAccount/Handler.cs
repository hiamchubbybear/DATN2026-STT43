using DoAnTotNghiep.Application.Exception;
using DoAnTotNghiep.Domain.Users;
using MediatR;

using DoAnTotNghiep.Application.Common;

namespace DoAnTotNghiep.Application.Auth.DeleteAccount;

public class Handler(IUserRepository userRepository, IPasswordHasher passwordHasher) : IRequestHandler<DeleteAccountCommand, string>
{
    public async Task<string> Handle(DeleteAccountCommand request, CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByEmail(request.Email);
        if (user == null)
            throw new NotFoundException("User not found.");

        if (!passwordHasher.Verify(request.Password, user.HashPassword ?? ""))
            throw new BadRequestException("Invalid password. Identity verification failed.");

        await userRepository.DeleteAccount(user.Id.ToString());

        return "Account deleted successfully.";
    }
}
