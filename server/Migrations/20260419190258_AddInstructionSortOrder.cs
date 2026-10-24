using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HeapReacipesApi.Migrations
{
    /// <inheritdoc />
    public partial class AddInstructionSortOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "SortOrder",
                table: "Instructions",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SortOrder",
                table: "Instructions");
        }
    }
}
