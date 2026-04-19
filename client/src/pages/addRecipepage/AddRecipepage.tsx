import { useState } from "react";
import './style.css';
import Stepper from "../../components/stepper/Stepper";
import StepOne from "../../components/recipeForm/steps/StepOne";
import StepTwo from "../../components/recipeForm/steps/StepTwo";
import StepThree from "../../components/recipeForm/steps/StepThree";
import { useNavigate } from "react-router-dom";
import { useRecipes } from "../../context/recipes";

const AddRecipePage = () => {
    const { addRecipe} = useRecipes();
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
        { quantity: "", name: "", sortOrder: 0 },
    ]);

    const [ingredientSections, setIngredientSections] = useState<IngredientSection[]>([]);

    const [instructions, setInstructions] = useState<Instruction[]>([
        { text: "" },
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
            ingredients: ingredients
                .filter((ing) => ing.name.trim() !== "" && ing.ingredientSectionId == null)
                .map((ing, index) => ({
                    id: ing.id,
                    name: ing.name,
                    quantity: ing.quantity,
                    sortOrder: ing.sortOrder ?? index,
                })),
            ingredientSections: ingredientSections
                .filter((section) => section.name.trim() !== "")
                .map((section, index) => ({
                    id: section.id,
                    name: section.name,
                    sortOrder: section.sortOrder ?? index,
                    ingredients: section.ingredients
                        .filter((ingredient) => ingredient.name.trim() !== "")
                        .map((ingredient, ingredientIndex) => ({
                            id: ingredient.id,
                            name: ingredient.name,
                            quantity: ingredient.quantity,
                            sortOrder: ingredient.sortOrder ?? ingredientIndex,
                        })),
                })),
            instructions: instructions.filter(inst => inst.text.trim() !== ""),
            tags: tags.map(tag => ({ name: tag.label }))
        };
        addRecipe(newRecipe)
            .then(response => {
                console.log('Recipe added successfully:', response);
                navigate('/');
            })
            .catch(error => {
                console.error('Error adding recipe:', error);
            });
    }

    return (
        <div className="container">
            <h1>Add Recipe</h1>
                <Stepper onComplete={handleSubmit}>
                    <StepOne recipe={recipe} handleChange={handleChange} tags={tags} setTags={setTags} />
                    <StepTwo
                        ingredients={ingredients}
                        ingredientSections={ingredientSections}
                        setIngredients={setIngredients}
                        setIngredientSections={setIngredientSections}
                        resetKey={recipe.id ?? "new"}
                    />
                    <StepThree instructions={instructions} setInstructions={setInstructions} />
            </Stepper>
        </div>
    );
};

export default AddRecipePage;