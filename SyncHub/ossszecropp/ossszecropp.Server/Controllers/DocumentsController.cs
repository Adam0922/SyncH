using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ossszecropp.Server.Data;
using ossszecropp.Server.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Authorization;

namespace ossszecropp.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DocumentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<DocumentsController> _logger;

        public DocumentsController(ApplicationDbContext context, ILogger<DocumentsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/Documents
        [HttpGet]
        public async Task<IActionResult> GetDocuments()
        {
            try
            {
                var documents = await _context.Documents
                    .Select(d => new
                    {
                        d.DocID,
                        DocName = d.DocName ?? string.Empty,
                        DocType = d.DocType ?? string.Empty,
                        DocDescription = d.DocDescription,
                        CreatedBy = d.CreatedBy ?? string.Empty,
                        CreatedAt = d.CreatedAt,
                        HasFile = d.DocFile != null && d.DocFile.Length > 0
                    })
                    .ToListAsync();

                return Ok(documents);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving documents: {ErrorMessage}", ex.Message);
                if (ex.InnerException != null)
                {
                    _logger.LogError("Inner exception: {InnerErrorMessage}", ex.InnerException.Message);
                }
                return StatusCode(500, new { message = "An error occurred while retrieving documents.", error = ex.Message });
            }
        }

        // Add a separate endpoint for file uploads
        [HttpPut("{id}/upload")]
        public async Task<IActionResult> UploadDocumentFile(int id, IFormFile file)
        {
            try
            {
                var document = await _context.Documents.FindAsync(id);
                if (document == null)
                {
                    return NotFound($"Document with ID {id} not found.");
                }

                if (file != null && file.Length > 0)
                {
                    using (var memoryStream = new MemoryStream())
                    {
                        await file.CopyToAsync(memoryStream);
                        document.DocFile = memoryStream.ToArray();
                    }

                    _context.Entry(document).State = EntityState.Modified;
                    await _context.SaveChangesAsync();
                }

                return Ok(new { message = "File uploaded successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error uploading file for document with ID {id}");
                return StatusCode(500, new { message = "An error occurred while uploading the file.", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDocument(int id)
        {
            try
            {
                var document = await _context.Documents
                    .Where(d => d.DocID == id)
                    .Select(d => new
                    {
                        d.DocID,
                        DocName = d.DocName ?? string.Empty,
                        DocType = d.DocType ?? string.Empty,
                        DocDescription = d.DocDescription,
                        CreatedBy = d.CreatedBy ?? string.Empty,
                        CreatedAt = d.CreatedAt,
                        HasFile = d.DocFile != null && d.DocFile.Length > 0
                    })
                    .FirstOrDefaultAsync();

                if (document == null)
                {
                    return NotFound($"Document with ID {id} not found.");
                }

                return Ok(document);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving document with ID {id}");
                return StatusCode(500, new { message = "An error occurred while retrieving the document.", error = ex.Message });
            }
        }


        [HttpPost]
        public async Task<IActionResult> CreateDocument([FromForm] DocumentUploadDto documentDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Get the current user's email from the JWT token
                var userEmail = User.FindFirstValue(ClaimTypes.Email);
                if (string.IsNullOrEmpty(userEmail))
                {
                    userEmail = "anonymous@user.com"; // Default value if not authenticated
                }

                var document = new Document
                {
                    DocName = documentDto.DocName ?? string.Empty,
                    DocType = documentDto.DocType ?? string.Empty,
                    DocDescription = documentDto.DocDescription,
                    CreatedBy = userEmail,
                    CreatedAt = DateTime.UtcNow
                };

                // Process the uploaded file
                if (documentDto.DocFile != null && documentDto.DocFile.Length > 0)
                {
                    using (var memoryStream = new MemoryStream())
                    {
                        await documentDto.DocFile.CopyToAsync(memoryStream);
                        document.DocFile = memoryStream.ToArray();
                    }
                }

                _context.Documents.Add(document);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetDocument), new { id = document.DocID }, new
                {
                    document.DocID,
                    DocName = document.DocName ?? string.Empty,
                    DocType = document.DocType ?? string.Empty,
                    DocDescription = document.DocDescription,
                    CreatedBy = document.CreatedBy ?? string.Empty,
                    HasFile = document.DocFile != null && document.DocFile.Length > 0
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating document");
                return StatusCode(500, new { message = "An error occurred while creating the document.", error = ex.Message });
            }
        }



        [HttpPut("{id}")]
        public async Task<IActionResult> PutDocument(int id, [FromForm] DocumentDto documentDto)
        {
            try
            {
                _logger.LogInformation($"Received update for document {id}");

                // Use FindAsync to avoid the query that's causing the error
                var document = await _context.Documents.FindAsync(id);
                if (document == null)
                {
                    return NotFound(new { message = $"Document with ID {id} not found" });
                }

                // Update document properties with null handling
                if (!string.IsNullOrEmpty(documentDto.DocName))
                    document.DocName = documentDto.DocName;

                if (!string.IsNullOrEmpty(documentDto.DocType))
                    document.DocType = documentDto.DocType;

                // Update description if provided
                document.DocDescription = documentDto.DocDescription;

                // Only update file data if a new file is provided
                if (documentDto.DocFile != null && documentDto.DocFile.Length > 0)
                {
                    _logger.LogInformation("Updating document file data");
                    using (var memoryStream = new MemoryStream())
                    {
                        await documentDto.DocFile.CopyToAsync(memoryStream);
                        document.DocFile = memoryStream.ToArray();
                    }
                }
                else
                {
                    _logger.LogInformation("No new file provided, keeping existing file data");
                }

                _context.Entry(document).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Document updated successfully",
                    document = new
                    {
                        document.DocID,
                        DocName = document.DocName ?? string.Empty,
                        DocType = document.DocType ?? string.Empty,
                        DocDescription = document.DocDescription,
                        document.CreatedAt,
                        HasFile = document.DocFile != null && document.DocFile.Length > 0
                    }
                });
            }
            catch (InvalidCastException ex)
            {
                _logger.LogError(ex, $"Error updating document with ID {id}: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred while updating the document", details = "Invalid data type encountered." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating document with ID {id}");
                return StatusCode(500, new { message = "An error occurred while updating the document", details = ex.Message });
            }
        }

        // PUT: api/Documents/{id}/metadata
        [HttpPut("{id}/metadata")]
        public async Task<IActionResult> UpdateDocumentMetadata(int id, [FromBody] DocumentMetadataDto dto)
        {
            try
            {
                _logger.LogInformation($"Received metadata update for document {id}");

                var document = await _context.Documents.FindAsync(id);
                if (document == null)
                {
                    return NotFound(new { message = $"Document with ID {id} not found" });
                }

                // Update document properties
                if (!string.IsNullOrEmpty(dto.DocName))
                    document.DocName = dto.DocName;

                if (!string.IsNullOrEmpty(dto.DocType))
                    document.DocType = dto.DocType;

                // Update description/remarks
                document.DocDescription = dto.Remarks;

                _context.Entry(document).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Document metadata updated successfully",
                    document = new
                    {
                        document.DocID,
                        DocName = document.DocName ?? string.Empty,
                        DocType = document.DocType ?? string.Empty,
                        Remarks = document.DocDescription,
                        document.CreatedAt,
                        HasFile = document.DocFile != null && document.DocFile.Length > 0
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating document metadata with ID {id}");
                return StatusCode(500, new { message = "An error occurred while updating the document metadata", details = ex.Message });
            }
        }


        // DELETE: api/Documents/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDocument(int id)
        {
            try
            {
                var document = await _context.Documents.FindAsync(id);
                if (document == null)
                {
                    return NotFound($"Document with ID {id} not found.");
                }

                _context.Documents.Remove(document);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Document deleted successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting document with ID {id}");
                return StatusCode(500, new { message = "An error occurred while deleting the document.", error = ex.Message });
            }
        }

        // GET: api/Documents/5/download
        [HttpGet("{id}/download")]
        public async Task<IActionResult> DownloadDocument(int id)
        {
            try
            {
                var document = await _context.Documents.FindAsync(id);

                if (document == null)
                {
                    return NotFound($"Document with ID {id} not found.");
                }

                if (document.DocFile == null || document.DocFile.Length == 0)
                {
                    return NotFound("Document file not found.");
                }

                // Determine content type based on document type
                string contentType = "application/octet-stream"; // Default
                string fileExtension = ".bin";

                switch (document.DocType?.ToLower())
                {
                    case "pdf":
                        contentType = "application/pdf";
                        fileExtension = ".pdf";
                        break;
                    case "word":
                        contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                        fileExtension = ".docx";
                        break;
                    case "excel":
                        contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                        fileExtension = ".xlsx";
                        break;
                    case "powerpoint":
                        contentType = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
                        fileExtension = ".pptx";
                        break;
                }

                // Create a filename for the download
                string filename = document.DocName ?? "document";
                if (!filename.EndsWith(fileExtension))
                {
                    filename += fileExtension;
                }

                // Return the file
                return File(document.DocFile, contentType, filename);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error downloading document with ID {id}");
                return StatusCode(500, new { message = "An error occurred while downloading the document.", error = ex.Message });
            }
        }

        // GET: api/Documents/test
        [HttpGet("test")]
        public IActionResult Test()
        {
            return Ok(new { message = "Documents API is working" });
        }

        //// GET: api/Documents/raw
        //[HttpGet("raw")]
        //public async Task<IActionResult> GetDocumentsRaw()
        //{
        //    try
        //    {
        //        var documents = new List<object>();

        //        using (var command = _context.Database.GetDbConnection().CreateCommand())
        //        {
        //            command.CommandText = "SELECT * FROM Documents";

        //            if (command.Connection.State != System.Data.ConnectionState.Open)
        //                await command.Connection.OpenAsync();

        //            using (var result = await command.ExecuteReaderAsync())
        //            {
        //                while (await result.ReadAsync())
        //                {
        //                    var document = new
        //                    {
        //                        DocID = result["DocID"] != DBNull.Value ? Convert.ToInt32(result["DocID"]) : 0,
        //                        DocName = result["DocName"] != DBNull.Value ? (string)result["DocName"] : string.Empty,
        //                        DocType = result["DocType"] != DBNull.Value ? (string)result["DocType"] : string.Empty,
        //                        DocDescription = result["DocDescription"] != DBNull.Value ? (string)result["DocDescription"] : null,
        //                        CreatedBy = result["CreatedBy"] != DBNull.Value ? (string)result["CreatedBy"] : string.Empty,
        //                        CreatedAt = result["created_at"] != DBNull.Value ? (DateTime)result["created_at"] : DateTime.MinValue,
        //                        HasFile = result["DocFile"] != DBNull.Value && ((byte[])result["DocFile"]).Length > 0
        //                    };

        //                    documents.Add(document);
        //                }
        //            }
        //        }

        //        return Ok(documents);
        //    }
        //    catch (Exception ex)
        //    {
        //        _logger.LogError(ex, "Error retrieving documents with raw SQL: {ErrorMessage}", ex.Message);
        //        return StatusCode(500, new { message = "An error occurred while retrieving documents.", error = ex.Message });
        //    }
        //}

        //private bool DocumentExists(int id)
        //{
        //    return _context.Documents.Any(e => e.DocID == id);
        //}
    }
}
