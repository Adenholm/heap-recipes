import IngredientInput from "../Ingredientinput";

interface StepTwoProps {
  ingredients: Ingredient[];
  setIngredients: React.Dispatch<React.SetStateAction<Ingredient[]>>;
}

const StepTwo = ({ ingredients, setIngredients }: StepTwoProps) => {
  return (
    <form>
      <IngredientInput ingredients={ingredients} setIngredients={setIngredients} />
    </form>
  );
};
export default StepTwo;