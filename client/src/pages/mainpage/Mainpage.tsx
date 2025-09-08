import recipesRaw from '../../data/recipes.json';
import './Mainpage.css';

import RecipeCard from '../../components/recipecard/RecipeCard';

const Mainpage = () => {
    const recipes: Recipe[] = recipesRaw as Recipe[];

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