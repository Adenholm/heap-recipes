import { ChangeEvent, useEffect } from "react";
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

type InstructionInputProps = {
  instructions: Instruction[];
  setInstructions: React.Dispatch<React.SetStateAction<Instruction[]>>;
};

const createClientId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const getInstructionId = (instruction: Instruction, fallbackIndex = 0) =>
  instruction.id != null ? `instruction-${instruction.id}` : instruction.clientId ?? `instruction-tmp-${fallbackIndex}`;

const sortInstructions = (items: Instruction[]) =>
  [...items].sort((a, b) => (a.sortOrder ?? a.id ?? 0) - (b.sortOrder ?? b.id ?? 0));

const normalizeSortOrder = (items: Instruction[]) =>
  items.map((instruction, index) => ({ ...instruction, sortOrder: index }));

type SortableInstructionRowProps = {
  instruction: Instruction;
  itemId: string;
  onChange: (itemId: string, value: string) => void;
  onRemove: (itemId: string) => void;
};

const SortableInstructionRow = ({ instruction, itemId, onChange, onRemove }: SortableInstructionRowProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: itemId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="instruction-row">
      <button type="button" className="drag-handle" aria-label="Drag instruction" {...attributes} {...listeners}>
        ⋮⋮
      </button>
      <textarea
        placeholder="eg. rinse the rice then ..."
        value={instruction.text}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(itemId, e.target.value)}
        className="instruction-textarea"
      />
      <button type="button" onClick={() => onRemove(itemId)} className="remove-btn">
        ✕
      </button>
    </div>
  );
};

const InstructionInput = ({ instructions, setInstructions }: InstructionInputProps) => {
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
    setInstructions((prev) => {
      let changed = false;
      const next = prev.map((instruction) => {
        if (instruction.id == null && !instruction.clientId) {
          changed = true;
          return { ...instruction, clientId: createClientId() };
        }
        return instruction;
      });

      return changed ? next : prev;
    });
  }, [setInstructions]);

  const orderedInstructions = sortInstructions(instructions);
  const instructionItemIds = orderedInstructions.map((instruction, index) => getInstructionId(instruction, index));

  const handleChange = (itemId: string, value: string) => {
    setInstructions((prev) =>
      prev.map((instruction, index) =>
        getInstructionId(instruction, index) === itemId ? { ...instruction, text: value } : instruction
      )
    );
  };

  const addInstruction = () => {
    setInstructions((prev) => [
      ...prev,
      { text: "", sortOrder: prev.length, clientId: createClientId() },
    ]);
  };

  const removeInstruction = (itemId: string) => {
    setInstructions((prev) =>
      normalizeSortOrder(
        sortInstructions(prev).filter((instruction, index) => getInstructionId(instruction, index) !== itemId)
      )
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    setInstructions((prev) => {
      const sorted = sortInstructions(prev);
      const oldIndex = sorted.findIndex((instruction, index) => getInstructionId(instruction, index) === active.id);
      const newIndex = sorted.findIndex((instruction, index) => getInstructionId(instruction, index) === over.id);

      if (oldIndex === -1 || newIndex === -1) {
        return prev;
      }

      return normalizeSortOrder(arrayMove(sorted, oldIndex, newIndex));
    });
  };

  return (
    <div>
      <h3>Instructions</h3>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={instructionItemIds} strategy={verticalListSortingStrategy}>
          {orderedInstructions.map((instruction, index) => (
            <SortableInstructionRow
              key={instructionItemIds[index]}
              instruction={instruction}
              itemId={instructionItemIds[index]}
              onChange={handleChange}
              onRemove={removeInstruction}
            />
          ))}
        </SortableContext>
      </DndContext>
      <button
        type="button"
        onClick={addInstruction}
        className="add-btn"
      >
        + Add Step
      </button>
    </div>
  );
};

export default InstructionInput;
