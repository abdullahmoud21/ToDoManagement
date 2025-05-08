using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Ticketsio.Repository;
using ToDoManagement.DataAccess.Repository.IRepository;
using ToDoManagement.Models.Models;

namespace ToDoManagement.DataAccess.Repository
{
    public class ToDoRepository : Repository<Todo>, IToDoRepository
    {
        private readonly ApplicationDbContext dbContext;
        public ToDoRepository(ApplicationDbContext dbContext) : base(dbContext)
        {
            this.dbContext = dbContext;
        }
    }
}
