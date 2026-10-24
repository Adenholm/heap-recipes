using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace HeapReacipesApi.Migrations
{
    /// <inheritdoc />
    public partial class AddInstructionSections : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "InstructionSectionId",
                table: "Instructions",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "InstructionSections",
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
                    table.PrimaryKey("PK_InstructionSections", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InstructionSections_Recipes_RecipeId",
                        column: x => x.RecipeId,
                        principalTable: "Recipes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Instructions_InstructionSectionId",
                table: "Instructions",
                column: "InstructionSectionId");

            migrationBuilder.CreateIndex(
                name: "IX_InstructionSections_RecipeId",
                table: "InstructionSections",
                column: "RecipeId");

            migrationBuilder.AddForeignKey(
                name: "FK_Instructions_InstructionSections_InstructionSectionId",
                table: "Instructions",
                column: "InstructionSectionId",
                principalTable: "InstructionSections",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Instructions_InstructionSections_InstructionSectionId",
                table: "Instructions");

            migrationBuilder.DropTable(
                name: "InstructionSections");

            migrationBuilder.DropIndex(
                name: "IX_Instructions_InstructionSectionId",
                table: "Instructions");

            migrationBuilder.DropColumn(
                name: "InstructionSectionId",
                table: "Instructions");
        }
    }
}
