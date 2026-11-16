import './Mainpage.css';

import RecipeCard from '../../components/recipeCard/RecipeCard';
import { useState } from 'react';
// @ts-ignore: missing type declaration for SVG import
import searchIcon from '../../assets/images/search.svg';
import { useRecipes } from '../../context/recipes';

const LoadError = ({ resource, message, retrying }: { resource: 'recipes' | 'tags'; message: string; retrying: boolean }) => (
    <div className="load-error" role="alert">
        <p className="load-error-title">Couldn't load {resource}</p>
        <p>Check your connection or try again later.{retrying && " We'll keep trying automatically."}</p>
        <p className="load-error-detail">Details: {message}</p>
    </div>
);

const Mainpage = () => {
    const { recipes, tags, loading, error, recipeLoadError, tagsError } = useRecipes();
    const [search, setSearch] = useState<string>('');
    const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

    const filteredRecipes = recipes.filter(recipe =>
        recipe.title.toLowerCase().includes(search.toLowerCase()) &&
        selectedTags.every(tag => recipe.tags.some(recipeTag => recipeTag.id === tag.id))
    );

    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
    };

    const onTagSelect = (tag: Tag) => {
        let updatedSelectedTags: Tag[];
        if (selectedTags.some(selectedTag => selectedTag.id === tag.id)) {
            updatedSelectedTags = selectedTags.filter(t => t.id !== tag.id);
        } else {
            updatedSelectedTags = [...selectedTags, tag];
        }
        setSelectedTags(updatedSelectedTags);
    };

    const MainContent = () => {
        if (error) return <LoadError resource="recipes" message={error} retrying={!!recipeLoadError} />;
        else if (loading) return <p className='no-recipes-text'>Loading recipes...</p>;
        else if (recipes.length === 0) return <p className='no-recipes-text'>No recipes found.</p>;
        else return (            
            <ul className='recipe-list'>
                {filteredRecipes.map((recipe: Recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
            </ul>
        )
    }


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
                        className={`tag ${selectedTags.some(selectedTag => selectedTag.id === tag.id) ? 'selected' : ''}`}
                        onClick={() => { onTagSelect(tag); }}
                    >
                        {tag.name}
                    </button>
                ))}
            </div>

            {tagsError && !recipeLoadError && <LoadError resource="tags" message={tagsError} retrying />}
            <MainContent />
        </>
    );
};

export default Mainpage;