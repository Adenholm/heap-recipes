namespace HeapRecipeApi.Data;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = default!;
    public string PasswordHash { get; set; } = default!;
    public string? Role { get; set; }
}

public class Recipe
{
    public int Id { get; set; }
    public string Title { get; set; } = default!;
    public string? Description { get; set; }

    public string? ImageUrl { get; set; }

    public int? PrepTime { get; set; } // in minutes

    public int? Servings { get; set; }

    public string Instructions { get; set; } = default!;

    public ICollection<Ingredient> Ingredients { get; set; } = new List<Ingredient>();
    
    public ICollection<Tag> Tags { get; set; } = new List<Tag>();
}

public class Ingredient
{
    public int Id { get; set; }
    public string Name { get; set; } = default!;

    public string? Quantity { get; set; }

    public int RecipeId { get; set; }
    public Recipe? Recipe { get; set; }
}

public class Tag
{
    public int Id { get; set; }
    public string Name { get; set; } = default!;

    public ICollection<Recipe> Recipes { get; set; } = new List<Recipe>();
}
