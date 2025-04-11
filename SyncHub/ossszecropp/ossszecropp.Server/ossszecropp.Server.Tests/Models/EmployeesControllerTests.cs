using System;
using System.Collections.Generic;
using System.IO;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;
using ossszecropp.Server.Controllers;
using ossszecropp.Server.Data;
using ossszecropp.Server.Models;

namespace ossszecropp.Server.Tests.Controllers
{
    [TestFixture]
    public class EmployeesControllerTests
    {
        private ApplicationDbContext _context;
        private Mock<IConfiguration> _mockConfiguration;
        private Mock<ILogger<EmployeesController>> _mockLogger;
        private EmployeesController _controller;
        private Employees _testEmployee;
        private Employees _testSupervisor;
        private Job _testJob;
        private EmploymentContract _testContract;

        [SetUp]
        public void Setup()
        {
            // Create a mock DbContext options with a unique database name for each test
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            // Create actual context with in-memory database
            _context = new ApplicationDbContext(options);

            // Setup test job
            _testJob = new Job
            {
                JobID = 1,
                JobTitle = "Software Developer",
                JobDescription = "Develops software applications"
            };
            _context.Jobs.Add(_testJob);

            // Setup test supervisor
            _testSupervisor = new Employees
            {
                IdCardNum = "SUP001",
                FirstName = "John",
                LastName = "Supervisor",
                Email = "supervisor@example.com",
                Pass = BCrypt.Net.BCrypt.HashPassword("password123"),
                PhoneNumber = "1234567890",
                TaxNum = "TAX001",
                SocialSecNum = "SSN001",
                DateOfBirth = new DateTime(1980, 1, 1),
                placeOfBirth = "Test City",
                BankAccountNumber = "BANK001",
                Country = "Test Country",
                PostalCode = "12345",
                City = "Test City",
                StreetAddress = "123 Test Street",
                IsSupervisor = true
            };
            _context.Employees.Add(_testSupervisor);

            // Setup test contract
            _testContract = new EmploymentContract
            {
                ContractID = 1,
                JobID = 1,
                SupervisorID = "SUP001",
                StartDate = DateTime.Now.AddMonths(-6),
                EndDate = DateTime.Now.AddYears(1),
                HourlyRates = 25,
                working_hours = 40,
                DaysOffNum = 20
            };
            _context.EmploymentContracts.Add(_testContract);

            // Setup test employee
            _testEmployee = new Employees
            {
                IdCardNum = "EMP001",
                FirstName = "Jane",
                LastName = "Employee",
                MiddleName = "Test",
                Email = "employee@example.com",
                Pass = BCrypt.Net.BCrypt.HashPassword("password123"),
                PhoneNumber = "0987654321",
                TaxNum = "TAX002",
                SocialSecNum = "SSN002",
                DateOfBirth = new DateTime(1990, 1, 1),
                placeOfBirth = "Another City",
                BankAccountNumber = "BANK002",
                Country = "Test Country",
                PostalCode = "54321",
                City = "Another City",
                StreetAddress = "456 Another Street",
                EmploymentContract = _testContract
            };
            _context.Employees.Add(_testEmployee);

            // Setup test company
            var company = new Company
            {
                CompanyID = 1,
                Name = "Test Company",
                CTaxNumber = "CTAX001",
                VatNumber = "VAT001",
                RegistrationNumber = "REG001",
                Email = "company@example.com",
                Phone = "1234567890",
                BankAccountNumber = "COMPANY_BANK001",
                Country = "Test Country",
                PostalCode = "12345",
                City = "Test City",
                StreetAddress = "123 Company Street"
            };
            _context.Companies.Add(company);

            _context.SaveChanges();

            _mockConfiguration = new Mock<IConfiguration>();
            _mockConfiguration.Setup(c => c["Jwt:Key"]).Returns("YourSecretKeyForTestingThatIsLongEnoughForHmacSha256");
            _mockConfiguration.Setup(c => c["Jwt:Issuer"]).Returns("TestIssuer");
            _mockConfiguration.Setup(c => c["Jwt:Audience"]).Returns("TestAudience");

            _mockLogger = new Mock<ILogger<EmployeesController>>();

            // Create controller with real context
            _controller = new EmployeesController(
                _context,
                _mockConfiguration.Object,
                _mockLogger.Object
            );
        }

