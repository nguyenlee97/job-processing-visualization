// src/utils/dataProcessing.ts

import { EnvironmentStepData, StepInfo } from "../types/index";

/**
 * Processes the JSON data in chunks to prevent UI freezing
 * @param data The raw EnvironmentStepData JSON object
 * @param chunkSize Number of entries to process in each chunk
 * @param onProgress Optional callback for progress updates
 * @returns Promise that resolves when all data is processed
 */
export async function processDataInChunks(
  data: EnvironmentStepData,
  chunkSize: number = 100,
  onProgress?: (processed: number, total: number) => void
): Promise<[string, StepInfo][]> {
  const entries = Object.entries(data);
  const totalEntries = entries.length;
  const result: [string, StepInfo][] = [];
  
  // Process entries in chunks
  for (let i = 0; i < totalEntries; i += chunkSize) {
    const chunk = entries.slice(i, i + chunkSize);
    result.push(...chunk);
    
    // Call progress callback if provided
    if (onProgress) {
      onProgress(Math.min(i + chunkSize, totalEntries), totalEntries);
    }
    
    // Yield to the browser to prevent UI freezing
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  
  return result;
}

/**
 * Analyzes the environment data to extract useful statistics
 * @param data The EnvironmentStepData object
 * @returns Object containing various statistics about the data
 */
export function analyzeEnvironmentData(data: EnvironmentStepData) {
  if (!data) return null;
  
  const stepCount = Object.keys(data).length;
  const stepTypes = new Set<string>();
  let totalReward = 0;
  let maxReward = -Infinity;
  let minReward = Infinity;
  let doneSteps = 0;
  let terminatedSteps = 0;
  
  Object.values(data).forEach(step => {
    stepTypes.add(step.type);
    totalReward += step.reward;
    maxReward = Math.max(maxReward, step.reward);
    minReward = Math.min(minReward, step.reward);
    
    if (step.isDone) doneSteps++;
    if (step.terminated) terminatedSteps++;
  });
  
  return {
    stepCount,
    uniqueStepTypes: Array.from(stepTypes),
    avgReward: totalReward / stepCount,
    maxReward,
    minReward,
    doneStepsCount: doneSteps,
    doneStepsPercentage: (doneSteps / stepCount) * 100,
    terminatedStepsCount: terminatedSteps,
    terminatedStepsPercentage: (terminatedSteps / stepCount) * 100
  };
}

/**
 * Creates a paginated subset of the environment data
 * @param data The EnvironmentStepData object
 * @param page Page number (1-based)
 * @param pageSize Number of items per page
 * @returns Object with paginated data and pagination info
 */
export function paginateEnvironmentData(
  data: EnvironmentStepData,
  page: number = 1,
  pageSize: number = 50
) {
  if (!data) return { paginatedData: {}, totalPages: 0, currentPage: 0 };
  
  const entries = Object.entries(data);
  const totalItems = entries.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  
  // Ensure page is within valid range
  const currentPage = Math.max(1, Math.min(page, totalPages));
  
  // Calculate start and end indices
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  
  // Extract the page data
  const pageEntries = entries.slice(startIndex, endIndex);
  const paginatedData = Object.fromEntries(pageEntries) as EnvironmentStepData;
  
  return {
    paginatedData,
    totalPages,
    currentPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1
  };
}