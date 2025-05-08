using System.ComponentModel.DataAnnotations;

namespace ToDoManagement.Models.Models
{
    public class Todo
    {
        public Guid Id { get; set; }
        [Required]
        [StringLength(100, ErrorMessage = "Title cannot be longer than 100 characters.")]
        public string Title { get; set; }
        public string? Description { get; set; }
        public Status Status { get; set; }
        public Priority Priority { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastModifiedAt { get; set; }

    }
}
