using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ossszecropp.Server.Models
{
    public class Service
    {
        public int? ServiceID { get; set; }
        public string? ServiceName { get; set; }
        public decimal? ServicePrice { get; set; }
        public string? ServiceFiatType { get; set; }
        public string? ServiceDescription { get; set; }
        public DateTime? Created_at { get; set; }
        public DateTime? Last_updated { get; set; }

        public string? ServiceIcon { get; set; } // Add this new property
    }

    public class ServiceCreateDto
    {
        public string? ServiceName { get; set; }
        public decimal? ServicePrice { get; set; }
        public string? ServiceFiatType { get; set; }
        public string? ServiceDescription { get; set; }
        public string? ServiceIcon { get; set; }
    }

    public class ServiceUpdateDto
    {
        public string? ServiceName { get; set; }
        public decimal? ServicePrice { get; set; }
        public string? ServiceFiatType { get; set; }
        public string? ServiceDescription { get; set; }
        public string? ServiceIcon { get; set; } // Add this new property
    }
}
