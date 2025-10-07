
using HeapRecipeApi.Data;
using HeapRecipeApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HeapRecipeApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TagsController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    public TagsController(ApplicationDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Tag>>> GetAll()
    {
        return await _db.Tags
            .Include(t => t.Recipes)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Tag>> GetById(int id)
    {
        var tag = await _db.Tags
            .Include(t => t.Recipes)
            .FirstOrDefaultAsync(t => t.Id == id);

        return tag is null ? NotFound() : tag;
    }

    [HttpPost]
    public async Task<ActionResult<Tag>> CreateTag([FromBody] CreateTagDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest("Tag name cannot be empty");

        var tag = new Tag { Name = dto.Name };
        _db.Tags.Add(tag);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = tag.Id }, tag);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTag(int id, [FromBody] CreateTagDto dto)
    {
        var tag = await _db.Tags.FindAsync(id);
        if (tag is null) return NotFound();

        tag.Name = dto.Name;
        await _db.SaveChangesAsync();

        return NoContent();
    }
    
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTag(int id)
    {
        var tag = await _db.Tags.FindAsync(id);
        if (tag is null) return NotFound();

        _db.Tags.Remove(tag);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}