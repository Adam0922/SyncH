using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
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
    public class EquipmentControllerTests
    {
        private ApplicationDbContext _context;
        private Mock<ILogger<EquipmentController>> _mockLogger;
        private EquipmentController _controller;
        private List<Equipment> _testEquipment;

        [SetUp]
        public void Setup()
        {
            // Create a mock DbContext options with a unique database name for each test
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            // Create actual context with in-memory database
            _context = new ApplicationDbContext(options);

            // Setup test equipment
            _testEquipment = new List<Equipment>
            {
                new Equipment
                {
                    SerialNumber = "SN001",
                    EquipmentName = "Test Laptop 1",
                    Employee = "employee@example.com",
                    Status = "Issued",
                    Category = "Laptop",
                    PurchaseDate = DateTime.UtcNow.AddMonths(-6),
                    WarrantyExpiration = DateTime.UtcNow.AddYears(2),
                    LastServiceDate = DateTime.UtcNow.AddMonths(-1),
                    Remarks = "Test remarks 1",
                    CreatedAt = DateTime.UtcNow.AddMonths(-6),
                    UpdatedAt = DateTime.UtcNow.AddDays(-1)
                },
                new Equipment
                {
                    SerialNumber = "SN002",
                    EquipmentName = "Test Monitor",
                    Employee = "employee@example.com",
                    Status = "Issued",
                    Category = "Monitor",
                    PurchaseDate = DateTime.UtcNow.AddMonths(-3),
                    WarrantyExpiration = DateTime.UtcNow.AddYears(1),
                    LastServiceDate = null,
                    Remarks = "Test remarks 2",
                    CreatedAt = DateTime.UtcNow.AddMonths(-3),
                    UpdatedAt = DateTime.UtcNow.AddDays(-1)
                },
                new Equipment
                {
                    SerialNumber = "SN003",
                    EquipmentName = "Test Phone",
                    Employee = "supervisor@example.com",
                    Status = "Issued",
                    Category = "Mobile",
                    PurchaseDate = DateTime.UtcNow.AddMonths(-2),
                    WarrantyExpiration = DateTime.UtcNow.AddYears(1),
                    LastServiceDate = null,
                    Remarks = "Test remarks 3",
                    CreatedAt = DateTime.UtcNow.AddMonths(-2),
                    UpdatedAt = DateTime.UtcNow.AddDays(-1)
                }
            };

            _context.Equipment.AddRange(_testEquipment);
            _context.SaveChanges();

            _mockLogger = new Mock<ILogger<EquipmentController>>();

            // Create controller with real context
            _controller = new EquipmentController(
                _context,
                _mockLogger.Object
            );
        }

        private void SetupUserContext(string email)
        {
            var claims = new List<Claim>
            {
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
        public async Task GetEquipment_ReturnsAllEquipment()
        {
            // Act
            var result = await _controller.GetEquipment();

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var okResult = (OkObjectResult)result;
            var equipment = okResult.Value as IEnumerable<dynamic>;
            Assert.That(equipment, Is.Not.Null);
            Assert.That(equipment, Has.Count.EqualTo(3));
        }

        [Test]
        public async Task GetEquipment_WithValidSerialNumber_ReturnsEquipment()
        {
            // Act
            var result = await _controller.GetEquipment("SN001");

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var okResult = (OkObjectResult)result;
            var equipment = okResult.Value as Equipment;
            Assert.That(equipment, Is.Not.Null);
            Assert.That(equipment.SerialNumber, Is.EqualTo("SN001"));
            Assert.That(equipment.EquipmentName, Is.EqualTo("Test Laptop 1"));
        }

        [Test]
        public async Task GetEquipment_WithInvalidSerialNumber_ReturnsNotFound()
        {
            // Act
            var result = await _controller.GetEquipment("INVALID_SN");

            // Assert
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task CreateEquipment_WithValidData_ReturnsCreatedAtAction()
        {
            // Arrange
            var equipmentDto = new EquipmentDto
            {
                SerialNumber = "SN004",
                EquipmentName = "New Test Equipment",
                Employee = "newemployee@example.com",
                Status = "Available",
                Category = "Printer",
                PurchaseDate = DateTime.UtcNow.ToString("yyyy-MM-dd"),
                WarrantyExpiration = DateTime.UtcNow.AddYears(3).ToString("yyyy-MM-dd"),
                LastServiceDate = null,
                Remarks = "New test remarks"
            };

            // Act
            var result = await _controller.CreateEquipment(equipmentDto);

            // Assert
            Assert.That(result, Is.InstanceOf<CreatedAtActionResult>());
            var createdResult = (CreatedAtActionResult)result;
            var equipment = createdResult.Value as Equipment;
            Assert.That(equipment, Is.Not.Null);
            Assert.That(equipment.SerialNumber, Is.EqualTo("SN004"));
            Assert.That(equipment.EquipmentName, Is.EqualTo("New Test Equipment"));

            // Verify it was added to the database
            var dbEquipment = await _context.Equipment.FindAsync("SN004");
            Assert.That(dbEquipment, Is.Not.Null);
        }

        [Test]
        public async Task CreateEquipment_WithInvalidModel_ReturnsBadRequest()
        {
            // Arrange
            var equipmentDto = new EquipmentDto
            {
                // Missing required fields
                SerialNumber = null,
                EquipmentName = "Invalid Equipment"
            };

            // Setup ModelState error
            _controller.ModelState.AddModelError("SerialNumber", "Serial number is required");

            // Act
            var result = await _controller.CreateEquipment(equipmentDto);

            // Assert
            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
        }

        [Test]
        public async Task UpdateEquipmentBySerial_WithValidData_ReturnsOk()
        {
            // Arrange
            var updatedEquipment = new Equipment
            {
                SerialNumber = "SN001",
                EquipmentName = "Updated Equipment Name",
                Employee = "updated@example.com",
                Status = "Under Repair",
                Category = "Laptop",
                PurchaseDate = DateTime.UtcNow.AddMonths(-6),
                WarrantyExpiration = DateTime.UtcNow.AddYears(2),
                LastServiceDate = DateTime.UtcNow,
                Remarks = "Updated remarks"
            };

            // Act
            var result = await _controller.UpdateEquipmentBySerial("SN001", updatedEquipment);

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());

            // Verify equipment was updated
            var dbEquipment = await _context.Equipment.FindAsync("SN001");
            Assert.That(dbEquipment.EquipmentName, Is.EqualTo("Updated Equipment Name"));
            Assert.That(dbEquipment.Employee, Is.EqualTo("updated@example.com"));
            Assert.That(dbEquipment.Status, Is.EqualTo("Under Repair"));
            Assert.That(dbEquipment.Remarks, Is.EqualTo("Updated remarks"));
        }

        [Test]
        public async Task UpdateEquipmentBySerial_WithInvalidSerialNumber_ReturnsNotFound()
        {
            // Arrange
            var updatedEquipment = new Equipment
            {
                SerialNumber = "INVALID_SN",
                EquipmentName = "Updated Equipment Name"
            };

            // Act
            var result = await _controller.UpdateEquipmentBySerial("INVALID_SN", updatedEquipment);

            // Assert
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task GetEquipmentByUserEmail_WithValidEmail_ReturnsEquipment()
        {
            // Act
            var result = await _controller.GetEquipmentByUserEmail("employee@example.com");

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var okResult = (OkObjectResult)result;
            var equipment = okResult.Value as IEnumerable<Equipment>;
            Assert.That(equipment, Is.Not.Null);
            Assert.That(equipment, Has.Count.EqualTo(2));
        }

        [Test]
        public async Task GetEquipmentByUserEmail_WithInvalidEmail_ReturnsNotFound()
        {
            // Act
            var result = await _controller.GetEquipmentByUserEmail("nonexistent@example.com");

            // Assert
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task GetCurrentUserEquipment_WhenAuthenticated_ReturnsEquipment()
        {
            // Arrange
            SetupUserContext("employee@example.com");

            // Act
            var result = await _controller.GetCurrentUserEquipment();

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var okResult = (OkObjectResult)result;
            var equipment = okResult.Value as IEnumerable<Equipment>;
            Assert.That(equipment, Is.Not.Null);
            Assert.That(equipment, Has.Count.EqualTo(2));
        }

        [Test]
        public async Task GetCurrentUserEquipment_WithNoEquipment_ReturnsEmptyList()
        {
            // Arrange
            SetupUserContext("noequipment@example.com");

            // Act
            var result = await _controller.GetCurrentUserEquipment();

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var okResult = (OkObjectResult)result;
            var equipment = okResult.Value as IEnumerable<Equipment>;
            Assert.That(equipment, Is.Not.Null);
            Assert.That(equipment, Is.Empty);
        }

        [Test]
        public async Task DeleteEquipment_WithValidSerialNumber_ReturnsOk()
        {
            // Act
            var result = await _controller.DeleteEquipment("SN001");

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());

            // Verify equipment was deleted
            var dbEquipment = await _context.Equipment.FindAsync("SN001");
            Assert.That(dbEquipment, Is.Null);
        }

        [Test]
        public async Task DeleteEquipment_WithInvalidSerialNumber_ReturnsNotFound()
        {
            // Act
            var result = await _controller.DeleteEquipment("INVALID_SN");

            // Assert
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
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
