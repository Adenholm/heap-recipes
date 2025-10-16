using Microsoft.EntityFrameworkCore;

namespace HeapRecipeApi.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> opts) : base(opts) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Recipe> Recipes => Set<Recipe>();
    public DbSet<Ingredient> Ingredients => Set<Ingredient>();
    public DbSet<Instruction> Instructions => Set<Instruction>();
    public DbSet<Tag> Tags => Set<Tag>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Recipe>()
            .HasMany(r => r.Ingredients)
            .WithOne(i => i.Recipe)
            .HasForeignKey(i => i.RecipeId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Recipe>()
            .HasMany(r => r.Instructions)
            .WithOne(i => i.Recipe)
            .HasForeignKey(i => i.RecipeId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Recipe>()
            .HasMany(r => r.Tags)
            .WithMany(t => t.Recipes)
            .UsingEntity<Dictionary<string, object>>(
                "RecipeTags",
                j => j.HasOne<Tag>().WithMany().OnDelete(DeleteBehavior.Cascade),
                j => j.HasOne<Recipe>().WithMany().OnDelete(DeleteBehavior.Cascade)
            );
    }
}
