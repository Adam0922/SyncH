using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ossszecropp.Server.Data;
using ossszecropp.Server.Models;
using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace ossszecropp.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class EquipmentController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<EquipmentController> _logger;

        public EquipmentController(ApplicationDbContext context, ILogger<EquipmentController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/Equipment
        [HttpGet]
        public async Task<IActionResult> GetEquipment()
        {
            try
            {
                var equipmentQuery = await _context.Equipment.ToListAsync();

                // Handle NULL values before returning
                var equipment = equipmentQuery.Select(e => new
                {
                    SerialNumber = e.SerialNumber ?? string.Empty,
                    EquipmentName = e.EquipmentName ?? string.Empty,
                    Employee = e.Employee ?? string.Empty,
                    Status = e.Status ?? string.Empty,
                    Category = e.Category ?? string.Empty,
                    PurchaseDate = e.PurchaseDate,
                    LastServiceDate = e.LastServiceDate,
                    WarrantyExpiration = e.WarrantyExpiration,
                    Remarks = e.Remarks ?? string.Empty
                }).ToList();

                return Ok(equipment);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting equipment");
                return StatusCode(500, new { message = "An error occurred while retrieving equipment.", details = ex.Message });
            }
        }


        // GET: api/Equipment/5
        [HttpGet("{serialNumber}")]
        public async Task<IActionResult> GetEquipment(string serialNumber)
        {
            try
            {
                var equipment = await _context.Equipment.FindAsync(serialNumber);

                if (equipment == null)
                {
                    return NotFound(new { message = "Equipment not found." });
                }

                return Ok(equipment);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting equipment with Serial Number {serialNumber}");
                return StatusCode(500, new { message = "An error occurred while retrieving the equipment.", details = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateEquipment([FromBody] EquipmentDto equipmentDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var now = DateTime.UtcNow;
                var equipment = new Equipment
                {
                    SerialNumber = equipmentDto.SerialNumber ?? string.Empty,
                    EquipmentName = equipmentDto.EquipmentName ?? string.Empty,
                    Employee = equipmentDto.Employee ?? string.Empty,
                    Status = equipmentDto.Status ?? "Issued",
                    Category = equipmentDto.Category ?? "Laptop",
                    PurchaseDate = string.IsNullOrEmpty(equipmentDto.PurchaseDate)
                        ? now
                        : DateTime.TryParse(equipmentDto.PurchaseDate, out var purchaseDate) ? purchaseDate : now,
                    WarrantyExpiration = string.IsNullOrEmpty(equipmentDto.WarrantyExpiration)
                        ? null
                        : DateTime.TryParse(equipmentDto.WarrantyExpiration, out var warrantyDate) ? warrantyDate : (DateTime?)null,
                    LastServiceDate = string.IsNullOrEmpty(equipmentDto.LastServiceDate)
                        ? null
                        : DateTime.TryParse(equipmentDto.LastServiceDate, out var serviceDate) ? serviceDate : (DateTime?)null,
                    Remarks = equipmentDto.Remarks ?? string.Empty,
                    CreatedAt = now,
                    UpdatedAt = now
                };

                _context.Equipment.Add(equipment);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetEquipment), new { serialNumber = equipment.SerialNumber }, equipment);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error creating equipment: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred while creating the equipment.", details = ex.Message });
            }
        }


        // PUT: api/Equipment/serial/{serialNumber}
        [HttpPut("serial/{serialNumber}")]
        public async Task<IActionResult> UpdateEquipmentBySerial(string serialNumber, [FromBody] Equipment equipment)
        {
            try
            {
                var existingEquipment = await _context.Equipment.FirstOrDefaultAsync(e => e.SerialNumber == serialNumber);

                if (existingEquipment == null)
                {
                    return NotFound(new { message = "Equipment not found." });
                }

                // Update the existing equipment with new values
                existingEquipment.EquipmentName = equipment.EquipmentName;
                existingEquipment.Employee = equipment.Employee;
                existingEquipment.Status = equipment.Status;
                existingEquipment.Category = equipment.Category;
                existingEquipment.PurchaseDate = equipment.PurchaseDate;
                existingEquipment.LastServiceDate = equipment.LastServiceDate;
                existingEquipment.WarrantyExpiration = equipment.WarrantyExpiration;
                existingEquipment.Remarks = equipment.Remarks;

                await _context.SaveChangesAsync();

                return Ok(new { message = "Equipment updated successfully", equipment = existingEquipment });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating equipment with serial number {serialNumber}");
                return StatusCode(500, new { message = "An error occurred while updating the equipment.", details = ex.Message });
            }
        }

        [HttpGet("user/{email}")]
        public async Task<IActionResult> GetEquipmentByUserEmail(string email)
        {
            try
            {
                var equipment = await _context.Equipment
                    .Where(e => e.Employee == email) // Adjusted the property name to 'Employee'
                    .ToListAsync();

                if (equipment == null || !equipment.Any())
                {
                    return NotFound(new { message = "No equipment found for this user." });
                }

                return Ok(equipment);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting equipment by user email");
                return StatusCode(500, new { message = "An error occurred while retrieving equipment.", details = ex.Message });
            }
        }

        // GET: api/Equipment/current-user
        [HttpGet("current-user")]
        public async Task<IActionResult> GetCurrentUserEquipment()
        {
            try
            {
                var userEmail = User.FindFirstValue(ClaimTypes.Name);
                if (string.IsNullOrEmpty(userEmail))
                {
                    return Unauthorized(new { message = "User is not logged in." });
                }

                var equipment = await _context.Equipment
                    .Where(e => e.Employee == userEmail)
                    .ToListAsync();

                return Ok(equipment);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting equipment for current user");
                return StatusCode(500, new { message = "An error occurred while retrieving equipment.", details = ex.Message });
            }
        }



        // DELETE: api/Equipment/5
        [HttpDelete("{serialNumber}")]
        public async Task<IActionResult> DeleteEquipment(string serialNumber)
        {
            try
            {
                var equipment = await _context.Equipment.FindAsync(serialNumber);
                if (equipment == null)
                {
                    return NotFound(new { message = "Equipment not found." });
                }

                _context.Equipment.Remove(equipment);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Equipment deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting equipment with Serial Number {serialNumber}");
                return StatusCode(500, new { message = "An error occurred while deleting the equipment.", details = ex.Message });
            }
        }

        private bool EquipmentExists(string serialNumber)
        {
            return _context.Equipment.Any(e => e.SerialNumber == serialNumber);
        }

    }
}
