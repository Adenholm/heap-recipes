using Microsoft.EntityFrameworkCore;

namespace HeapRecipeApi.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> opts) : base(opts) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Recipe> Recipes => Set<Recipe>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Ingredient> Ingredients => Set<Ingredient>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Recipe>()
        .HasMany(r => r.Ingredients)
        .WithOne(i => i.Recipe)
        .HasForeignKey(i => i.RecipeId)
        .OnDelete(DeleteBehavior.Cascade);
    }
}
