import { useEffect, useState } from "react";
import './style.css';
import Stepper from "../../components/stepper/Stepper";
import StepOne from "../../components/recipeForm/steps/StepOne";
import StepTwo from "../../components/recipeForm/steps/StepTwo";
import StepThree from "../../components/recipeForm/steps/StepThree";
import api from "../../service/apiClient";
import { useNavigate, useParams } from "react-router-dom";

const EditRecipePage = () => {
    const { id } = useParams<{ id: string }>();
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
        api.get(`/recipes/${id}`).then(response => {
            setRecipe(response.data);
            setIngredients(response.data.ingredients.length ? response.data.ingredients : [{ quantity: "", name: "" }]);
            setInstructions(response.data.instructions.length ? response.data.instructions : [{ text: "" }]);
            setTags(response.data.tags.map((tag: Tag) => ({ value: tag.id?.toString() || tag.name, label: tag.name })));
        }).catch(error => {
            console.error('Error fetching recipe:', error);
        });
    }, [id]);

    if (!recipe) {
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

        api.put(`/recipes/${id}`, updatedRecipe)
            .then(response => {
                console.log('Recipe updated successfully:', response.data);
                navigate('/recipe/' + id);
            })
            .catch(error => {
                console.error('Error updating recipe:', error);
            });
    };

    return (
        <div className="edit-container">
            <h1>Add Recipe</h1>
                <Stepper onComplete={handleSubmit}>
                    <StepOne recipe={recipe} handleChange={handleChange} tags={tags} setTags={setTags} />
                    <StepTwo ingredients={ingredients} setIngredients={setIngredients} />
                    <StepThree instructions={instructions} setInstructions={setInstructions} />
            </Stepper>
        </div>
    );
};

export default EditRecipePage;