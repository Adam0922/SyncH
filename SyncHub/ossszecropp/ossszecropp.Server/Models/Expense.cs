using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ossszecropp.Server.Models
{
    public class Expense
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int expenseID { get; set; }

        [Required]
        [Column(TypeName = "date")]
        public DateTime expenseDate { get; set; }

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal amount { get; set; }

        [Column(TypeName = "text")]
        public string description { get; set; }

        [Required]
        public string category { get; set; }

        [Required]
        public string paymentMethod { get; set; }

        [Required]
        public string paymentStatus { get; set; }

        [Column(TypeName = "date")]
        public DateTime? dueDate { get; set; }

        [StringLength(255)]
        public string recipientName { get; set; }

        [StringLength(20)]
        public string recipientTaxNumber { get; set; }

        [StringLength(50)]
        public string invoiceNumber { get; set; }

        public DateTime created_at { get; set; }

        public DateTime updated_at { get; set; }
    }
}
