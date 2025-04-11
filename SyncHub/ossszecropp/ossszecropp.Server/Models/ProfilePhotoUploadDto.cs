using System.ComponentModel.DataAnnotations;

namespace ossszecropp.Server.Models
{
    public class ProfilePhotoUploadDto
    {
        [Required]
        public IFormFile ProfilePhoto { get; set; }
    }
}
