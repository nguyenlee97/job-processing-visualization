import React, { useMemo, useRef, useState } from 'react';
import { useEnvironment } from '../context/EnvironmentContext';
import { analyzeEnvironmentData } from '../utils/dataProcessing';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, ReferenceArea
} from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './AnalyticsDashboard.css';

const AnalyticsDashboard: React.FC = () => {
  const { state } = useEnvironment();
  const dashboardRef = useRef<HTMLDivElement>(null);
  
  // State for zoom functionality
  const [rewardLeft, setRewardLeft] = useState<string | null>(null);
  const [rewardRight, setRewardRight] = useState<string | null>(null);
  const [rewardRefAreaLeft, setRewardRefAreaLeft] = useState<string>('');
  const [rewardRefAreaRight, setRewardRefAreaRight] = useState<string>('');
  const [rewardDomain, setRewardDomain] = useState<[any, any]>(['auto', 'auto']);
  
  const [fullRewardLeft, setFullRewardLeft] = useState<string | null>(null);
  const [fullRewardRight, setFullRewardRight] = useState<string | null>(null);
  const [fullRewardRefAreaLeft, setFullRewardRefAreaLeft] = useState<string>('');
  const [fullRewardRefAreaRight, setFullRewardRefAreaRight] = useState<string>('');
  const [fullRewardDomain, setFullRewardDomain] = useState<[any, any]>(['auto', 'auto']);
  
  const analytics = useMemo(() => {
    return analyzeEnvironmentData(state.data || {});
  }, [state.data]);
  
  // Generate chart data
  const rewardChartData = useMemo(() => {
    if (!state.data) return [];
    
    return Object.entries(state.data).map(([stepId, stepData]) => ({
      stepId,
      reward: stepData.reward,
      fullReward: stepData.info?.fullReward // Access fullReward from stepData.info
    })).sort((a, b) => a.stepId.localeCompare(b.stepId, undefined, { numeric: true }));
  }, [state.data]);
  
  // Export to PDF function
  const exportToPDF = async () => {
    if (!dashboardRef.current) return;
    
    try {
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2, // Higher scale for better quality
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210; // A4 width in mm
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('analytics-dashboard.pdf');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
    }
  };
  
  // Zoom functions for reward chart
  const handleRewardMouseDown = (e: any) => {
    if (!e) return;
    setRewardRefAreaLeft(e.activeLabel);
  };
  
  const handleRewardMouseMove = (e: any) => {
    if (!e) return;
    if (rewardRefAreaLeft) setRewardRefAreaRight(e.activeLabel);
  };
  
  const handleRewardMouseUp = () => {
    if (rewardRefAreaLeft && rewardRefAreaRight) {
      // Ensure left is before right
      const indexLeft = rewardChartData.findIndex(d => d.stepId === rewardRefAreaLeft);
      const indexRight = rewardChartData.findIndex(d => d.stepId === rewardRefAreaRight);
      
      if (indexLeft !== -1 && indexRight !== -1) {
        const [left, right] = indexLeft <= indexRight 
          ? [rewardRefAreaLeft, rewardRefAreaRight] 
          : [rewardRefAreaRight, rewardRefAreaLeft];
          
        setRewardLeft(left);
        setRewardRight(right);
        setRewardDomain([left, right]);
        setRewardRefAreaLeft('');
        setRewardRefAreaRight('');
      }
    }
  };
  
  const handleRewardReset = () => {
    setRewardLeft(null);
    setRewardRight(null);
    setRewardDomain(['auto', 'auto']);
    setRewardRefAreaLeft('');
    setRewardRefAreaRight('');
  };
  
  // Zoom functions for fullReward chart
  const handleFullRewardMouseDown = (e: any) => {
    if (!e) return;
    setFullRewardRefAreaLeft(e.activeLabel);
  };
  
  const handleFullRewardMouseMove = (e: any) => {
    if (!e) return;
    if (fullRewardRefAreaLeft) setFullRewardRefAreaRight(e.activeLabel);
  };
  
  const handleFullRewardMouseUp = () => {
    if (fullRewardRefAreaLeft && fullRewardRefAreaRight) {
      // Ensure left is before right
      const indexLeft = rewardChartData.findIndex(d => d.stepId === fullRewardRefAreaLeft);
      const indexRight = rewardChartData.findIndex(d => d.stepId === fullRewardRefAreaRight);
      
      if (indexLeft !== -1 && indexRight !== -1) {
        const [left, right] = indexLeft <= indexRight 
          ? [fullRewardRefAreaLeft, fullRewardRefAreaRight] 
          : [fullRewardRefAreaRight, fullRewardRefAreaLeft];
          
        setFullRewardLeft(left);
        setFullRewardRight(right);
        setFullRewardDomain([left, right]);
        setFullRewardRefAreaLeft('');
        setFullRewardRefAreaRight('');
      }
    }
  };
  
  const handleFullRewardReset = () => {
    setFullRewardLeft(null);
    setFullRewardRight(null);
    setFullRewardDomain(['auto', 'auto']);
    setFullRewardRefAreaLeft('');
    setFullRewardRefAreaRight('');
  };
  
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
    <div className="analytics-dashboard" ref={dashboardRef}>
      <div className="dashboard-header">
        <h2>Environment Analytics</h2>
        <button 
          className="export-button"
          onClick={exportToPDF}
        >
          Export to PDF
        </button>
      </div>
      
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
      
      {/* Reward Graph */}
      {/* <div className="analytics-section">
        <div className="chart-header">
          <h3>Reward Progression</h3>
          {(rewardLeft && rewardRight) && (
            <button className="zoom-reset-button" onClick={handleRewardReset}>
              Reset Zoom
            </button>
          )}
        </div>
        <div className="chart-container" style={{ height: "300px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={rewardChartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
              onMouseDown={handleRewardMouseDown}
              onMouseMove={handleRewardMouseMove}
              onMouseUp={handleRewardMouseUp}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="stepId" 
                allowDataOverflow
                domain={rewardDomain}
                label={{ value: 'Step ID', position: 'insideBottom', offset: -10 }}
                angle={-45}
                textAnchor="end"
              />
              <YAxis 
                label={{ value: 'Reward Value', angle: -90, position: 'insideLeft' }}
                allowDataOverflow
              />
              <Tooltip />
              <Legend verticalAlign="top" />
              <Line 
                type="monotone" 
                dataKey="reward" 
                stroke="#8884d8" 
                activeDot={{ r: 8 }} 
                name="Reward"
                isAnimationActive={false}
              />
              
              {rewardRefAreaLeft && rewardRefAreaRight ? (
                <ReferenceArea
                  x1={rewardRefAreaLeft}
                  x2={rewardRefAreaRight}
                  strokeOpacity={0.3}
                  fill="#8884d8"
                  fillOpacity={0.3}
                />
              ) : null}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-instructions">
          Drag to zoom: Click and drag horizontally across the chart to zoom in
        </div>
      </div> */}
      
      {/* Full Reward Graph */}
      {/* <div className="analytics-section">
        <div className="chart-header">
          <h3>Full Reward Progression</h3>
          {(fullRewardLeft && fullRewardRight) && (
            <button className="zoom-reset-button" onClick={handleFullRewardReset}>
              Reset Zoom
            </button>
          )}
        </div>
        <div className="chart-container" style={{ height: "300px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={rewardChartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
              onMouseDown={handleFullRewardMouseDown}
              onMouseMove={handleFullRewardMouseMove}
              onMouseUp={handleFullRewardMouseUp}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="stepId" 
                allowDataOverflow
                domain={fullRewardDomain}
                label={{ value: 'Step ID', position: 'insideBottom', offset: -10 }}
                angle={-45}
                textAnchor="end"
              />
              <YAxis 
                label={{ value: 'Full Reward Value', angle: -90, position: 'insideLeft' }}
                allowDataOverflow
              />
              <Tooltip />
              <Legend verticalAlign="top" />
              <Line 
                type="monotone" 
                dataKey="fullReward" 
                stroke="#82ca9d" 
                activeDot={{ r: 8 }} 
                name="Full Reward"
                isAnimationActive={false}
              />
              
              {fullRewardRefAreaLeft && fullRewardRefAreaRight ? (
                <ReferenceArea
                  x1={fullRewardRefAreaLeft}
                  x2={fullRewardRefAreaRight}
                  strokeOpacity={0.3}
                  fill="#82ca9d"
                  fillOpacity={0.3}
                />
              ) : null}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-instructions">
          Drag to zoom: Click and drag horizontally across the chart to zoom in
        </div>
      </div> */}
      
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