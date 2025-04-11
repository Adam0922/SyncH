using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ossszecropp.Server.Models
{
    public class DocumentDto
    {
        [Key]
        public int? DocID { get; set; }

        [Required]
        [StringLength(255)]
        public string? DocName { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string? DocType { get; set; } = string.Empty;

        public string? DocDescription { get; set; }  // Make nullable
        [Column("docData")]

        public IFormFile? DocFile { get; set; }  // Make nullable

        public string? CreatedBy { get; set; }  // Make nullable if it can be null

        [Column("created_at")]
        public DateTime? CreatedAt { get; set; } = DateTime.UtcNow;


    }
    public class DocumentUploadDto
    {
        [Required(ErrorMessage = "Document name is required")]
        [StringLength(255, ErrorMessage = "Document name cannot exceed 255 characters")]
        public string DocName { get; set; }

        [Required(ErrorMessage = "Document type is required")]
        [StringLength(50, ErrorMessage = "Document type cannot exceed 50 characters")]
        public string DocType { get; set; }

        public string DocDescription { get; set; }

        [Required(ErrorMessage = "Document file is required")]
        [Column("docData")]

        public IFormFile? DocFile { get; set; }
    }

    public class DocumentUpdateDto
    {
        public int DocID { get; set; }
        public string? DocName { get; set; }
        public string? DocType { get; set; }

        public string? DocDescription { get; set; }
        public string? Remarks { get; set; }
        [Column("docData")]

        public IFormFile? DocFile { get; set; } // Make DocFile optional
    }

    public class DocumentMetadataDto
    {
        public string? DocName { get; set; }
        public string? DocType { get; set; }
        public string? Remarks { get; set; }
    }
    public class Document
    {
        [Key]
        public int DocID { get; set; }

        public string? DocName { get; set; }
        public string? DocType { get; set; }
        public string? DocDescription { get; set; }
        [Column("docData")]

        public byte[]? DocFile { get; set; }
        public string? CreatedBy { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
