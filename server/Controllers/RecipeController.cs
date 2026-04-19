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
    public async Task<ActionResult<IEnumerable<RecipeReadDto>>> GetAll()
    {
        var recipes = await _db.Recipes
            .Include(r => r.Tags)
            .Include(r => r.Ingredients)
            .Include(r => r.IngredientSections)
                .ThenInclude(s => s.Ingredients)
            .Include(r => r.Instructions)
            .ToListAsync();

        return recipes.Select(ToReadDto).ToList();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<RecipeReadDto>> GetById(int id)
    {
        var recipe = await _db.Recipes
            .Include(r => r.Tags)
            .Include(r => r.Ingredients)
            .Include(r => r.IngredientSections)
                .ThenInclude(s => s.Ingredients)
            .Include(r => r.Instructions)
            .FirstOrDefaultAsync(r => r.Id == id);

        return recipe is null ? NotFound() : ToReadDto(recipe);
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<RecipeReadDto>> CreateRecipe([FromBody] CreateRecipeDto dto)
    {
        var recipe = new Recipe
        {
            Title = dto.Title,
            Description = dto.Description,
            ImageUrl = dto.ImageUrl,
            PrepTime = dto.PrepTime,
            Servings = dto.Servings,
        };

        ApplyRecipeDetails(recipe, dto);

        _db.Recipes.Add(recipe);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = recipe.Id }, ToReadDto(recipe));
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] CreateRecipeDto dto)
    {
        var recipe = await _db.Recipes
            .Include(r => r.Ingredients)
            .Include(r => r.IngredientSections)
                .ThenInclude(s => s.Ingredients)
            .Include(r => r.Instructions)
            .Include(r => r.Tags)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (recipe == null)
            return NotFound($"Recipe with ID {id} not found.");

        recipe.Title = dto.Title;
        recipe.Description = dto.Description;
        recipe.ImageUrl = dto.ImageUrl;
        recipe.PrepTime = dto.PrepTime;
        recipe.Servings = dto.Servings;

        ApplyRecipeDetails(recipe, dto);

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

    private void ApplyRecipeDetails(Recipe recipe, CreateRecipeDto dto)
    {
        recipe.Ingredients.Clear();
        recipe.IngredientSections.Clear();
        recipe.Instructions.Clear();
        recipe.Tags.Clear();

        foreach (var ingredient in BuildIngredients(recipe, null, dto.Ingredients))
        {
            recipe.Ingredients.Add(ingredient);
        }

        foreach (var section in BuildIngredientSections(recipe, dto.IngredientSections))
        {
            recipe.IngredientSections.Add(section);
        }

        foreach (var instruction in dto.Instructions.Where(inst => !string.IsNullOrWhiteSpace(inst.Text)))
        {
            recipe.Instructions.Add(new Instruction
            {
                Text = instruction.Text
            });
        }

        foreach (var tagDto in dto.Tags)
        {
            if (string.IsNullOrWhiteSpace(tagDto.Name))
                continue;

            var tag = _db.Tags.Local.FirstOrDefault(t =>
                t.Name.Equals(tagDto.Name, StringComparison.OrdinalIgnoreCase))
                ?? _db.Tags.FirstOrDefault(t => t.Name.ToLower() == tagDto.Name.ToLower());

            if (tag == null)
                tag = new Tag { Name = tagDto.Name };

            recipe.Tags.Add(tag);
        }
    }

    private IEnumerable<IngredientSection> BuildIngredientSections(Recipe recipe, IEnumerable<CreateIngredientSectionDto> sectionDtos)
    {
        return sectionDtos
            .Where(section => !string.IsNullOrWhiteSpace(section.Name))
            .Select((section, sectionIndex) =>
            {
                var sectionEntity = new IngredientSection
                {
                    Name = section.Name,
                    SortOrder = section.SortOrder ?? sectionIndex,
                    Recipe = recipe
                };

                sectionEntity.Ingredients = BuildIngredients(recipe, sectionEntity, section.Ingredients).ToList();
                return sectionEntity;
            });
    }

    private IEnumerable<Ingredient> BuildIngredients(Recipe recipe, IngredientSection? section, IEnumerable<CreateIngredientDto> ingredientDtos)
    {
        return ingredientDtos
            .Where(ingredient => !string.IsNullOrWhiteSpace(ingredient.Name))
            .Select((ingredient, index) => new Ingredient
            {
                Name = ingredient.Name,
                Quantity = ingredient.Quantity,
                SortOrder = ingredient.SortOrder ?? index,
                Recipe = recipe,
                IngredientSection = section
            });
    }

    private static RecipeReadDto ToReadDto(Recipe recipe)
    {
        var orderedRootIngredients = recipe.Ingredients
            .OrderBy(ingredient => ingredient.SortOrder)
            .ThenBy(ingredient => ingredient.Id)
            .Select(ingredient => ToReadDto(ingredient, null))
            .ToList();

        var orderedSections = recipe.IngredientSections
            .OrderBy(section => section.SortOrder)
            .ThenBy(section => section.Id)
            .Select(section => new IngredientSectionReadDto
            {
                Id = section.Id,
                Name = section.Name,
                SortOrder = section.SortOrder,
                Ingredients = section.Ingredients
                    .OrderBy(ingredient => ingredient.SortOrder)
                    .ThenBy(ingredient => ingredient.Id)
                    .Select(ingredient => ToReadDto(ingredient, section.Id))
                    .ToList()
            })
            .ToList();

        var sectionedIngredients = orderedSections
            .SelectMany(section => section.Ingredients)
            .ToList();

        return new RecipeReadDto
        {
            Id = recipe.Id,
            Title = recipe.Title,
            Description = recipe.Description,
            ImageUrl = recipe.ImageUrl,
            PrepTime = recipe.PrepTime,
            Servings = recipe.Servings,
            Ingredients = orderedRootIngredients.Concat(sectionedIngredients).ToList(),
            IngredientSections = orderedSections,
            Instructions = recipe.Instructions
                .OrderBy(instruction => instruction.Id)
                .Select(instruction => new CreateInstructionDto
                {
                    Id = instruction.Id,
                    Text = instruction.Text
                })
                .ToList(),
            Tags = recipe.Tags
                .OrderBy(tag => tag.Name)
                .Select(tag => new CreateTagDto
                {
                    Id = tag.Id,
                    Name = tag.Name
                })
                .ToList()
        };
    }

    private static IngredientReadDto ToReadDto(Ingredient ingredient, int? ingredientSectionId)
    {
        return new IngredientReadDto
        {
            Id = ingredient.Id,
            Name = ingredient.Name,
            Quantity = ingredient.Quantity,
            SortOrder = ingredient.SortOrder,
            IngredientSectionId = ingredientSectionId
        };
    }
}
