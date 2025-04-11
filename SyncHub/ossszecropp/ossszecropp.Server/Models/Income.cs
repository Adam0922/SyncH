using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ossszecropp.Server.Models
{
    public class Income
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int incomeID { get; set; }

        [Required]
        [StringLength(20)]
        public string invoiceNumber { get; set; }

        [Required]
        [StringLength(20)]
        public string companyID { get; set; }

        [Required]
        public int serviceID { get; set; }

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal price { get; set; }

        [Required]
        [Column(TypeName = "date")]
        public DateTime invoiceDate { get; set; }

        [Required]
        [Column(TypeName = "date")]
        public DateTime dueDate { get; set; }

        [Required]
        public string paymentStatus { get; set; }

        [Required]
        public string paymentMethod { get; set; }

        [Column(TypeName = "text")]
        public string description { get; set; }

        public int? quantity { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal? taxRate { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal? taxAmount { get; set; }

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal totalAmount { get; set; }

        [Column(TypeName = "text")]
        public string notes { get; set; }

        public DateTime created_at { get; set; }

        public DateTime updated_at { get; set; }
    }
}
