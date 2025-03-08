import React from 'react';
import { StepInfo } from '../types/index';
import { MachineJobVisualization } from './visualization/MachineJobVisualization';
import './StepDetail.css'; // Import the CSS file

interface StepDetailProps {
  stepKey: string;
  stepInfo: StepInfo;
}

const StepDetail: React.FC<StepDetailProps> = ({ stepKey, stepInfo }) => {
  const { type, reward, isDone, terminated, info } = stepInfo;
  const {
    jobList,
    machineList,
    agentPositionList,
    upperBound,
    minIdle,
    fullReward,
    direction
  } = info;

  // Calculate the displayed agent window based on remaining_time logic
  const displayedAgentPositions = machineList.map(machine => {
    const firstPositiveWindowIndex = machine.machine_window.findIndex(window => window.remaining_time > 0);
    return firstPositiveWindowIndex !== -1 ? firstPositiveWindowIndex + 1 : 0; // Window index is 1-based
  });

  // Format Direction information
  let formattedDirection = "N/A";
  if (direction && typeof direction === 'string') {
    if (direction.startsWith('skip-')) {
      const agentIndex = parseInt(direction.split('-')[1], 10);
      formattedDirection = `Agent ${agentIndex + 1} skipped the current window`;
    } else if (direction.endsWith('-full')) {
      const directionParts = direction.split('-');
      if (directionParts.length === 3) {
        const jobIndex = parseInt(directionParts[0], 10);
        const agentIndex = parseInt(directionParts[1], 10);

        if (jobList && jobList[jobIndex]) {
          const jobName = jobList[jobIndex].job_name;
          const jobTime = jobList[jobIndex].job_time; // Assuming job_time in jobList is the remaining time in "full" case
          formattedDirection = `Job ${jobName} assigned all remaining work (${jobTime}) into agent ${agentIndex + 1}`;
        } else {
          formattedDirection = `Direction: Job Index ${jobIndex}, Agent ${agentIndex + 1}, Full Assignment (Job info not available)`;
        }
      } else {
        formattedDirection = `Direction: ${direction} (Format not recognized as full assignment)`;
      }
    }
    else {
      const directionParts = direction.split('-').map(Number);
      if (directionParts.length === 3) {
        const jobIndex = directionParts[0];
        const agentIndex = directionParts[1];
        const time = directionParts[2];

        if (jobList && jobList[jobIndex]) {
          const jobName = jobList[jobIndex].job_name;
          formattedDirection = `Job ${jobName} assigned an amount of work with time = ${time} into agent ${agentIndex + 1}`;
        } else {
          formattedDirection = `Direction: Job Index ${jobIndex}, Agent ${agentIndex + 1}, Time ${time} (Job info not available)`;
        }
      } else {
        formattedDirection = `Direction: ${direction} (Format not recognized)`;
      }
    }
  } else if (direction) {
    formattedDirection = `Direction: ${direction} (Raw value)`;
  }


  return (
    <div className="step-detail-container">
      <div className="step-detail-header">
        <h2>Step {stepKey} Details</h2>
        <div className={`step-type ${type.toLowerCase().replace(/\s+/g, '-')}`}>
          {type}
        </div>
      </div>

      <div className="step-metrics">
        <div className="metric-card">
          <div className="metric-label">Reward</div>
          <div className="metric-value">{reward}</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Full Reward</div>
          <div className="metric-value">{fullReward}</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Min Idle</div>
          <div className="metric-value">{minIdle}</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Upper Bound</div>
          <div className="metric-value">{upperBound}</div>
        </div>
      </div>

      <div className="step-status">
        <h3>Step Status</h3> {/* Added a heading for Step Status section */}
        <div className="status-item">
          <span className="status-label">Is Done:</span>
          <span className={`status-value ${isDone ? 'status-true' : 'status-false'}`}>
            {isDone ? 'Yes' : 'No'}
          </span>
        </div>

        <div className="status-item">
          <span className="status-label">Terminated:</span>
          <span className={`status-value ${terminated ? 'status-true' : 'status-false'}`}>
            {terminated ? 'Yes' : 'No'}
          </span>
        </div>

        <div className="status-item">
          <span className="status-label">Direction:</span>
          <span className="status-value direction-value">{formattedDirection}</span>
        </div>
      </div>

      {/* Agent Position Summary */}
      <div className="agent-positions">
        <h3>Agent Positions</h3> {/* Added a heading for Agent Positions section */}
        <div className="agent-positions-list">
          {agentPositionList.map((position, index) => {
            const displayedWindow = displayedAgentPositions[index];
            return (
              <div key={index} className="agent-position-item">
                <span className="agent-label">Machine {index + 1}:</span>
                <span className="agent-position-value">Window {displayedWindow} ({position})</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Jobs and Machines Visualization */}
      <MachineJobVisualization
        machines={machineList}
        jobs={jobList}
        agentPositions={displayedAgentPositions} // Use calculated positions for visualization
      />
    </div>
  );
};

export default StepDetail;