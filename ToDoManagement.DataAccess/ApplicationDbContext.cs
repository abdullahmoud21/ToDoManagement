using Microsoft.EntityFrameworkCore;
using ToDoManagement.Models.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

namespace ToDoManagement.DataAccess
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public DbSet<Todo> Todos { get; set; }
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
        }
    }


}

