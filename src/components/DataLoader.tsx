import { useState, useEffect } from 'react';
import { EnvironmentStepData } from '../types/index';

const DataLoader = () => {
  const [data, setData] = useState<EnvironmentStepData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // Assuming the JSON file is in the public directory
        const response = await fetch('/data/environment-steps.json');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return { data, isLoading, error };
};

export default DataLoader;