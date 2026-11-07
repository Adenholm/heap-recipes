import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import RecipeCard from './RecipeCard';

const recipe: Recipe = {
    id: 42,
    title: 'Creamy Ramen',
    description: 'A quick ramen recipe',
    imageUrl: '/ramen.jpg',
    prepTime: 20,
    servings: 2,
    tags: [],
};

describe('RecipeCard', () => {
    it('renders recipe details and links to the recipe page', () => {
        render(
            <BrowserRouter>
                <RecipeCard recipe={recipe} />
            </BrowserRouter>,
        );

        expect(screen.getByRole('link')).toHaveAttribute('href', '/recipe/42');
        expect(screen.getByRole('heading', { name: 'Creamy Ramen' })).toBeVisible();
        expect(screen.getByText('Cooking time: 20')).toBeVisible();
        expect(screen.getByRole('img', { name: 'Creamy Ramen' })).toHaveAttribute(
            'src',
            '/ramen.jpg',
        );
    });
});
