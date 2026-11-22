using Microsoft.AspNetCore.Authorization;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace HeapRecipeApi.Swagger;

public class AuthorizeOperationFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        var hasAuthorize =
            context.MethodInfo.GetCustomAttributes(true).OfType<AuthorizeAttribute>().Any() ||
            (context.MethodInfo.DeclaringType?.GetCustomAttributes(true).OfType<AuthorizeAttribute>().Any() ?? false);
        var allowAnonymous = context.MethodInfo.GetCustomAttributes(true).OfType<AllowAnonymousAttribute>().Any();

        if (!hasAuthorize || allowAnonymous) return;

        operation.Responses.TryAdd("401", new OpenApiResponse { Description = "Unauthorized" });
        operation.Security = new List<OpenApiSecurityRequirement>
        {
            new()
            {
                [new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
                }] = Array.Empty<string>()
            }
        };
    }
}