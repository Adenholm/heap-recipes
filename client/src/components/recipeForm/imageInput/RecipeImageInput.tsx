import { useState } from "react";
import axios from "axios";
import api from "../../../service/apiClient";
import "./style.css";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface RecipeImageInputProps {
    imageUrl: string;
    onImageUrlChange: (imageUrl: string) => void;
}

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
        if (typeof error.response.data === "string" && error.response.data) {
            return error.response.data;
        }
    }
    return "Det gick inte att ladda upp bilden.";
}

const RecipeImageInput = ({
    imageUrl,
    onImageUrlChange,
}: RecipeImageInputProps) => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const uploadFile = async (file: File) => {
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
            onImageUrlChange(response.data.url);
        } catch (error) {
            console.error("Error uploading recipe image:", error);
            setUploadError(getUploadErrorMessage(error));
        } finally {
            setIsUploading(false);
        }
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";

        if (file) {
            void uploadFile(file);
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
    };

    const handleDragEnter = (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();

        if (!isUploading) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
        if (event.currentTarget.contains(event.relatedTarget as Node)) {
            return;
        }

        setIsDragging(false);
    };

    const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        setIsDragging(false);

        if (isUploading) {
            return;
        }

        const file = event.dataTransfer.files?.[0];
        if (file) {
            void uploadFile(file);
        }
    };

    return (
        <div className="image-upload">
            <div className="image-upload__url-field">
                <label htmlFor="imageUrl">Image URL:</label>
                <input
                    type="url"
                    id="imageUrl"
                    name="imageUrl"
                    value={imageUrl}
                    onChange={(event) => onImageUrlChange(event.target.value)}
                    placeholder="https://example.com/bild.jpg"
                />
            </div>

            <input
                type="file"
                id="imageUpload"
                className="image-upload__input"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageUpload}
                disabled={isUploading}
            />

            <label
                htmlFor="imageUpload"
                className={`dropzone${isDragging ? " is-dragging" : ""}${isUploading ? " is-uploading" : ""}${imageUrl ? " has-image" : ""}`}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {imageUrl ? (
                    <img src={imageUrl} alt="Image preview" className="dropzone__image" />
                ) : (
                    <div className="dropzone__empty">
                        <svg
                            width="36"
                            height="36"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <strong>Click to choose an image</strong>
                        <span>or drag and drop it here</span>
                    </div>
                )}

                <div className="dropzone__overlay" aria-hidden="true">
                    {isUploading ? (
                        <>
                            <span className="dropzone__spinner" />
                            Uploading...
                        </>
                    ) : isDragging ? (
                        "Drop to upload"
                    ) : (
                        "Click or drop to replace"
                    )}
                </div>
            </label>

            <span className="image-upload__hint">JPG, PNG or WebP, max 5 MB</span>

            {uploadError && (
                <p role="alert" className="image-upload__error">
                    {uploadError}
                </p>
            )}
        </div>
    );
};

export default RecipeImageInput;
