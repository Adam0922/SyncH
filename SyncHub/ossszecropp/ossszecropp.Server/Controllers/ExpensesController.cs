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
    public class ExpensesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ExpensesController> _logger;

        public ExpensesController(ApplicationDbContext context, ILogger<ExpensesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/Expenses
        [HttpGet]
        public async Task<IActionResult> GetExpenses()
        {
            try
            {
                var expenses = await _context.Expenses.ToListAsync();
                return Ok(expenses);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting expenses");
                return StatusCode(500, new { message = "An error occurred while retrieving expenses.", details = ex.Message });
            }
        }

        // GET: api/Expenses/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetExpense(int id)
        {
            try
            {
                var expense = await _context.Expenses.FindAsync(id);
                if (expense == null)
                {
                    return NotFound(new { message = "Expense not found." });
                }
                return Ok(expense);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting expense");
                return StatusCode(500, new { message = "An error occurred while retrieving the expense.", details = ex.Message });
            }
        }

        // POST: api/Expenses
        [HttpPost]
        public async Task<IActionResult> CreateExpense([FromBody] Expense expense)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                expense.created_at = DateTime.Now;
                expense.updated_at = DateTime.Now;

                _context.Expenses.Add(expense);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetExpense), new { id = expense.expenseID }, expense);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating expense");
                return StatusCode(500, new { message = "An error occurred while creating the expense.", details = ex.Message });
            }
        }

        // PUT: api/Expenses/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateExpense(int id, [FromBody] Expense expense)
        {
            try
            {
                if (id != expense.expenseID)
                {
                    return BadRequest(new { message = "ID mismatch." });
                }

                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                expense.updated_at = DateTime.Now;

                _context.Entry(expense).State = EntityState.Modified;
                _context.Entry(expense).Property(e => e.created_at).IsModified = false;

                try
                {
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!ExpenseExists(id))
                    {
                        return NotFound(new { message = "Expense not found." });
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
                _logger.LogError(ex, "Error updating expense");
                return StatusCode(500, new { message = "An error occurred while updating the expense.", details = ex.Message });
            }
        }

        // DELETE: api/Expenses/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteExpense(int id)
        {
            try
            {
                var expense = await _context.Expenses.FindAsync(id);
                if (expense == null)
                {
                    return NotFound(new { message = "Expense not found." });
                }

                _context.Expenses.Remove(expense);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Expense deleted successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting expense");
                return StatusCode(500, new { message = "An error occurred while deleting the expense.", details = ex.Message });
            }
        }

        private bool ExpenseExists(int id)
        {
            return _context.Expenses.Any(e => e.expenseID == id);
        }
    }
}
