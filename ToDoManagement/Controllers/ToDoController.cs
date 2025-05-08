using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ToDoManagement.DataAccess;
using ToDoManagement.DataAccess.Repository;
using ToDoManagement.DataAccess.Repository.IRepository;
using ToDoManagement.Models.Models;

namespace ToDoManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ToDoController : ControllerBase
    {
        private readonly IToDoRepository _toDoRepository;
        public ToDoController(IToDoRepository toDoRepository)
        {
            _toDoRepository = toDoRepository;
        }
        
        [HttpGet("Getall")]
        public IActionResult GetAll()
        {
            var todos = _toDoRepository.Get();
            return Ok(todos.ToList());
        }
        [HttpGet("{id}")]
        public IActionResult GetById(Guid id)
        {
            var todo = _toDoRepository.GetOne(e => e.Id == id);
            if (todo == null)
            {
                return NotFound();
            }
            return Ok(todo);
        }
        [HttpPost("create")]
        public IActionResult Create([FromBody] Todo todo)
        {
            if (todo != null)
            {
                todo.CreatedAt = DateTime.Now;
                _toDoRepository.Create(todo);
                _toDoRepository.Commit();
            }
            else
            {
                return BadRequest("Cannot Create Task");
            }
            return CreatedAtAction(nameof(GetAll), new { id = todo.Id }, todo);
        }
        [HttpPut("update/{id}")]
        public IActionResult Update(Guid id, [FromBody] Todo todo)
        {
            if (id != todo.Id)
            {
                return BadRequest("ID mismatch");
            }
            var existingTodo = _toDoRepository.GetOne(e => e.Id == id);
            if (existingTodo == null)
            {
                return NotFound();
            }
            existingTodo.Title = todo.Title;
            existingTodo.Description = todo.Description;
            existingTodo.Status = todo.Status;
            existingTodo.Priority = todo.Priority;
            existingTodo.DueDate = todo.DueDate;
            existingTodo.LastModifiedAt = DateTime.Now;
            _toDoRepository.Edit(existingTodo);
            _toDoRepository.Commit();
            return NoContent();
        }
        [HttpDelete("delete/{id}")]
        public IActionResult Delete(Guid id)
        {
            var todo = _toDoRepository.GetOne(e => e.Id == id);
            if (todo == null)
            {
                return NotFound();
            }
            _toDoRepository.Delete(todo);
            _toDoRepository.Commit();
            return Ok("Task Deleted Successfully");
        }
    }
}
