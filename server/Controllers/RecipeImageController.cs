using HeapRecipeApi.Models;
using HeapRecipeApi.Services;
using ImageMagick;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HeapRecipeApi.Controllers;

[ApiController]
[Route("api/recipe-image")]
[Authorize]
public sealed class RecipeImageController(IRecipeImageReader reader) : ControllerBase
{
    private const long MaxImageSize = 5 * 1024 * 1024;
    private static readonly HashSet<string> AllowedTypes = ["image/jpeg", "image/png", "image/webp"];

    /// <summary>Extract an editable recipe from an uploaded image using Gemini.</summary>
    [HttpPost]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(MaxImageSize + 64 * 1024)]
    [ProducesResponseType<RecipeImageResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> Extract(IFormFile file, CancellationToken cancellationToken)
    {
        if (file is null || file.Length == 0 || file.Length > MaxImageSize ||
            !AllowedTypes.Contains(file.ContentType.ToLowerInvariant()))
            return Problem(statusCode: 400, detail: "Choose a JPG, PNG or WebP image up to 5 MB.");

        byte[] imageBytes;
        try
        {
            await using var stream = file.OpenReadStream();
            using var image = new MagickImage(stream);
            if (image.Format is not (MagickFormat.Jpeg or MagickFormat.Png or MagickFormat.WebP) ||
                image.Width > 10000 || image.Height > 10000)
                return Problem(statusCode: 400, detail: "The image format or dimensions are not supported.");
            image.AutoOrient();
            image.Strip();
            image.Format = MagickFormat.Png;
            imageBytes = image.ToByteArray();
            if (imageBytes.Length > 10 * 1024 * 1024)
                return Problem(statusCode: 400, detail: "The decoded image is too large to process.");
        }
        catch (MagickException)
        {
            return Problem(statusCode: 400, detail: "The file is not a valid image.");
        }

        try
        {
            var recipe = await reader.ReadAsync(imageBytes, "image/png", cancellationToken);
            return recipe is null
                ? Problem(statusCode: 422, detail: "No readable recipe was found in the image.")
                : Ok(recipe);
        }
        catch (RecipeImageReaderException ex)
        {
            return Problem(statusCode: ex.StatusCode, detail: ex.Message);
        }
    }
}
