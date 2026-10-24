import TagInput from "../Taginput";
import "../style.css";
import placeHolderImage from '@/assets/images/ramen-black.svg'
import api from "../../../service/apiClient";
import { useState } from "react";
import axios from "axios";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB, samma som RequestSizeLimit i backend
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function getUploadErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        if (!error.response) {
        return "Kunde inte nå servern. Kontrollera din anslutning och försök igen.";
        }
        if (error.response.status === 413) {
        return "Bilden är för stor.";
        }
        if (error.response.status === 401 || error.response.status === 403) {
        return "Du måste vara inloggad för att ladda upp bilder.";
        }
        // Backend skickar en text vid BadRequest("...")
        if (typeof error.response.data === "string" && error.response.data) {
        return error.response.data;
        }
    }
    return "Det gick inte att ladda upp bilden.";
}

interface StepOneProps {
  recipe: Recipe;
  handleChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  setImageUrl: (imageUrl: string) => void;
  tags: { value: string; label: string }[];
  setTags: React.Dispatch<React.SetStateAction<{ value: string; label: string }[]>>;
}

const StepOne = ({ recipe, handleChange, setImageUrl, tags, setTags }: StepOneProps) => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
        return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
        setUploadError("Filen måste vara en JPG-, PNG- eller WebP-bild.");
        return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
        setUploadError(`Bilden är ${sizeMb} MB. Max tillåtet är 5 MB.`);
        return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await api.post<{ url: string }>("/images", formData);
        setImageUrl(response.data.url);
    } catch (error) {
        console.error("Error uploading recipe image:", error);
        setUploadError(getUploadErrorMessage(error));
    } finally {
        setIsUploading(false);
    }
    };

    return (
        <form className="recipe-form">
            <div>
                <label htmlFor="title">Title:</label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    value={recipe.title}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <label htmlFor="description">Description:</label>
                <textarea
                    id="description"
                    name="description"
                    value={recipe.description}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="two-input-row">
                <div>
                    <label htmlFor="prepTime">Time (minutes):</label>
                    <input
                        type="number"
                        id="prepTime"
                        name="prepTime"
                        value={recipe.prepTime}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="servings">Servings:</label>
                    <input
                        type="number"
                        id="servings"
                        name="servings"
                        value={recipe.servings}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>
            <TagInput selectedTags={tags} setSelectedTags={setTags} />
            <div>
                <label htmlFor="imageUrl">Image URL:</label>
                <input
                    type="url"
                    id="imageUrl"
                    name="imageUrl"
                    value={recipe.imageUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/bild.jpg"
                />
            </div>
            <div>
                <label htmlFor="imageUpload">Or upload an image:</label>
                <input
                    type="file"
                    id="imageUpload"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                />
                {isUploading && <p>Uploading image...</p>}
                {uploadError && <p role="alert" className="error">{uploadError}</p>}
            </div>
            <div>
                <label htmlFor="imagePreview">Image Preview:</label>
            <img src={recipe.imageUrl || placeHolderImage} alt="Image Preview" className="image-preview" />
            </div>
        </form>
    );
};

export default StepOne;
