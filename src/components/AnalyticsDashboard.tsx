// src/components/AnalyticsDashboard.tsx
import React, { useMemo } from 'react';
import { useEnvironment } from '../context/EnvironmentContext';
import { analyzeEnvironmentData } from '../utils/dataProcessing';
import './AnalyticsDashboard.css';

const AnalyticsDashboard: React.FC = () => {
  const { state } = useEnvironment();
  
  const analytics = useMemo(() => {
    return analyzeEnvironmentData(state.data || {});
  }, [state.data]);
  
  if (!analytics) {
    return null;
  }
  
  // Count steps by type
  const stepTypeCounters: Record<string, number> = {};
  if (state.data) {
    Object.values(state.data).forEach(step => {
      stepTypeCounters[step.type] = (stepTypeCounters[step.type] || 0) + 1;
    });
  }
  
  return (
    <div className="analytics-dashboard">
      <h2>Environment Analytics</h2>
      
      <div className="analytics-grid">
        <div className="analytics-card">
          <div className="analytics-value">{analytics.stepCount}</div>
          <div className="analytics-label">Total Steps</div>
        </div>
        
        <div className="analytics-card">
          <div className="analytics-value">{analytics.avgReward.toFixed(2)}</div>
          <div className="analytics-label">Average Reward</div>
        </div>
        
        <div className="analytics-card">
          <div className="analytics-value">{analytics.maxReward.toFixed(2)}</div>
          <div className="analytics-label">Max Reward</div>
        </div>
        
        <div className="analytics-card">
          <div className="analytics-value">
            {analytics.doneStepsCount} ({analytics.doneStepsPercentage.toFixed(1)}%)
          </div>
          <div className="analytics-label">Steps Marked Done</div>
        </div>
        
        <div className="analytics-card">
          <div className="analytics-value">
            {analytics.terminatedStepsCount} ({analytics.terminatedStepsPercentage.toFixed(1)}%)
          </div>
          <div className="analytics-label">Terminated Steps</div>
        </div>
      </div>
      
      <div className="analytics-section">
        <h3>Step Types Distribution</h3>
        <div className="step-type-distribution">
          {Object.entries(stepTypeCounters).map(([type, count]) => {
            const percentage = (count / analytics.stepCount) * 100;
            return (
              <div key={type} className="distribution-item">
                <div className="distribution-label">{type}</div>
                <div className="distribution-bar-container">
                  <div 
                    className={`distribution-bar ${type.toLowerCase().replace(/\s+/g, '-')}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="distribution-count">
                  {count} ({percentage.toFixed(1)}%)
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;