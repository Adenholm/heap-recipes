import recipesRaw from '../../data/recipes.json';
import './Mainpage.css';

import RecipeCard from '../../components/recipecard/RecipeCard';
import { useEffect, useState } from 'react';
import api from '../../service/apiClient';

const Mainpage = () => {
    const [recipes, setRecipes] = useState<Recipe[]>([]);

    useEffect(() => {
        // Simulate fetching data from an API
        api.get('/recipes').then(response => {
            setRecipes(response.data);
        }).catch(error => {
            console.error('Error fetching recipes:', error);
        });
    }, []);

    return (
        <>
            <ul className='recipe-list'>
                {recipes.map((recipe: Recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
            </ul>
        </>
    );
};

export default Mainpage;