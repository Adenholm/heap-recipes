import React from "react";
import api from "../service/apiClient";

const RecipesContext = React.createContext<RecipesContextType | undefined>(undefined);

export const useRecipes = (): RecipesContextType => {
  const context = React.useContext(RecipesContext);
  if (!context) {
    throw new Error("useRecipes must be used within a RecipesProvider");
  }
  return context;
};

export const RecipesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [recipes, setRecipes] = React.useState<Recipe[]>([]);
  const [tags, setTags] = React.useState<Tag[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchRecipes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/recipes');
      setRecipes(response.data);
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/tags');
      setTags(response.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchRecipes()
    fetchTags()
  }, []);


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
        error,
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
  fetchRecipes: () => Promise<void>;
  fetchTags: () => Promise<void>;
  getRecipeById: (id: number) => Promise<Recipe>;
  addRecipe: (newRecipe: Recipe) => Promise<void>;
  editRecipe: (id: number, updatedRecipe: Recipe) => Promise<void>;
  deleteRecipe: (id: number) => Promise<void>;
}