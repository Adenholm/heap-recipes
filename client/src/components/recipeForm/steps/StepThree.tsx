import InstructionInput from "../InstructionsInput";

interface StepThreeProps {
  instructions: Instruction[];
  setInstructions: React.Dispatch<React.SetStateAction<Instruction[]>>;
}

const StepThree = ({ instructions, setInstructions }: StepThreeProps) => {
  return (
    <form>
        <InstructionInput instructions={instructions} setInstructions={setInstructions} />
    </form>
  );
};
export default StepThree;