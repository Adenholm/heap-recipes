import { useEffect, useState } from "react";
import './style.css';
import Stepper from "../../components/stepper/Stepper";
import StepOne from "../../components/recipeForm/steps/StepOne";
import StepTwo from "../../components/recipeForm/steps/StepTwo";
import StepThree from "../../components/recipeForm/steps/StepThree";
import api from "../../service/apiClient";
import { useNavigate, useParams } from "react-router-dom";
import { useRecipes } from "../../context/recipes";

const EditRecipePage = () => {
    const { getRecipeById, editRecipe} = useRecipes();
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();
    const [recipe, setRecipe] = useState<Recipe>({
        title: '',
        description: '',
        ingredients: [],
        instructions: [],
        prepTime: 0,
        servings: 0,
        tags: [],
        imageUrl: ''
    });

    const [ingredients, setIngredients] = useState<Ingredient[]>([
        { quantity: "", name: "" },
    ]);

    const [instructions, setInstructions] = useState<Instruction[]>([
        { text: "" },
    ]);

    const [tags, setTags] = useState<{ value: string; label: string }[]>([]);

    useEffect(() => {
        const fetchRecipe = async () => {
            const data = await getRecipeById(Number(id));
            setRecipe(data);
            setIngredients(data.ingredients.length ? data.ingredients : [{ quantity: "", name: "" }]);
            setInstructions(data.instructions.length ? data.instructions : [{ text: "" }]);
            setTags(data.tags.map((tag: Tag) => ({ value: tag.id?.toString() || tag.name, label: tag.name })));
            setLoading(false);
        };
        fetchRecipe();
    }, [id, getRecipeById]);

    if (loading || !recipe) {
        return <div>Loading...</div>;
    }

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
        const updatedRecipe = {
            ...recipe,
            ingredients: ingredients
                .filter(ing => ing.name.trim() !== "")
                .map(ing => ({ id: ing.id, name: ing.name, quantity: ing.quantity })),
            instructions: instructions
                .filter(inst => inst.text.trim() !== "")
                .map(inst => ({ id: inst.id, text: inst.text })),
            tags: tags.map(tag => ({ name: tag.label }))
        };
        console.log(updatedRecipe);

        editRecipe(Number(id), updatedRecipe)
            .then(response => {
                console.log('Recipe updated successfully:', response);
                navigate('/recipe/' + id);
            })
            .catch(error => {
                console.error('Error updating recipe:', error);
            });
    };

    return (
        <div className="edit-container">
            <h1>Edit Recipe</h1>
                <Stepper onComplete={handleSubmit}>
                    <StepOne recipe={recipe} handleChange={handleChange} tags={tags} setTags={setTags} />
                    <StepTwo ingredients={ingredients} setIngredients={setIngredients} />
                    <StepThree instructions={instructions} setInstructions={setInstructions} />
            </Stepper>
        </div>
    );
};

export default EditRecipePage;