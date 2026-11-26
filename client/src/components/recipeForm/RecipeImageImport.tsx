import { useState } from "react";
import axios from "axios";
import api from "@/service/apiClient";

export interface ExtractedRecipe {
    title: string;
    description: string;
    prepTime: number | null;
    servings: number | null;
    ingredients: { name: string; quantity: string }[];
    instructions: string[];
}

interface RecipeImageImportProps {
    onApply: (recipe: ExtractedRecipe) => void;
}

const RecipeImageImport = ({ onApply }: RecipeImageImportProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState<ExtractedRecipe | null>(null);

    const extract = async () => {
        if (!file) return;
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size === 0 || file.size > 5 * 1024 * 1024) {
            setError("Choose a JPG, PNG or WebP image up to 5 MB.");
            return;
        }
        setError("");
        setResult(null);
        setLoading(true);
        try {
            const form = new FormData();
            form.append("file", file);
            const response = await api.post<ExtractedRecipe>("/recipe-image", form);
            setResult(response.data);
        } catch (err) {
            if (axios.isAxiosError(err) && typeof err.response?.data?.detail === "string") {
                setError(err.response.data.detail);
            } else {
                setError("Could not import the recipe. Check your connection and try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="recipe-import" aria-labelledby="recipe-import-heading">
            <h2 id="recipe-import-heading">Import from a recipe image</h2>
            <p>Choose a photo of a written recipe. Sending it shares the image with Google Gemini; free-tier content may be used to improve Google's products. Avoid sensitive images.</p>
            <label htmlFor="recipe-import-file">Recipe image (JPG, PNG or WebP, max 5 MB)</label>
            <input id="recipe-import-file" type="file" accept="image/jpeg,image/png,image/webp" disabled={loading}
                onChange={(event) => {
                    setFile(event.target.files?.[0] ?? null);
                    setResult(null);
                    setError("");
                }} />
            <button type="button" className="add-btn" disabled={!file || loading} onClick={() => void extract()}>
                {loading ? "Reading image..." : "Send image to Gemini"}
            </button>
            {loading && <p role="status">Reading recipe, please wait...</p>}
            {error && <p role="alert">{error}</p>}
            {result && (
                <div>
                    <p>Recipe found: <strong>{result.title || "Untitled"}</strong>. Review all details after applying; AI can make mistakes.</p>
                    <p>Applying replaces the title, description, time, servings, ingredients and instructions, including any sections. Tags and the recipe's display image are kept.</p>
                    <button type="button" className="add-btn" onClick={() => { onApply(result); setResult(null); }}>
                        Replace fields with extracted recipe
                    </button>
                </div>
            )}
        </section>
    );
};

export default RecipeImageImport;
