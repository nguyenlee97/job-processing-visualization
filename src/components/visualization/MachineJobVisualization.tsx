// src/components/visualization/MachineJobVisualization.tsx
import React from 'react';
import { Job, Machine } from '../../types/index';
import './MachineJobVisualization.css';

interface MachineJobVisualizationProps {
  machines: Machine[];
  jobs: Job[];
  agentPositions: number[]; // Now agentPositions is window index (1-based)
}

export const MachineJobVisualization: React.FC<MachineJobVisualizationProps> = ({
  machines,
  jobs,
  agentPositions,
}) => {
  // Calculate max window count across all machines for grid layout
  const maxWindowCount = Math.max(...machines.map(m => m.machine_window.length));

  return (
    <div className="visualization-container">
      <h3>Machine and Job Allocation</h3>

      {/* Jobs list */}
      <div className="jobs-container">
        <h4>Available Jobs</h4>
        <div className="jobs-grid">
          {jobs.map((job, index) => (
            <div key={job.job_name} className="job-card">
              <div className="job-header">{job.job_name}</div>
              <div className="job-time">Time: {job.job_time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Machines Visualization */}
      <div className="machines-container">
        <h4>Machines and Windows</h4>
        <div className="machine-layout">
          {/* Header row with column numbers */}
          <div className="machine-row header-row">
            <div className="machine-cell header-cell">Machine</div>
            {Array.from({ length: maxWindowCount }).map((_, index) => (
              <div key={index} className="machine-cell header-cell">
                Window {index + 1}
              </div>
            ))}
          </div>

          {/* Machine rows */}
          {machines.map((machine, machineIndex) => {
            // Find the first window index with remaining_time > 0 for agent position
            let agentWindowIndex = -1;
            for (let i = 0; i < machine.machine_window.length; i++) {
              if (machine.machine_window[i].remaining_time > 0) {
                agentWindowIndex = i;
                break;
              }
            }
            const currentAgentWindow = agentPositions[machineIndex]; // This is now 1-based window index

            return (
              <div key={machine.machine_name} className="machine-row">
                <div className="machine-cell machine-name-cell">
                  {machine.machine_name}
                </div>

                {/* Windows for this machine */}
                {machine.machine_window.map((window, windowIndex) => {
                  // Use the calculated agentWindowIndex to highlight the agent position
                  const isAgentHere = (windowIndex + 1) === currentAgentWindow && currentAgentWindow !== 0; // Compare with 1-based index and ensure it's not 0 (no window)
                  const jobsInWindow = window.job_in_window;

                  return (
                    <div
                      key={windowIndex}
                      className={`machine-cell window-cell ${isAgentHere ? 'agent-position' : ''}`}
                    >
                      <div className="window-time">
                        Remaining: {window.remaining_time}
                      </div>
                      <div className="window-jobs">
                        {jobsInWindow.length > 0 ? (
                          jobsInWindow.map(job => (
                            <div key={job.job_name} className="window-job-item">
                              {job.job_name} ({job.job_time})
                            </div>
                          ))
                        ) : (
                          <div className="window-empty">Empty</div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Add empty cells if this machine has fewer windows than max */}
                {Array.from({ length: maxWindowCount - machine.machine_window.length }).map((_, i) => (
                  <div key={`empty-${i}`} className="machine-cell window-cell empty-window">
                    -
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};