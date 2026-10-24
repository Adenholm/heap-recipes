import InstructionInput from "../InstructionsInput";

interface StepThreeProps {
  instructions: Instruction[];
  instructionSections: InstructionSection[];
  setInstructions: React.Dispatch<React.SetStateAction<Instruction[]>>;
  setInstructionSections: React.Dispatch<React.SetStateAction<InstructionSection[]>>;
  resetKey: string | number;
}

const StepThree = ({
  instructions,
  instructionSections,
  setInstructions,
  setInstructionSections,
  resetKey,
}: StepThreeProps) => {
  return (
    <form>
        <InstructionInput
          instructions={instructions}
          instructionSections={instructionSections}
          setInstructions={setInstructions}
          setInstructionSections={setInstructionSections}
          resetKey={resetKey}
        />
    </form>
  );
};
export default StepThree;