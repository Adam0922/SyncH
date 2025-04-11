using System.ComponentModel.DataAnnotations;

namespace ossszecropp.Server.Models
{
    public class PasswordRecoveryRequestDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }
    }

    public class VerifyCodeDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [StringLength(6, MinimumLength = 6)]
        public string Code { get; set; }
    }

    public class ResetPasswordDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string Code { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 8)]
        public string NewPassword { get; set; }
    }
}
