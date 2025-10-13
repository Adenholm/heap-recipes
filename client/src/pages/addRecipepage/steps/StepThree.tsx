interface StepThreeProps {
  recipe: Recipe;
  handleChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const StepThree = ({ recipe, handleChange }: StepThreeProps) => {
  return (
    <form>
        <label htmlFor="instructions">Instructions:</label>
        <textarea
            id="instructions"
            name="instructions"
            value={recipe.instructions}
            onChange={handleChange}
            required
        />
    </form>
  );
};
export default StepThree;