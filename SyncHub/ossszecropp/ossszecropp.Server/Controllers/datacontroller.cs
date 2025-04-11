using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ossszecropp.Server.Data;
using ossszecropp.Server.Models;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Logging;

namespace ossszecropp.Server.Controllers
{
    [Route("api/data")]
    [ApiController]
    public class DataController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<DataController> _logger;

        public DataController(ApplicationDbContext context, IConfiguration configuration, ILogger<DataController> logger)
        {
            _context = context;
            _configuration = configuration;
            _logger = logger;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel request)
        {
            try
            {
                _logger.LogInformation("Login attempt for identifier: {Identifier}", request.Identifier);

                if (string.IsNullOrWhiteSpace(request.Password))
                {
                    _logger.LogWarning("Password is required.");
                    return BadRequest(new { message = "Password is required." });
                }

                Employees? user = null;

                if (request.Identifier.Contains("@"))
                {
                    user = await _context.Employees.FirstOrDefaultAsync(u => u.Email == request.Identifier);
                }
                else
                {
                    var nameParts = request.Identifier.Split(' ');
                    if (nameParts.Length >= 2)
                    {
                        var firstName = nameParts[0];
                        var lastName = nameParts[nameParts.Length - 1];
                        var middleName = nameParts.Length > 2 ? string.Join(" ", nameParts.Skip(1).Take(nameParts.Length - 2)) : null;

                        user = await _context.Employees.FirstOrDefaultAsync(u =>
                            u.FirstName == firstName &&
                            u.MiddleName == middleName &&
                            u.LastName == lastName);
                    }
                }

                if (user == null)
                {
                    _logger.LogWarning("User not found for identifier: {Identifier}", request.Identifier);
                    return Unauthorized(new { success = false, message = "Invalid username or password." });
                }

                bool passwordValid;
                try
                {
                    // Check if the password is already in BCrypt format
                    if (user.Pass.StartsWith("$2a$") || user.Pass.StartsWith("$2b$") || user.Pass.StartsWith("$2y$"))
                    {
                        // Verify using BCrypt
                        passwordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.Pass);
                    }
                    else
                    {
                        // For legacy passwords, do a direct comparison
                        passwordValid = user.Pass == request.Password;

                        // If valid, update to BCrypt hash for future logins
                        if (passwordValid)
                        {
                            user.Pass = BCrypt.Net.BCrypt.HashPassword(request.Password);
                            await _context.SaveChangesAsync();
                            _logger.LogInformation("Updated password hash for user: {Identifier}", request.Identifier);
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error verifying password for user: {Identifier}", request.Identifier);
                    // Fallback to direct comparison if BCrypt verification fails
                    passwordValid = user.Pass == request.Password;

                    // If valid, update to BCrypt hash for future logins
                    if (passwordValid)
                    {
                        user.Pass = BCrypt.Net.BCrypt.HashPassword(request.Password);
                        await _context.SaveChangesAsync();
                        _logger.LogInformation("Updated password hash for user: {Identifier}", request.Identifier);
                    }
                }

                if (!passwordValid)
                {
                    _logger.LogWarning("Invalid password for identifier: {Identifier}", request.Identifier);
                    return Unauthorized(new { success = false, message = "Invalid username or password." });
                }

                var fullName = $"{user.FirstName} {(string.IsNullOrEmpty(user.MiddleName) ? "" : user.MiddleName + " ")}{user.LastName}";

                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"]);
                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(new[]
                    {
                new Claim(ClaimTypes.NameIdentifier, user.IdCardNum),
                new Claim(ClaimTypes.Name, user.Email), // Use email for the Name claim
                new Claim("sub", user.Email), // Add sub claim for JWT standard
                new Claim("unique_name", fullName), // Store only the full name in the unique_name claim
                new Claim("firstName", user.FirstName),
                new Claim("lastName", user.LastName)
            }),
                    Expires = DateTime.UtcNow.AddHours(3),
                    SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
                    Issuer = _configuration["Jwt:Issuer"],
                    Audience = _configuration["Jwt:Audience"]
                };

                var token = tokenHandler.CreateToken(tokenDescriptor);
                var tokenString = tokenHandler.WriteToken(token);

                _logger.LogInformation("Login successful for identifier: {Identifier}", request.Identifier);
                return Ok(new { success = true, token = tokenString });

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled exception during login for identifier: {Identifier}", request.Identifier);
                return StatusCode(500, new { message = "An error occurred during login. Please try again later." });
            }
        }


    }
}

