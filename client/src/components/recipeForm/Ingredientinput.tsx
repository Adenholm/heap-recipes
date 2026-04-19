import { CSS } from "@dnd-kit/utilities";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ChangeEvent, useEffect } from "react";

type IngredientInputProps = {
  ingredients: Ingredient[];
  setIngredients: React.Dispatch<React.SetStateAction<Ingredient[]>>;
};

const createClientId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const getIngredientId = (ingredient: Ingredient, fallbackIndex = 0) =>
  ingredient.id != null
    ? `id-${ingredient.id}`
    : ingredient.clientId ?? `tmp-${fallbackIndex}`;

const sortIngredients = (items: Ingredient[]) =>
  [...items].sort((a, b) => (a.sortOrder ?? a.id ?? 0) - (b.sortOrder ?? b.id ?? 0));

const normalizeSortOrder = (items: Ingredient[]) =>
  items.map((ingredient, index) => ({ ...ingredient, sortOrder: index }));

type SortableIngredientRowProps = {
  ingredient: Ingredient;
  itemId: string;
  onChange: (itemId: string, field: keyof Ingredient, value: string) => void;
  onRemove: (itemId: string) => void;
};

const SortableIngredientRow = ({ ingredient, itemId, onChange, onRemove }: SortableIngredientRowProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: itemId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="ingredient-row">
      <button type="button" className="drag-handle" aria-label="Drag ingredient" {...attributes} {...listeners}>
        ⋮⋮
      </button>
      <input
        type="text"
        placeholder="e.g. 2 cups"
        value={ingredient.quantity}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(itemId, "quantity", e.target.value)}
      />
      <input
        type="text"
        placeholder="e.g. Flour"
        value={ingredient.name}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(itemId, "name", e.target.value)}
      />
      <button type="button" onClick={() => onRemove(itemId)} className="remove-btn">
        ✕
      </button>
    </div>
  );
};

const IngredientInput = ({ ingredients, setIngredients }: IngredientInputProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    setIngredients((prev) => {
      let changed = false;
      const withClientIds = prev.map((ingredient) => {
        if (ingredient.id == null && !ingredient.clientId) {
          changed = true;
          return { ...ingredient, clientId: createClientId() };
        }
        return ingredient;
      });

      return changed ? withClientIds : prev;
    });
  }, [setIngredients]);

  const orderedIngredients = sortIngredients(ingredients);
  const ingredientItemIds = orderedIngredients.map((ingredient, index) => getIngredientId(ingredient, index));

  const handleChange = (
    itemId: string,
    field: keyof Ingredient,
    value: string
  ) => {
    setIngredients((prev) =>
      prev.map((ingredient, i) =>
        getIngredientId(ingredient, i) === itemId ? { ...ingredient, [field]: value } : ingredient
      )
    );
  };

  const addIngredient = () => {
    setIngredients((prev) => {
      const nextSortOrder = Math.max(-1, ...prev.map((ingredient) => ingredient.sortOrder ?? 0)) + 1;
      return [
        ...prev,
        {
          quantity: "",
          name: "",
          sortOrder: nextSortOrder,
          clientId: createClientId(),
        },
      ];
    });
  };

  const removeIngredient = (itemId: string) => {
    setIngredients((prev) =>
      normalizeSortOrder(
        sortIngredients(prev).filter((ingredient, index) => getIngredientId(ingredient, index) !== itemId)
      )
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    setIngredients((prev) => {
      const sorted = sortIngredients(prev);
      const oldIndex = sorted.findIndex((ingredient, index) => getIngredientId(ingredient, index) === active.id);
      const newIndex = sorted.findIndex((ingredient, index) => getIngredientId(ingredient, index) === over.id);

      if (oldIndex === -1 || newIndex === -1) {
        return prev;
      }

      return normalizeSortOrder(arrayMove(sorted, oldIndex, newIndex));
    });
  };

  return (
    <div>
      <h3>Ingredients</h3>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={ingredientItemIds} strategy={verticalListSortingStrategy}>
          {orderedIngredients.map((ingredient, index) => (
            <SortableIngredientRow
              key={ingredientItemIds[index]}
              ingredient={ingredient}
              itemId={ingredientItemIds[index]}
              onChange={handleChange}
              onRemove={removeIngredient}
            />
          ))}
        </SortableContext>
      </DndContext>
      <button
        type="button"
        onClick={addIngredient}
        className="add-btn"
      >
        + Add Ingredient
      </button>
    </div>
  );
};

export default IngredientInput;
