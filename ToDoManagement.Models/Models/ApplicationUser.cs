using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace ToDoManagement.Models.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string PhoneNumber { get; set; }
    }
}
