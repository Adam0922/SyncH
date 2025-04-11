using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;
using ossszecropp.Server.Controllers;
using ossszecropp.Server.Data;
using ossszecropp.Server.Models;

namespace ossszecropp.Server.Tests.Controllers
{
    [TestFixture]
    public class EmployeeRegistrationControllerTests
    {
        private ApplicationDbContext _context;
        private EmployeeRegistrationController _controller;
        private Employees _testSupervisor;

        [SetUp]
        public void Setup()
        {
            // Create a mock DbContext options with a unique database name for each test
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            // Create actual context with in-memory database
            _context = new ApplicationDbContext(options);

            // Setup test supervisor
            _testSupervisor = new Employees
            {
                IdCardNum = "SUP001",
                FirstName = "John",
                LastName = "Supervisor",
                Email = "supervisor@example.com",
                Pass = "password123",
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
                IsSupervisor = false // Will be updated to true during test
            };

            _context.Employees.Add(_testSupervisor);
            _context.SaveChanges();

            // Create controller with real context
            _controller = new EmployeeRegistrationController(_context);
        }

        [Test]
        public async Task RegisterEmployee_WithValidData_ReturnsOk()
        {
            // Arrange
            var registrationDto = new EmployeeRegistrationDto
            {
                IdCardNum = "EMP001",
                FirstName = "Jane",
                LastName = "Employee",
                MiddleName = "Test",
                Email = "employee@example.com",
                Password = "password123",
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
                SupervisorId = "SUP001",
                JobId = 1,
                StartDate = DateTime.Now,
                EndDate = DateTime.Now.AddYears(1),
                HourlyRates = (int)20.0m,
                working_hours = 40,
                DaysOffNum = 20
            };

            // Act
            var result = await _controller.RegisterEmployee(registrationDto);

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var okResult = (OkObjectResult)result;
            dynamic response = okResult.Value;
            Assert.That((string)response.message, Is.EqualTo("Employee registered successfully"));

            // Verify employee was created
            var employee = await _context.Employees.FirstOrDefaultAsync(e => e.IdCardNum == "EMP001");
            Assert.That(employee, Is.Not.Null);
            Assert.That(employee.Email, Is.EqualTo("employee@example.com"));

            // Verify supervisor was updated
            var supervisor = await _context.Employees.FirstOrDefaultAsync(e => e.IdCardNum == "SUP001");
            Assert.That(supervisor.IsSupervisor, Is.True);

            // Verify contract was created
            var contract = await _context.EmploymentContracts.FirstOrDefaultAsync(c => c.SupervisorID == "SUP001");
            Assert.That(contract, Is.Not.Null);
            Assert.That(contract.HourlyRates, Is.EqualTo(20.0m));
        }

        [Test]
        public async Task RegisterEmployee_WithExistingEmployee_ReturnsConflict()
        {
            // Arrange
            // Add an existing employee with the same IdCardNum
            var existingEmployee = new Employees
            {
                IdCardNum = "EMP001",
                FirstName = "Existing",
                LastName = "Employee",
                Email = "existing@example.com",
                Pass = "password123",
                Country = "Test Country",
                PostalCode = "12345",
                City = "Test City",
                StreetAddress = "123 Test Street"
            };
            _context.Employees.Add(existingEmployee);
            await _context.SaveChangesAsync();

            var registrationDto = new EmployeeRegistrationDto
            {
                IdCardNum = "EMP001", // Same as existing employee
                FirstName = "Jane",
                LastName = "Employee",
                Email = "employee@example.com",
                Password = "password123",
                SupervisorId = "SUP001",
                JobId = 1,
                StartDate = DateTime.Now,
                EndDate = DateTime.Now.AddYears(1),
                HourlyRates = (int)20.0m,
                working_hours = 40,
                DaysOffNum = 20,
                Country = "Test Country",
                PostalCode = "12345",
                City = "Test City",
                StreetAddress = "123 Test Street"
            };

            // Act
            var result = await _controller.RegisterEmployee(registrationDto);

            // Assert
            Assert.That(result, Is.InstanceOf<ConflictObjectResult>());
            var conflictResult = (ConflictObjectResult)result;
            dynamic response = conflictResult.Value;
            Assert.That((string)response.message, Is.EqualTo("An employee with the same IdCardNum already exists."));
        }


        [Test]
        public async Task RegisterEmployee_WithInvalidModel_ReturnsBadRequest()
        {
            // Arrange
            var registrationDto = new EmployeeRegistrationDto
            {
                // Missing required fields
                IdCardNum = "EMP001",
                FirstName = "Jane"
                // Other fields missing
            };

            // Setup ModelState error
            _controller.ModelState.AddModelError("LastName", "Last name is required");

            // Act
            var result = await _controller.RegisterEmployee(registrationDto);

            // Assert
            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
        }


    }
}
