declare module '*.css';
declare module '*.svg';



interface Recipe {
    id?: number;
    title: string;
    description: string;
    imageUrl: string;
    ingredients: Ingredient[];
    ingredientSections?: IngredientSection[];
    instructions: Instruction[];
    prepTime: number; // in minutes
    servings: number;
    tags: Tag[];
}

interface Ingredient {
    id?: number;
    clientId?: string;
    name: string;
    quantity: string; // e.g., "2 cups", "1 tbsp"
    sortOrder?: number;
    ingredientSectionId?: number | null;
}

interface IngredientSection {
    id?: number;
    name: string;
    sortOrder?: number;
    ingredients: Ingredient[];
}

interface Instruction {
    id?: number;
    text: string;
}

interface Tag {
    id?: number;
    name: string;
}