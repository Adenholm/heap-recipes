import { useState } from "react";
import './style.css';
import IngredientInput from "./Ingredientinput";
import TagInput from "./Taginput";
import Stepper from "../../components/stepper/Stepper";
import StepOne from "./steps/StepOne";
import StepTwo from "./steps/StepTwo";
import StepThree from "./steps/StepThree";
import api from "../../service/apiClient";
import { useNavigate } from "react-router-dom";

const AddRecipePage = () => {
    const navigate = useNavigate();
    const [recipe, setRecipe] = useState<Recipe>({
        title: '',
        description: '',
        ingredients: [],
        instructions: '',
        prepTime: 0,
        servings: 0,
        tags: [],
        imageUrl: ''
    });

    const [ingredients, setIngredients] = useState<Ingredient[]>([
        { quantity: "", name: "" },
    ]);

    const [tags, setTags] = useState<{ value: string; label: string }[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setRecipe((prevRecipe: Recipe) => ({
        ...prevRecipe,
        [name]:
            name === "prepTime" || name === "servings"
                ? Number(value)
                : value
    }));
    };


    const handleSubmit = () => {
        const newRecipe = {
            ...recipe,
            ingredients: ingredients.filter(ing => ing.name.trim() !== ""),
            tags: tags.map(tag => ({ name: tag.value }))
        };
        api.post('/recipes', newRecipe)
            .then(response => {
                console.log('Recipe added successfully:', response.data);
                navigate('/');
            })
            .catch(error => {
                console.error('Error adding recipe:', error);
            });
    }

    return (
        <div className="add-container">
            <h1>Add Recipe</h1>
                <Stepper onComplete={handleSubmit}>
                    <StepOne recipe={recipe} handleChange={handleChange} tags={tags} setTags={setTags} />
                    <StepTwo ingredients={ingredients} setIngredients={setIngredients} />
                    <StepThree recipe={recipe} handleChange={handleChange} />
            </Stepper>
        </div>
    );
};

export default AddRecipePage;