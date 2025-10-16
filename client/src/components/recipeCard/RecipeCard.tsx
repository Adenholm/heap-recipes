import React from 'react';
import './RecipeCard.css';
import {Link } from 'react-router-dom';

interface RecipeCardProps {
    recipe: Recipe;
}

const RecipeCard: React.FC<RecipeCardProps> = ({recipe}) => {
    return (
        <Link to={"/recipe/" + recipe.id} className='recipe-card'>
            <img src={recipe.imageUrl || 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Zm9vZHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600'} alt={recipe.title} />
            <h2>{recipe.title}</h2>
            <p>Cooking time: {recipe.prepTime}</p>
        </Link>
    )
};

export default RecipeCard;