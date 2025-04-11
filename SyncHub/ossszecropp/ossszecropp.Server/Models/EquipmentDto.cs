using System;
using System.ComponentModel.DataAnnotations;

namespace ossszecropp.Server.Models
{
    public class EquipmentDto
    {
        [Required]
        public string SerialNumber { get; set; }

        [Required]
        public string EquipmentName { get; set; }

        public string Employee { get; set; }

        [Required]
        public string Status { get; set; }

        public string Category { get; set; }

        [Required]
        public string PurchaseDate { get; set; }

        public string WarrantyExpiration { get; set; }

        public string LastServiceDate { get; set; }

        public string Remarks { get; set; }
    }

}
