import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import StepOne from './StepOne';

const useRecipesMock = vi.hoisted(() => vi.fn());

vi.mock('@/context/recipes', () => ({ useRecipes: useRecipesMock }));
vi.mock('@/components/recipeForm/Taginput', () => ({ default: () => null }));
vi.mock('@/components/recipeForm/imageInput/RecipeImageInput', () => ({ default: () => null }));

const TestForm = ({ suggestions = true }: { suggestions?: boolean }) => {
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
            onTitleSelect={suggestions ? title => setRecipe(current => ({ ...current, title })) : undefined}
        />
    );
};

describe('recipe title suggestions', () => {
    it('shows matching titles while typing and preserves normal title editing', async () => {
        const user = userEvent.setup();
        useRecipesMock.mockReturnValue({
            recipes: [
                { title: 'Creamy Ramen' },
                { title: 'Ramen Salad' },
                { title: 'Apple Pie' },
                { title: 'Creamy Ramen' },
            ],
            recipeLoadError: null,
        });
        render(<TestForm />);
        const title = screen.getByLabelText('Title:');

        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
        await user.type(title, 'RaMeN');
        expect(screen.getAllByRole('option').map(option => option.textContent)).toEqual(['Creamy Ramen', 'Ramen Salad']);
        await user.click(screen.getByRole('option', { name: 'Creamy Ramen' }));
        expect(title).toHaveValue('Creamy Ramen');
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
        await user.clear(title);
        await user.type(title, 'unmatched');
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('supports keyboard selection and dismissing suggestions', async () => {
        const user = userEvent.setup();
        useRecipesMock.mockReturnValue({
            recipes: [{ title: 'Ramen Soup' }, { title: 'Ramen Salad' }],
            recipeLoadError: null,
        });
        render(<TestForm />);
        const title = screen.getByLabelText('Title:');
        await user.type(title, 'ramen');
        await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');
        expect(title).toHaveValue('Ramen Salad');
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

        await user.clear(title);
        await user.type(title, 'ramen{Escape}');
        expect(title).toHaveValue('ramen');
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('reports loading failures and leaves edit forms unchanged', () => {
        useRecipesMock.mockReturnValue({ recipes: [], recipeLoadError: 'Network error' });
        const { rerender } = render(<TestForm />);
        expect(screen.getByRole('alert')).toHaveTextContent("Couldn't load recipe suggestions");

        rerender(<TestForm suggestions={false} />);
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        expect(screen.getByLabelText('Title:')).not.toHaveAttribute('role', 'combobox');
    });
});
