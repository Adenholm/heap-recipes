
import Steps from './steps';
import './style.css';
import { useState } from 'react';

interface StepperProps {
  children: React.ReactNode[];
  onComplete: () => void;
  stepCondition?: boolean;
  errorMessage?: string;
}

const Stepper = ({
  children,
  onComplete,
  stepCondition = true,
  errorMessage,
}: StepperProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const onBackClick = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onNextClick = () => {
    if (currentStep === children.length - 1) {
      onComplete();
      return;
    }

    setCurrentStep(currentStep + 1);
  };

  return (
    <div>
      <div className="steps-container">
        <Steps maxSteps={children.length} currentStep={currentStep} />
      </div>

      {children[currentStep]}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <div className="stepper-buttons">
        <button className="offwhite" onClick={onBackClick}>Back</button>
        <button
          disabled={!stepCondition}
          className="blue"
          onClick={onNextClick}
        >
          {currentStep === children.length - 1 ? 'Submit' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default Stepper;
