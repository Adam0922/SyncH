using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ossszecropp.Server.Data;
using ossszecropp.Server.Models;

[ApiController]
[Route("api/[controller]")]
public class ServicesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IWebHostEnvironment _environment;

    public ServicesController(ApplicationDbContext context, IWebHostEnvironment environment)
    {
        _context = context;
        _environment = environment;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetServices()
    {
        try
        {
            var services = await _context.Services.ToListAsync();

            // Transform the data to match what the frontend expects
            var result = services.Select(s => new
            {
                serviceID = s.ServiceID,
                serviceName = s.ServiceName,
                servicePrice = s.ServicePrice,
                serviceFiatType = s.ServiceFiatType,
                serviceDescription = s.ServiceDescription,
                serviceIcon = s.ServiceIcon ?? "app" // Default to 'app' if not set
            });

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving services.", details = ex.Message });
        }
    }

    // POST: api/Services
    [HttpPost]
    public async Task<ActionResult<Service>> CreateService([FromForm] ServiceCreateDto dto)
    {
        try
        {
            var service = new Service
            {
                ServiceName = dto.ServiceName,
                ServicePrice = dto.ServicePrice,
                ServiceFiatType = dto.ServiceFiatType,
                ServiceDescription = dto.ServiceDescription,
                ServiceIcon = dto.ServiceIcon ?? "app", // Default to 'app' if not provided
                Created_at = DateTime.UtcNow
            };

            _context.Services.Add(service);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetService), new { id = service.ServiceID }, service);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while creating the service.", details = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetService(int id)
    {
        var service = await _context.Services.FindAsync(id);

        if (service == null)
        {
            return NotFound();
        }

        // Transform the data to match what the frontend expects
        var result = new
        {
            serviceID = service.ServiceID,
            serviceName = service.ServiceName,
            servicePrice = service.ServicePrice,
            serviceFiatType = service.ServiceFiatType,
            serviceDescription = service.ServiceDescription,
            serviceIcon = service.ServiceIcon ?? "app" // Default to 'app' if not set
        };

        return Ok(result);
    }

    // PUT: api/Services/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateService(int id, [FromForm] ServiceUpdateDto dto)
    {
        try
        {
            var service = await _context.Services.FindAsync(id);
            if (service == null)
            {
                return NotFound();
            }

            // Update service properties
            service.ServiceName = dto.ServiceName ?? service.ServiceName;
            service.ServicePrice = dto.ServicePrice ?? service.ServicePrice;
            service.ServiceFiatType = dto.ServiceFiatType ?? service.ServiceFiatType;
            service.ServiceDescription = dto.ServiceDescription ?? service.ServiceDescription;
            service.ServiceIcon = dto.ServiceIcon ?? service.ServiceIcon;
            service.Last_updated = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while updating the service.", details = ex.Message });
        }
    }

    // DELETE: api/Services/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteService(int id)
    {
        try
        {
            var service = await _context.Services.FindAsync(id);
            if (service == null)
            {
                return NotFound();
            }

            _context.Services.Remove(service);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while deleting the service.", details = ex.Message });
        }
    }
}
