import { useEffect, useState } from "react";
import './style.css';
import Stepper from "../../components/stepper/Stepper";
import StepOne from "../../components/recipeForm/steps/StepOne";
import StepTwo from "../../components/recipeForm/steps/StepTwo";
import StepThree from "../../components/recipeForm/steps/StepThree";
import { useNavigate, useParams } from "react-router-dom";
import { useRecipes } from "../../context/recipes";

const splitIngredientSections = (sections?: IngredientSection[]) => {
    const sortedSections = [...(sections ?? [])].sort(
        (a, b) => (a.sortOrder ?? a.id ?? 0) - (b.sortOrder ?? b.id ?? 0)
    );
    const uncategorizedSection = sortedSections.find((section) => section.isUncategorized || section.id == null) ?? null;

    return {
        ingredients: uncategorizedSection?.ingredients ?? [],
        ingredientSections: sortedSections.filter((section) => !section.isUncategorized && section.id != null),
    };
};

const splitInstructionSections = (sections?: InstructionSection[]) => {
    const sortedSections = [...(sections ?? [])].sort(
        (a, b) => (a.sortOrder ?? a.id ?? 0) - (b.sortOrder ?? b.id ?? 0)
    );
    const uncategorizedSection = sortedSections.find((section) => section.isUncategorized || section.id == null) ?? null;

    return {
        instructions: uncategorizedSection?.instructions ?? [],
        instructionSections: sortedSections.filter((section) => !section.isUncategorized && section.id != null),
    };
};

const getLegacyRootIngredients = (recipe: Recipe) =>
    recipe.ingredients?.filter((ingredient) => ingredient.ingredientSectionId == null) ?? [];

const getLegacyRootInstructions = (recipe: Recipe) =>
    recipe.instructions?.filter((instruction) => instruction.instructionSectionId == null) ?? [];

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
        { quantity: "", name: "", sortOrder: 0 },
    ]);

    const [ingredientSections, setIngredientSections] = useState<IngredientSection[]>([]);

    const [instructions, setInstructions] = useState<Instruction[]>([
        { text: "", sortOrder: 0 },
    ]);

    const [instructionSections, setInstructionSections] = useState<InstructionSection[]>([]);

    const [tags, setTags] = useState<{ value: string; label: string }[]>([]);

    useEffect(() => {
        const fetchRecipe = async () => {
            const data = await getRecipeById(Number(id));
            setRecipe(data);
            const sectionState = splitIngredientSections(data.ingredientSections);
            const legacyRootIngredients = getLegacyRootIngredients(data);
            setIngredients(
                sectionState.ingredients.length
                    ? sectionState.ingredients
                    : legacyRootIngredients.length
                        ? legacyRootIngredients
                        : [{ quantity: "", name: "", sortOrder: 0 }]
            );
            setIngredientSections(sectionState.ingredientSections);
            const instructionSectionState = splitInstructionSections(data.instructionSections);
            const legacyRootInstructions = getLegacyRootInstructions(data);
            setInstructions(
                instructionSectionState.instructions.length
                    ? instructionSectionState.instructions
                    : legacyRootInstructions.length
                        ? legacyRootInstructions
                        : [{ text: "", sortOrder: 0 }]
            );
            setInstructionSections(instructionSectionState.instructionSections);
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
                .filter((ing) => ing.name.trim() !== "" && ing.ingredientSectionId == null)
                .map((ing, index) => ({
                    id: ing.id,
                    name: ing.name,
                    quantity: ing.quantity,
                    sortOrder: ing.sortOrder ?? index
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
                            sortOrder: ingredient.sortOrder ?? ingredientIndex
                        })),
                })),
            instructions: instructions
                .filter((inst) => inst.text.trim() !== "" && inst.instructionSectionId == null)
                .map((inst, index) => ({ id: inst.id, text: inst.text, sortOrder: inst.sortOrder ?? index })),
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
        <div className="container">
            <h1>Edit Recipe</h1>
                <Stepper onComplete={handleSubmit}>
                    <StepOne recipe={recipe} handleChange={handleChange} tags={tags} setTags={setTags} />
                    <StepTwo
                        ingredients={ingredients}
                        ingredientSections={ingredientSections}
                        setIngredients={setIngredients}
                        setIngredientSections={setIngredientSections}
                        resetKey={recipe.id ?? "new"}
                    />
                    <StepThree
                        instructions={instructions}
                        instructionSections={instructionSections}
                        setInstructions={setInstructions}
                        setInstructionSections={setInstructionSections}
                        resetKey={recipe.id ?? "new"}
                    />
            </Stepper>
        </div>
    );
};

export default EditRecipePage;