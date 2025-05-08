using Mapster;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using ToDoManagement.Models.DTOs.Request;
using ToDoManagement.Models.Models;

namespace ToDoManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;

        public AccountController( UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager)
        {
            _userManager = userManager;
            _signInManager = signInManager;
        }

        [HttpPost("Register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest registerRequest)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new
                {
                    Errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                });
            }

            var applicationUser = registerRequest.Adapt<ApplicationUser>();

            var result = await _userManager.CreateAsync(applicationUser, registerRequest.Password);

            if (result.Succeeded)
            {
                await _signInManager.SignInAsync(applicationUser, isPersistent: false);
                return Ok(new { Message = "Registration successful" });
            }

            return BadRequest(new
            {
                Errors = result.Errors.Select(e => e.Description)
            });
        }

        [HttpPost("Login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest loginRequest)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var appUser = await _userManager.FindByEmailAsync(loginRequest.Email);

            if (appUser == null)
            {
                return BadRequest(new { Errors = new[] { "Invalid email or password" } });
            }

            var passwordValid = await _userManager.CheckPasswordAsync(appUser, loginRequest.Password);

            if (!passwordValid)
            {
                return BadRequest(new { Errors = new[] { "Invalid email or password" } });
            }

            await _signInManager.SignInAsync(appUser, loginRequest.RememberMe);

            return Ok(new { Message = "Login successful" });
        }

        [HttpGet("Logout")]
        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            return Ok(new { Message = "Logged out successfully" });
        }
    }
}