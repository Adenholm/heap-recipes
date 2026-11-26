namespace HeapRecipeApi.Models;

/// <summary>Recipe text extracted from an image for review before saving.</summary>
public sealed record RecipeImageResponse(
    string Title,
    string Description,
    int? PrepTime,
    int? Servings,
    RecipeImageIngredient[] Ingredients,
    string[] Instructions);

/// <summary>An ingredient and its quantity extracted from an image.</summary>
public sealed record RecipeImageIngredient(string Name, string Quantity);
