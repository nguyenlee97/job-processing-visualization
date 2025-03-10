import React, { useEffect, useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import { EnvironmentProvider, useEnvironment, useCurrentStep } from './context/EnvironmentContext';
import StepDetail from './components/StepDetail';
import StepTypeFilter from './components/StepTypeFilter';
import StepNavigator from './components/StepNavigator';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import { processDataInChunks } from './utils/dataProcessing';
import './App.css';

// Main content component that uses the context
const MainContent: React.FC = () => {
  const { state, dispatch } = useEnvironment();
  const currentStep = useCurrentStep();
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [availableFiles, setAvailableFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  useEffect(() => {
    const fetchFileList = async () => {
      try {
        const response = await fetch('/data/processedData/list_files.json'); // Assuming a backend endpoint or a static json listing files
        if (response.ok) {
          const fileList = await response.json();
          if (Array.isArray(fileList)) {
            const jsonFiles = fileList.filter(file => file.toLowerCase().endsWith('.json'));
            setAvailableFiles(jsonFiles);
            if (jsonFiles.length > 0) {
              setSelectedFile(jsonFiles[0]); // Select the first JSON file by default
            }
          } else {
            console.error("File list is not an array:", fileList);
            setAvailableFiles([]);
          }
        } else if (response.status === 404) {
          // If list_files.json is not found, assume files are directly in /data and try to load 'environment-steps.json' as fallback
          console.warn("File list endpoint not found, falling back to default and assuming files are in /data/");
          setAvailableFiles(['environment-steps.json']); // Fallback to default if no file list
          setSelectedFile('environment-steps.json');
        }
         else {
          console.error('Failed to fetch file list:', response.status, response.statusText);
          setAvailableFiles([]);
        }
      } catch (error) {
        console.error('Error fetching file list:', error);
        setAvailableFiles([]);
      }
    };

    fetchFileList();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (!selectedFile) return; // Don't load data if no file selected

      try {
        setIsLoading(true);
        setLoadingProgress(0); // Reset loading progress on new file load
        const response = await fetch(`/data/processedData/${selectedFile}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch data from ${selectedFile}`);
        }

        const jsonData = await response.json();

        // Process the data in chunks to avoid freezing the UI
        await processDataInChunks(
          jsonData,
          100,
          (processed, total) => {
            setLoadingProgress(Math.floor((processed / total) * 100));
          }
        );

        dispatch({ type: 'SET_DATA', payload: jsonData });
      } catch (err) {
        dispatch({
          type: 'SET_ERROR',
          payload: err instanceof Error ? err.message : `An unknown error occurred loading ${selectedFile}`
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [dispatch, selectedFile]); // Depend on selectedFile to reload data when file changes

  const handleSelectStep = (stepKey: string) => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: stepKey });
  };

  const toggleAnalytics = () => {
    setShowAnalytics(prev => !prev);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFile(event.target.value);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">
          Loading environment data... {loadingProgress}%
        </div>
        <div className="loading-progress-bar">
          <div
            className="loading-progress-fill"
            style={{ width: `${loadingProgress}%` }}
          ></div>
        </div>
      </div>
    );
  }

  if (state.error) {
    return <div className="error-container">Error: {state.error}</div>;
  }

  if (!state.data) {
    return (
      <div className="no-data-container">
        <h2>No data loaded.</h2>
        {availableFiles.length > 0 ? (
          <p>Please select a JSON data file from the dropdown to load environment steps.</p>
        ) : (
          <p>No JSON data files found in the data directory or listing is not configured.</p>
        )}
      </div>
    );
  }

  return (
    <div className="app-content">
      <header className="app-header">
        <h1>Environment Step Visualizer</h1>
        <div className="header-actions">
          <div>
            <select
              value={selectedFile || ''}
              onChange={handleFileChange}
              className="file-selector"
            >
              {availableFiles.map((file) => (
                <option key={file} value={file}>{file}</option>
              ))}
            </select>
          </div>
          <button
            className={`analytics-toggle-button ${showAnalytics ? 'active' : ''}`}
            onClick={toggleAnalytics}
          >
            {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
          </button>
        </div>
      </header>

      {showAnalytics && <AnalyticsDashboard />}

      <StepTypeFilter />
      <StepNavigator />

      <div className="main-layout">
        <aside className="step-list-sidebar">
          <h2>Steps</h2>
          {state.filteredStepKeys.length > 0 ? (
            <List
              height={600}
              width={250}
              itemCount={state.filteredStepKeys.length}
              itemSize={50}
              className="step-list"
            >
              {({ index, style }) => {
                const stepKey = state.filteredStepKeys[index];
                const stepInfo = state.data![stepKey];
                const isSelected = stepKey === state.currentStepKey;

                return (
                  <div
                    style={style}
                    className={`step-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectStep(stepKey)}
                  >
                    <div className="step-number">Step {stepKey}</div>
                    <div className={`step-badge ${stepInfo.type.toLowerCase().replace(/\s+/g, '-')}`}>
                      {stepInfo.type}
                    </div>
                  </div>
                );
              }}
            </List>
          ) : (
            <div className="no-steps-message">
              No steps match the current filter.
            </div>
          )}
        </aside>

        <main className="step-detail-panel">
          {currentStep ? (
            <StepDetail
              stepKey={currentStep.key}
              stepInfo={currentStep.stepInfo}
            />
          ) : (
            <div className="no-step-selected">
              <p>Select a step to view details</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// Wrap the app with the provider
const App: React.FC = () => {
  return (
    <EnvironmentProvider>
      <MainContent />
    </EnvironmentProvider>
  );
};

export default App;