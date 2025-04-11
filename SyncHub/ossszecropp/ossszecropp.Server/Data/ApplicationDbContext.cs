using Microsoft.EntityFrameworkCore;
using ossszecropp.Server.Models;
using Microsoft.Extensions.Configuration;
using Org.BouncyCastle.Tls;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

namespace ossszecropp.Server.Data
{

    public class ApplicationDbContext : DbContext
    {

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.LogTo(Console.WriteLine, LogLevel.Information);
        }
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Employees> Employees { get; set; }
        public DbSet<Job> Jobs { get; set; }
        public DbSet<EmploymentContract> EmploymentContracts { get; set; }
        public DbSet<Equipment> Equipments { get; set; }
        public DbSet<Expense> Expenses { get; set; }
        public DbSet<Income> Income { get; set; }
        public DbSet<Service> Services { get; set; }
        public DbSet<Supervisor> Supervisors { get; set; }
        public DbSet<Document> Documents { get; set; }
        public DbSet<Equipment> Equipment { get; set; }
        public DbSet<Company> Companies { get; set; }
        public DbSet<ConnectionEmp> ConnectionEmps { get; set; }



        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Service>(entity =>
            {
                entity.ToTable("Services");
                entity.HasKey(e => e.ServiceID);
                entity.Property(e => e.ServiceName).HasMaxLength(100).IsRequired();
                entity.Property(e => e.ServicePrice).HasColumnType("decimal(10,2)").IsRequired();
                entity.Property(e => e.ServiceFiatType).HasMaxLength(10).IsRequired();
                entity.Property(e => e.ServiceDescription).HasColumnType("text");
                //entity.Property(e => e.ServicePhoto).HasColumnType("mediumblob");
                //entity.Property(e => e.StockPhoto).HasColumnType("mediumblob");
                //entity.Property(e => e.ServicePhotoUrl).HasMaxLength(255);
                //entity.Property(e => e.IsStockPhoto).HasColumnType("tinyint(1)").IsRequired(false);
                entity.Property(e => e.ServiceIcon).HasMaxLength(50); // Add this new configuration
            });
        }

    }
}
