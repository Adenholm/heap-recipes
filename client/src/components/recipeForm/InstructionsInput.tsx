import { ChangeEvent, useEffect, useState } from "react";
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
  instructionSections: InstructionSection[];
  setInstructions: React.Dispatch<React.SetStateAction<Instruction[]>>;
  setInstructionSections: React.Dispatch<React.SetStateAction<InstructionSection[]>>;
  resetKey: string | number;
};

type InstructionRow = {
  key: string;
  kind: "instruction";
  instruction: Instruction;
};

type SectionRow = {
  key: string;
  kind: "section";
  section: InstructionSection;
};

type Row = InstructionRow | SectionRow;

const createClientId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const getInstructionId = (instruction: Instruction, fallbackKey: string) =>
  instruction.id != null ? `instruction-${instruction.id}` : instruction.clientId ?? `instruction-tmp-${fallbackKey}`;

const getSectionId = (section: InstructionSection, fallbackKey: string) =>
  section.id != null ? `instruction-section-${section.id}` : section.clientId ?? `instruction-section-tmp-${fallbackKey}`;

const sortInstructions = (items: Instruction[]) =>
  [...items].sort((a, b) => (a.sortOrder ?? a.id ?? 0) - (b.sortOrder ?? b.id ?? 0));

const sortSections = (items: InstructionSection[]) =>
  [...items].sort((a, b) => (a.sortOrder ?? a.id ?? 0) - (b.sortOrder ?? b.id ?? 0));

const normalizeSortOrder = (items: Instruction[]) =>
  items.map((instruction, index) => ({ ...instruction, sortOrder: index }));

const buildRowsFromData = (instructions: Instruction[], instructionSections: InstructionSection[]): Row[] => {
  const rows: Row[] = [];
  const rootInstructions = sortInstructions(instructions.filter((instruction) => instruction.instructionSectionId == null));
  const orderedSections = sortSections(instructionSections);

  if (rootInstructions.length === 0 && orderedSections.length === 0) {
    return [
      {
        key: createClientId(),
        kind: "instruction",
        instruction: {
          text: "",
          sortOrder: 0,
        },
      },
    ];
  }

  rootInstructions.forEach((instruction, index) => {
    rows.push({
      key: getInstructionId(instruction, `root-${index}`),
      kind: "instruction",
      instruction,
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
        instructions: sortInstructions(sectionWithClientId.instructions).map((instruction) =>
          instruction.id == null && !instruction.clientId
            ? { ...instruction, clientId: createClientId() }
            : instruction
        ),
      },
    });

    sortInstructions(sectionWithClientId.instructions).forEach((instruction, instructionIndex) => {
      const instructionWithClientId =
        instruction.id == null && !instruction.clientId
          ? { ...instruction, clientId: createClientId() }
          : instruction;

      rows.push({
        key: getInstructionId(instructionWithClientId, `section-${sectionIndex}-instruction-${instructionIndex}`),
        kind: "instruction",
        instruction: instructionWithClientId,
      });
    });
  });

  return rows;
};

const syncRowsToState = (rows: Row[]) => {
  const rootInstructions: Instruction[] = [];
  const instructionSections: InstructionSection[] = [];
  let currentSection: InstructionSection | null = null;

  rows.forEach((row) => {
    if (row.kind === "section") {
      if (!row.section.name.trim()) {
        currentSection = null;
        return;
      }

      currentSection = {
        ...row.section,
        sortOrder: instructionSections.length,
        instructions: [],
      };

      instructionSections.push(currentSection);
      return;
    }

    const nextInstruction = {
      ...row.instruction,
      sortOrder: currentSection ? currentSection.instructions.length : rootInstructions.length,
      instructionSectionId: currentSection ? (currentSection.id ?? -1) : null,
    };

    if (currentSection) {
      currentSection.instructions.push(nextInstruction);
      return;
    }

    rootInstructions.push(nextInstruction);
  });

  return {
    instructions: normalizeSortOrder(rootInstructions),
    instructionSections,
  };
};

type SortableInstructionRowProps = {
  row: Row;
  isIndented: boolean;
  onChange: (itemId: string, field: "name" | "text", value: string) => void;
  onRemove: (itemId: string) => void;
};

const SortableInstructionRow = ({ row, isIndented, onChange, onRemove }: SortableInstructionRowProps) => {
  const itemId = row.key;
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: itemId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (row.kind === "section") {
    return (
      <div ref={setNodeRef} style={style} className="instruction-section-row">
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
    <div ref={setNodeRef} style={style} className={`instruction-row${isIndented ? " instruction-row--nested" : ""}`}>
      <button type="button" className="drag-handle" aria-label="Drag instruction" {...attributes} {...listeners}>
        ⋮⋮
      </button>
      <textarea
        placeholder="eg. rinse the rice then ..."
        value={row.instruction.text}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(itemId, "text", e.target.value)}
        className="instruction-textarea"
      />
      <button type="button" onClick={() => onRemove(itemId)} className="remove-btn">
        ✕
      </button>
    </div>
  );
};

const InstructionInput = ({
  instructions,
  instructionSections,
  setInstructions,
  setInstructionSections,
  resetKey,
}: InstructionInputProps) => {
  const [rows, setRows] = useState<Row[]>(() => buildRowsFromData(instructions, instructionSections));

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
    setRows(buildRowsFromData(instructions, instructionSections));
  }, [resetKey]);

  useEffect(() => {
    const nextState = syncRowsToState(rows);
    setInstructions(nextState.instructions);
    setInstructionSections(nextState.instructionSections);
  }, [rows, setInstructionSections, setInstructions]);

  const rowIds = rows.map((row) => row.key);

  const handleChange = (
    itemId: string,
    field: "name" | "text",
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

        if (field === "name") {
          return row;
        }

        return { ...row, instruction: { ...row.instruction, text: value } };
      })
    );
  };

  const addInstruction = () => {
    setRows((prev) => [
      ...prev,
      {
        key: createClientId(),
        kind: "instruction",
        instruction: {
          text: "",
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
          instructions: [],
        },
      },
    ]);
  };

  const removeInstruction = (itemId: string) => {
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
      <h3>Instructions</h3>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={rowIds} strategy={verticalListSortingStrategy}>
          {rows.map((row) => {
            if (row.kind === "section") {
              sectionActive = true;
            }

            const isIndented = row.kind === "instruction" && sectionActive;

            return (
              <SortableInstructionRow
                key={row.key}
                row={row}
                isIndented={isIndented}
                onChange={handleChange}
                onRemove={removeInstruction}
              />
            );
          })}
        </SortableContext>
      </DndContext>
      <div className="ingredient-actions">
        <button type="button" onClick={addInstruction} className="add-btn">
          + Add Step
        </button>
        <button type="button" onClick={addSection} className="add-btn add-btn--secondary">
          + Add Section
        </button>
      </div>
    </div>
  );
};

export default InstructionInput;
