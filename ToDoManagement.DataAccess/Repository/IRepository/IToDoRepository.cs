using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Ticketsio.Repository.IRepositories;
using ToDoManagement.Models.Models;

namespace ToDoManagement.DataAccess.Repository.IRepository
{
    public interface IToDoRepository : IRepository<Todo>
    {
        
    }    
}
