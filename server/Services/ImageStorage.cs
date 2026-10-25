namespace HeapRecipeApi.Services;

public sealed class ImageStorage
{
    private const string UploadPrefix = "/uploads/";
    private static readonly HashSet<string> ManagedExtensions =
        new(StringComparer.OrdinalIgnoreCase) { ".jpg", ".jpeg", ".png", ".webp" };
    private readonly ILogger<ImageStorage> _logger;

    public string UploadPath { get; }

    public ImageStorage(
        IConfiguration config,
        IWebHostEnvironment environment,
        ILogger<ImageStorage> logger)
    {
        var configuredUploadPath = config["UploadPath"] ?? "uploads";
        UploadPath = Path.IsPathRooted(configuredUploadPath)
            ? configuredUploadPath
            : Path.Combine(environment.ContentRootPath, configuredUploadPath);

        Directory.CreateDirectory(UploadPath);
        _logger = logger;
    }

    public bool IsManagedUrl(string? url) =>
        TryGetManagedPath(url, out _);

    public bool DeleteByUrl(string? url)
    {
        if (!TryGetManagedPath(url, out var fullPath) || !File.Exists(fullPath))
            return false;

        try
        {
            File.Delete(fullPath);
            return true;
        }
        catch (IOException ex)
        {
            _logger.LogWarning(ex, "Kunde inte ta bort bildfilen {FilePath}", fullPath);
            return false;
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Saknar behörighet att ta bort bildfilen {FilePath}", fullPath);
            return false;
        }
    }

    public IEnumerable<string> GetStoredImages() =>
        Directory.EnumerateFiles(UploadPath, "*", SearchOption.TopDirectoryOnly)
            .Where(path => ManagedExtensions.Contains(Path.GetExtension(path)));

    private bool TryGetManagedPath(string? url, out string fullPath)
    {
        fullPath = string.Empty;

        if (string.IsNullOrWhiteSpace(url) ||
            !url.StartsWith(UploadPrefix, StringComparison.Ordinal))
            return false;

        var fileName = url[UploadPrefix.Length..];
        if (string.IsNullOrWhiteSpace(fileName) ||
            fileName != Path.GetFileName(fileName) ||
            !ManagedExtensions.Contains(Path.GetExtension(fileName)))
            return false;

        fullPath = Path.Combine(UploadPath, fileName);
        return true;
    }
}
