import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import Mainpage from './Mainpage';

const useRecipesMock = vi.hoisted(() => vi.fn());

vi.mock('../../context/recipes', () => ({
    useRecipes: useRecipesMock,
}));

const recipes: Recipe[] = [
    {
        id: 1,
        title: 'Creamy Ramen',
        description: '',
        imageUrl: '',
        prepTime: 20,
        servings: 2,
        tags: [{ id: 1, name: 'Quick' }],
    },
    {
        id: 2,
        title: 'Apple Pie',
        description: '',
        imageUrl: '',
        prepTime: 60,
        servings: 8,
        tags: [{ id: 2, name: 'Dessert' }],
    },
];

describe('Mainpage', () => {
    it('filters recipes by search text and tags', async () => {
        const user = userEvent.setup();
        useRecipesMock.mockReturnValue({
            recipes,
            tags: [{ id: 1, name: 'Quick' }, { id: 2, name: 'Dessert' }],
            loading: false,
            error: null,
        });

        render(
            <BrowserRouter>
                <Mainpage />
            </BrowserRouter>,
        );

        const search = screen.getByPlaceholderText('Search recipes...');
        await user.type(search, 'ramen');
        expect(screen.getByRole('heading', { name: 'Creamy Ramen' })).toBeVisible();
        expect(screen.queryByRole('heading', { name: 'Apple Pie' })).not.toBeInTheDocument();

        await user.clear(search);
        await user.click(screen.getByRole('button', { name: 'Dessert' }));
        expect(screen.getByRole('heading', { name: 'Apple Pie' })).toBeVisible();
        expect(screen.queryByRole('heading', { name: 'Creamy Ramen' })).not.toBeInTheDocument();
    });

    it('shows loading, empty, and error states', () => {
        useRecipesMock.mockReturnValue({
            recipes: [],
            tags: [],
            loading: true,
            error: null,
        });
        const { rerender } = render(
            <BrowserRouter>
                <Mainpage />
            </BrowserRouter>,
        );
        expect(screen.getByText('Loading recipes...')).toBeVisible();

        useRecipesMock.mockReturnValue({
            recipes: [],
            tags: [],
            loading: false,
            error: null,
        });
        rerender(
            <BrowserRouter>
                <Mainpage />
            </BrowserRouter>,
        );
        expect(screen.getByText('No recipes found.')).toBeVisible();

        useRecipesMock.mockReturnValue({
            recipes,
            tags: [],
            loading: false,
            error: 'Unable to load recipes',
        });
        rerender(
            <BrowserRouter>
                <Mainpage />
            </BrowserRouter>,
        );
        expect(screen.getByText('Error loading recipes: Unable to load recipes')).toBeVisible();
    });

    it('shows all matching recipes again when a selected tag is toggled off', async () => {
        const user = userEvent.setup();
        useRecipesMock.mockReturnValue({
            recipes,
            tags: [{ id: 1, name: 'Quick' }, { id: 2, name: 'Dessert' }],
            loading: false,
            error: null,
        });

        render(
            <BrowserRouter>
                <Mainpage />
            </BrowserRouter>,
        );

        const quickTag = screen.getByRole('button', { name: 'Quick' });
        await user.click(quickTag);
        expect(screen.getByRole('heading', { name: 'Creamy Ramen' })).toBeVisible();
        expect(screen.queryByRole('heading', { name: 'Apple Pie' })).not.toBeInTheDocument();

        await user.click(quickTag);
        expect(screen.getByRole('heading', { name: 'Creamy Ramen' })).toBeVisible();
        expect(screen.getByRole('heading', { name: 'Apple Pie' })).toBeVisible();
    });
});
