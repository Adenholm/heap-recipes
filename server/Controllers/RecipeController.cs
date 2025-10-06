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
            .Include(r => r.Category)
            .Include(r => r.Ingredients)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Recipe>> GetById(int id)
    {
        var recipe = await _db.Recipes
            .Include(r => r.Category)
            .Include(r => r.Ingredients)
            .FirstOrDefaultAsync(r => r.Id == id);

        return recipe is null ? NotFound() : recipe;
    }

    [Authorize] // only logged-in users can create
    [HttpPost]
    public async Task<ActionResult<Recipe>> CreateRecipe([FromBody] CreateRecipeDto dto)
    {
        if (dto.CategoryId is not null)
        {
            var category = await _db.Categories.FindAsync(dto.CategoryId);
            if (category is null)
                return BadRequest($"Category with ID {dto.CategoryId} does not exist.");
        }

        var recipe = new Recipe
        {
            Title = dto.Title,
            Description = dto.Description,
            ImageUrl = dto.ImageUrl,
            PrepTime = dto.PrepTime,
            Servings = dto.Servings,
            Instructions = dto.Instructions,
            CategoryId = dto.CategoryId
        };

        // Handle ingredients
        recipe.Ingredients = new List<Ingredient>();
        foreach (var ingDto in dto.Ingredients)
        {
            if (!string.IsNullOrWhiteSpace(ingDto.Name))
            {
                var ingredient = new Ingredient
                {
                    Name = ingDto.Name,
                    Quantity = ingDto.Quantity
                    // RecipeId will be set by EF Core when saving
                };
                recipe.Ingredients.Add(ingredient);
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
            .FirstOrDefaultAsync(r => r.Id == id);

        if (recipe is null)
            return NotFound($"Recipe with ID {id} not found.");

        recipe.Title = dto.Title;
        recipe.Description = dto.Description;
        recipe.CategoryId = dto.CategoryId;
        recipe.ImageUrl = dto.ImageUrl;
        recipe.PrepTime = dto.PrepTime;
        recipe.Servings = dto.Servings;
        recipe.Instructions = dto.Instructions;

        var updatedIngredients = new List<Ingredient>();
        foreach (var ingDto in dto.Ingredients)
        {
            Ingredient? ingredient = null;

        if (ingDto.Id is not null)
        {
            ingredient = await _db.Ingredients.FindAsync(ingDto.Id);
            if (ingredient != null)
            {
                // Update existing ingredient
                ingredient.Name = ingDto.Name;
                ingredient.Quantity = ingDto.Quantity;
                updatedIngredients.Add(ingredient);
                continue;
            }
        }

        if (ingredient is null && !string.IsNullOrWhiteSpace(ingDto.Name))
        {
                ingredient = new Ingredient
                {
                    Name = ingDto.Name,
                    Quantity = ingDto.Quantity,
                    RecipeId = recipe.Id
                };
                _db.Ingredients.Add(ingredient);
                updatedIngredients.Add(ingredient);
            }
        }

        // Clear old ingredients and add updated ones
        _db.Ingredients.RemoveRange(recipe.Ingredients);
        recipe.Ingredients = updatedIngredients;

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
