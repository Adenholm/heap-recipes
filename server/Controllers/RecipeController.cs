using HeapRecipeApi.Data;
using HeapRecipeApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HeapRecipeApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RecipesController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    public RecipesController(ApplicationDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Recipe>>> GetAll()
    {
        return await _db.Recipes
            .Include(r => r.Tags)
            .Include(r => r.Ingredients)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Recipe>> GetById(int id)
    {
        var recipe = await _db.Recipes
            .Include(r => r.Tags)
            .Include(r => r.Ingredients)
            .FirstOrDefaultAsync(r => r.Id == id);

        return recipe is null ? NotFound() : recipe;
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<Recipe>> CreateRecipe([FromBody] CreateRecipeDto dto)
    {
        var recipe = new Recipe
        {
            Title = dto.Title,
            Description = dto.Description,
            ImageUrl = dto.ImageUrl,
            PrepTime = dto.PrepTime,
            Servings = dto.Servings,
            Instructions = dto.Instructions
        };

        // Handle ingredients
        recipe.Ingredients = dto.Ingredients
            .Where(ing => !string.IsNullOrWhiteSpace(ing.Name))
            .Select(ingDto => new Ingredient
            {
                Name = ingDto.Name,
                Quantity = ingDto.Quantity
            }).ToList();

        // Handle tags
        foreach (var tagDto in dto.Tags)
        {
            if (string.IsNullOrWhiteSpace(tagDto.Name))
                continue;

            var existingTag = await _db.Tags
                .FirstOrDefaultAsync(t => t.Name.ToLower() == tagDto.Name.ToLower());

            if (existingTag != null)
            {
                recipe.Tags.Add(existingTag);
            }
            else
            {
                var newTag = new Tag { Name = tagDto.Name };
                recipe.Tags.Add(newTag);
            }
        }

        _db.Recipes.Add(recipe);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = recipe.Id }, recipe);
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] CreateRecipeDto dto)
    {
        var recipe = await _db.Recipes
            .Include(r => r.Ingredients)
            .Include(r => r.Tags)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (recipe == null)
            return NotFound($"Recipe with ID {id} not found.");

        // Update recipe fields
        recipe.Title = dto.Title;
        recipe.Description = dto.Description;
        recipe.ImageUrl = dto.ImageUrl;
        recipe.PrepTime = dto.PrepTime;
        recipe.Servings = dto.Servings;
        recipe.Instructions = dto.Instructions;

        // --- INGREDIENTS ---
        var dtoIngredientIds = dto.Ingredients
            .Where(i => i.Id.HasValue)
            .Select(i => i.Id.Value)
            .ToHashSet();

        // Remove deleted ingredients (let EF mark them for deletion)
        var ingredientsToRemove = recipe.Ingredients
            .Where(i => !dtoIngredientIds.Contains(i.Id))
            .ToList();
        foreach (var ing in ingredientsToRemove)
        {
            recipe.Ingredients.Remove(ing);
        }

        foreach (var ingDto in dto.Ingredients)
        {
            var existingIng = recipe.Ingredients.FirstOrDefault(i => i.Id == ingDto.Id);

            if (existingIng != null)
            {
                // EF is already tracking this, just update properties
                existingIng.Name = ingDto.Name;
                existingIng.Quantity = ingDto.Quantity;
            }
            else
            {
                // New ingredient — EF will insert this
                recipe.Ingredients.Add(new Ingredient
                {
                    Name = ingDto.Name,
                    Quantity = ingDto.Quantity,
                    RecipeId = recipe.Id
                });
            }
        }

    // --- TAGS ---
    recipe.Tags.Clear();
    foreach (var tagDto in dto.Tags)
    {
        if (string.IsNullOrWhiteSpace(tagDto.Name))
            continue;

        var tag = await _db.Tags.FirstOrDefaultAsync(t =>
            t.Name.ToLower() == tagDto.Name.ToLower());

        if (tag == null)
            tag = new Tag { Name = tagDto.Name };

        recipe.Tags.Add(tag);
    }

    await _db.SaveChangesAsync();
    return NoContent();
}


    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var recipe = await _db.Recipes.FindAsync(id);
        if (recipe is null) return NotFound();

        _db.Recipes.Remove(recipe);
        await _db.SaveChangesAsync();
        return Ok();
    }
}
