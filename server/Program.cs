using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using HeapRecipeApi.Data;
using System.Text;
using System.Text.Json.Serialization;
using Microsoft.Extensions.FileProviders;
using HeapRecipeApi.Services;
using System.Reflection;
using HeapRecipeApi.Swagger;
using Npgsql;
var builder = WebApplication.CreateBuilder(args);

// Configure EF Core with PostgreSQL
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
var postgres = builder.Configuration.GetSection("Postgres");
if (postgres.Exists())
{
    var postgresConnection = new NpgsqlConnectionStringBuilder(connectionString)
    {
        Database = postgres["Database"] ?? throw new InvalidOperationException("Postgres:Database is required."),
        Username = postgres["Username"] ?? throw new InvalidOperationException("Postgres:Username is required."),
        Password = postgres["Password"] ?? throw new InvalidOperationException("Postgres:Password is required.")
    };
    connectionString = postgresConnection.ConnectionString;
}

builder.Services.AddDbContext<ApplicationDbContext>(opts =>
    opts.UseNpgsql(connectionString));
builder.Services.AddSingleton<ImageStorage>();
builder.Services.AddHostedService<OrphanImageCleaner>();

// Configure JWT options
var jwtSection = builder.Configuration.GetSection("Jwt");
var jwtKey = jwtSection["Key"];
if (string.IsNullOrEmpty(jwtKey))
{
    Console.WriteLine("⚠️ Warning: JWT key not set. Using temporary key for CI/CD.");
    jwtKey = "=temporary-ci-key="; // safe fallback for CI
}
var key = Encoding.UTF8.GetBytes(jwtKey);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = true,
            ValidIssuer = jwtSection["Issuer"],
            ValidateAudience = true,
            ValidAudience = jwtSection["Audience"],
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30)
        };
    });

var allowedOrigins = builder.Configuration["AllowedOrigins"]?
    .Split(';', StringSplitOptions.RemoveEmptyEntries)
    ?? Array.Empty<string>();

builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowConfiguredOrigins", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });


builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Heap Recipes API",
        Version = "1.0.0",
        Description = """
            API for managing recipes, users and image uploads in Heap Recipes.

            ### Features
            - Authentication via JWT
            - Recipe management
            - Image upload and processing
            - System health endpoint

            ### Environments
            - Local development (proxy)
            - Local direct
            - Production API
            """,
        Contact = new OpenApiContact
        {
            Name = "Hanna Adenholm",
            Url = new Uri("https://adenholm.com"),
        }
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme."
    });

    c.OperationFilter<AuthorizeOperationFilter>();
});


var app = builder.Build();

var configuredUploadPath = builder.Configuration["UploadPath"];
var uploadPath = Path.IsPathRooted(configuredUploadPath ?? string.Empty)
    ? configuredUploadPath!
    : Path.Combine(builder.Environment.ContentRootPath, configuredUploadPath ?? "uploads");

Directory.CreateDirectory(uploadPath);


var swaggerEnabled = app.Environment.IsDevelopment()
    || app.Configuration.GetValue<bool>("Swagger:Enabled");

if (swaggerEnabled)
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("./v1/swagger.json", "Recipe API v1");
        c.EnablePersistAuthorization();
        c.DisplayRequestDuration();
        c.DocExpansion(Swashbuckle.AspNetCore.SwaggerUI.DocExpansion.None);
    });
}

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    int maxAttempts = 15;
    for (var attempt = 1; attempt <= maxAttempts; attempt++)
    {
        try
        {
            db.Database.Migrate();
            break;
        }
        catch (Exception ex)
        {
            app.Logger.LogWarning(ex, "Tried to migrate but DB was not ready, retry {Attempt}/{MaxAttempts}", attempt, maxAttempts);
            Thread.Sleep(3000);
        }
    }
}

await DbSeeder.SeedAsync(app.Services);

if (app.Environment.IsDevelopment())
    await DbSeeder.SeedExampleRecipesAsync(app.Services);

app.MapGet("/health", () => Results.Ok("Healthy!"));
app.UseCors("AllowConfiguredOrigins");
app.UseHttpsRedirection();
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadPath),
    RequestPath = "/uploads"
});
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
