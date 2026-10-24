using Microsoft.EntityFrameworkCore;

namespace HeapRecipeApi.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();

        var username = config["DefaultUser:Username"];
        var password = config["DefaultUser:Password"];

        // Nothing configured -> don't seed (CI, or prod without a default user)
        if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
            return;

        if (await db.Users.AnyAsync(u => u.Username == username))
            return;

        db.Users.Add(new User
        {
            Username = username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            Role = config["DefaultUser:Role"] ?? "Admin"
        });

        await db.SaveChangesAsync();
    }
}