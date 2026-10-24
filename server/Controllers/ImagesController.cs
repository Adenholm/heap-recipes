using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HeapRecipeApi.Controllers;

[ApiController]
[Route("api/images")]
public class ImagesController : ControllerBase
{
    private static readonly string[] Allowed = [".jpg", ".jpeg", ".png", ".webp"];
    private readonly string _uploadPath;

    public ImagesController(IConfiguration config, IWebHostEnvironment environment)
    {
        var configuredUploadPath = config["UploadPath"] ?? "uploads";
        _uploadPath = Path.IsPathRooted(configuredUploadPath)
            ? configuredUploadPath
            : Path.Combine(environment.ContentRootPath, configuredUploadPath);
    }

    [Authorize]
    [HttpPost]
    [RequestSizeLimit(5_000_000)] // 5 MB
    public async Task<IActionResult> Upload([FromForm] IFormFile file)
    {
        if (file is null || file.Length == 0)
            return BadRequest("Ingen fil skickades");

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!Allowed.Contains(ext))
            return BadRequest("Filtypen stöds inte");

        var name = $"{Guid.NewGuid()}{ext}"; // använd aldrig användarens filnamn
        var fullPath = Path.Combine(_uploadPath, name);

        await using var stream = System.IO.File.Create(fullPath);
        await file.CopyToAsync(stream);

        return Ok(new { url = $"/uploads/{name}" });
    }
}