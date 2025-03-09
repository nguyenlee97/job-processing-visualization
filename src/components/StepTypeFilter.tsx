// src/components/StepTypeFilter.tsx
import React from 'react';
import { useEnvironment, useStepTypes } from '../context/EnvironmentContext';

const StepTypeFilter: React.FC = () => {
  const { state, dispatch } = useEnvironment();
  const stepTypes = useStepTypes();

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedType = event.target.value === 'all' ? null : event.target.value;
    dispatch({ type: 'SET_FILTER_TYPE', payload: selectedType });
  };

  return (
    <div className="step-filter-container">
      <label htmlFor="step-type-filter" className="filter-label">
        Filter by Step Type:
      </label>
      <select
        id="step-type-filter"
        style={{marginLeft: "1rem"}}
        className="step-type-select"
        value={state.filterType || 'all'}
        onChange={handleFilterChange}
      >
        <option value="all">All Step Types</option>
        {stepTypes.map(type => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
      
      <div className="filter-stats">
        Showing {state.filteredStepKeys.length} of {state.data ? Object.keys(state.data).length : 0} steps
      </div>
    </div>
  );
};

export default StepTypeFilter;