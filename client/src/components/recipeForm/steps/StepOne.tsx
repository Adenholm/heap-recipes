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
    onRecipeSelect?: (id: number) => void;
}

const StepOne = ({ recipe, handleChange, setImageUrl, tags, setTags, onRecipeSelect }: StepOneProps) => {
    const { recipes, recipeLoadError } = useRecipes();
    const suggestionsId = useId();
    const [suggestionsOpen, setSuggestionsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const search = recipe.title.trim().toLowerCase();
    const matches = search ? recipes.filter(({ title }) => title.toLowerCase().includes(search)) : [];
    const matchingRecipes = matches.filter((match): match is Recipe & { id: number } => typeof match.id === "number");
    const showSuggestions = !!onRecipeSelect && suggestionsOpen && matchingRecipes.length > 0;

    const selectRecipe = (id: number) => {
        onRecipeSelect?.(id);
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
                            if (!onRecipeSelect) return;
                            if (event.key === "Escape") {
                                setSuggestionsOpen(false);
                                setActiveIndex(-1);
                            } else if (matchingRecipes.length > 0 && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
                                event.preventDefault();
                                setSuggestionsOpen(true);
                                setActiveIndex(current => event.key === "ArrowDown"
                                    ? Math.min(current + 1, matchingRecipes.length - 1)
                                    : current <= 0 ? matchingRecipes.length - 1 : current - 1);
                            } else if (event.key === "Enter" && showSuggestions && activeIndex >= 0 && activeIndex < matchingRecipes.length) {
                                event.preventDefault();
                                selectRecipe(matchingRecipes[activeIndex].id);
                            }
                        }}
                        role={onRecipeSelect ? "combobox" : undefined}
                        aria-autocomplete={onRecipeSelect ? "list" : undefined}
                        aria-expanded={onRecipeSelect ? showSuggestions : undefined}
                        aria-controls={onRecipeSelect ? suggestionsId : undefined}
                        aria-activedescendant={showSuggestions && activeIndex >= 0 && activeIndex < matchingRecipes.length ? `${suggestionsId}-${activeIndex}` : undefined}
                        required
                    />
                    {showSuggestions && (
                        <ul id={suggestionsId} role="listbox" className="title-suggestions-list">
                            {matchingRecipes.map((match, index) => {
                                const label = matchingRecipes.some(other => other.id !== match.id && other.title === match.title)
                                    ? `${match.title} (ID ${match.id})`
                                    : match.title;
                                return (
                                    <li
                                        id={`${suggestionsId}-${index}`}
                                        key={match.id}
                                        role="option"
                                        aria-selected={index === activeIndex}
                                        aria-label={label}
                                        onMouseDown={event => event.preventDefault()}
                                        onClick={() => selectRecipe(match.id)}
                                    >
                                        <span>{label}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
                {onRecipeSelect && recipeLoadError && <p role="alert">Couldn't load recipe suggestions. We'll keep trying automatically.</p>}
                {onRecipeSelect && suggestionsOpen && matches.length !== matchingRecipes.length && (
                    <p role="alert">Some recipe suggestions couldn't be shown because they are missing an ID.</p>
                )}
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
