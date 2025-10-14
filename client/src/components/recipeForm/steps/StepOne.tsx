import TagInput from "../Taginput";
import "../style.css";

interface StepOneProps {
  recipe: Recipe;
  handleChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  tags: { value: string; label: string }[];
  setTags: React.Dispatch<React.SetStateAction<{ value: string; label: string }[]>>;
}

const StepOne = ({ recipe, handleChange, tags, setTags }: StepOneProps) => {
  return (
    <form>
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
        <div>
            <label htmlFor="prepTime">Cooking Time (minutes):</label>
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
        <div>
            <label htmlFor="imageUrl">Image URL:</label>
            <input
                type="text"
                id="imageUrl"
                name="imageUrl"
                value={recipe.imageUrl}
                onChange={handleChange}
            />
        </div>
        <div>
            <label htmlFor="imagePreview">Image Preview:</label>
        <img src={recipe.imageUrl || 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Zm9vZHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600'} alt="Image Preview" className="image-preview" />
        </div>
        <TagInput selectedTags={tags} setSelectedTags={setTags} />
    </form>
  );
};
export default StepOne;
