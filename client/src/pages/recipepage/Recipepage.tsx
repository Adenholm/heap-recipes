import "./RecipePage.css";

import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import recipesRaw from "../../data/recipes.json";
import api from "../../service/apiClient";

const RecipePage = () => {
    const { id } = useParams<{ id: string }>();
    const [recipe, setRecipe] = useState<Recipe | null>(null);

    useEffect(() => {
        api.get(`/recipes/${id}`).then(response => {
            setRecipe(response.data);
        }).catch(error => {
            console.error('Error fetching recipe:', error);
        });
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
                            <li key={index}>{ingredient.quantity + " " + ingredient.name}</li>
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
                        <p>{recipe.tags.map(tag => tag.name).join(", ")}</p>
                    </div>

                    <p>{recipe.instructions}</p>
                </div>
            </div>
        </div>
    );
};

export default RecipePage;