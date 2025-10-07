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
            .FirstOrDefaultAsync(r => r.Id == id);

        if (recipe is null)
            return NotFound($"Recipe with ID {id} not found.");

        recipe.Title = dto.Title;
        recipe.Description = dto.Description;
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

        var updatedTags = new List<Tag>();
        foreach (var tagDto in dto.Tags)
        {
            if (string.IsNullOrWhiteSpace(tagDto.Name))
                continue;

            var existingTag = await _db.Tags
                .FirstOrDefaultAsync(t => t.Name.ToLower() == tagDto.Name.ToLower());

            if (existingTag != null)
            {
                if (!recipe.Tags.Any(t => t.Id == existingTag.Id))
                    updatedTags.Add(existingTag);
            }
            else
            {
                var newTag = new Tag { Name = tagDto.Name };
                updatedTags.Add(newTag);
            }
        }

        recipe.Tags = updatedTags;

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
