import { useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import { StepInfo } from '../types/index';

type StepListProps = {
  steps: [string, StepInfo][];
  onSelectStep: (stepKey: string) => void;
};

const StepList = ({ steps, onSelectStep }: StepListProps) => {
  return (
    <List
      height={400}
      width={300}
      itemCount={steps.length}
      itemSize={50}
    >
      {({ index, style }) => {
        const [stepKey, stepInfo] = steps[index];
        return (
          <div 
            style={style} 
            className="step-item"
            onClick={() => onSelectStep(stepKey)}
          >
            Step {stepKey} - {stepInfo.type}
          </div>
        );
      }}
    </List>
  );
};