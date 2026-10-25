using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ImageMagick;
using HeapRecipeApi.Services;

namespace HeapRecipeApi.Controllers;

[ApiController]
[Route("api/images")]
public class ImagesController : ControllerBase
{
    private static readonly HashSet<string> AllowedContentTypes =
        ["image/jpeg", "image/png", "image/webp"];
    private const long MaxUploadSize = 10_000_000;
    private const int MaxInputDimension = 10_000;
    private const int MaxOutputDimension = 1_600;
    private readonly string _uploadPath;

    public ImagesController(ImageStorage storage) => _uploadPath = storage.UploadPath;

    [Authorize]
    [HttpPost]
    [RequestSizeLimit(MaxUploadSize)]
    public async Task<IActionResult> Upload([FromForm] IFormFile file)
    {
        if (file is null || file.Length == 0)
            return BadRequest("Ingen fil skickades");

        if (!AllowedContentTypes.Contains(file.ContentType.ToLowerInvariant()))
            return BadRequest("Filtypen stöds inte");

        try
        {
            await using var input = file.OpenReadStream();
            using var image = new MagickImage(input);
            image.AutoOrient();

            if (image.Width > MaxInputDimension || image.Height > MaxInputDimension)
                return BadRequest("Bildens dimensioner är för stora");

            if (image.Width > MaxOutputDimension || image.Height > MaxOutputDimension)
                image.Resize(new MagickGeometry(MaxOutputDimension, MaxOutputDimension)
                {
                    IgnoreAspectRatio = false
                });

            var name = $"{Guid.NewGuid():N}.webp";
            var fullPath = Path.Combine(_uploadPath, name);

            image.Format = MagickFormat.WebP;
            image.Quality = 82;
            await image.WriteAsync(fullPath);

            return Ok(new { url = $"/uploads/{name}" });
        }
        catch (MagickException)
        {
            return BadRequest("Filen är inte en giltig bild");
        }
    }
}