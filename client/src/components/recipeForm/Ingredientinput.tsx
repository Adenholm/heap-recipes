import { useState, ChangeEvent, FormEvent } from "react";

type IngredientInputProps = {
  ingredients: Ingredient[];
  setIngredients: React.Dispatch<React.SetStateAction<Ingredient[]>>;
};

const IngredientInput = ({ ingredients, setIngredients }: IngredientInputProps) => {

  const handleChange = (
    index: number,
    field: keyof Ingredient,
    value: string
  ) => {
    setIngredients((prev) =>
      prev.map((ingredient, i) =>
        i === index ? { ...ingredient, [field]: value } : ingredient
      )
    );
  };

  const addIngredient = () => {
    setIngredients((prev) => [...prev, { quantity: "", name: "" }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      <h3>Ingredients</h3>
      {ingredients.sort((a, b) => (a.id ?? 0) - (b.id ?? 0)).map((ingredient, index) => (
        <div key={index} className="ingredient-row">
          <input
            type="text"
            placeholder="e.g. 2 cups"
            value={ingredient.quantity}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleChange(index, "quantity", e.target.value)
            }
          />
          <input
            type="text"
            placeholder="e.g. Flour"
            value={ingredient.name}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleChange(index, "name", e.target.value)
            }
          />
          <button
            type="button"
            onClick={() => removeIngredient(index)}
            className="remove-btn"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addIngredient}
        className="add-btn"
      >
        + Add Ingredient
      </button>
    </div>
  );
};

export default IngredientInput;
