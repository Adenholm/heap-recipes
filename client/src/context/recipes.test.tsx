import { act, fireEvent, render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Mainpage from '../pages/mainpage/Mainpage';
import api from '../service/apiClient';
import { RecipesProvider } from './recipes';

vi.mock('../service/apiClient', () => ({
  default: { get: vi.fn() },
}));

const recipe: Recipe = {
  id: 1, title: 'Ramen', description: '', imageUrl: '', prepTime: 20,
  servings: 2, tags: [{ id: 1, name: 'Quick' }],
};
const otherRecipe: Recipe = { ...recipe, id: 2, title: 'Pie', tags: [] };

const renderPage = () => render(
  <BrowserRouter>
    <RecipesProvider><Mainpage /></RecipesProvider>
  </BrowserRouter>,
);

beforeEach(() => {
  vi.useFakeTimers();
  vi.mocked(api.get).mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('recipe loading and recovery', () => {
  it('shows loading until recipes finish even if tags finish first', async () => {
    let finishRecipes!: (result: { data: Recipe[] }) => void;
    vi.mocked(api.get).mockImplementation((path) => path === '/tags'
      ? Promise.resolve({ data: [] })
      : new Promise(resolve => { finishRecipes = resolve; }));

    renderPage();
    expect(screen.getByText('Loading recipes...')).toBeVisible();
    await act(async () => {});
    expect(screen.getByText('Loading recipes...')).toBeVisible();
    expect(screen.queryByText('No recipes found.')).not.toBeInTheDocument();

    await act(async () => finishRecipes({ data: [recipe] }));
    expect(screen.getByRole('heading', { name: 'Ramen' })).toBeVisible();
  });

  it('reports failures and retries both resources until the backend returns', async () => {
    let recipeAttempts = 0;
    let tagAttempts = 0;
    vi.mocked(api.get).mockImplementation((path) => {
      if (path === '/recipes') {
        recipeAttempts++;
        return recipeAttempts < 3
          ? Promise.reject(new Error('Network error'))
          : Promise.resolve({ data: [recipe, otherRecipe] });
      }
      tagAttempts++;
      return tagAttempts < 2
        ? Promise.reject(new Error('Network error'))
        : Promise.resolve({ data: [{ id: 1, name: 'Quick' }] });
    });

    renderPage();
    fireEvent.change(screen.getByPlaceholderText('Search recipes...'), { target: { value: 'ram' } });
    await act(async () => {});
    expect(screen.getByRole('alert')).toHaveTextContent("Couldn't load recipes");
    expect(screen.getByRole('alert')).toHaveTextContent("We'll keep trying automatically.");
    expect(screen.getByRole('alert')).toHaveTextContent('Details: Network error');
    expect(screen.queryByText('No recipes found.')).not.toBeInTheDocument();

    await act(async () => { await vi.advanceTimersByTimeAsync(5000); });
    expect(screen.getByRole('alert')).toHaveTextContent("Couldn't load recipes");
    expect(screen.getByRole('button', { name: 'Quick' })).toBeVisible();
    await act(async () => { await vi.advanceTimersByTimeAsync(5000); });
    expect(screen.getByRole('heading', { name: 'Ramen' })).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'Pie' })).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(recipeAttempts).toBe(3);
    expect(tagAttempts).toBe(2);
  });

  it('cancels pending retries when the provider unmounts', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('Network error'));
    const { unmount } = renderPage();
    await act(async () => {});
    expect(vi.mocked(api.get)).toHaveBeenCalledTimes(2);
    unmount();
    await act(async () => { await vi.advanceTimersByTimeAsync(10000); });
    expect(vi.mocked(api.get)).toHaveBeenCalledTimes(2);
  });

  it('shows a tag warning without hiding recipes when only tags fail', async () => {
    let tagAttempts = 0;
    vi.mocked(api.get).mockImplementation((path) => {
      if (path === '/recipes') return Promise.resolve({ data: [recipe] });
      tagAttempts++;
      return tagAttempts === 1
        ? Promise.reject(new Error('Network error'))
        : Promise.resolve({ data: [] });
    });
    renderPage();
    await act(async () => {});
    expect(screen.getByRole('heading', { name: 'Ramen' })).toBeVisible();
    expect(screen.getByRole('alert')).toHaveTextContent("Couldn't load tags");
    expect(screen.getByRole('alert')).toHaveTextContent("We'll keep trying automatically.");
    await act(async () => { await vi.advanceTimersByTimeAsync(5000); });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
