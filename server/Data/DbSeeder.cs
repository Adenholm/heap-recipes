using Microsoft.EntityFrameworkCore;

namespace HeapRecipeApi.Data;

public static class DbSeeder
{
    // Creates the default user from configuration (DefaultUser:Username / Password / Role).
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();
        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("DbSeeder");

        var username = config["DefaultUser:Username"];
        var password = config["DefaultUser:Password"];

        if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
        {
            logger.LogInformation("Default user not configured, skipping user seeding.");
            return;
        }

        if (await db.Users.AnyAsync(u => u.Username == username))
        {
            logger.LogInformation("Default user '{Username}' already exists, skipping.", username);
            return;
        }

        db.Users.Add(new User
        {
            Username = username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            Role = config["DefaultUser:Role"] ?? "Admin"
        });

        await db.SaveChangesAsync();
        logger.LogInformation("Created default user '{Username}'.", username);
    }

    // Adds a few example recipes for development. Only runs when there are no recipes yet.
    public static async Task SeedExampleRecipesAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("DbSeeder");

        if (await db.Recipes.AnyAsync())
        {
            logger.LogInformation("Recipes already exist, skipping example recipes.");
            return;
        }

        // Reuse existing tags by name, create the rest
        var tags = new Dictionary<string, Tag>(StringComparer.OrdinalIgnoreCase);
        foreach (var existing in await db.Tags.ToListAsync())
            tags.TryAdd(existing.Name, existing);

        Tag GetTag(string name)
        {
            if (!tags.TryGetValue(name, out var tag))
            {
                tag = new Tag { Name = name };
                tags[name] = tag;
            }
            return tag;
        }

        // 1. Simple recipe: no sections
        var pancakes = new Recipe
        {
            Title = "Fluffy Pancakes",
            Description = "Classic Sunday pancakes, soft in the middle and golden on the outside.",
            PrepTime = 25,
            Servings = 4
        };
        AddIngredients(pancakes, null,
            ("2 dl", "Flour"),
            ("2 tbsp", "Sugar"),
            ("2 tsp", "Baking powder"),
            ("1 pinch", "Salt"),
            ("2", "Eggs"),
            ("3 dl", "Milk"),
            ("2 tbsp", "Melted butter"));
        AddInstructions(pancakes, null,
            "Mix the dry ingredients in a bowl.",
            "Whisk the eggs, milk and melted butter in another bowl.",
            "Combine the wet and dry ingredients until just mixed. A few lumps are fine.",
            "Fry in a buttered pan on medium heat, about 2 minutes per side.",
            "Serve with jam, berries or maple syrup.");
        pancakes.Tags.Add(GetTag("Breakfast"));
        pancakes.Tags.Add(GetTag("Vegetarian"));

        // 2. Ingredient sections only
        var bolognese = new Recipe
        {
            Title = "Spaghetti Bolognese",
            Description = "A slow-simmered meat sauce served over spaghetti.",
            PrepTime = 60,
            Servings = 4
        };
        var sauce = AddIngredientSection(bolognese, "Sauce");
        AddIngredients(bolognese, sauce,
            ("500 g", "Minced beef"),
            ("1", "Onion, finely chopped"),
            ("2", "Garlic cloves"),
            ("1", "Carrot, grated"),
            ("400 g", "Crushed tomatoes"),
            ("2 tbsp", "Tomato paste"),
            ("1 tsp", "Dried oregano"));
        var pasta = AddIngredientSection(bolognese, "Pasta");
        AddIngredients(bolognese, pasta,
            ("400 g", "Spaghetti"),
            ("", "Grated parmesan, to serve"));
        AddInstructions(bolognese, null,
            "Fry the onion, carrot and garlic in oil until soft.",
            "Add the minced beef and brown it well.",
            "Stir in the tomato paste, crushed tomatoes and oregano. Season with salt and pepper.",
            "Simmer on low heat for 40 minutes, stirring now and then.",
            "Cook the spaghetti according to the package and serve with the sauce and parmesan.");
        bolognese.Tags.Add(GetTag("Dinner"));
        bolognese.Tags.Add(GetTag("Pasta"));

        // 3. Both ingredient sections and instruction sections
        var cookies = new Recipe
        {
            Title = "Chocolate Chip Cookies",
            Description = "Chewy cookies with crisp edges and plenty of chocolate.",
            PrepTime = 40,
            Servings = 24
        };
        var dry = AddIngredientSection(cookies, "Dry ingredients");
        AddIngredients(cookies, dry,
            ("3 dl", "Flour"),
            ("0.5 tsp", "Baking soda"),
            ("0.5 tsp", "Salt"));
        var wet = AddIngredientSection(cookies, "Wet ingredients");
        AddIngredients(cookies, wet,
            ("100 g", "Butter, softened"),
            ("1 dl", "Brown sugar"),
            ("0.5 dl", "Sugar"),
            ("1", "Egg"),
            ("1 tsp", "Vanilla extract"));
        AddIngredients(cookies, null,
            ("150 g", "Chocolate chips or chopped chocolate"));
        var dough = AddInstructionSection(cookies, "Dough");
        AddInstructions(cookies, dough,
            "Whisk the flour, baking soda and salt together.",
            "Beat the butter and both sugars until light and fluffy, then beat in the egg and vanilla.",
            "Stir in the dry ingredients, then fold in the chocolate.");
        var baking = AddInstructionSection(cookies, "Baking");
        AddInstructions(cookies, baking,
            "Heat the oven to 180 C.",
            "Place tablespoon-sized balls of dough on a lined baking tray, spaced apart.",
            "Bake for 10 to 12 minutes until the edges are golden. Let cool on the tray.");
        cookies.Tags.Add(GetTag("Dessert"));
        cookies.Tags.Add(GetTag("Baking"));
        cookies.Tags.Add(GetTag("Vegetarian"));

        // 4. Another simple one
        var soup = new Recipe
        {
            Title = "Roasted Tomato Soup",
            Description = "Smooth, rich tomato soup. Good with grilled cheese.",
            PrepTime = 45,
            Servings = 4
        };
        AddIngredients(soup, null,
            ("1 kg", "Ripe tomatoes, halved"),
            ("1", "Onion, quartered"),
            ("4", "Garlic cloves"),
            ("3 tbsp", "Olive oil"),
            ("5 dl", "Vegetable stock"),
            ("", "Salt and pepper"));
        AddInstructions(soup, null,
            "Heat the oven to 200 C.",
            "Roast the tomatoes, onion and garlic with olive oil for 30 minutes.",
            "Blend with the vegetable stock until smooth.",
            "Heat through and season to taste.");
        soup.Tags.Add(GetTag("Lunch"));
        soup.Tags.Add(GetTag("Vegan"));

        db.Recipes.AddRange(pancakes, bolognese, cookies, soup);
        await db.SaveChangesAsync();
        logger.LogInformation("Seeded {Count} example recipes.", 4);
    }

    private static IngredientSection AddIngredientSection(Recipe recipe, string name)
    {
        var section = new IngredientSection
        {
            Name = name,
            SortOrder = recipe.IngredientSections.Count,
            Recipe = recipe
        };
        recipe.IngredientSections.Add(section);
        return section;
    }

    private static InstructionSection AddInstructionSection(Recipe recipe, string name)
    {
        var section = new InstructionSection
        {
            Name = name,
            SortOrder = recipe.InstructionSections.Count,
            Recipe = recipe
        };
        recipe.InstructionSections.Add(section);
        return section;
    }

    // section == null adds root-level (uncategorized) ingredients
    private static void AddIngredients(Recipe recipe, IngredientSection? section, params (string Quantity, string Name)[] items)
    {
        for (var i = 0; i < items.Length; i++)
        {
            var ingredient = new Ingredient
            {
                Name = items[i].Name,
                Quantity = string.IsNullOrEmpty(items[i].Quantity) ? null : items[i].Quantity,
                SortOrder = i,
                Recipe = recipe,
                IngredientSection = section
            };

            if (section is null) recipe.Ingredients.Add(ingredient);
            else section.Ingredients.Add(ingredient);
        }
    }

    // section == null adds root-level (uncategorized) instructions
    private static void AddInstructions(Recipe recipe, InstructionSection? section, params string[] steps)
    {
        for (var i = 0; i < steps.Length; i++)
        {
            var instruction = new Instruction
            {
                Text = steps[i],
                SortOrder = i,
                Recipe = recipe,
                InstructionSection = section
            };

            if (section is null) recipe.Instructions.Add(instruction);
            else section.Instructions.Add(instruction);
        }
    }
}