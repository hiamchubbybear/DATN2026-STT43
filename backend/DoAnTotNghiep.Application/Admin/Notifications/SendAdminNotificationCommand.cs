using DoAnTotNghiep.Application.Email;
using DoAnTotNghiep.Application.Notifications;
using DoAnTotNghiep.Domain.Users;
using MediatR;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace DoAnTotNghiep.Application.Admin.Notifications;

public record SendAdminNotificationCommand(
    Guid? UserId, 
    string Title, 
    string Body, 
    bool SendPush = true, 
    bool SendEmail = false,
    bool IsBroadcast = false
) : IRequest<bool>;

public class SendAdminNotificationHandler : IRequestHandler<SendAdminNotificationCommand, bool>
{
    private readonly INotificationService _notificationService;
    private readonly IEmailService _emailService;
    private readonly IUserRepository _userRepository;

    public SendAdminNotificationHandler(
        INotificationService notificationService, 
        IEmailService emailService,
        IUserRepository userRepository)
    {
        _notificationService = notificationService;
        _emailService = emailService;
        _userRepository = userRepository;
    }

    public async Task<bool> Handle(SendAdminNotificationCommand request, CancellationToken cancellationToken)
    {
        if (request.IsBroadcast)
        {
            await _notificationService.BroadcastNotificationAsync(request.Title, request.Body);
            return true;
        }

        if (request.UserId.HasValue)
        {
            if (request.SendPush)
            {
                await _notificationService.SendPushToUserAsync(request.UserId.Value, request.Title, request.Body);
            }

            if (request.SendEmail)
            {
                var user = await _userRepository.GetByIdAsync(request.UserId.Value);
                if (user != null && !string.IsNullOrEmpty(user.Email))
                {
                    await _emailService.SendAsync(user.Email, request.Title, request.Body);
                }
            }
            return true;
        }

        return false;
    }
}
