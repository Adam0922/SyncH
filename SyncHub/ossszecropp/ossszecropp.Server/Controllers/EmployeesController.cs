using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ossszecropp.Server.Data;
using ossszecropp.Server.Models;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Authorization;


namespace ossszecropp.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmployeesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmployeesController> _logger;

        public EmployeesController(ApplicationDbContext context, IConfiguration configuration, ILogger<EmployeesController> logger)
        {
            _context = context;
            _configuration = configuration;
            _logger = logger;
        }


        // GET: api/Employees
        [HttpGet]
        public IActionResult GetEmployees()
        {
            try
            {
                var employees = _context.Employees
                    .Include(e => e.EmploymentContract)
                    .ThenInclude(ec => ec.Job)
                    .Select(e => new
                    {
                        e.IdCardNum,
                        e.FirstName,
                        e.LastName,
                        e.MiddleName,
                        e.Email,
                        e.PhoneNumber,
                        e.TaxNum,
                        e.SocialSecNum,
                        e.DateOfBirth,
                        e.placeOfBirth,
                        e.BankAccountNumber,
                        e.Country,
                        e.PostalCode,
                        e.City,
                        e.StreetAddress,
                        JobTitle = e.EmploymentContract != null && e.EmploymentContract.Job != null ? e.EmploymentContract.Job.JobTitle : "Unknown"
                    })
                    .ToList();

                return Ok(employees);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching employees: {ex.Message}");
                return StatusCode(500, "Internal Server Error");
            }
        }

        // GET: api/Employees/profile
        [HttpGet("profile")]
        public async Task<IActionResult> GetEmployeeProfile()
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                Console.WriteLine($"User ID: {userId}");

                var employee = await _context.Employees
                    .Include(e => e.EmploymentContract)
                    .ThenInclude(ec => ec.Job)
                    .Where(e => e.IdCardNum == userId)
                    .Select(e => new
                    {
                        e.FirstName,
                        e.MiddleName,
                        e.LastName,
                        e.Email,
                        e.PhoneNumber,
                        e.TaxNum,
                        e.SocialSecNum,
                        e.DateOfBirth,
                        e.placeOfBirth,
                        e.BankAccountNumber,
                        e.Country,
                        e.PostalCode,
                        e.City,
                        e.StreetAddress,
                        JobTitle = e.EmploymentContract != null && e.EmploymentContract.Job != null ? e.EmploymentContract.Job.JobTitle : "Unknown"
                    })
                    .FirstOrDefaultAsync();

                if (employee == null)
                {
                    Console.WriteLine("Employee not found.");
                    return NotFound("Employee not found.");
                }

                var fullName = $"{employee.FirstName} {(string.IsNullOrEmpty(employee.MiddleName) ? "" : employee.MiddleName + " ")}{employee.LastName}";
                return Ok(new { fullName, employee });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching employee profile: {ex.Message}");
                return StatusCode(500, "Internal Server Error");
            }
        }

        // GET: api/Employees/{idCardNum}
        [HttpGet("{idCardNum}")]
        public async Task<IActionResult> GetEmployee(string idCardNum)
        {
            try
            {
                var employee = await _context.Employees
                    .Include(e => e.EmploymentContract)
                    .ThenInclude(ec => ec.Job)
                    .Where(e => e.IdCardNum == idCardNum)
                    .Select(e => new
                    {
                        e.IdCardNum,
                        e.FirstName,
                        e.MiddleName,
                        e.LastName,
                        e.Email,
                        e.PhoneNumber,
                        e.TaxNum,
                        e.SocialSecNum,
                        e.DateOfBirth,
                        e.placeOfBirth,
                        e.BankAccountNumber,
                        e.Country,
                        e.PostalCode,
                        e.City,
                        e.StreetAddress,
                        e.CreatedAt,
                        JobTitle = e.EmploymentContract != null && e.EmploymentContract.Job != null ? e.EmploymentContract.Job.JobTitle : "Unknown"
                    })
                    .FirstOrDefaultAsync();

                if (employee == null)
                {
                    return NotFound($"Employee with ID {idCardNum} not found.");
                }

                return Ok(employee);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error fetching employee with ID {idCardNum}");
                return StatusCode(500, "Internal Server Error");
            }
        }

        // DELETE: api/Employees/{idCardNum}
        [HttpDelete("{idCardNum}")]
        public async Task<IActionResult> DeleteEmployee(string idCardNum)
        {
            try
            {
                var employee = await _context.Employees
                    .Include(e => e.EmploymentContract)
                    .FirstOrDefaultAsync(e => e.IdCardNum == idCardNum);

                if (employee == null)
                {
                    _logger.LogWarning($"Employee with ID {idCardNum} not found.");
                    return NotFound($"Employee with ID {idCardNum} not found.");
                }

                // Delete the associated contract if it exists
                if (employee.EmploymentContract != null)
                {
                    _context.EmploymentContracts.Remove(employee.EmploymentContract);
                }

                _context.Employees.Remove(employee);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Employee with ID {idCardNum} and their associated contract deleted successfully.");
                return Ok($"Employee with ID {idCardNum} and their associated contract deleted successfully.");
            }
            catch (DbUpdateException dbEx)
            {
                _logger.LogError(dbEx, $"Database update error deleting employee with ID {idCardNum}: {dbEx.Message}");
                return StatusCode(500, "Database update error");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting employee with ID {idCardNum}: {ex.Message}");
                return StatusCode(500, "Internal Server Error");
            }
        }


        // GET: api/Employees/current
        [HttpGet("current")]
        public async Task<IActionResult> GetCurrentEmployee()
        {
            try
            {
                var userEmail = User.FindFirstValue(ClaimTypes.Name);
                if (string.IsNullOrEmpty(userEmail))
                {
                    return Unauthorized(new { message = "User is not logged in." });
                }

                var employee = await _context.Employees
                    .Include(e => e.EmploymentContract)
                    .ThenInclude(ec => ec.Job)
                    .FirstOrDefaultAsync(e => e.Email == userEmail);

                if (employee == null)
                {
                    return NotFound(new { message = "Employee not found." });
                }

                return Ok(new
                {
                    employee.IdCardNum,
                    employee.FirstName,
                    employee.MiddleName,
                    employee.LastName,
                    employee.Email,
                    employee.PhoneNumber,
                    employee.TaxNum,
                    employee.SocialSecNum,
                    employee.DateOfBirth,
                    employee.placeOfBirth,
                    employee.BankAccountNumber,
                    employee.Country,
                    employee.PostalCode,
                    employee.City,
                    employee.StreetAddress,
                    employee.CreatedAt,
                    JobTitle = employee.EmploymentContract?.Job?.JobTitle ?? "Unknown"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred.", details = ex.Message });
            }
        }

        // GET: api/Employees/GetIdCardNumByEmail/{email}
        [HttpGet("GetIdCardNumByEmail/{email}")]
        public async Task<IActionResult> GetIdCardNumByEmail(string email)
        {
            try
            {
                var employee = await _context.Employees
                    .Where(e => e.Email == email)
                    .Select(e => new { e.IdCardNum })
                    .FirstOrDefaultAsync();

                if (employee == null)
                {
                    return NotFound("Employee not found.");
                }

                return Ok(employee.IdCardNum);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching IdCardNum: {ex.Message}");
                return StatusCode(500, "Internal Server Error");
            }
        }

        // GET: api/Employees/GetJobs
        [HttpGet("GetJobs")]
        public async Task<IActionResult> GetJobs()
        {
            try
            {
                var jobs = await _context.Jobs.ToListAsync();
                return Ok(jobs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred.", details = ex.Message });
            }
        }

        // GET: api/Employees/GetLoggedInUserData
        [HttpGet("GetLoggedInUserData")]
        public async Task<IActionResult> GetLoggedInUserData()
        {
            var idCardNum = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var employee = await _context.Employees
                .Include(e => e.EmploymentContract)
                .ThenInclude(ec => ec.Job)
                .Where(e => e.IdCardNum == idCardNum)
                .Select(e => new
                {
                    e.FirstName,
                    e.MiddleName,
                    e.LastName,
                    e.Email,
                    e.PhoneNumber,
                    e.TaxNum,
                    e.SocialSecNum,
                    e.DateOfBirth,
                    e.placeOfBirth,
                    e.BankAccountNumber,
                    e.Country,
                    e.PostalCode,
                    e.City,
                    e.StreetAddress,
                    JobTitle = e.EmploymentContract != null && e.EmploymentContract.Job != null ? e.EmploymentContract.Job.JobTitle : "Unknown"
                })
                .FirstOrDefaultAsync();

            if (employee == null)
            {
                return NotFound();
            }

            return Ok(employee);
        }

        [HttpGet("whoami")]
        public IActionResult WhoAmI()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var name = User.FindFirstValue(ClaimTypes.Name);

            return Ok(new
            {
                userId,
                name,
                isAuthenticated = User.Identity.IsAuthenticated,
                claims = User.Claims.Select(c => new { c.Type, c.Value }).ToList()
            });
        }

        // PUT: api/Employees/{idCardNum}
        [HttpPut("{idCardNum}")]
        public async Task<IActionResult> UpdateEmployee(string idCardNum, [FromBody] EmployeeUpdateDto dto)
        {
            try
            {
                var employee = await _context.Employees.FirstOrDefaultAsync(e => e.IdCardNum == idCardNum);

                if (employee == null)
                {
                    return NotFound(new { message = $"Employee with ID {idCardNum} not found." });
                }

                // Update employee properties
                employee.FirstName = dto.FirstName ?? employee.FirstName;
                employee.MiddleName = dto.MiddleName ?? employee.MiddleName;
                employee.LastName = dto.LastName ?? employee.LastName;
                employee.Email = dto.Email ?? employee.Email;
                employee.PhoneNumber = dto.PhoneNumber ?? employee.PhoneNumber;
                employee.TaxNum = dto.TaxNum ?? employee.TaxNum;
                employee.SocialSecNum = dto.SocialSecNum ?? employee.SocialSecNum;
                employee.DateOfBirth = dto.DateOfBirth ?? employee.DateOfBirth;
                employee.placeOfBirth = dto.PlaceOfBirth ?? employee.placeOfBirth;
                employee.BankAccountNumber = dto.BankAccountNumber ?? employee.BankAccountNumber;
                employee.Country = dto.Country ?? employee.Country;
                employee.PostalCode = dto.PostalCode ?? employee.PostalCode;
                employee.City = dto.City ?? employee.City;
                employee.StreetAddress = dto.StreetAddress ?? employee.StreetAddress;

                await _context.SaveChangesAsync();

                return Ok(new { message = "Employee updated successfully", employee });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating employee with ID {idCardNum}");
                return StatusCode(500, new { message = "An error occurred while updating the employee.", details = ex.Message });
            }
        }


        [HttpGet("test")]
        [AllowAnonymous]
        public IActionResult Test() => Ok("API is working");

        [HttpGet("test-auth")]
        public IActionResult TestAuth()
        {
            var claims = User.Claims.Select(c => new { c.Type, c.Value }).ToList();
            return Ok(new
            {
                message = "Authentication successful",
                claims = claims,
                userId = User.FindFirstValue(ClaimTypes.NameIdentifier),
                userName = User.FindFirstValue(ClaimTypes.Name)
            });
        }

        // GET: api/Employees/under-supervision
        [Authorize]
        [HttpGet("under-supervision")]
        public async Task<IActionResult> GetEmployeesUnderSupervision()
        {
            try
            {
                var supervisorId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(supervisorId))
                {
                    return Unauthorized(new { message = "User is not logged in." });
                }

                var employees = await _context.Employees
                    .Include(e => e.EmploymentContract)
                    .ThenInclude(ec => ec.Job)
                    .Where(e => e.EmploymentContract.SupervisorID == supervisorId)
                    .Select(e => new
                    {
                        e.IdCardNum,
                        e.FirstName,
                        e.LastName,
                        e.Email,
                        JobTitle = e.EmploymentContract.Job.JobTitle
                    })
                    .ToListAsync();

                return Ok(employees);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred.", details = ex.Message });
            }
        }


        [HttpPut("update-address")]
        public async Task<IActionResult> UpdateAddress([FromBody] AddressUpdateDto dto)
        {
            try
            {
                var userEmail = User.FindFirstValue(ClaimTypes.Name);
                if (string.IsNullOrEmpty(userEmail))
                {
                    return Unauthorized(new { message = "User is not logged in." });
                }

                var employee = await _context.Employees
                    .FirstOrDefaultAsync(e => e.Email == userEmail);

                if (employee == null)
                {
                    return NotFound(new { message = "Employee not found." });
                }

                // Update address fields
                employee.Country = dto.Country;
                employee.PostalCode = dto.PostalCode;
                employee.City = dto.City;
                employee.StreetAddress = dto.StreetAddress;

                await _context.SaveChangesAsync();
                return Ok(new { message = "Address updated successfully", employee });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred.", details = ex.Message });
            }
        }

        [HttpPut("update-birth-data")]
        public async Task<IActionResult> UpdateBirthData([FromBody] BirthDataUpdateDto dto)
        {
            try
            {
                var userEmail = User.FindFirstValue(ClaimTypes.Name);
                if (string.IsNullOrEmpty(userEmail))
                {
                    return Unauthorized(new { message = "User is not logged in." });
                }

                var employee = await _context.Employees
    .FirstOrDefaultAsync(e => e.Email == userEmail);

                if (employee == null)
                {
                    return NotFound(new { message = "Employee not found." });
                }

                // Update birth-related fields
                employee.FirstName = dto.FirstName;
                employee.LastName = dto.LastName;
                employee.MiddleName = dto.MiddleName;
                employee.placeOfBirth = dto.PlaceOfBirth;
                employee.DateOfBirth = dto.DateOfBirth;

                await _context.SaveChangesAsync();
                return Ok(new { message = "Birth data updated successfully", employee });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred.", details = ex.Message });
            }
        }

        public static class PasswordHelper
        {
            public static string HashPassword(string password)
            {
                // Implement your hashing logic here
                // For example, using BCrypt:
                return BCrypt.Net.BCrypt.HashPassword(password);
            }

            public static bool VerifyPassword(string password, string hashedPassword)
            {
                // Implement your verification logic here
                // For example, using BCrypt:
                return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
            }
        }


        [Authorize]
        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "User is not logged in." });
                }

                var employee = await _context.Employees.FirstOrDefaultAsync(e => e.IdCardNum == userId);
                if (employee == null)
                {
                    return NotFound(new { message = "Employee not found." });
                }

                // Verify the old password
                if (!PasswordHelper.VerifyPassword(dto.OldPassword, employee.Pass))
                {
                    return BadRequest(new { message = "Old password is incorrect." });
                }

                // Hash the new password
                employee.Pass = PasswordHelper.HashPassword(dto.NewPassword);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Password changed successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred.", details = ex.Message });
            }
        }



        // PUT: api/Employees/update-personal-data
        [HttpPut("update-personal-data")]
        public async Task<IActionResult> UpdatePersonalData([FromBody] PersonalDataUpdateDto dto)
        {
            try
            {
                var userEmail = User.FindFirstValue(ClaimTypes.Name);
                if (string.IsNullOrEmpty(userEmail))
                {
                    return Unauthorized(new { message = "User is not logged in." });
                }

                var employee = await _context.Employees
                    .FirstOrDefaultAsync(e => e.Email == userEmail);

                if (employee == null)
                {
                    return NotFound(new { message = "Employee not found." });
                }

                // Update personal data fields
                employee.Email = dto.Email;
                employee.PhoneNumber = dto.PhoneNumber;
                employee.BankAccountNumber = dto.BankAccountNumber;
                employee.TaxNum = dto.TaxNum;
                employee.SocialSecNum = dto.SocialSecNum;

                await _context.SaveChangesAsync();
                return Ok(new { message = "Personal data updated successfully", employee });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred.", details = ex.Message });
            }
        }

        [HttpPost("upload-profile-photo")]
        public async Task<IActionResult> UploadProfilePhoto([FromForm] ProfilePhotoUploadDto model)
        {
            try
            {
                if (model == null || model.ProfilePhoto == null || model.ProfilePhoto.Length == 0)
                {
                    return BadRequest(new { message = "No file was uploaded." });
                }

                // Get the current user's email from the JWT token
                var userEmail = User.FindFirstValue(ClaimTypes.Name);
                if (string.IsNullOrEmpty(userEmail))
                {
                    return Unauthorized(new { message = "User not authenticated." });
                }

                // Find the employee in the database
                var employee = await _context.Employees.FirstOrDefaultAsync(e => e.Email == userEmail);
                if (employee == null)
                {
                    return NotFound(new { message = "Employee not found." });
                }

                // Convert the uploaded file to a byte array
                using (var memoryStream = new MemoryStream())
                {
                    await model.ProfilePhoto.CopyToAsync(memoryStream);
                    employee.ProfilePhoto = memoryStream.ToArray();
                }

                await _context.SaveChangesAsync();

                return Ok(new { message = "Profile photo uploaded successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading profile photo");
                return StatusCode(500, new
                {
                    message = "An error occurred while uploading the profile photo.",
                    details = ex.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }


        [HttpGet("profile-photo")]
        public async Task<IActionResult> GetProfilePhoto()
        {
            try
            {
                var userEmail = User.FindFirstValue(ClaimTypes.Name);
                if (string.IsNullOrEmpty(userEmail))
                {
                    return Unauthorized(new { message = "User not authenticated." });
                }

                var employee = await _context.Employees.FirstOrDefaultAsync(e => e.Email == userEmail);
                if (employee == null || employee.ProfilePhoto == null || employee.ProfilePhoto.Length == 0)
                {
                    return NotFound(new { message = "No profile photo found." });
                }

                return File(employee.ProfilePhoto, "image/jpeg");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving profile photo");
                return StatusCode(500, new { message = "An error occurred while retrieving the profile photo." });
            }
        }

        [HttpDelete("delete-profile-photo")]
        public async Task<IActionResult> DeleteProfilePhoto()
        {
            try
            {
                // Get the current user's email from the JWT token
                var userEmail = User.FindFirstValue(ClaimTypes.Name);
                if (string.IsNullOrEmpty(userEmail))
                {
                    return Unauthorized(new { message = "User not authenticated." });
                }

                // Find the employee in the database
                var employee = await _context.Employees.FirstOrDefaultAsync(e => e.Email == userEmail);
                if (employee == null)
                {
                    return NotFound(new { message = "Employee not found." });
                }

                // Set the profile photo to null
                employee.ProfilePhoto = null;
                await _context.SaveChangesAsync();

                return Ok(new { message = "Profile photo deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting profile photo");
                return StatusCode(500, new
                {
                    message = "An error occurred while deleting the profile photo.",
                    details = ex.Message
                });
            }
        }

        [HttpPost("company")]
        public async Task<IActionResult> CreateOrUpdateCompany([FromBody] CompanyDto companyDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var userEmail = User.FindFirstValue(ClaimTypes.Name);
                if (string.IsNullOrEmpty(userEmail))
                {
                    return Unauthorized(new { message = "User not authenticated." });
                }

                // Check if the user is authorized (e.g., has a job title containing "vezet")
                var employee = await _context.Employees
                    .Include(e => e.EmploymentContract)
                    .ThenInclude(ec => ec.Job)
                    .FirstOrDefaultAsync(e => e.Email == userEmail);

                if (employee == null)
                {
                    return NotFound(new { message = "Employee not found." });
                }

                var jobTitle = employee.EmploymentContract?.Job?.JobTitle ?? string.Empty;
                if (!jobTitle.Contains("vezet", StringComparison.OrdinalIgnoreCase))
                {
                    //return Forbid(new { message = "Only managers can create or update company information." });
                }

                // Check if company already exists
                var company = await _context.Companies.FirstOrDefaultAsync();

                if (company == null)
                {
                    // Create new company
                    company = new Company
                    {
                        Name = companyDto.Name,
                        CTaxNumber = companyDto.CTaxNumber,
                        VatNumber = companyDto.VatNumber,
                        RegistrationNumber = companyDto.RegistrationNumber,
                        Email = companyDto.Email,
                        Phone = companyDto.Phone,
                        BankAccountNumber = companyDto.BankAccountNumber,
                        Country = companyDto.Country,
                        PostalCode = companyDto.PostalCode,
                        City = companyDto.City,
                        StreetAddress = companyDto.StreetAddress
                    };

                    _context.Companies.Add(company);
                    await _context.SaveChangesAsync();
                    return Ok(new { message = "Company created successfully", company });
                }
                else
                {
                    // Update existing company
                    company.Name = companyDto.Name;
                    company.CTaxNumber = companyDto.CTaxNumber;
                    company.VatNumber = companyDto.VatNumber;
                    company.RegistrationNumber = companyDto.RegistrationNumber;
                    company.Email = companyDto.Email;
                    company.Phone = companyDto.Phone;
                    company.BankAccountNumber = companyDto.BankAccountNumber;
                    company.Country = companyDto.Country;
                    company.PostalCode = companyDto.PostalCode;
                    company.City = companyDto.City;
                    company.StreetAddress = companyDto.StreetAddress;

                    _context.Companies.Update(company);
                    await _context.SaveChangesAsync();
                    return Ok(new { message = "Company updated successfully", company });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating/updating company");
                return StatusCode(500, new { message = "An error occurred while processing your request.", details = ex.Message });
            }
        }

        // GET: api/Employees/company
        [HttpGet("company")]
        public async Task<IActionResult> GetCompany()
        {
            try
            {
                var userEmail = User.FindFirstValue(ClaimTypes.Name);
                if (string.IsNullOrEmpty(userEmail))
                {
                    return Unauthorized(new { message = "User not authenticated." });
                }

                // Check if the user is authorized
                var employee = await _context.Employees
                    .Include(e => e.EmploymentContract)
                    .ThenInclude(ec => ec.Job)
                    .FirstOrDefaultAsync(e => e.Email == userEmail);

                if (employee == null)
                {
                    return NotFound(new { message = "Employee not found." });
                }

                var company = await _context.Companies.FirstOrDefaultAsync();
                if (company == null)
                {
                    return NotFound(new { message = "No company information found." });
                }

                return Ok(company);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving company");
                return StatusCode(500, new { message = "An error occurred while retrieving company information.", details = ex.Message });
            }
        }
    }
}

