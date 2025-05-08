using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ToDoManagement.DataAccess;
using ToDoManagement.DataAccess.Repository;
using ToDoManagement.DataAccess.Repository.IRepository;
using ToDoManagement.Models.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

builder.Services.AddScoped<IToDoRepository, ToDoRepository>();

// Configure CORS for credentials
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", builder =>
    {
        builder.WithOrigins("http://127.0.0.1:5500", "https://localhost:7254")
               .AllowAnyMethod()
               .AllowAnyHeader()
               .AllowCredentials()
               .SetIsOriginAllowedToAllowWildcardSubdomains();
    });
});

// Cookie settings and authentication
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.LoginPath = "/api/Account/Login";
        options.Cookie.HttpOnly = true;
        options.Cookie.SameSite = SameSiteMode.Lax;
        options.Cookie.SecurePolicy = CookieSecurePolicy.None; // Allow cookies over HTTP in dev
        options.Events.OnValidatePrincipal = context =>
        {
            if (context.Principal == null)
            {
                Console.WriteLine("Authentication failed: No principal found.");
            }
            return Task.CompletedTask;
        };
    });

// Prevent redirect for API calls – ensure 401 with message


builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add detailed logging for debugging
builder.Services.AddLogging(logging =>
{
    logging.AddConsole();
    logging.AddDebug();
    logging.SetMinimumLevel(LogLevel.Debug);
});

var app = builder.Build();

// Middleware pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    // Disable HTTPS redirection in dev to match frontend HTTP
    // app.UseHttpsRedirection(); // Commented out for dev
    Console.WriteLine($"Server running on: {app.Urls}");
}
else
{
    app.UseHttpsRedirection();
}

app.UseStaticFiles();

app.UseRouting();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

// Add middleware to log incoming requests and cookies
app.Use(async (context, next) =>
{
    Console.WriteLine($"Request: {context.Request.Method} {context.Request.Path} from {context.Request.Headers["Origin"]}");
    if (context.Request.Cookies.Count > 0)
    {
        Console.WriteLine("Cookies present: " + string.Join(", ", context.Request.Cookies.Keys));
    }
    else
    {
        Console.WriteLine("No cookies sent with request.");
    }
    await next.Invoke();
});

app.MapControllers();

app.Run();