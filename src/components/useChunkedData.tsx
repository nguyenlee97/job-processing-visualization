import { useState, useEffect } from 'react';
import { EnvironmentStepData } from '../types/index';

const useChunkedData = (data: EnvironmentStepData | null) => {
  const [processedSteps, setProcessedSteps] = useState<[string, any][]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!data) return;

    const processData = async () => {
      setIsProcessing(true);
      
      // Convert object entries to array
      const entries = Object.entries(data);
      const result: [string, any][] = [];
      
      // Process in chunks to prevent UI blocking
      const chunkSize = 100;
      
      for (let i = 0; i < entries.length; i += chunkSize) {
        const chunk = entries.slice(i, i + chunkSize);
        result.push(...chunk);
        
        // Allow UI to update between chunks
        await new Promise(resolve => setTimeout(resolve, 0));
      }
      
      setProcessedSteps(result);
      setIsProcessing(false);
    };
    
    processData();
  }, [data]);
  
  return { processedSteps, isProcessing };
};