import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import AddRecipePage from './AddRecipepage';
import EditRecipePage from '@/pages/editRecipepage/EditRecipePage';

const useRecipesMock = vi.hoisted(() => vi.fn());

vi.mock('@/context/recipes', () => ({ useRecipes: useRecipesMock }));
vi.mock('@/components/recipeForm/Taginput', () => ({ default: () => null }));
vi.mock('@/components/recipeForm/imageInput/RecipeImageInput', () => ({ default: () => null }));

const recipes: Recipe[] = [
    { id: 11, title: 'Ramen', description: 'First recipe', prepTime: 10, servings: 1, tags: [], imageUrl: '' },
    { id: 12, title: 'Ramen', description: 'Second recipe', prepTime: 20, servings: 2, tags: [], imageUrl: '' },
];

describe('AddRecipePage suggestions', () => {
    it.each(['click', 'keyboard'] as const)('opens the selected recipe for editing with %s', async method => {
        const user = userEvent.setup();
        const getRecipeById = vi.fn(async (id: number) => {
            const recipe = recipes.find(item => item.id === id);
            if (!recipe) throw new Error(`Unknown recipe ${id}`);
            return recipe;
        });
        useRecipesMock.mockReturnValue({ recipes, recipeLoadError: null, getRecipeById });

        render(
            <MemoryRouter initialEntries={['/add-recipe']}>
                <Routes>
                    <Route path="/add-recipe" element={<AddRecipePage />} />
                    <Route path="/edit-recipe/:id" element={<EditRecipePage />} />
                </Routes>
            </MemoryRouter>,
        );

        await user.type(screen.getByLabelText('Title:'), 'ramen');
        expect(screen.getByRole('option', { name: 'Ramen (ID 11)' })).toBeVisible();
        if (method === 'click') {
            await user.click(screen.getByRole('option', { name: 'Ramen (ID 12)' }));
        } else {
            await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');
        }

        expect(await screen.findByRole('heading', { name: 'Edit Recipe' })).toBeVisible();
        expect(getRecipeById).toHaveBeenCalledWith(12);
        expect(screen.getByLabelText('Description:')).toHaveValue('Second recipe');
    });
});
