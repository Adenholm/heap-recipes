import { useId, useState } from "react";
import TagInput from "@/components/recipeForm/Taginput";
import RecipeImageInput from "@/components/recipeForm/imageInput/RecipeImageInput";
import "@/components/recipeForm/style.css";
import { useRecipes } from "@/context/recipes";

interface StepOneProps {
    recipe: Recipe;
    handleChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    setImageUrl: (imageUrl: string) => void;
    tags: { value: string; label: string }[];
    setTags: React.Dispatch<React.SetStateAction<{ value: string; label: string }[]>>;
    onTitleSelect?: (title: string) => void;
}

const StepOne = ({ recipe, handleChange, setImageUrl, tags, setTags, onTitleSelect }: StepOneProps) => {
    const { recipes, recipeLoadError } = useRecipes();
    const suggestionsId = useId();
    const [suggestionsOpen, setSuggestionsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const search = recipe.title.trim().toLowerCase();
    const matchingTitles = search
        ? [...new Set(recipes.filter(({ title }) => title.toLowerCase().includes(search)).map(({ title }) => title))]
        : [];
    const showSuggestions = !!onTitleSelect && suggestionsOpen && matchingTitles.length > 0;

    const selectTitle = (title: string) => {
        onTitleSelect?.(title);
        setSuggestionsOpen(false);
        setActiveIndex(-1);
    };

    return (
        <form className="recipe-form">
            <div>
                <label htmlFor="title">Title:</label>
                <div className="title-suggestions">
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={recipe.title}
                        onChange={event => {
                            handleChange(event);
                            setSuggestionsOpen(true);
                            setActiveIndex(-1);
                        }}
                        onFocus={() => setSuggestionsOpen(true)}
                        onBlur={() => setSuggestionsOpen(false)}
                        onKeyDown={event => {
                            if (!onTitleSelect) return;
                            if (event.key === "Escape") {
                                setSuggestionsOpen(false);
                                setActiveIndex(-1);
                            } else if (matchingTitles.length > 0 && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
                                event.preventDefault();
                                setSuggestionsOpen(true);
                                setActiveIndex(current => event.key === "ArrowDown"
                                    ? Math.min(current + 1, matchingTitles.length - 1)
                                    : current <= 0 ? matchingTitles.length - 1 : current - 1);
                            } else if (event.key === "Enter" && showSuggestions && activeIndex >= 0 && activeIndex < matchingTitles.length) {
                                event.preventDefault();
                                selectTitle(matchingTitles[activeIndex]);
                            }
                        }}
                        role={onTitleSelect ? "combobox" : undefined}
                        aria-autocomplete={onTitleSelect ? "list" : undefined}
                        aria-expanded={onTitleSelect ? showSuggestions : undefined}
                        aria-controls={onTitleSelect ? suggestionsId : undefined}
                        aria-activedescendant={showSuggestions && activeIndex >= 0 && activeIndex < matchingTitles.length ? `${suggestionsId}-${activeIndex}` : undefined}
                        required
                    />
                    {showSuggestions && (
                        <ul id={suggestionsId} role="listbox" className="title-suggestions-list">
                            {matchingTitles.map((title, index) => (
                                <li
                                    id={`${suggestionsId}-${index}`}
                                    key={title}
                                    role="option"
                                    aria-selected={index === activeIndex}
                                    aria-label={title}
                                    onMouseDown={event => event.preventDefault()}
                                    onClick={() => selectTitle(title)}
                                >
                                    <span>{title}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                {onTitleSelect && recipeLoadError && <p role="alert">Couldn't load recipe suggestions. We'll keep trying automatically.</p>}
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
            <RecipeImageInput
                imageUrl={recipe.imageUrl}
                onImageUrlChange={setImageUrl}
            />
        </form>
    );
};

export default StepOne;
