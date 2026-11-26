import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "@/service/apiClient";
import AddRecipePage from "./AddRecipepage";

vi.mock("@/service/apiClient", () => ({ default: { post: vi.fn() } }));
vi.mock("@/context/recipes", () => ({
    useRecipes: () => ({ tags: [], addRecipe: vi.fn() }),
}));

const extracted = {
    title: "Soup",
    description: "Warm soup",
    prepTime: 25,
    servings: 2,
    ingredients: [{ name: "Carrot", quantity: "2" }],
    instructions: ["Chop carrots", "Cook soup"],
};

const selectImage = () => {
    fireEvent.change(screen.getByLabelText(/Recipe image \(JPG/), {
        target: { files: [new File(["image"], "recipe.png", { type: "image/png" })] },
    });
};

beforeEach(() => { vi.mocked(api.post).mockReset(); });

describe("recipe image import", () => {
    it("only replaces the form after confirmation and populates the ingredient and instruction steps", async () => {
        vi.mocked(api.post).mockResolvedValue({ data: extracted });
        render(<MemoryRouter><AddRecipePage /></MemoryRouter>);
        fireEvent.change(screen.getByLabelText("Title:"), { target: { value: "My draft" } });
        selectImage();
        fireEvent.click(screen.getByRole("button", { name: "Send image to Gemini" }));
        await screen.findByText("Soup");
        expect(screen.getByLabelText("Title:")).toHaveValue("My draft");
        fireEvent.click(screen.getByRole("button", { name: "Replace fields with extracted recipe" }));
        expect(screen.getByLabelText("Title:")).toHaveValue("Soup");
        expect(screen.getByLabelText("Time (minutes):")).toHaveValue(25);
        fireEvent.click(screen.getByRole("button", { name: "Next" }));
        expect(screen.getByPlaceholderText("e.g. Flour")).toHaveValue("Carrot");
        expect(screen.getByPlaceholderText("e.g. 2 cups")).toHaveValue("2");
        fireEvent.click(screen.getByRole("button", { name: "Next" }));
        expect(screen.getAllByPlaceholderText("eg. rinse the rice then ...").map((el) => (el as HTMLTextAreaElement).value))
            .toEqual(["Chop carrots", "Cook soup"]);
    });

    it("shows a server error without replacing the draft", async () => {
        vi.mocked(api.post).mockRejectedValue({
            isAxiosError: true, response: { data: { detail: "No readable recipe was found in the image." } },
        });
        render(<MemoryRouter><AddRecipePage /></MemoryRouter>);
        fireEvent.change(screen.getByLabelText("Title:"), { target: { value: "My draft" } });
        selectImage();
        fireEvent.click(screen.getByRole("button", { name: "Send image to Gemini" }));
        await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("No readable recipe"));
        expect(screen.getByLabelText("Title:")).toHaveValue("My draft");
        expect(screen.queryByRole("button", { name: "Replace fields with extracted recipe" })).not.toBeInTheDocument();
    });
});
