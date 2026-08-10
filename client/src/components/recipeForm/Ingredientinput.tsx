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
import { ChangeEvent, useEffect, useState } from "react";

type IngredientInputProps = {
  ingredients: Ingredient[];
  ingredientSections: IngredientSection[];
  setIngredients: React.Dispatch<React.SetStateAction<Ingredient[]>>;
  setIngredientSections: React.Dispatch<React.SetStateAction<IngredientSection[]>>;
  resetKey: string | number;
};

type IngredientRow = {
  key: string;
  kind: "ingredient";
  ingredient: Ingredient;
};

type SectionRow = {
  key: string;
  kind: "section";
  section: IngredientSection;
};

type Row = IngredientRow | SectionRow;

const createClientId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const getIngredientId = (ingredient: Ingredient, fallbackKey: string) =>
  ingredient.id != null ? `ingredient-${ingredient.id}` : ingredient.clientId ?? `ingredient-tmp-${fallbackKey}`;

const getSectionId = (section: IngredientSection, fallbackKey: string) =>
  section.id != null ? `section-${section.id}` : section.clientId ?? `section-tmp-${fallbackKey}`;

const sortIngredients = (items: Ingredient[]) =>
  [...items].sort((a, b) => (a.sortOrder ?? a.id ?? 0) - (b.sortOrder ?? b.id ?? 0));

const sortSections = (items: IngredientSection[]) =>
  [...items].sort((a, b) => (a.sortOrder ?? a.id ?? 0) - (b.sortOrder ?? b.id ?? 0));

const normalizeSortOrder = (items: Ingredient[]) =>
  items.map((ingredient, index) => ({ ...ingredient, sortOrder: index }));

const buildRowsFromData = (ingredients: Ingredient[], ingredientSections: IngredientSection[]): Row[] => {
  const rows: Row[] = [];
  const rootIngredients = sortIngredients(ingredients.filter((ingredient) => ingredient.ingredientSectionId == null));
  const orderedSections = sortSections(ingredientSections);

  if (rootIngredients.length === 0 && orderedSections.length === 0) {
    return [
      {
        key: createClientId(),
        kind: "ingredient",
        ingredient: {
          quantity: "",
          name: "",
          sortOrder: 0,
        },
      },
    ];
  }

  rootIngredients.forEach((ingredient, index) => {
    rows.push({
      key: getIngredientId(ingredient, `root-${index}`),
      kind: "ingredient",
      ingredient,
    });
  });

  orderedSections.forEach((section, sectionIndex) => {
    const sectionWithClientId =
      section.id == null && !section.clientId
        ? { ...section, clientId: createClientId() }
        : section;

    rows.push({
      key: getSectionId(sectionWithClientId, `section-${sectionIndex}`),
      kind: "section",
      section: {
        ...sectionWithClientId,
        ingredients: sortIngredients(sectionWithClientId.ingredients).map((ingredient) =>
          ingredient.id == null && !ingredient.clientId
            ? { ...ingredient, clientId: createClientId() }
            : ingredient
        ),
      },
    });

    sortIngredients(sectionWithClientId.ingredients).forEach((ingredient, ingredientIndex) => {
      const ingredientWithClientId =
        ingredient.id == null && !ingredient.clientId
          ? { ...ingredient, clientId: createClientId() }
          : ingredient;

      rows.push({
        key: getIngredientId(ingredientWithClientId, `section-${sectionIndex}-ingredient-${ingredientIndex}`),
        kind: "ingredient",
        ingredient: ingredientWithClientId,
      });
    });
  });

  return rows;
};

const syncRowsToState = (rows: Row[]) => {
  const rootIngredients: Ingredient[] = [];
  const ingredientSections: IngredientSection[] = [];
  let currentSection: IngredientSection | null = null;

  rows.forEach((row) => {
    if (row.kind === "section") {
      if (!row.section.name.trim()) {
        currentSection = null;
        return;
      }

      currentSection = {
        ...row.section,
        sortOrder: ingredientSections.length,
        ingredients: [],
      };

      ingredientSections.push(currentSection);
      return;
    }

    const nextIngredient = {
      ...row.ingredient,
      sortOrder: currentSection ? currentSection.ingredients.length : rootIngredients.length,
      ingredientSectionId: currentSection?.id ?? null,
    };

    if (currentSection) {
      currentSection.ingredients.push(nextIngredient);
      return;
    }

    rootIngredients.push(nextIngredient);
  });

  return {
    ingredients: normalizeSortOrder(rootIngredients),
    ingredientSections,
  };
};

