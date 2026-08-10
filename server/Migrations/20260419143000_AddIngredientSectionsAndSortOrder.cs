using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;
using HeapRecipeApi.Data;

#nullable disable

namespace HeapReacipesApi.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    [Migration("20260419143000_AddIngredientSectionsAndSortOrder")]
    public partial class AddIngredientSectionsAndSortOrder : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "SortOrder",
                table: "Ingredients",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "IngredientSectionId",
                table: "Ingredients",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "IngredientSections",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    RecipeId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IngredientSections", x => x.Id);
                    table.ForeignKey(
                        name: "FK_IngredientSections_Recipes_RecipeId",
                        column: x => x.RecipeId,
                        principalTable: "Recipes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Ingredients_IngredientSectionId",
                table: "Ingredients",
                column: "IngredientSectionId");

            migrationBuilder.CreateIndex(
                name: "IX_IngredientSections_RecipeId",
                table: "IngredientSections",
                column: "RecipeId");

            migrationBuilder.AddForeignKey(
                name: "FK_Ingredients_IngredientSections_IngredientSectionId",
                table: "Ingredients",
                column: "IngredientSectionId",
                principalTable: "IngredientSections",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Ingredients_IngredientSections_IngredientSectionId",
                table: "Ingredients");

            migrationBuilder.DropIndex(
                name: "IX_Ingredients_IngredientSectionId",
                table: "Ingredients");

            migrationBuilder.DropTable(
                name: "IngredientSections");

            migrationBuilder.DropColumn(
                name: "SortOrder",
                table: "Ingredients");

            migrationBuilder.DropColumn(
                name: "IngredientSectionId",
                table: "Ingredients");
        }
    }
}
