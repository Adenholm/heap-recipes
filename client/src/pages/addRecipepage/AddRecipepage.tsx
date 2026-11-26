import { useState } from "react";
import '@/pages/addRecipepage/style.css';
import Stepper from "@/components/stepper/Stepper";
import StepOne from "@/components/recipeForm/steps/StepOne";
import StepTwo from "@/components/recipeForm/steps/StepTwo";
import StepThree from "@/components/recipeForm/steps/StepThree";
import { useNavigate } from "react-router-dom";
import { useRecipes } from "@/context/recipes";
import RecipeImageImport, { type ExtractedRecipe } from "@/components/recipeForm/RecipeImageImport";

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
        { text: "", sortOrder: 0 },
    ]);

    const [instructionSections, setInstructionSections] = useState<InstructionSection[]>([]);

    const [tags, setTags] = useState<{ value: string; label: string }[]>([]);
    const [importVersion, setImportVersion] = useState(0);

    const applyExtractedRecipe = (extracted: ExtractedRecipe) => {
        setRecipe((current) => ({
            ...current,
            title: extracted.title,
            description: extracted.description,
            prepTime: extracted.prepTime ?? 0,
            servings: extracted.servings ?? 0,
        }));
        setIngredients(extracted.ingredients.map((ingredient, sortOrder) => ({ ...ingredient, sortOrder })));
        setIngredientSections([]);
        setInstructions(extracted.instructions.map((text, sortOrder) => ({ text, sortOrder })));
        setInstructionSections([]);
        setImportVersion((version) => version + 1);
    };

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
            instructions: instructions
                .filter((inst) => inst.text.trim() !== "" && inst.instructionSectionId == null)
                .map((inst, index) => ({
                    id: inst.id,
                    text: inst.text,
                    sortOrder: inst.sortOrder ?? index,
                })),
            instructionSections: instructionSections
                .filter((section) => section.name.trim() !== "")
                .map((section, index) => ({
                    id: section.id,
                    name: section.name,
                    sortOrder: section.sortOrder ?? index,
                    instructions: section.instructions
                        .filter((instruction) => instruction.text.trim() !== "")
                        .map((instruction, instructionIndex) => ({
                            id: instruction.id,
                            text: instruction.text,
                            sortOrder: instruction.sortOrder ?? instructionIndex,
                        })),
                })),
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
                <RecipeImageImport onApply={applyExtractedRecipe} />
                <Stepper onComplete={handleSubmit}>
                    <StepOne
                        recipe={recipe}
                        handleChange={handleChange}
                        setImageUrl={(imageUrl) => setRecipe((current) => ({ ...current, imageUrl }))}
                        tags={tags}
                        setTags={setTags}
                    />
                    <StepTwo
                        ingredients={ingredients}
                        ingredientSections={ingredientSections}
                        setIngredients={setIngredients}
                        setIngredientSections={setIngredientSections}
                        resetKey={importVersion}
                    />
                    <StepThree
                        instructions={instructions}
                        instructionSections={instructionSections}
                        setInstructions={setInstructions}
                        setInstructionSections={setInstructionSections}
                        resetKey={importVersion}
                    />
            </Stepper>
        </div>
    );
};

export default AddRecipePage;