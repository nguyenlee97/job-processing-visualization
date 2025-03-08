// src/context/EnvironmentContext.tsx
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { EnvironmentStepData } from '../types/index';

// Define the state structure
interface EnvironmentState {
  data: EnvironmentStepData | null;
  currentStepKey: string | null;
  filteredStepKeys: string[];
  filterType: string | null;
  isLoading: boolean;
  error: string | null;
}

// Define the possible action types
type EnvironmentAction =
  | { type: 'SET_DATA'; payload: EnvironmentStepData }
  | { type: 'SET_CURRENT_STEP'; payload: string }
  | { type: 'SET_FILTER_TYPE'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// Initial state
const initialState: EnvironmentState = {
  data: null,
  currentStepKey: null,
  filteredStepKeys: [],
  filterType: null,
  isLoading: false,
  error: null,
};

// Create the context
const EnvironmentContext = createContext<{
  state: EnvironmentState;
  dispatch: React.Dispatch<EnvironmentAction>;
} | undefined>(undefined);

// Reducer function
function environmentReducer(state: EnvironmentState, action: EnvironmentAction): EnvironmentState {
  switch (action.type) {
    case 'SET_DATA':
      return {
        ...state,
        data: action.payload,
        filteredStepKeys: Object.keys(action.payload),
        currentStepKey: Object.keys(action.payload)[0] || null,
      };
    case 'SET_CURRENT_STEP':
      return {
        ...state,
        currentStepKey: action.payload,
      };
    case 'SET_FILTER_TYPE':
      return {
        ...state,
        filterType: action.payload,
        filteredStepKeys: action.payload
          ? Object.entries(state.data || {})
              .filter(([_, stepInfo]) => stepInfo.type === action.payload)
              .map(([key]) => key)
          : Object.keys(state.data || {}),
        // Reset current step if it's filtered out
        currentStepKey: state.currentStepKey && 
          (action.payload && state.data?.[state.currentStepKey]?.type !== action.payload)
          ? (state.filteredStepKeys[0] || null)
          : state.currentStepKey,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
}

// Context provider component
export const EnvironmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(environmentReducer, initialState);
  
  return (
    <EnvironmentContext.Provider value={{ state, dispatch }}>
      {children}
    </EnvironmentContext.Provider>
  );
};

// Custom hook for using the context
export function useEnvironment() {
  const context = useContext(EnvironmentContext);
  if (context === undefined) {
    throw new Error('useEnvironment must be used within an EnvironmentProvider');
  }
  return context;
}

// Helper functions
export function useCurrentStep() {
  const { state } = useEnvironment();
  if (!state.data || !state.currentStepKey) return null;
  return {
    key: state.currentStepKey,
    stepInfo: state.data[state.currentStepKey],
  };
}

export function useStepTypes() {
  const { state } = useEnvironment();
  if (!state.data) return [];
  
  const types = new Set<string>();
  Object.values(state.data).forEach(step => {
    types.add(step.type);
  });
  
  return Array.from(types);
}