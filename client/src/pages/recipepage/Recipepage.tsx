import "./RecipePage.css";

import { useParams, Link, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/auth";
import editIcon from '../../assets/images/edit-white.svg';
import deleteIcon from '../../assets/images/delete-white.svg';
import { useRecipes } from "../../context/recipes";
import { ModalContext } from "../../context/modal";
import DeleteModal from "../../components/deleteModal/Delete";
import placeHolderImage from '@/assets/images/ramen-black.svg'


const RecipePage = () => {
    const { getRecipeById } = useRecipes();
    const {isAuthenticated} = useContext(AuthContext);
    const { id } = useParams<{ id: string }>();
    const { openModal, setModal } = useContext(ModalContext);
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [portions, setPortions] = useState(recipe?.servings || 4);
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    useEffect(() => {
        const fetchRecipe = async () => {
            const existingRecipe = await getRecipeById(Number(id));
            if (existingRecipe) {
                existingRecipe.instructions.sort((a, b) => (a.sortOrder ?? a.id ?? 0) - (b.sortOrder ?? b.id ?? 0));
                setRecipe(existingRecipe);
                setPortions(existingRecipe.servings);
                return;
            }
        }
        fetchRecipe();
    }, [id]);

    if (!recipe) {
        return <div>Loading...</div>;
    }

    const onEdit = () => {
        navigate(`/edit-recipe/${id}`);
    };

    const showDeleteModal = () => {
        setModal('Delete', <DeleteModal recipeId={Number(id)} />);
        openModal();
    };

    const sortedSections = [...(recipe.ingredientSections ?? [])].sort(
        (a, b) => (a.sortOrder ?? a.id ?? 0) - (b.sortOrder ?? b.id ?? 0)
    );
    const uncategorizedSection = sortedSections.find((section) => section.isUncategorized || section.id == null) ?? null;
    const rootIngredients = (uncategorizedSection?.ingredients ?? recipe.ingredients ?? []).slice().sort(
        (a, b) => (a.sortOrder ?? a.id ?? 0) - (b.sortOrder ?? b.id ?? 0)
    );
    const orderedSections = sortedSections.filter((section) => !section.isUncategorized && section.id != null);

    const handlePortionsChange = (newPortions: number) => {
        setRecipe(prevRecipe => {
            if (!prevRecipe) return null;
            const updatedIngredientSections = (prevRecipe.ingredientSections ?? []).map((section) => ({
                ...section,
                ingredients: section.ingredients.map((ingredient) => ({
                    ...ingredient,
                    quantity: scaleQuantity(ingredient.quantity, newPortions / portions),
                })),
            }));
            setPortions(newPortions);
            return { ...prevRecipe, ingredientSections: updatedIngredientSections };
        });
    };

    const incrementPortions = () => {
        handlePortionsChange(portions + 2);
    };

    const decrementPortions = () => {
        if (portions > 2) {
            handlePortionsChange(portions - 2);
        }
    };

    const Header = () => (
        <div>
            <div className="recipe-header">
                <h1>{recipe.title}</h1>
            </div>
            
            <div className="recipe-details">
                <p>{recipe.prepTime} min</p>
                <p>|</p>
                <p>{recipe.servings} portioner</p>
                <p>|</p>
                <p>{recipe.tags.map(tag => tag.name).join(", ")}</p>
            </div>
            <p className="recipe-description">{recipe.description}</p>
        </div>
    );
    
    return (
        <div className="recipe-page">

            <div className="recipe-container">
                {isAuthenticated && <img src={editIcon} alt="Edit Recipe" className='edit-buttons' onClick={onEdit}/>}
                {isAuthenticated && <img src={deleteIcon} alt="Delete Recipe" className='edit-buttons delete-button' onClick={showDeleteModal}/>}
                {isMobile && <Header />}
                <aside>
                    <img className="recipe-image" src={recipe.imageUrl || placeHolderImage} alt={recipe.title} >
                    </img>

                    <Link to="/" className="back-arrow">
                        <span className="material-symbols-outlined">
                        arrow_back
                        </span>
                    </Link>

                    <div className="ingredients-header">
                        <h3>Ingredienser</h3>
                        <div className="portion-controls">
                            <button onClick={decrementPortions}>-</button>
                            <span>{portions}</span>
                            <button onClick={incrementPortions}>+</button>
                        </div>
                    </div>
                    <ul>
                        {rootIngredients.map((ingredient, index) => (
                            <li key={`root-${ingredient.id ?? index}`}><strong>{ingredient.quantity}</strong> <p>{ingredient.name}</p></li>
                        ))}
                    </ul>
                    {orderedSections.map((section) => (
                        <div key={`section-${section.id}`} className="recipe-ingredient-section">
                            <h4>{section.name}</h4>
                            <ul>
                                {section.ingredients
                                    .slice()
                                    .sort((a, b) => (a.sortOrder ?? a.id ?? 0) - (b.sortOrder ?? b.id ?? 0))
                                    .map((ingredient, index) => (
                                        <li key={`section-${section.id}-${ingredient.id ?? index}`}>
                                            <strong>{ingredient.quantity}</strong> <p>{ingredient.name}</p>
                                        </li>
                                    ))}
                            </ul>
                        </div>
                    ))}
                </aside>
                <div>
                    {!isMobile && <Header />}
                    <h3>Instruktioner</h3>
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


function parseQuantity(str: string): number | null {
  // Match "1 1/2", "1/2", "2.5", "1", etc.
  const match = str.match(/(\d+\s\d+\/\d+|\d+\/\d+|\d+(\.\d+)?)/);
  if (!match) return null;

  const value = match[0];

  // Handle mixed numbers like "1 1/2"
  if (value.includes(" ")) {
    const [whole, fraction] = value.split(" ");
    const [num, denom] = fraction.split("/").map(Number);
    return Number(whole) + num / denom;
  }

  // Handle fractions like "1/2"
  if (value.includes("/")) {
    const [num, denom] = value.split("/").map(Number);
    return num / denom;
  }

  // Handle decimals and integers
  return parseFloat(value);
}

function scaleQuantity(str: string, factor: number): string {
  const num = parseQuantity(str);
  if (num === null) return str; // no numeric part, return unchanged

  // Extract the unit (everything after the number)
  const unit = str.replace(/(\d+\s\d+\/\d+|\d+\/\d+|\d+(\.\d+)?)/, "").trim();

  const scaled = num * factor;

  // Round to a reasonable precision
  const rounded = Math.round((scaled + Number.EPSILON) * 10) / 10;

  return `${rounded} ${unit}`.trim();
}