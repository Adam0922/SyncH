namespace ossszecropp.Server.Models
{
    public class EmployeeUpdateDto
    {
        public string? FirstName { get; set; }
        public string? MiddleName { get; set; }
        public string? LastName { get; set; }
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public string? TaxNum { get; set; }
        public string? SocialSecNum { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? PlaceOfBirth { get; set; }
        public string? BankAccountNumber { get; set; }
        public string? Country { get; set; }
        public string? PostalCode { get; set; }
        public string? City { get; set; }
        public string? StreetAddress { get; set; }
    }

}
