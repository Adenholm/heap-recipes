import React from "react";
import api from "@/service/apiClient";

const RecipesContext = React.createContext<RecipesContextType | undefined>(undefined);

export const useRecipes = (): RecipesContextType => {
  const context = React.useContext(RecipesContext);
  if (!context) {
    throw new Error("useRecipes must be used within a RecipesProvider");
  }
  return context;
};

const RETRY_DELAY_MS = 5000;

function useRetriedFetch<T>(path: string, setData: React.Dispatch<React.SetStateAction<T>>) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const request = React.useRef<AbortController | null>(null);
  const retryTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchData = React.useCallback(async () => {
    request.current?.abort();
    if (retryTimer.current) clearTimeout(retryTimer.current);
    const controller = new AbortController();
    request.current = controller;

    const attempt = async () => {
      setLoading(true);
      try {
        const response = await api.get<T>(path, { signal: controller.signal });
        if (controller.signal.aborted) return;
        setData(response.data);
        setError(null);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : `Unable to load ${path.slice(1)}`);
        retryTimer.current = setTimeout(attempt, RETRY_DELAY_MS);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    await attempt();
  }, [path, setData]);

  React.useEffect(() => {
    void fetchData();
    return () => {
      request.current?.abort();
      if (retryTimer.current) clearTimeout(retryTimer.current);
    };
  }, [fetchData]);

  return { fetchData, loading, error };
}

export const RecipesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [recipes, setRecipes] = React.useState<Recipe[]>([]);
  const [tags, setTags] = React.useState<Tag[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const { fetchData: fetchRecipes, loading, error: recipeError } = useRetriedFetch('/recipes', setRecipes);
  const { fetchData: fetchTags, error: tagsError } = useRetriedFetch('/tags', setTags);

  const getRecipeById = async (id: number): Promise<Recipe> => {
    const found = recipes.find(r => r.id === id);
    if (found) return found;
    try {
      const response = await api.get(`/recipes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recipe:', error);
      setError((error as Error).message);
      return Promise.reject(error);
    }
  };


  const addRecipe = async (newRecipe: Recipe): Promise<void> => {
    try {
      const response = await api.post('/recipes', newRecipe);
      console.log('Recipe added successfully:', response.data);
      setRecipes((prev) => [...prev, response.data]);
      fetchTags();
    } catch (error) {
      console.error('Error adding recipe:', error);
      setError((error as Error).message);
    }
  };

  const editRecipe = async (id: number, updatedRecipe: Recipe): Promise<void> => {
    try {
      const response = await api.put(`/recipes/${id}`, updatedRecipe);
      console.log('Recipe updated successfully:', response.data);
      setRecipes((prev) =>
        prev.map((r) => (r.id === id ? updatedRecipe : r))
      );
      fetchTags();
    } catch (error) {
      console.error('Failed to edit recipe', error);
      setError((error as Error).message);
    }
  };

  const deleteRecipe = async (id: number): Promise<void> => {
    try {
      await api.delete(`/recipes/${id}`);
      console.log('Recipe deleted successfully');
      setRecipes((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      console.error('Error deleting recipe:', error);
      setError((error as Error).message);
    }
  };

  return (
    <RecipesContext.Provider
      value={{
        recipes,
        tags,
        loading,
        error: recipeError ?? error,
        recipeLoadError: recipeError,
        tagsError,
        fetchRecipes,
        fetchTags,
        getRecipeById,
        addRecipe,
        editRecipe,
        deleteRecipe
      }}
    >
      {children}
    </RecipesContext.Provider>
  );
};

interface RecipesContextType {
  recipes: Recipe[];
  tags: Tag[];
  loading: boolean;
  error: string | null;
  recipeLoadError: string | null;
  tagsError: string | null;
  fetchRecipes: () => Promise<void>;
  fetchTags: () => Promise<void>;
  getRecipeById: (id: number) => Promise<Recipe>;
  addRecipe: (newRecipe: Recipe) => Promise<void>;
  editRecipe: (id: number, updatedRecipe: Recipe) => Promise<void>;
  deleteRecipe: (id: number) => Promise<void>;
}