using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using HeapRecipeApi.Data;
using HeapRecipeApi.Services;
using System.Security.Claims;
using System.Text;

namespace HeapRecipeApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly IConfiguration _config;

    public AuthController(ApplicationDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        var role = string.IsNullOrWhiteSpace(dto.Role) ? "User" : dto.Role;
        if (role != "User" && role != "Admin")
            return BadRequest("Role must be 'User' or 'Admin'");

        if (await _db.Users.AnyAsync(u => u.Username == dto.Username))
            return BadRequest("Username already taken");

        var user = new User
        {
            Username = dto.Username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = role
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        return Ok(new { user.Id, user.Username, user.Role });
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("users")]
    public async Task<IActionResult> Users()
    {
        var users = await _db.Users
            .OrderByDescending(user => user.Role == "Admin")
            .ThenBy(user => user.Username)
            .Select(user => new { user.Id, user.Username, user.Role })
            .ToListAsync();

        return Ok(users);
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("users/{id:int}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        if (User.FindFirstValue(ClaimTypes.NameIdentifier) == id.ToString())
            return BadRequest("You cannot delete your own account");

        var user = await _db.Users.FindAsync(id);
        if (user == null)
            return NotFound();

        _db.Users.Remove(user);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var user = await _db.Users.SingleOrDefaultAsync(u => u.Username == dto.Username);
        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return Unauthorized();

        var token = JwtTokenHelper.GenerateToken(user, _config);
        return Ok(new { token });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
            return Unauthorized();

        var userId = int.Parse(userIdClaim);

        var user = await _db.Users.FindAsync(userId);

        if (user == null)
            return NotFound();

        return Ok(new { user.Id, user.Username, user.Role });
    }

    [Authorize]
    [HttpPut("me")]
    public async Task<IActionResult> UpdateAccount(UpdateAccountDto dto)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
            return Unauthorized();

        var user = await _db.Users.FindAsync(userId);
        if (user == null)
            return NotFound();

        if (string.IsNullOrEmpty(dto.CurrentPassword) ||
            !BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
            return BadRequest("Current password is incorrect.");

        var username = dto.Username?.Trim();
        if (string.IsNullOrWhiteSpace(username))
            return BadRequest("Username is required.");

        if (await _db.Users.AnyAsync(u => u.Id != userId && u.Username == username))
            return BadRequest("Username already taken.");

        if (dto.NewPassword != null &&
            (string.IsNullOrWhiteSpace(dto.NewPassword) || Encoding.UTF8.GetByteCount(dto.NewPassword) > 72))
            return BadRequest("New password must not be blank or exceed 72 UTF-8 bytes.");

        if (username == user.Username && dto.NewPassword == null)
            return BadRequest("There are no changes to save.");

        user.Username = username;
        if (dto.NewPassword != null)
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);

        await _db.SaveChangesAsync();
        return Ok(new { token = JwtTokenHelper.GenerateToken(user, _config) });
    }
}

public record RegisterDto(string Username, string Password, string? Role = null);
public record LoginDto(string Username, string Password);
public record UpdateAccountDto(string? Username, string? CurrentPassword, string? NewPassword);
