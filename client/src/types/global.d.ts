

interface Recipe {
    id: number;
    title: string;
    description: string;
    imageUrl: string;
    ingredients: string[];
    instructions: string[];
    prepTime: number; // in minutes
    servings: number;
    category: string;
}

