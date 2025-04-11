using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ossszecropp.Server.Data;
using System.Security.Cryptography;
using System.Collections.Concurrent;
using MimeKit;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using BC = BCrypt.Net.BCrypt;

namespace ossszecropp.Server.Services
{
    public class PasswordRecoveryService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<PasswordRecoveryService> _logger;
        private readonly IConfiguration _configuration;
        private static readonly ConcurrentDictionary<string, (string code, DateTime expiry)> _recoveryCodes = new();

        public PasswordRecoveryService(ApplicationDbContext context, ILogger<PasswordRecoveryService> logger, IConfiguration configuration)
        {
            _context = context;
            _logger = logger;
            _configuration = configuration;
        }

        public async Task<bool> IsEmailRegistered(string email)
        {
            return await _context.Employees.AnyAsync(e => e.Email == email);
        }

        public async Task<string> GenerateAndSendRecoveryCode(string email)
        {
            var code = GenerateRandomCode();
            _recoveryCodes[email] = (code, DateTime.UtcNow.AddMinutes(15));
            await SendRecoveryEmail(email, code);
            return code;
        }

        public bool VerifyRecoveryCode(string email, string code)
        {
            if (_recoveryCodes.TryGetValue(email, out var storedData))
            {
                var (storedCode, expiry) = storedData;
                if (DateTime.UtcNow <= expiry && storedCode == code)
                {
                    return true;
                }
            }
            return false;
        }

        public async Task<bool> ResetPassword(string email, string code, string newPassword)
        {
            if (!VerifyRecoveryCode(email, code))
            {
                return false;
            }

            var employee = await _context.Employees.FirstOrDefaultAsync(e => e.Email == email);
            if (employee == null)
            {
                return false;
            }

            employee.Pass = BC.HashPassword(newPassword);
            _context.Employees.Update(employee);
            await _context.SaveChangesAsync();
            _recoveryCodes.TryRemove(email, out _);

            return true;
        }

        private string GenerateRandomCode()
        {
            using var rng = RandomNumberGenerator.Create();
            var bytes = new byte[4];
            rng.GetBytes(bytes);
            var random = BitConverter.ToUInt32(bytes, 0) % 1000000;
            return random.ToString("D6");
        }

        private async Task SendRecoveryEmail(string email, string code)
        {
            try
            {
                var smtpServer = _configuration["EmailSettings:SmtpServer"];
                var smtpPort = int.Parse(_configuration["EmailSettings:SmtpPort"]);
                var smtpUsername = _configuration["EmailSettings:Username"];
                var smtpPassword = _configuration["EmailSettings:Password"];
                var senderEmail = _configuration["EmailSettings:SenderEmail"];
                var senderName = _configuration["EmailSettings:SenderName"];

                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(senderName, senderEmail));
                message.To.Add(new MailboxAddress("", email));
                message.Subject = "SyncHub Password Recovery";

                var bodyBuilder = new BodyBuilder
                {
                    HtmlBody = $@"
                    <html>
                    <body>
                        <h2>Password Recovery</h2>
                        <p>You requested a password reset for your SyncHub account.</p>
                        <p>Your verification code is: <strong>{code}</strong></p>
                        <p>This code will expire in 15 minutes.</p>
                        <p>If you did not request this password reset, please ignore this email.</p>
                    </body>
                    </html>"
                };
                message.Body = bodyBuilder.ToMessageBody();

                using (var client = new SmtpClient())
                {
                    await client.ConnectAsync(smtpServer, smtpPort, SecureSocketOptions.StartTls);
                    await client.AuthenticateAsync(smtpUsername, smtpPassword);
                    await client.SendAsync(message);
                    await client.DisconnectAsync(true);
                }

                _logger.LogInformation($"Recovery email sent to {email}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send recovery email to {email}");
                throw;
            }
        }
    }
}