        private void SetupUserContext(string idCardNum, string email)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, idCardNum),
                new Claim(ClaimTypes.Name, email)
            };
            var identity = new ClaimsIdentity(claims, "TestAuthType");
            var claimsPrincipal = new ClaimsPrincipal(identity);

            // Set the user on the controller's ControllerContext
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = claimsPrincipal }
            };
        }

        [Test]
        public void GetEmployees_ReturnsAllEmployees()
        {
            // Act
            var result = _controller.GetEmployees();

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var okResult = (OkObjectResult)result;
            var employees = okResult.Value as IEnumerable<dynamic>;
            Assert.That(employees, Is.Not.Null);
            Assert.That(employees, Has.Count.EqualTo(2)); // Supervisor and employee
        }

        [Test]
        public async Task GetEmployee_WithValidId_ReturnsEmployee()
        {
            // Act
            var result = await _controller.GetEmployee("EMP001");

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var okResult = (OkObjectResult)result;
            dynamic employee = okResult.Value;
            Assert.That((string)employee.IdCardNum, Is.EqualTo("EMP001"));
            Assert.That((string)employee.FirstName, Is.EqualTo("Jane"));
            Assert.That((string)employee.JobTitle, Is.EqualTo("Software Developer"));
        }

        [Test]
        public async Task GetEmployee_WithInvalidId_ReturnsNotFound()
        {
            // Act
            var result = await _controller.GetEmployee("INVALID_ID");

            // Assert
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task DeleteEmployee_WithValidId_ReturnsOk()
        {
            // Act
            var result = await _controller.DeleteEmployee("EMP001");

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());

            // Verify employee was deleted
            var employee = await _context.Employees.FindAsync("EMP001");
            Assert.That(employee, Is.Null);

            // Verify contract was deleted
            var contract = await _context.EmploymentContracts.FindAsync(1);
            Assert.That(contract, Is.Null);
        }

        [Test]
        public async Task DeleteEmployee_WithInvalidId_ReturnsNotFound()
        {
            // Act
            var result = await _controller.DeleteEmployee("INVALID_ID");

            // Assert
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task GetCurrentEmployee_WhenAuthenticated_ReturnsEmployee()
        {
            // Arrange
            SetupUserContext("EMP001", "employee@example.com");

            // Act
            var result = await _controller.GetCurrentEmployee();

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var okResult = (OkObjectResult)result;
            dynamic employee = okResult.Value;
            Assert.That((string)employee.IdCardNum, Is.EqualTo("EMP001"));
            Assert.That((string)employee.Email, Is.EqualTo("employee@example.com"));
        }

        [Test]
        public async Task GetCurrentEmployee_WithInvalidUser_ReturnsNotFound()
        {
            // Arrange
            SetupUserContext("INVALID_ID", "invalid@example.com");

            // Act
            var result = await _controller.GetCurrentEmployee();

            // Assert
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task GetIdCardNumByEmail_WithValidEmail_ReturnsIdCardNum()
        {
            // Act
            var result = await _controller.GetIdCardNumByEmail("employee@example.com");

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var okResult = (OkObjectResult)result;
            Assert.That(okResult.Value.ToString(), Is.EqualTo("EMP001"));
        }

        [Test]
        public async Task GetIdCardNumByEmail_WithInvalidEmail_ReturnsNotFound()
        {
            // Act
            var result = await _controller.GetIdCardNumByEmail("invalid@example.com");

            // Assert
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task GetJobs_ReturnsAllJobs()
        {
            // Act
            var result = await _controller.GetJobs();

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var okResult = (OkObjectResult)result;
            var jobs = okResult.Value as IEnumerable<Job>;
            Assert.That(jobs, Is.Not.Null);
            Assert.That(jobs, Has.Count.EqualTo(1));
        }

        [Test]
        public async Task UpdateEmployee_WithValidData_ReturnsOk()
        {
            // Arrange
            var updateDto = new EmployeeUpdateDto
            {
                FirstName = "Updated",
                LastName = "Name",
                Email = "updated@example.com"
            };

            // Act
            var result = await _controller.UpdateEmployee("EMP001", updateDto);

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());

            // Verify employee was updated
            var employee = await _context.Employees.FindAsync("EMP001");
            Assert.That(employee.FirstName, Is.EqualTo("Updated"));
            Assert.That(employee.LastName, Is.EqualTo("Name"));
            Assert.That(employee.Email, Is.EqualTo("updated@example.com"));
        }

        [Test]
        public async Task UpdateEmployee_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            var updateDto = new EmployeeUpdateDto
            {
                FirstName = "Updated",
                LastName = "Name"
            };

            // Act
            var result = await _controller.UpdateEmployee("INVALID_ID", updateDto);

            // Assert
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public void Test_ReturnsOk()
        {
            // Act
            var result = _controller.Test();

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var okResult = (OkObjectResult)result;
            Assert.That(okResult.Value.ToString(), Is.EqualTo("API is working"));
        }

        [Test]
        public void TestAuth_WhenAuthenticated_ReturnsUserInfo()
        {
            // Arrange
            SetupUserContext("EMP001", "employee@example.com");

            // Act
            var result = _controller.TestAuth();

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var okResult = (OkObjectResult)result;
            dynamic response = okResult.Value;
            Assert.That((string)response.message, Is.EqualTo("Authentication successful"));
            Assert.That((string)response.userId, Is.EqualTo("EMP001"));
            Assert.That((string)response.userName, Is.EqualTo("employee@example.com"));
        }

        [Test]
        public async Task GetEmployeesUnderSupervision_AsSupervisor_ReturnsEmployees()
        {
            // Arrange
            SetupUserContext("SUP001", "supervisor@example.com");

            // Act
            var result = await _controller.GetEmployeesUnderSupervision();

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var okResult = (OkObjectResult)result;
            var employees = okResult.Value as IEnumerable<dynamic>;
            Assert.That(employees, Is.Not.Null);
            Assert.That(employees, Has.Count.EqualTo(1)); // One employee under supervision
        }

        [Test]
        public async Task UpdateAddress_WithValidData_ReturnsOk()
        {
            // Arrange
            SetupUserContext("EMP001", "employee@example.com");
            var addressDto = new AddressUpdateDto
            {
                Country = "Updated Country",
                PostalCode = "99999",
                City = "Updated City",
                StreetAddress = "999 Updated Street"
            };

            // Act
            var result = await _controller.UpdateAddress(addressDto);

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());

            // Verify address was updated
            var employee = await _context.Employees.FindAsync("EMP001");
            Assert.That(employee.Country, Is.EqualTo("Updated Country"));
            Assert.That(employee.PostalCode, Is.EqualTo("99999"));
            Assert.That(employee.City, Is.EqualTo("Updated City"));
            Assert.That(employee.StreetAddress, Is.EqualTo("999 Updated Street"));
        }

        [Test]
        public async Task UpdateBirthData_WithValidData_ReturnsOk()
        {
            // Arrange
            SetupUserContext("EMP001", "employee@example.com");
            var birthDataDto = new BirthDataUpdateDto
            {
                FirstName = "Updated",
                LastName = "Name",
                MiddleName = "New",
                PlaceOfBirth = "Updated City",
                DateOfBirth = new DateTime(1995, 5, 5)
            };

            // Act
            var result = await _controller.UpdateBirthData(birthDataDto);

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());

            // Verify birth data was updated
            var employee = await _context.Employees.FindAsync("EMP001");
            Assert.That(employee.FirstName, Is.EqualTo("Updated"));
            Assert.That(employee.LastName, Is.EqualTo("Name"));
            Assert.That(employee.MiddleName, Is.EqualTo("New"));
            Assert.That(employee.placeOfBirth, Is.EqualTo("Updated City"));
            Assert.That(employee.DateOfBirth, Is.EqualTo(new DateTime(1995, 5, 5)));
        }

        [Test]
        public async Task UpdatePersonalData_WithValidData_ReturnsOk()
        {
            // Arrange
            SetupUserContext("EMP001", "employee@example.com");
            var personalDataDto = new PersonalDataUpdateDto
            {
                Email = "newemail@example.com",
                PhoneNumber = "5555555555",
                BankAccountNumber = "NEW_BANK001",
                TaxNum = "NEW_TAX001",
                SocialSecNum = "NEW_SSN001"
            };

            // Act
            var result = await _controller.UpdatePersonalData(personalDataDto);

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());

            // Verify personal data was updated
            var employee = await _context.Employees.FindAsync("EMP001");
            Assert.That(employee.Email, Is.EqualTo("newemail@example.com"));
            Assert.That(employee.PhoneNumber, Is.EqualTo("5555555555"));
            Assert.That(employee.BankAccountNumber, Is.EqualTo("NEW_BANK001"));
            Assert.That(employee.TaxNum, Is.EqualTo("NEW_TAX001"));
            Assert.That(employee.SocialSecNum, Is.EqualTo("NEW_SSN001"));
        }

        [Test]
        public async Task ChangePassword_WithValidData_ReturnsOk()
        {
            // Arrange
            SetupUserContext("EMP001", "employee@example.com");

            // Set a known password for testing
            var employee = await _context.Employees.FindAsync("EMP001");
            employee.Pass = BCrypt.Net.BCrypt.HashPassword("oldpassword");
            await _context.SaveChangesAsync();

            var passwordDto = new ChangePasswordDto
            {
                OldPassword = "oldpassword",
                NewPassword = "newpassword"
            };

            // Act
            var result = await _controller.ChangePassword(passwordDto);

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());

            // Verify password was changed
            employee = await _context.Employees.FindAsync("EMP001");
            Assert.That(BCrypt.Net.BCrypt.Verify("newpassword", employee.Pass), Is.True);
        }

        [Test]
        public async Task ChangePassword_WithIncorrectOldPassword_ReturnsBadRequest()
        {
            // Arrange
            SetupUserContext("EMP001", "employee@example.com");

            // Set a known password for testing
            var employee = await _context.Employees.FindAsync("EMP001");
            employee.Pass = BCrypt.Net.BCrypt.HashPassword("oldpassword");
            await _context.SaveChangesAsync();

            var passwordDto = new ChangePasswordDto
            {
                OldPassword = "wrongpassword",
                NewPassword = "newpassword"
            };

            // Act
            var result = await _controller.ChangePassword(passwordDto);

            // Assert
            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
        }

        [Test]
        public async Task UploadProfilePhoto_WithValidFile_ReturnsOk()
        {
            // Arrange
            SetupUserContext("EMP001", "employee@example.com");
            var formFile = CreateTestFormFile("photo.jpg", "image/jpeg", 100);
            var photoDto = new ProfilePhotoUploadDto
            {
                ProfilePhoto = formFile
            };

            // Act
            var result = await _controller.UploadProfilePhoto(photoDto);

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());

            // Verify photo was uploaded
            var employee = await _context.Employees.FindAsync("EMP001");
            Assert.That(employee.ProfilePhoto, Is.Not.Null);
            Assert.That(employee.ProfilePhoto.Length, Is.GreaterThan(0));
        }

        [Test]
        public async Task GetProfilePhoto_WithExistingPhoto_ReturnsFile()
        {
            // Arrange
            SetupUserContext("EMP001", "employee@example.com");

            // Set a test photo
            var employee = await _context.Employees.FindAsync("EMP001");
            employee.ProfilePhoto = new byte[] { 1, 2, 3, 4, 5 };
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetProfilePhoto();

            // Assert
            Assert.That(result, Is.InstanceOf<FileContentResult>());
            var fileResult = (FileContentResult)result;
            Assert.That(fileResult.FileContents, Is.EqualTo(new byte[] { 1, 2, 3, 4, 5 }));
            Assert.That(fileResult.ContentType, Is.EqualTo("image/jpeg"));
        }

        [Test]
        public async Task GetProfilePhoto_WithNoPhoto_ReturnsNotFound()
        {
            // Arrange
            SetupUserContext("EMP001", "employee@example.com");

            // Ensure no photo exists
            var employee = await _context.Employees.FindAsync("EMP001");
            employee.ProfilePhoto = null;
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetProfilePhoto();

            // Assert
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task DeleteProfilePhoto_WithExistingPhoto_ReturnsOk()
        {
            // Arrange
            SetupUserContext("EMP001", "employee@example.com");

            // Set a test photo
            var employee = await _context.Employees.FindAsync("EMP001");
            employee.ProfilePhoto = new byte[] { 1, 2, 3, 4, 5 };
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.DeleteProfilePhoto();

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());

            // Verify photo was deleted
            employee = await _context.Employees.FindAsync("EMP001");
            Assert.That(employee.ProfilePhoto, Is.Null);
        }

        [Test]
        public async Task CreateOrUpdateCompany_WithValidData_ReturnsOk()
        {
            // Arrange
            SetupUserContext("EMP001", "employee@example.com");
            var companyDto = new CompanyDto
            {
                Name = "Updated Company",
                CTaxNumber = "NEW_CTAX001",
                VatNumber = "NEW_VAT001",
                RegistrationNumber = "NEW_REG001",
                Email = "newcompany@example.com",
                Phone = "9999999999",
                BankAccountNumber = "NEW_COMPANY_BANK001",
                Country = "New Country",
                PostalCode = "99999",
                City = "New City",
                StreetAddress = "999 New Street"
            };

            // Act
            var result = await _controller.CreateOrUpdateCompany(companyDto);

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());

            // Verify company was updated
            var company = await _context.Companies.FindAsync(1);
            Assert.That(company.Name, Is.EqualTo("Updated Company"));
            Assert.That(company.Email, Is.EqualTo("newcompany@example.com"));
        }

        [Test]
        public async Task GetCompany_ReturnsCompanyInfo()
        {
            // Arrange
            SetupUserContext("EMP001", "employee@example.com");

            // Act
            var result = await _controller.GetCompany();

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var okResult = (OkObjectResult)result;
            dynamic company = okResult.Value;
            Assert.That((string)company.Name, Is.EqualTo("Test Company"));
            Assert.That((string)company.Email, Is.EqualTo("company@example.com"));
        }

        [TearDown]
        public void TearDown()
        {
            // Ensure proper cleanup of resources
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        // Helper method to create a test IFormFile
        private IFormFile CreateTestFormFile(string fileName, string contentType, int length)
        {
            byte[] content = new byte[length];
            for (int i = 0; i < length; i++)
            {
                content[i] = (byte)(i % 256);
            }

            var stream = new MemoryStream(content);
            var formFile = new Mock<IFormFile>();
            formFile.Setup(f => f.FileName).Returns(fileName);
            formFile.Setup(f => f.ContentType).Returns(contentType);
            formFile.Setup(f => f.Length).Returns(length);
            formFile.Setup(f => f.CopyToAsync(It.IsAny<Stream>(), It.IsAny<CancellationToken>()))
                .Returns((Stream stream, CancellationToken token) =>
                {
                    return stream.WriteAsync(content, 0, content.Length, token);
                });

            return formFile.Object;
        }
    }
}

