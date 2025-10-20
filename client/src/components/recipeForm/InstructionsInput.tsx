import { useState, ChangeEvent, FormEvent } from "react";

type InstructionInputProps = {
  instructions: Instruction[];
  setInstructions: React.Dispatch<React.SetStateAction<Instruction[]>>;
};

const InstructionInput = ({ instructions, setInstructions }: InstructionInputProps) => {

  const handleChange = (
    index: number,
    field: keyof Instruction,
    value: string
  ) => {
    setInstructions((prev) =>
      prev.map((instruction, i) =>
        i === index ? { ...instruction, [field]: value } : instruction
      )
    );
  };

  const addInstruction = () => {
    setInstructions((prev) => [...prev, { text: "" }]);
  };

  const removeInstruction = (index: number) => {
    setInstructions((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      <h3>Instructions</h3>
      {instructions.sort((a, b) => (a.id ?? 0) - (b.id ?? 0)).map((instruction, index) => (
        <div key={index} className="instruction-row">
          <textarea
            placeholder="eg. rinse the rice then ..."
            value={instruction.text}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              handleChange(index, "text", e.target.value)
            }
            className="instruction-textarea"
          />
          <button
            type="button"
            onClick={() => removeInstruction(index)}
            className="remove-btn"
          >
            ✕
          </button>
        </div>
      ))}
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
