import React from 'react';
import './RecipeCard.css';
import {Link } from 'react-router-dom';

interface RecipeCardProps {
    recipe: Recipe;
}

const RecipeCard: React.FC<RecipeCardProps> = ({recipe}) => {
    return (
        <Link to={"/recipe/" + recipe.id} className='recipe-card'>
            <img src={recipe.imageUrl} alt={recipe.title} />
            <h2>{recipe.title}</h2>
            <p>Cooking time: {recipe.prepTime}</p>
        </Link>
    )
};

export default RecipeCard;