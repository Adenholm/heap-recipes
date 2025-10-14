import recipesRaw from '../../data/recipes.json';
import './Mainpage.css';

import RecipeCard from '../../components/recipecard/RecipeCard';
import { useEffect, useState } from 'react';
import api from '../../service/apiClient';
import searchIcon from '../../assets/images/search.svg';

const Mainpage = () => {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
    const [search, setSearch] = useState<string>('');
    const [tags, setTags] = useState<Tag[]>([]);
    const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

    useEffect(() => {
        api.get('/recipes').then(response => {
            setRecipes(response.data);
            setFilteredRecipes(response.data);
        }).catch(error => {
            console.error('Error fetching recipes:', error);
        });
        api.get('/tags').then(response => {
            setTags(response.data);
        }).catch(error => {
            console.error('Error fetching tags:', error);
        });
    }, []);

    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
        setFilteredRecipes(
            recipes.filter(recipe =>
                recipe.title.toLowerCase().includes(value.toLowerCase())
            )
        );
    };

    const onTagSelect = (tag: Tag) => {
        let updatedSelectedTags: Tag[];
        if (selectedTags.includes(tag)) {
            updatedSelectedTags = selectedTags.filter(t => t.id !== tag.id);
        } else {
            updatedSelectedTags = [...selectedTags, tag];
        }
        setSelectedTags(updatedSelectedTags);  
        if (updatedSelectedTags.length === 0) {
            setFilteredRecipes(recipes.filter(recipe =>
                recipe.title.toLowerCase().includes(search.toLowerCase())
            ));
        } else {
            setFilteredRecipes(recipes.filter(recipe =>
                updatedSelectedTags.every(t => recipe.tags.some(rt => rt.id === t.id)) &&
                recipe.title.toLowerCase().includes(search.toLowerCase())
            ));
        }
    };

    return (
        <>
            <div className='search-bar'>
                <input
                    type="text"
                    placeholder="Search recipes..."
                    value={search}
                    onChange={onSearchChange}
                />
                <button>
                    <img src={searchIcon} alt="Search" className="search-icon" />
                </button>
            </div>
            <div className='tag-filters'>
                {tags.map(tag => (
                    <button
                        key={tag.id}
                        className={`tag ${selectedTags.includes(tag) ? 'selected' : ''}`}
                        onClick={() => { onTagSelect(tag); }}
                    >
                        {tag.name}
                    </button>
                ))}
            </div>
            <ul className='recipe-list'>
                {filteredRecipes.map((recipe: Recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
            </ul>
        </>
    );
};

export default Mainpage;