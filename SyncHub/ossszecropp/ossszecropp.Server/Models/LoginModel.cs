using Microsoft.IdentityModel.Tokens;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json.Serialization;

namespace ossszecropp.Server.Models
{
    public class LoginModel
    {
        [Required]
        public string Identifier { get; set; } = null!;

        [Required]
        public string Password { get; set; } = null!;

    }

    public class JwtTokenGenerator
    {
        private readonly IConfiguration _configuration;

        public JwtTokenGenerator(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string GenerateJwtToken(string email)
        {
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(30),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    public class EmployeeRegistrationDto
    {
        // Required fields
        [Required]
        [RegularExpression(@"^\d{9}[A-Z]{2}$", ErrorMessage = "ID card number must be a valid Hungarian ID card number (e.g., 123456789AB)")]
        public string IdCardNum { get; set; }

        [Required]
        public string LastName { get; set; }

        [Required]
        public string FirstName { get; set; }

        [Required]
        public string Email { get; set; }

        [Required]
        public string Password { get; set; }

        // Address fields
        [Required]
        public string Country { get; set; }

        [Required]
        public string PostalCode { get; set; }

        [Required]
        public string City { get; set; }

        [Required]
        public string StreetAddress { get; set; }

        // Optional fields
        public string? MiddleName { get; set; }
        public string? PhoneNumber { get; set; }
        [Column("taxNum")]
        [JsonPropertyName("taxNumber")]
        public string? TaxNum { get; set; }
        public string? SocialSecNum { get; set; }
        public string? placeOfBirth { get; set; }
        public string? BankAccountNumber { get; set; }
        public int? ContractID { get; set; }
        public DateTime? DateOfBirth { get; set; }

        // Contract fields
        [Required]
        public int JobId { get; set; }

        [Required]
        public string SupervisorId { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        [Required]
        public int HourlyRates { get; set; }

        [Required]
        [Column("working_hours")]
        public int working_hours { get; set; }

        [Required]
        public int DaysOffNum { get; set; }
    }


    public class EmploymentContract
    {
        [Key]
        public int ContractID { get; set; }

        [Required]
        public int JobID { get; set; }

        [ForeignKey("JobID")]
        public Job? Job { get; set; } // Add this navigation property

        [Required]
        public string SupervisorID { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        [Required]
        public int HourlyRates { get; set; }

        [Required]
        [Column("working_hours")]
        public int working_hours { get; set; }

        [Required]
        public int DaysOffNum { get; set; }
    }

    public class Employees
    {
        [Key]
        [StringLength(15)]
        public string IdCardNum { get; set; } = null!;

        [Required]
        [StringLength(50)]
        public string LastName { get; set; } = null!;

        [StringLength(50)]
        public string? MiddleName { get; set; }

        [Required]
        [StringLength(50)]
        public string FirstName { get; set; } = null!;

        [Required]
        [StringLength(255)]
        public string Email { get; set; } = null!;

        [Required]
        [StringLength(255)]
        public string Pass { get; set; } = null!;

        [StringLength(25)]
        public string? PhoneNumber { get; set; }

        [StringLength(20)]
        public string? TaxNum { get; set; }

        [StringLength(20)]
        public string? SocialSecNum { get; set; }

        public DateTime? DateOfBirth { get; set; }

        public string? placeOfBirth { get; set; }

        [StringLength(34)]
        public string? BankAccountNumber { get; set; }

        [Required]
        [StringLength(100)]
        public string Country { get; set; } = null!;

        [Required]
        [StringLength(20)]
        public string PostalCode { get; set; } = null!;

        [Required]
        [StringLength(100)]
        public string City { get; set; } = null!;

        [Required]
        [StringLength(255)]
        public string StreetAddress { get; set; } = null!;
        [Column("created_at")]
        public DateTime CreatedAt { get; set; } // Ensure this field is mapped to the correct column
        public int? ContractID { get; set; }

        [StringLength(255)]
        [Column("ProfilePhoto")]
        public byte[]? ProfilePhoto { get; set; }

        [ForeignKey("ContractID")]
        public EmploymentContract? EmploymentContract { get; set; }

        public bool IsSupervisor { get; set; }
    }

    public class Company
    {
        [Key]
        public int CompanyID { get; set; }

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
        public string PostalCode { get; set; } // Add this line

        [Required]
        [StringLength(100)]
        public string City { get; set; }

        [Required]
        [StringLength(255)]
        public string StreetAddress { get; set; }
    }


    public class Job
    {
        [Key]
        public int JobID { get; set; }

        [Required]
        [StringLength(255)]
        public string JobTitle { get; set; } = null!;

        public string? JobDescription { get; set; }
    }

    public class Supervisor
    {
        [Key]
        public int SupervisorID { get; set; }

        [Required]
        public int IdCardNum { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    [Table("Equipments")]
    public class Equipment
    {
        [Key]
        [Column("serialNumber")]
        public string? SerialNumber { get; set; }

        [Required]
        [Column("equipmentName")]
        public string? EquipmentName { get; set; }

        [Column("purchase_date")]
        public DateTime? PurchaseDate { get; set; }

        [Column("employee")]
        public string? Employee { get; set; }

        [Required]
        [Column("status")]
        public string? Status { get; set; }

        [Column("category")]
        public string? Category { get; set; }

        [Column("last_service_date")]
        public DateTime? LastServiceDate { get; set; }

        [Column("warranty_expiration")]
        public DateTime? WarrantyExpiration { get; set; }

        [Column("remarks")]
        public string? Remarks { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public class ConnectionEmp
    {
        [Key]
        public int ConnectionEmpID { get; set; }

        [Required]
        public string ConnectionDetails { get; set; } = null!;
    }
}