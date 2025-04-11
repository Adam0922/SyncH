using System.ComponentModel.DataAnnotations;

namespace ossszecropp.Server.Models
{
    public class CompanyDto
    {
        [Required]
        [StringLength(255)]
        public string Name { get; set; }

        [Required]
        [StringLength(20)]
        public string CTaxNumber { get; set; }

        [StringLength(20)]
        public string? VatNumber { get; set; }

        [StringLength(20)]
        public string? RegistrationNumber { get; set; }

        [StringLength(255)]
        public string? Email { get; set; }

        [StringLength(25)]
        public string? Phone { get; set; }

        [StringLength(50)]
        public string? BankAccountNumber { get; set; }

        [Required]
        [StringLength(100)]
        public string Country { get; set; }

        [Required]
        [StringLength(20)]
        public string PostalCode { get; set; }

        [Required]
        [StringLength(100)]
        public string City { get; set; }

        [Required]
        [StringLength(255)]
        public string StreetAddress { get; set; }
    }
}
