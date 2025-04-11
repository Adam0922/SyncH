using System;
using System.Collections.Generic;
using System.IO;
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
    public class DocumentsControllerTests
    {
        private ApplicationDbContext _context;
        private Mock<ILogger<DocumentsController>> _mockLogger;
        private DocumentsController _controller;
        private List<Document> _testDocuments;

        [SetUp]
        public void Setup()
        {
            // Create a mock DbContext options with a unique database name for each test
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            // Create actual context with in-memory database
            _context = new ApplicationDbContext(options);

            // Setup test data
            _testDocuments = new List<Document>
            {
                new Document
                {
                    DocID = 1,
                    DocName = "Test Document 1",
                    DocType = "PDF",
                    DocDescription = "Test Description 1",
                    CreatedBy = "test@example.com",
                    CreatedAt = DateTime.UtcNow.AddDays(-1),
                    DocFile = new byte[] { 1, 2, 3, 4, 5 }
                },
                new Document
                {
                    DocID = 2,
                    DocName = "Test Document 2",
                    DocType = "Word",
                    DocDescription = "Test Description 2",
                    CreatedBy = "test@example.com",
                    CreatedAt = DateTime.UtcNow,
                    DocFile = null
                }
            };

            _context.Documents.AddRange(_testDocuments);
            _context.SaveChanges();

            _mockLogger = new Mock<ILogger<DocumentsController>>();

            // Create controller with real context
            _controller = new DocumentsController(
                _context,
                _mockLogger.Object
            );

            // Setup ClaimsPrincipal for the controller
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Email, "test@example.com")
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
        public async Task GetDocuments_ReturnsAllDocuments()
        {
            // Act
            var result = await _controller.GetDocuments();

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var okResult = (OkObjectResult)result;
            var documents = okResult.Value as IEnumerable<dynamic>;
            Assert.That(documents, Is.Not.Null);
            Assert.That(documents, Has.Count.EqualTo(2));
        }

        [Test]
        public async Task GetDocument_WithValidId_ReturnsDocument()
        {
            // Act
            var result = await _controller.GetDocument(1);

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var okResult = (OkObjectResult)result;
            dynamic document = okResult.Value;
            Assert.That((int)document.DocID, Is.EqualTo(1));
            Assert.That((string)document.DocName, Is.EqualTo("Test Document 1"));
            Assert.That((bool)document.HasFile, Is.True);
        }

        [Test]
        public async Task GetDocument_WithInvalidId_ReturnsNotFound()
        {
            // Act
            var result = await _controller.GetDocument(999);

            // Assert
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task CreateDocument_WithValidData_ReturnsCreatedAtAction()
        {
            // Arrange
            var formFile = CreateTestFormFile("test.pdf", "application/pdf", 100);
            var documentDto = new DocumentUploadDto
            {
                DocName = "New Test Document",
                DocType = "PDF",
                DocDescription = "New Test Description",
                DocFile = formFile
            };

            // Act
            var result = await _controller.CreateDocument(documentDto);

            // Assert
            Assert.That(result, Is.InstanceOf<CreatedAtActionResult>());
            var createdResult = (CreatedAtActionResult)result;
            dynamic document = createdResult.Value;
            Assert.That((string)document.DocName, Is.EqualTo("New Test Document"));
            Assert.That((bool)document.HasFile, Is.True);

            // Verify it was added to the database
            var dbDocument = await _context.Documents.FindAsync(3); // Should be ID 3
            Assert.That(dbDocument, Is.Not.Null);
            Assert.That(dbDocument.DocName, Is.EqualTo("New Test Document"));
        }

        [Test]
        public async Task CreateDocument_WithInvalidModel_ReturnsBadRequest()
        {
            // Arrange
            var documentDto = new DocumentUploadDto
            {
                // Missing required DocName
                DocType = "PDF",
                DocDescription = "Test Description"
            };

            // Setup ModelState error
            _controller.ModelState.AddModelError("DocName", "Document name is required");

            // Act
            var result = await _controller.CreateDocument(documentDto);

            // Assert
            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
        }

        [Test]
        public async Task UpdateDocumentMetadata_WithValidData_ReturnsOk()
        {
            // Arrange
            var metadataDto = new DocumentMetadataDto
            {
                DocName = "Updated Document Name",
                DocType = "Excel",
                Remarks = "Updated Description"
            };

            // Act
            var result = await _controller.UpdateDocumentMetadata(1, metadataDto);

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());

            // Verify the database was updated
            var dbDocument = await _context.Documents.FindAsync(1);
            Assert.That(dbDocument.DocName, Is.EqualTo("Updated Document Name"));
            Assert.That(dbDocument.DocType, Is.EqualTo("Excel"));
            Assert.That(dbDocument.DocDescription, Is.EqualTo("Updated Description"));
        }

        [Test]
        public async Task UpdateDocumentMetadata_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            var metadataDto = new DocumentMetadataDto
            {
                DocName = "Updated Document Name",
                DocType = "Excel",
                Remarks = "Updated Description"
            };

            // Act
            var result = await _controller.UpdateDocumentMetadata(999, metadataDto);

            // Assert
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task UploadDocumentFile_WithValidFile_ReturnsOk()
        {
            // Arrange
            var formFile = CreateTestFormFile("test.pdf", "application/pdf", 100);

            // Act
            var result = await _controller.UploadDocumentFile(2, formFile);

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());

            // Verify the file was uploaded
            var dbDocument = await _context.Documents.FindAsync(2);
            Assert.That(dbDocument.DocFile, Is.Not.Null);
            Assert.That(dbDocument.DocFile.Length, Is.GreaterThan(0));
        }

        [Test]
        public async Task UploadDocumentFile_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            var formFile = CreateTestFormFile("test.pdf", "application/pdf", 100);

            // Act
            var result = await _controller.UploadDocumentFile(999, formFile);

            // Assert
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task DeleteDocument_WithValidId_ReturnsOk()
        {
            // Act
            var result = await _controller.DeleteDocument(1);

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());

            // Verify it was deleted from the database
            var dbDocument = await _context.Documents.FindAsync(1);
            Assert.That(dbDocument, Is.Null);
        }

        [Test]
        public async Task DeleteDocument_WithInvalidId_ReturnsNotFound()
        {
            // Act
            var result = await _controller.DeleteDocument(999);

            // Assert
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task DownloadDocument_WithValidId_ReturnsFileResult()
        {
            // Act
            var result = await _controller.DownloadDocument(1);

            // Assert
            Assert.That(result, Is.InstanceOf<FileContentResult>());
            var fileResult = (FileContentResult)result;
            Assert.That(fileResult.FileContents, Is.EqualTo(_testDocuments[0].DocFile));
            Assert.That(fileResult.ContentType, Is.EqualTo("application/pdf"));
        }

        [Test]
        public async Task DownloadDocument_WithInvalidId_ReturnsNotFound()
        {
            // Act
            var result = await _controller.DownloadDocument(999);

            // Assert
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task DownloadDocument_WithNoFile_ReturnsNotFound()
        {
            // Act
            var result = await _controller.DownloadDocument(2); // Document with no file

            // Assert
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public void Test_ReturnsOk()
        {
            // Act
            var result = _controller.Test();

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var okResult = (OkObjectResult)result;
            dynamic value = okResult.Value;
            Assert.That((string)value.message, Is.EqualTo("Documents API is working"));
        }

        [TearDown]
        public void TearDown()
        {
            // Ensure proper cleanup of resources
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        // Helper method to create a test IFormFile
        private IFormFile CreateTestFormFile(string fileName, string contentType, int length)
        {
            byte[] content = new byte[length];
            for (int i = 0; i < length; i++)
            {
                content[i] = (byte)(i % 256);
            }

            var stream = new MemoryStream(content);
            var formFile = new Mock<IFormFile>();
            formFile.Setup(f => f.FileName).Returns(fileName);
            formFile.Setup(f => f.ContentType).Returns(contentType);
            formFile.Setup(f => f.Length).Returns(length);
            formFile.Setup(f => f.CopyToAsync(It.IsAny<Stream>(), It.IsAny<CancellationToken>()))
                .Returns((Stream stream, CancellationToken token) =>
                {
                    return stream.WriteAsync(content, 0, content.Length, token);
                });

            return formFile.Object;
        }
    }
}
