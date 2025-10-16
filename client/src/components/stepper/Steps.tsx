import './style.css';

type StepsProps = {
  maxSteps: number;
  currentStep?: number;
};

const Steps = ({ maxSteps, currentStep = 0 }: StepsProps) => {
  return (
    <ul className="steps">
      {[...Array(maxSteps)].map((_, i) => (
        <li className={`steps-number ${currentStep === i && 'active'}`} key={i}>
          <span className="text-white ">{i + 1}</span>
        </li>
      ))}
    </ul>
  );
};

export default Steps;
