using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using ossszecropp.Server.Models;
using ossszecropp.Server.Services;

namespace ossszecropp.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PasswordRecoveryController : ControllerBase
    {
        private readonly PasswordRecoveryService _recoveryService;
        private readonly ILogger<PasswordRecoveryController> _logger;

        public PasswordRecoveryController(PasswordRecoveryService recoveryService, ILogger<PasswordRecoveryController> logger)
        {
            _recoveryService = recoveryService;
            _logger = logger;
        }

        [HttpPost("request")]
        public async Task<IActionResult> RequestRecovery([FromBody] PasswordRecoveryRequestDto request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var isEmailRegistered = await _recoveryService.IsEmailRegistered(request.Email);
                if (!isEmailRegistered)
                {
                    return NotFound(new { message = "Email not found in our records." });
                }

                await _recoveryService.GenerateAndSendRecoveryCode(request.Email);

                return Ok(new { message = "Recovery code sent to your email." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in password recovery request");
                return StatusCode(500, new { message = "An error occurred while processing your request." });
            }
        }

        [HttpPost("verify")]
        public IActionResult VerifyCode([FromBody] VerifyCodeDto request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var isValid = _recoveryService.VerifyRecoveryCode(request.Email, request.Code);
                if (!isValid)
                {
                    return BadRequest(new { message = "Invalid or expired verification code." });
                }

                return Ok(new { message = "Code verified successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in code verification");
                return StatusCode(500, new { message = "An error occurred while verifying the code." });
            }
        }

        [HttpPost("reset")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var success = await _recoveryService.ResetPassword(request.Email, request.Code, request.NewPassword);
                if (!success)
                {
                    return BadRequest(new { message = "Failed to reset password. Invalid or expired code." });
                }

                return Ok(new { message = "Password has been reset successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in password reset");
                return StatusCode(500, new { message = "An error occurred while resetting your password." });
            }
        }
    }
}
