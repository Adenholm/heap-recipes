using HeapRecipeApi.Data;
using Microsoft.EntityFrameworkCore;

namespace HeapRecipeApi.Services;

public sealed class OrphanImageCleaner : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ImageStorage _storage;
    private readonly ILogger<OrphanImageCleaner> _logger;
    private readonly TimeSpan _sweepInterval;
    private readonly TimeSpan _minimumAge;

    public OrphanImageCleaner(
        IServiceScopeFactory scopeFactory,
        ImageStorage storage,
        ILogger<OrphanImageCleaner> logger,
        IConfiguration configuration)
    {
        _scopeFactory = scopeFactory;
        _storage = storage;
        _logger = logger;
        _sweepInterval = configuration.GetValue(
            "ImageCleanup:SweepInterval",
            TimeSpan.FromHours(24));
        _minimumAge = configuration.GetValue(
            "ImageCleanup:MinimumAge",
            TimeSpan.FromHours(24));

        if (_sweepInterval <= TimeSpan.Zero || _minimumAge < TimeSpan.Zero)
            throw new InvalidOperationException(
                "ImageCleanup:SweepInterval måste vara större än noll och MinimumAge får inte vara negativ.");
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(_sweepInterval);

        try
        {
            await SweepAsync(stoppingToken);

            while (await timer.WaitForNextTickAsync(stoppingToken))
                await SweepAsync(stoppingToken);
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
        {
        }
    }

    private async Task SweepAsync(CancellationToken cancellationToken)
    {
        try
        {
            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var inUse = (await db.Recipes
                    .Where(recipe => recipe.ImageUrl != null)
                    .Select(recipe => recipe.ImageUrl!)
                    .ToListAsync(cancellationToken))
                .Where(_storage.IsManagedUrl)
                .Select(url => Path.GetFileName(url))
                .ToHashSet(StringComparer.OrdinalIgnoreCase);

            var cutoff = DateTime.UtcNow - _minimumAge;

            foreach (var filePath in _storage.GetStoredImages())
            {
                cancellationToken.ThrowIfCancellationRequested();

                if (inUse.Contains(Path.GetFileName(filePath)) ||
                    File.GetLastWriteTimeUtc(filePath) > cutoff)
                    continue;

                _logger.LogInformation("Tar bort föräldralös bild {FilePath}", filePath);
                _storage.DeleteByUrl($"/uploads/{Path.GetFileName(filePath)}");
            }
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Städning av föräldralösa bilder misslyckades");
        }
    }
}
