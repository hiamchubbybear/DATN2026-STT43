using DoAnTotNghiep.Application.Common;
using DoAnTotNghiep.Application.Exception;
using DoAnTotNghiep.Domain.Admin;
using DoAnTotNghiep.Domain.Enum;
using DoAnTotNghiep.Domain.Users;
using MediatR;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;

namespace DoAnTotNghiep.Application.Admin.Users.Commands
{
    public class ModerateUserHandler : IRequestHandler<ModerateUserCommand>
    {
        private readonly IUserProfileRepository _profileRepo;
        private readonly IMongoDbContext _db;
        private readonly ICurrentUserService _currentUser;
        private readonly ILogger<ModerateUserHandler> _logger;

        public ModerateUserHandler(
            IUserProfileRepository profileRepo,
            IMongoDbContext db,
            ICurrentUserService currentUser,
            ILogger<ModerateUserHandler> logger)
        {
            _profileRepo = profileRepo;
            _db = db;
            _currentUser = currentUser;
            _logger = logger;
        }

        public async Task Handle(ModerateUserCommand request, CancellationToken ct)
        {
            _logger.LogInformation(
                "ModerateUser start: UserId={UserId} Action={Action} Reason={Reason} Days={Days}",
                request.UserId, request.Action, request.Reason, request.DurationDays);

            var account = await _db.UserAccounts
                .Find(a => a.Id == request.UserId)
                .FirstOrDefaultAsync(ct);

            if (account is null)
            {
                throw new NotFoundException($"User account {request.UserId} not found");
            }

            var profile = await _profileRepo.GetByUserIdAsync(request.UserId);

            string auditAction;
            string auditDetails;

            switch (request.Action)
            {
                case ModerateAction.Ban:
                {
                    var until = request.DurationDays.HasValue
                        ? DateTime.UtcNow.AddDays(request.DurationDays.Value)
                        : (DateTime?)null;

                    account.Ban(request.Reason ?? "Banned by admin", until);
                    profile?.Ban();

                    await _db.UserSessions.DeleteManyAsync(s => s.UserId == request.UserId, ct);

                    auditAction = "BAN_USER";
                    auditDetails = $"Reason: {request.Reason}" +
                                   (until.HasValue ? $" until {until:yyyy-MM-dd}" : " (permanent)");
                    break;
                }

                case ModerateAction.Unban:
                case ModerateAction.Restore:
                {
                    account.Unban();
                    profile?.Restore();

                    auditAction = request.Action == ModerateAction.Unban ? "UNBAN_USER" : "RESTORE_USER";
                    auditDetails = string.IsNullOrWhiteSpace(request.Reason)
                        ? "User restored by admin"
                        : request.Reason;
                    break;
                }

                case ModerateAction.Suspend:
                {
                    var days = request.DurationDays ?? 7;
                    var until = DateTime.UtcNow.AddDays(days);

                    account.Ban(request.Reason ?? $"Suspended for {days} day(s)", until);
                    profile?.Suspend(days);

                    await _db.UserSessions.DeleteManyAsync(s => s.UserId == request.UserId, ct);

                    auditAction = "SUSPEND_USER";
                    auditDetails = $"Suspended {days} day(s). Reason: {request.Reason}";
                    break;
                }

                case ModerateAction.ShadowBan:
                {
                    profile?.ShadowBan();

                    auditAction = "SHADOW_BAN_USER";
                    auditDetails = $"Reason: {request.Reason}";
                    break;
                }

                default:
                    throw new ArgumentOutOfRangeException(nameof(request.Action),
                        request.Action, "Unsupported moderation action");
            }

            await _db.UserAccounts.ReplaceOneAsync(
                a => a.Id == account.Id, account, cancellationToken: ct);

            if (profile is not null)
            {
                await _profileRepo.UpdateAsync(profile);
            }

            var adminId = Guid.TryParse(_currentUser.UserId, out var aid) ? aid : Guid.Empty;
            var adminEmail = _currentUser.Email ?? "system@mixer.com";

            var log = new AuditLog(adminId, adminEmail, auditAction, request.UserId.ToString(), auditDetails, "admin-panel");
            await _db.AuditLogs.InsertOneAsync(log, cancellationToken: ct);

            _logger.LogInformation(
                "ModerateUser done: UserId={UserId} Action={Action} AccountIsBanned={Banned} ProfileStatus={Status}",
                request.UserId, request.Action, account.IsBanned, profile?.Status);
        }
    }
}
