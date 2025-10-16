import "./RecipePage.css";

import { useParams, Link, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import api from "../../service/apiClient";
import { AuthContext } from "../../context/auth";
import editIcon from '../../assets/images/edit-white.svg';
import deleteIcon from '../../assets/images/delete-white.svg';

const RecipePage = () => {
    const {isAuthenticated} = useContext(AuthContext);
    const { id } = useParams<{ id: string }>();
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const navigate = useNavigate();

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

    const onDelete = () => {
        api.delete(`/recipes/${id}`).then(response => {
            console.log('Recipe deleted successfully');
            navigate('/');
        }).catch(error => {
            console.error('Error deleting recipe:', error);
        });
    };

    const onEdit = () => {
        navigate(`/edit-recipe/${id}`);
    };

    return (
        <div className="recipe-page">

            <div className="recipe-container">
                <aside>
                    <img className="recipe-image" src={recipe.imageUrl || 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Zm9vZHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600'} alt={recipe.title} >
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
                    <div className="recipe-header">
                        <h1>{recipe.title}</h1>
                        {isAuthenticated && <img src={editIcon} alt="Edit Recipe" className='icon' onClick={onEdit}/>}
                        {isAuthenticated && <img src={deleteIcon} alt="Delete Recipe" className='icon delete-button' onClick={onDelete}/>}

                    </div>
                    
                    <div className="recipe-details">
                        <p>{recipe.prepTime} min</p>
                        <p>|</p>
                        <p>{recipe.servings} portioner</p>
                        <p>|</p>
                        <p>{recipe.tags.map(tag => tag.name).join(", ")}</p>
                    </div>

                    <ol>
                        {recipe.instructions.map((instruction, index) => (
                            <li key={index}>{instruction.text}</li>
                        ))}
                    </ol>
                </div>
            </div>
        </div>
    );
};

export default RecipePage;