type SortableIngredientRowProps = {
  row: Row;
  isIndented: boolean;
  onChange: (itemId: string, field: "name" | "quantity", value: string) => void;
  onRemove: (itemId: string) => void;
};

const SortableIngredientRow = ({ row, isIndented, onChange, onRemove }: SortableIngredientRowProps) => {
  const itemId = row.key;
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: itemId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (row.kind === "section") {
    return (
      <div ref={setNodeRef} style={style} className="ingredient-section-row">
        <button type="button" className="drag-handle" aria-label="Drag section" {...attributes} {...listeners}>
          ⋮⋮
        </button>
        <input
          type="text"
          placeholder="Section title"
          value={row.section.name}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(itemId, "name", e.target.value)}
        />
        <button type="button" onClick={() => onRemove(itemId)} className="remove-btn">
          ✕
        </button>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} className={`ingredient-row${isIndented ? " ingredient-row--nested" : ""}`}>
      <button type="button" className="drag-handle" aria-label="Drag ingredient" {...attributes} {...listeners}>
        ⋮⋮
      </button>
      <input
        type="text"
        placeholder="e.g. 2 cups"
        value={row.ingredient.quantity}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(itemId, "quantity", e.target.value)}
      />
      <input
        type="text"
        placeholder="e.g. Flour"
        value={row.ingredient.name}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(itemId, "name", e.target.value)}
      />
      <button type="button" onClick={() => onRemove(itemId)} className="remove-btn">
        ✕
      </button>
    </div>
  );
};

const IngredientInput = ({
  ingredients,
  ingredientSections,
  setIngredients,
  setIngredientSections,
  resetKey,
}: IngredientInputProps) => {
  const [rows, setRows] = useState<Row[]>(() => buildRowsFromData(ingredients, ingredientSections));

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
    setRows(buildRowsFromData(ingredients, ingredientSections));
  }, [resetKey]);

  useEffect(() => {
    const nextState = syncRowsToState(rows);
    setIngredients(nextState.ingredients);
    setIngredientSections(nextState.ingredientSections);
  }, [rows, setIngredientSections, setIngredients]);

  const rowIds = rows.map((row) => row.key);

  const handleChange = (
    itemId: string,
    field: "name" | "quantity",
    value: string
  ) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.key !== itemId) {
          return row;
        }

        if (row.kind === "section") {
          return { ...row, section: { ...row.section, name: value } };
        }

        return { ...row, ingredient: { ...row.ingredient, [field]: value } };
      })
    );
  };

  const addIngredient = () => {
    setRows((prev) => [
      ...prev,
      {
        key: createClientId(),
        kind: "ingredient",
        ingredient: {
          quantity: "",
          name: "",
          sortOrder: 0,
        },
      },
    ]);
  };

  const addSection = () => {
    setRows((prev) => [
      ...prev,
      {
        key: createClientId(),
        kind: "section",
        section: {
          clientId: createClientId(),
          name: "Section",
          sortOrder: 0,
          ingredients: [],
        },
      },
    ]);
  };

  const removeIngredient = (itemId: string) => {
    setRows((prev) => prev.filter((row) => row.key !== itemId));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    setRows((prev) => {
      const oldIndex = prev.findIndex((row) => row.key === active.id);
      const newIndex = prev.findIndex((row) => row.key === over.id);

      if (oldIndex === -1 || newIndex === -1) {
        return prev;
      }

      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  let sectionActive = false;

  return (
    <div>
      <h3>Ingredients</h3>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={rowIds} strategy={verticalListSortingStrategy}>
          {rows.map((row) => {
            if (row.kind === "section") {
              sectionActive = true;
            }

            const isIndented = row.kind === "ingredient" && sectionActive;

            return (
              <SortableIngredientRow
                key={row.key}
                row={row}
                isIndented={isIndented}
                onChange={handleChange}
                onRemove={removeIngredient}
              />
            );
          })}
        </SortableContext>
      </DndContext>
      <div className="ingredient-actions">
        <button type="button" onClick={addIngredient} className="add-btn">
          + Add Ingredient
        </button>
        <button type="button" onClick={addSection} className="add-btn add-btn--secondary">
          + Add Section
        </button>
      </div>
    </div>
  );
};

export default IngredientInput;
