namespace HeapRecipeApi.Models;

// Used when creating or updating a recipe
public class CreateRecipeDto
{
    public string Title { get; set; } = default!;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public int? PrepTime { get; set; } // in minutes
    public int? Servings { get; set; }
    public List<CreateIngredientDto> Ingredients { get; set; } = new();
    public List<CreateIngredientSectionDto> IngredientSections { get; set; } = new();
    public List<CreateInstructionDto> Instructions { get; set; } = new();
    public List<CreateInstructionSectionDto> InstructionSections { get; set; } = new();
    public List<CreateTagDto> Tags { get; set; } = new();
}

public class CreateIngredientDto
{
    public int? Id { get; set; }
    public string Name { get; set; } = "";
    public string? Quantity { get; set; }
    public int? SortOrder { get; set; }
}

public class CreateIngredientSectionDto
{
    public int? Id { get; set; }
    public string Name { get; set; } = "";
    public int? SortOrder { get; set; }
    public List<CreateIngredientDto> Ingredients { get; set; } = new();
}

public class CreateInstructionDto
{
    public int? Id { get; set; }
    public string Text { get; set; } = "";
    public int? SortOrder { get; set; }
    public int? InstructionSectionId { get; set; }
}

public class CreateInstructionSectionDto
{
    public int? Id { get; set; }
    public string Name { get; set; } = "";
    public int? SortOrder { get; set; }
    public List<CreateInstructionDto> Instructions { get; set; } = new();
}

public class CreateTagDto
{
    public int? Id { get; set; }
    public string Name { get; set; } = "";
}

public class RecipeReadDto
{
    public int Id { get; set; }
    public string Title { get; set; } = default!;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public int? PrepTime { get; set; }
    public int? Servings { get; set; }
    public List<IngredientSectionReadDto> IngredientSections { get; set; } = new();
    public List<InstructionSectionReadDto> InstructionSections { get; set; } = new();
    public List<CreateTagDto> Tags { get; set; } = new();
}

public class IngredientReadDto
{
    public int Id { get; set; }
    public string Name { get; set; } = default!;
    public string? Quantity { get; set; }
    public int SortOrder { get; set; }
    public int? IngredientSectionId { get; set; }
}

public class IngredientSectionReadDto
{
    public int? Id { get; set; }
    public string Name { get; set; } = default!;
    public int SortOrder { get; set; }
    public bool IsUncategorized { get; set; }
    public List<IngredientReadDto> Ingredients { get; set; } = new();
}

public class InstructionReadDto
{
    public int Id { get; set; }
    public string Text { get; set; } = default!;
    public int SortOrder { get; set; }
    public int? InstructionSectionId { get; set; }
}

public class InstructionSectionReadDto
{
    public int? Id { get; set; }
    public string Name { get; set; } = default!;
    public int SortOrder { get; set; }
    public bool IsUncategorized { get; set; }
    public List<InstructionReadDto> Instructions { get; set; } = new();
}
