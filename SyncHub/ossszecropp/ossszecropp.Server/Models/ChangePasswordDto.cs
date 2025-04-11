using System.ComponentModel.DataAnnotations;

namespace ossszecropp.Server.Models
{
    public class ChangePasswordDto
    {
        [Required]
        public string OldPassword { get; set; } = null!;

        [Required]
        public string NewPassword { get; set; } = null!;
    }
}
