import React, { useState } from 'react';
import './RecipeCard.css';
import { Link } from 'react-router-dom';
import ramenIcon from '../../assets/images/ramen-black.svg'; //placeholder and fallback image

interface RecipeCardProps {
    recipe: Recipe;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
    const [imgSrc, setImgSrc] = useState(recipe.imageUrl || ramenIcon);

    return (
        <Link to={"/recipe/" + recipe.id} className='recipe-card'>
            <img
                src={imgSrc}
                alt={recipe.title}
                onError={() => setImgSrc(ramenIcon)}
            />
            <h2>{recipe.title}</h2>
            <p>Cooking time: {recipe.prepTime}</p>
        </Link>
    );
};

export default RecipeCard;
