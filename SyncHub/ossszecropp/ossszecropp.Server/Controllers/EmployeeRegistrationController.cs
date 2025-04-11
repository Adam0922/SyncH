using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ossszecropp.Server.Data;
using ossszecropp.Server.Models;

[ApiController]
[Route("api/[controller]")]
public class EmployeeRegistrationController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public EmployeeRegistrationController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> RegisterEmployee([FromBody] EmployeeRegistrationDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            Console.WriteLine($"Received TaxNum: {dto.TaxNum}"); // Log the received TaxNum
            // Check if the employee already exists
            var existingEmployee = await _context.Employees
                .FirstOrDefaultAsync(e => e.IdCardNum == dto.IdCardNum);

            if (existingEmployee != null)
            {
                return Conflict(new
                {
                    message = "An employee with the same IdCardNum already exists."
                });
            }

            // Validate and create supervisor if necessary
            var supervisor = await _context.Employees
                .FirstOrDefaultAsync(e => e.IdCardNum == dto.SupervisorId);

            if (supervisor == null)
            {
                return BadRequest(new
                {
                    message = "Supervisor not found."
                });
            }

            supervisor.IsSupervisor = true;
            _context.Employees.Update(supervisor);
            await _context.SaveChangesAsync();

            // Create EmployeeContract
            var employeeContract = new EmploymentContract
            {
                JobID = dto.JobId,
                SupervisorID = dto.SupervisorId,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                HourlyRates = dto.HourlyRates,
                working_hours = dto.working_hours,
                DaysOffNum = dto.DaysOffNum
            };

            _context.EmploymentContracts.Add(employeeContract);
            await _context.SaveChangesAsync();

            // Create Employee with the new contractID
            var employee = new Employees
            {
                IdCardNum = dto.IdCardNum,
                LastName = dto.LastName,
                FirstName = dto.FirstName,
                MiddleName = dto.MiddleName,
                Email = dto.Email,
                Pass = dto.Password,
                PhoneNumber = dto.PhoneNumber,
                TaxNum = dto.TaxNum,
                SocialSecNum = dto.SocialSecNum,
                DateOfBirth = dto.DateOfBirth?.Date,
                placeOfBirth = dto.placeOfBirth,
                BankAccountNumber = dto.BankAccountNumber,
                Country = dto.Country,
                PostalCode = dto.PostalCode,
                City = dto.City,
                StreetAddress = dto.StreetAddress,
                EmploymentContract = employeeContract // Associate the contract with the employee
            };

            _context.Employees.Add(employee);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Employee registered successfully",
                employeeId = employee.IdCardNum,
                contractId = employeeContract.ContractID
            });
        }
        catch (DbUpdateException ex)
        {
            return StatusCode(500, new
            {
                message = "Database error while registering employee",
                error = ex.InnerException?.Message ?? ex.Message
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                message = "Error registering employee",
                error = ex.Message
            });
        }
    }
}

