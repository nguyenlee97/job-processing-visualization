import React, { useState, useRef, useEffect } from 'react';
import { useEnvironment } from '../context/EnvironmentContext';
import './StepNavigator.css';

const StepNavigator: React.FC = () => {
  const { state, dispatch } = useEnvironment();
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<number | null>(null);

  if (!state.data || !state.currentStepKey || state.filteredStepKeys.length === 0) {
    return null;
  }

  const currentIndex = state.filteredStepKeys.indexOf(state.currentStepKey);
  const isFirstStep = currentIndex === 0;
  const isLastStep = currentIndex === state.filteredStepKeys.length - 1;

  const handleFirst = () => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: state.filteredStepKeys[0] });
    setIsPlaying(false);
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: state.filteredStepKeys[currentIndex - 1] });
      setIsPlaying(false);
    }
  };

  const handleNext = () => {
    if (!isLastStep) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: state.filteredStepKeys[currentIndex + 1] });
    }
  };

  const handleLast = () => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: state.filteredStepKeys[state.filteredStepKeys.length - 1] });
    setIsPlaying(false);
  };

  const handlePlay = () => {
    if (!isPlaying && !isLastStep) {
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        const idx = state.filteredStepKeys.indexOf(state.currentStepKey);
        if (idx < state.filteredStepKeys.length - 1) {
          dispatch({ type: 'SET_CURRENT_STEP', payload: state.filteredStepKeys[idx + 1] });
        } else {
          setIsPlaying(false);
        }
      }, 100);
    }
    return () => clearInterval(intervalRef.current || 0);
  }, [isPlaying, state.currentStepKey, state.filteredStepKeys, dispatch]);

  return (
    <div className="step-navigator">
      <button className="nav-button" onClick={handleFirst} disabled={isFirstStep} title="First Step">⏮️</button>
      <button className="nav-button" onClick={handlePrevious} disabled={isFirstStep} title="Previous Step">◀️</button>
      <div className="step-indicator">Step {currentIndex + 1} of {state.filteredStepKeys.length}</div>
      <button className="nav-button" onClick={handleNext} disabled={isLastStep || isPlaying} title="Next Step">▶️</button>
      <button className="nav-button" onClick={handleLast} disabled={isLastStep} title="Last Step">⏭️</button>
      <button
        className="nav-button play-pause-button"
        onClick={isPlaying ? handlePause : handlePlay}
        disabled={isLastStep && !isPlaying}
        title={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? 'Pause' : 'Play'}
      </button>
    </div>
  );
};

export default StepNavigator;