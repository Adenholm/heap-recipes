import IngredientInput from "../Ingredientinput";

interface StepTwoProps {
  ingredients: Ingredient[];
  ingredientSections: IngredientSection[];
  setIngredients: React.Dispatch<React.SetStateAction<Ingredient[]>>;
  setIngredientSections: React.Dispatch<React.SetStateAction<IngredientSection[]>>;
  resetKey: string | number;
}

const StepTwo = ({
  ingredients,
  ingredientSections,
  setIngredients,
  setIngredientSections,
  resetKey,
}: StepTwoProps) => {
  return (
    <form>
      <IngredientInput
        ingredients={ingredients}
        ingredientSections={ingredientSections}
        setIngredients={setIngredients}
        setIngredientSections={setIngredientSections}
        resetKey={resetKey}
      />
    </form>
  );
};
export default StepTwo;