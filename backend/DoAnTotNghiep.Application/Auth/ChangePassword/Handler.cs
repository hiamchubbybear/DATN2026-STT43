using MediatR;
using DoAnTotNghiep.Domain.Users;
using DoAnTotNghiep.Application.Common;
using DoAnTotNghiep.Application.Exception;

namespace DoAnTotNghiep.Application.Auth.ChangePassword;

public class ChangePasswordCommandHandler : IRequestHandler<ChangePasswordCommand, string>
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;

    public ChangePasswordCommandHandler(IUserRepository userRepository, IPasswordHasher passwordHasher)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
    }

    public async Task<string> Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByEmail(request.Email);
        if (user == null)
            throw new NotFoundException("User not found");
        
        if (!_passwordHasher.Verify(request.OldPassword, user.HashPassword ?? ""))
            throw new BadRequestException("Invalid old password");
        
        user.UpdatePassword(_passwordHasher.Hash(request.NewPassword));
        await _userRepository.UpdateAsync(user);
        
        return user.Id.ToString();
    }
}
