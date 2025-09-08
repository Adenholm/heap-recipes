import "./RecipePage.css";

import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import recipesRaw from "../../data/recipes.json";

const RecipePage = () => {
    const { id } = useParams<{ id: string }>();
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const recipes: Recipe[] = recipesRaw as Recipe[];

    useEffect(() => {
        const foundRecipe = recipes.find((r) => r.id === Number(id));
        if (foundRecipe) {
            setRecipe(foundRecipe);
        }
    }, [id]);

    if (!recipe) {
        return <div>Loading...</div>;
    }

    return (
        <div className="recipe-page">

            <div className="recipe-container">
                <aside>
                    <img className="recipe-image" src={recipe.imageUrl} alt={recipe.title} >
                    </img>

                    <Link to="/" className="back-arrow">
                        <span className="material-symbols-outlined">
                        arrow_back
                        </span>
                    </Link>

                    <h3>Ingredienser</h3>
                    <ul>
                        {recipe.ingredients.map((ingredient, index) => (
                            <li key={index}>{ingredient}</li>
                        ))}
                    </ul>
                </aside>

                <div>
                    <h1>{recipe.title}</h1>
                    
                    <div className="recipe-details">
                        <p>{recipe.prepTime} min</p>
                        <p>|</p>
                        <p>{recipe.servings} portioner</p>
                        <p>|</p>
                        <p>{recipe.category}</p>
                    </div>

                    <ol className="recipe-instructions">
                        {recipe.instructions.map((step, index) => (
                            <li key={index}>{step}</li>
                        ))}
                    </ol>
                </div>
            </div>
        </div>
    );
};

export default RecipePage;