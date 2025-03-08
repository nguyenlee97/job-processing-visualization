// src/types/index.ts

/**
 * Interface representing the structure of the JSON object.
 * This object contains step-wise information of an environment, likely for reinforcement learning.
 */
 export interface EnvironmentStepData {
  /**
   * Key representing the step number (e.g., "0", "1", "2", "7", "57", "223").
   * Each key corresponds to a step in the environment.
   */
  [step: string]: StepInfo;
}

/**
 * Type definition for the different possible step types.
 * Currently includes "Normal step", "Skip step", "Final step", and "Terminated step because out of upper bound".
 * Add more types as needed based on your environment.
 */
export type StepType =
  | "Normal step"
  | "Skip step"
  | "Final step"
  | "Terminated step because out of upper bound";

/**
 * Interface for the information related to a single step in the environment.
 */
export interface StepInfo {
  /**
   * Type of the step. Can be "Normal step", "Skip step", "Final step", etc.
   * Reflects the nature of the step taken in the environment.
   */
  type: StepType;
  /**
   * Reward obtained at this step.
   * Represents the performance or progress at this step. Can be positive or negative.
   */
  reward: number;
  /**
   * Boolean indicating if the current step is considered 'done'.
   * It might signify completion of a sub-task or a state transition within the step.
   */
  isDone: boolean;
  /**
   * Boolean indicating if the episode is terminated at this step.
   * True if the episode has ended (e.g., due to reaching a goal, failure, or time limit), false otherwise.
   */
  terminated: boolean;
  /**
   * Detailed information about the environment state at this step.
   * Contains lists of jobs, machines, agent positions, and other relevant metrics describing the environment's state.
   */
  info: StepDetailedInfo;
}

/**
 * Interface for the detailed information object within a StepInfo.
 */
export interface StepDetailedInfo {
  /**
   * List of jobs available in the environment.
   * Each job is an object with a name and a processing time.
   */
  jobList: Job[];
  /**
   * List of machines available in the environment.
   * Each machine is an object with a name and a list of time windows representing its availability.
   */
  machineList: Machine[];
  /**
   * List of agent positions. The meaning of positions depends on the environment context.
   * In this case, it likely represents the window index the agent is currently observing for each machine.
   */
  agentPositionList: number[];
  /**
   * Upper bound value, its meaning is context-dependent.
   * Could be an upper limit on a certain metric like makespan or total processing time, defining a constraint for the problem.
   */
  upperBound: number;
  /**
   * Minimum idle time observed in the environment up to this step, its meaning is context-dependent.
   * Could represent the minimum idle time of machines or agents, potentially used as a performance metric.
   */
  minIdle: number;
  /**
   * The full reward value, its meaning is context-dependent.
   * Could be the maximum possible reward achievable in the environment or a reference reward value for normalization.
   */
  fullReward: number;
  /**
   * Direction information, likely a string representing a sequence or path taken in the environment.
   * Format "X-Y-Z" or "skip-X" suggests a path or sequence of actions/states or type of step taken.
   */
  direction: string;
}

/**
 * Interface for a Job object.
 * Represents a task to be processed by a machine.
 */
export interface Job {
  /**
   * Name of the job (e.g., "J1", "J2", ...).
   * Unique identifier for the job.
   */
  job_name: string;
  /**
   * Processing time required for this job.
   * Duration for which the job needs to be processed on a machine.
   */
  job_time: number;
}

/**
 * Interface for a Machine object.
 * Represents a machine capable of processing jobs.
 */
export interface Machine {
  /**
   * Name of the machine (e.g., "M1", "M2", ...).
   * Unique identifier for the machine.
   */
  machine_name: string;
  /**
   * List of time windows available on this machine.
   * Each window represents a time slot where the machine can process jobs, with remaining time and potentially assigned jobs.
   */
  machine_window: MachineWindow[];
}

/**
 * Interface for a MachineWindow object.
 * Represents a time window on a machine where jobs can be processed.
 */
export interface MachineWindow {
  /**
   * Remaining processing time available in this window.
   * Decreases as jobs are assigned and processed in this window.
   */
  remaining_time: number;
  /**
   * List of jobs currently assigned to this time window.
   * Jobs scheduled to be processed within this specific time window on the machine.
   */
  job_in_window: JobInWindow[];
}

/**
 * Interface for a JobInWindow object.
 * Represents a job assigned to a specific time window on a machine.
 * Note: Even though it's named JobInWindow, it essentially holds the same information as a Job.
 * It might be used to track jobs assigned to specific windows within the machine's schedule.
 */
export interface JobInWindow {
  /**
   * Name of the job assigned to this window.
   */
  job_name: string;
  /**
   * Processing time of the job assigned to this window.
   */
  job_time: number;
}