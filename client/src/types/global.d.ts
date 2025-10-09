

interface Recipe {
    id?: number;
    title: string;
    description: string;
    imageUrl: string;
    ingredients: Ingredient[];
    instructions: string;
    prepTime: number; // in minutes
    servings: number;
    tags: Tag[];
}

interface Ingredient {
    id?: number;
    name: string;
    quantity: string; // e.g., "2 cups", "1 tbsp"
}

interface Tag {
    id?: number;
    name: string;
}