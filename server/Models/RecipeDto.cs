namespace HeapRecipeApi.Models;

// Used when creating or updating a recipe
public class CreateRecipeDto
{
    public string Title { get; set; } = default!;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public int? PrepTime { get; set; } // in minutes
    public int? Servings { get; set; }
    public string Instructions { get; set; } = default!;
    public int? CategoryId { get; set; }
    public List<CreateIngredientDto> Ingredients { get; set; } = new();
}

public class CreateIngredientDto
{
    public int? Id { get; set; }
    public string Name { get; set; } = "";
    public string? Quantity { get; set; }
}

public class IngredientDto
{
    public int Id { get; set; }
    public string Name { get; set; } = default!;
    public string? Quantity { get; set; }
}