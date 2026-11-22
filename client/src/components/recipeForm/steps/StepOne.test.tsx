import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import StepOne from './StepOne';

const useRecipesMock = vi.hoisted(() => vi.fn());

vi.mock('@/context/recipes', () => ({ useRecipes: useRecipesMock }));
vi.mock('@/components/recipeForm/Taginput', () => ({ default: () => null }));
vi.mock('@/components/recipeForm/imageInput/RecipeImageInput', () => ({ default: () => null }));

const TestForm = ({ onRecipeSelect }: { onRecipeSelect?: (id: number) => void }) => {
    const [recipe, setRecipe] = useState<Recipe>({
        title: '', description: '', prepTime: 0, servings: 0, tags: [], imageUrl: '',
    });

    return (
        <StepOne
            recipe={recipe}
            handleChange={event => setRecipe(current => ({ ...current, title: event.target.value }))}
            setImageUrl={() => {}}
            tags={[]}
            setTags={() => {}}
            onRecipeSelect={onRecipeSelect}
        />
    );
};

describe('recipe title suggestions', () => {
    it('shows matching titles while typing and preserves normal title editing', async () => {
        const user = userEvent.setup();
        const onRecipeSelect = vi.fn();
        useRecipesMock.mockReturnValue({
            recipes: [
                { id: 1, title: 'Creamy Ramen' },
                { id: 2, title: 'Ramen Salad' },
                { id: 3, title: 'Apple Pie' },
            ],
            recipeLoadError: null,
        });
        render(<TestForm onRecipeSelect={onRecipeSelect} />);
        const title = screen.getByLabelText('Title:');

        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
        await user.type(title, 'RaMeN');
        expect(screen.getAllByRole('option').map(option => option.textContent)).toEqual(['Creamy Ramen', 'Ramen Salad']);
        await user.click(screen.getByRole('option', { name: 'Creamy Ramen' }));
        expect(onRecipeSelect).toHaveBeenCalledWith(1);
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
        await user.clear(title);
        await user.type(title, 'unmatched');
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('supports keyboard selection and dismissing suggestions', async () => {
        const user = userEvent.setup();
        const onRecipeSelect = vi.fn();
        useRecipesMock.mockReturnValue({
            recipes: [{ id: 4, title: 'Ramen Soup' }, { id: 5, title: 'Ramen Salad' }],
            recipeLoadError: null,
        });
        render(<TestForm onRecipeSelect={onRecipeSelect} />);
        const title = screen.getByLabelText('Title:');
        await user.type(title, 'ramen');
        await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');
        expect(onRecipeSelect).toHaveBeenCalledWith(5);
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

        await user.clear(title);
        await user.type(title, 'ramen{Escape}');
        expect(title).toHaveValue('ramen');
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
        expect(onRecipeSelect).toHaveBeenCalledTimes(1);
    });

    it('reports loading failures and leaves edit forms unchanged', () => {
        useRecipesMock.mockReturnValue({ recipes: [], recipeLoadError: 'Network error' });
        const { rerender } = render(<TestForm onRecipeSelect={vi.fn()} />);
        expect(screen.getByRole('alert')).toHaveTextContent("Couldn't load recipe suggestions");

        rerender(<TestForm />);
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        expect(screen.getByLabelText('Title:')).not.toHaveAttribute('role', 'combobox');
    });

    it('reports matching recipes without an ID instead of navigating to an invalid route', async () => {
        const user = userEvent.setup();
        const onRecipeSelect = vi.fn();
        useRecipesMock.mockReturnValue({
            recipes: [{ title: 'Ramen' }, { id: 7, title: 'Ramen Soup' }],
            recipeLoadError: null,
        });
        render(<TestForm onRecipeSelect={onRecipeSelect} />);

        await user.type(screen.getByLabelText('Title:'), 'ramen');
        expect(screen.getByRole('alert')).toHaveTextContent('missing an ID');
        await user.click(screen.getByRole('option', { name: 'Ramen Soup' }));
        expect(onRecipeSelect).toHaveBeenCalledWith(7);
    });
});
