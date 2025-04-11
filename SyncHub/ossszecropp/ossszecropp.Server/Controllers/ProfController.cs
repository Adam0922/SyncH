using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ossszecropp.Server.Data;
using System.Threading.Tasks;

namespace ossszecropp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProfController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProfController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Prof/{idCardNum}
        [HttpGet("{idCardNum}")]
        public async Task<IActionResult> GetEmployee(string idCardNum)
        {
            try
            {
                var employee = await _context.Employees
                    .Include(e => e.EmploymentContract)
                    .ThenInclude(ec => ec.Job)
                    .FirstOrDefaultAsync(e => e.IdCardNum == idCardNum);

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
                    employee.TaxNum, // Ensure TaxNum is included
                    employee.SocialSecNum,
                    employee.DateOfBirth,
                    employee.placeOfBirth,
                    employee.BankAccountNumber,
                    employee.Country,
                    employee.PostalCode,
                    employee.City,
                    employee.StreetAddress,
                    JobTitle = employee.EmploymentContract != null && employee.EmploymentContract.Job != null ? employee.EmploymentContract.Job.JobTitle : "Unknown"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred.", details = ex.Message });
            }
        }
    }
}
