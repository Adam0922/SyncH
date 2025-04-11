using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ossszecropp.Server.Data;
using ossszecropp.Server.Models;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace ossszecropp.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class incomeController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<incomeController> _logger;

        public incomeController(ApplicationDbContext context, ILogger<incomeController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/income
        [HttpGet]
        public async Task<IActionResult> Getincome()
        {
            try
            {
                var income = await _context.Income.ToListAsync();
                return Ok(income);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting income");
                return StatusCode(500, new { message = "An error occurred while retrieving income.", details = ex.Message });
            }
        }

        // GET: api/income/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetIncome(int id)
        {
            try
            {
                var income = await _context.Income.FindAsync(id);
                if (income == null)
                {
                    return NotFound(new { message = "Income not found." });
                }
                return Ok(income);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting income");
                return StatusCode(500, new { message = "An error occurred while retrieving the income.", details = ex.Message });
            }
        }

        // POST: api/income
        [HttpPost]
        public async Task<IActionResult> CreateIncome([FromBody] Income income)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                income.created_at = DateTime.Now;
                income.updated_at = DateTime.Now;

                _context.Income.Add(income);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetIncome), new { id = income.incomeID }, income);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating income");
                return StatusCode(500, new { message = "An error occurred while creating the income.", details = ex.Message });
            }
        }

        // PUT: api/income/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateIncome(int id, [FromBody] Income income)
        {
            try
            {
                if (id != income.incomeID)
                {
                    return BadRequest(new { message = "ID mismatch." });
                }

                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                income.updated_at = DateTime.Now;

                _context.Entry(income).State = EntityState.Modified;
                _context.Entry(income).Property(e => e.created_at).IsModified = false;

                try
                {
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!IncomeExists(id))
                    {
                        return NotFound(new { message = "Income not found." });
                    }
                    else
                    {
                        throw;
                    }
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating income");
                return StatusCode(500, new { message = "An error occurred while updating the income.", details = ex.Message });
            }
        }

        // DELETE: api/income/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteIncome(int id)
        {
            try
            {
                var income = await _context.Income.FindAsync(id);
                if (income == null)
                {
                    return NotFound(new { message = "Income not found." });
                }

                _context.Income.Remove(income);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Income deleted successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting income");
                return StatusCode(500, new { message = "An error occurred while deleting the income.", details = ex.Message });
            }
        }

        private bool IncomeExists(int id)
        {
            return _context.Income.Any(e => e.incomeID == id);
        }
    }
}
