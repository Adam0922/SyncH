using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;
using ossszecropp.Server.Controllers;
using ossszecropp.Server.Data;
using ossszecropp.Server.Models;

namespace ossszecropp.Server.Tests.Models
{
    [TestFixture]
    public class DataControllerTests
    {
        private ApplicationDbContext _context;
        private Mock<IConfiguration> _mockConfiguration;
        private Mock<ILogger<DataController>> _mockLogger;
        private DataController _controller;

        [SetUp]
        public void Setup()
        {
            // Create a mock DbContext options with a unique database name for each test
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            // Create actual context with in-memory database
            _context = new ApplicationDbContext(options);

            // Setup test data with all required properties
            _context.Employees.Add(new Employees
            {
                IdCardNum = "EMP001",
                FirstName = "John",
                MiddleName = "",
                LastName = "Doe",
                Email = "john.doe@example.com",
                Pass = "password123", // Plain text password for testing
                City = "Test City",
                Country = "Test Country",
                PostalCode = "12345",
                StreetAddress = "123 Test Street"
            });

            _context.Employees.Add(new Employees
            {
                IdCardNum = "EMP002",
                FirstName = "Jane",
                MiddleName = "Marie",
                LastName = "Smith",
                Email = "jane.smith@example.com",
                Pass = BCrypt.Net.BCrypt.HashPassword("securepass"), // BCrypt hashed password
                City = "Another City",
                Country = "Another Country",
                PostalCode = "54321",
                StreetAddress = "456 Another Street"
            });

            _context.SaveChanges();

            _mockConfiguration = new Mock<IConfiguration>();
            _mockConfiguration.Setup(c => c["Jwt:Key"]).Returns("YourSecretKeyForTestingThatIsLongEnoughForHmacSha256");
            _mockConfiguration.Setup(c => c["Jwt:Issuer"]).Returns("TestIssuer");
            _mockConfiguration.Setup(c => c["Jwt:Audience"]).Returns("TestAudience");

            _mockLogger = new Mock<ILogger<DataController>>();

            // Create controller with real context
            _controller = new DataController(
                _context,
                _mockConfiguration.Object,
                _mockLogger.Object
            );
        }

        [Test]
        public async Task Login_WithValidEmail_ReturnsOkWithToken()
        {
            // Arrange
            var loginModel = new LoginModel
            {
                Identifier = "john.doe@example.com",
                Password = "password123"
            };

            // Act
            var result = await _controller.Login(loginModel);

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var okResult = (OkObjectResult)result;

            dynamic responseValue = okResult.Value;
            Assert.That((bool)responseValue.success, Is.True);
            Assert.That(responseValue.token, Is.Not.Null);
        }

        [Test]
        public async Task Login_WithFullNameAndMiddleName_ReturnsOkWithToken()
        {
            // Arrange
            var loginModel = new LoginModel
            {
                Identifier = "Jane Marie Smith",
                Password = "securepass"
            };

            // Act
            var result = await _controller.Login(loginModel);

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var okResult = (OkObjectResult)result;

            dynamic responseValue = okResult.Value;
            Assert.That((bool)responseValue.success, Is.True);
            Assert.That(responseValue.token, Is.Not.Null);
        }

        [Test]
        public async Task Login_WithInvalidPassword_ReturnsUnauthorized()
        {
            // Arrange
            var loginModel = new LoginModel
            {
                Identifier = "john.doe@example.com",
                Password = "wrongpassword"
            };

            // Act
            var result = await _controller.Login(loginModel);

            // Assert
            Assert.That(result, Is.InstanceOf<UnauthorizedObjectResult>());
            var unauthorizedResult = (UnauthorizedObjectResult)result;

            dynamic responseValue = unauthorizedResult.Value;
            Assert.That((bool)responseValue.success, Is.False);
            Assert.That((string)responseValue.message, Is.EqualTo("Invalid username or password."));
        }

        [Test]
        public async Task Login_WithEmptyPassword_ReturnsBadRequest()
        {
            // Arrange
            var loginModel = new LoginModel
            {
                Identifier = "john.doe@example.com",
                Password = ""
            };

            // Act
            var result = await _controller.Login(loginModel);

            // Assert
            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
            var badRequestResult = (BadRequestObjectResult)result;

            dynamic responseValue = badRequestResult.Value;
            Assert.That((string)responseValue.message, Is.EqualTo("Password is required."));
        }

        [Test]
        public async Task Login_WithNonExistentUser_ReturnsUnauthorized()
        {
            // Arrange
            var loginModel = new LoginModel
            {
                Identifier = "nonexistent@example.com",
                Password = "anypassword"
            };

            // Act
            var result = await _controller.Login(loginModel);

            // Assert
            Assert.That(result, Is.InstanceOf<UnauthorizedObjectResult>());
            var unauthorizedResult = (UnauthorizedObjectResult)result;

            dynamic responseValue = unauthorizedResult.Value;
            Assert.That((bool)responseValue.success, Is.False);
            Assert.That((string)responseValue.message, Is.EqualTo("Invalid username or password."));
        }



        [TearDown]
        public void TearDown()
        {
            // Ensure proper cleanup of resources
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}
