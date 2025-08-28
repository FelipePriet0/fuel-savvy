import React from 'react';
import { Check } from 'lucide-react';

interface StepperProps {
  steps: string[];
  currentStep: number;
}

export const Stepper = ({ steps, currentStep }: StepperProps) => {
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;
        
        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                  ${isCompleted 
                    ? 'bg-primary text-primary-foreground'
                    : isCurrent 
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                  }
                  transition-all duration-300
                `}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  stepNumber
                )}
              </div>
              <span 
                className={`
                  mt-2 text-xs font-medium hidden sm:block
                  ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}
                `}
              >
                {step}
              </span>
            </div>
            
            {index < steps.length - 1 && (
              <div 
                className={`
                  w-12 sm:w-16 h-0.5 mx-2 mt-2 sm:mt-0
                  ${isCompleted ? 'bg-primary' : 'bg-muted'}
                  transition-all duration-300
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};