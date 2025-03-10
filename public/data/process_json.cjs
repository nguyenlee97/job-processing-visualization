#!/usr/bin/env node
/**
 * Script to process a large JSON object representing environment step data using streaming.
 * Also generates list_files.json in the data directory.
 *
 * Usage: node process_json.js <input_json_file> <batch_size> <output_prefix>
 *
 * Arguments:
 *   <input_json_file>: Path to the input JSON file.
 *   <batch_size>: Number of steps to include in each batch JSON file.
 *   <output_prefix>: Prefix for the output files (e.g., "output").
 */
 const fs = require('fs');
 const path = require('path');
 const { chain } = require('stream-chain');
 const { parser } = require('stream-json');
 const { streamObject } = require('stream-json/streamers/StreamObject');

 const args = process.argv.slice(2);
 if (args.length !== 3) {
     console.error('Usage: node process_json.js <input_json_file> <batch_size> <output_prefix>');
     process.exit(1);
 }

 const inputJsonFile = args[0];
 const batchSize = parseInt(args[1], 10);
 const outputPrefix = args[2];

 if (isNaN(batchSize) || batchSize <= 0) {
     console.error('Batch size must be a positive integer.');
     process.exit(1);
 }

 // Define the data directory path relative to the script's directory
 const dataDir = path.join(__dirname, 'processedData');

 // Function to clear the data directory
 function clearDataDirectory(dirPath) {
     if (fs.existsSync(dirPath)) {
         console.log(`Clearing existing data directory: ${dirPath}`);
         const files = fs.readdirSync(dirPath);
         for (const file of files) {
             const filePath = path.join(dirPath, file);
             try {
                 const stat = fs.statSync(filePath);
                 if (stat.isDirectory()) {
                     fs.rmSync(filePath, { recursive: true, force: true }); // Use force: true to remove read-only files/dirs
                     console.log(`Removed directory: ${filePath}`);
                 } else {
                     fs.unlinkSync(filePath);
                     console.log(`Removed file: ${filePath}`);
                 }
             } catch (err) {
                 console.error(`Error deleting ${filePath}: ${err.message}`);
                 // Continue to try and delete other files, but note the error.
             }
         }
         console.log(`Data directory cleared.`);
     }
 }

 // Clear the data directory before writing new files
 clearDataDirectory(dataDir);

 // Ensure the data directory exists, create it if not
 if (!fs.existsSync(dataDir)) {
     fs.mkdirSync(dataDir, { recursive: true });
     console.log(`Data directory created: ${dataDir}`);
 }

 // Initialize CSV files with headers in the data directory
 const rewardWriteStream = fs.createWriteStream(path.join(dataDir, `${outputPrefix}_reward.csv`));
 rewardWriteStream.write('step,reward\n');

 const fullRewardWriteStream = fs.createWriteStream(path.join(dataDir, `${outputPrefix}_fullReward.csv`));
 fullRewardWriteStream.write('step,fullReward\n');

//  const jobListWriteStream = fs.createWriteStream(path.join(dataDir, `${outputPrefix}_jobList.csv`));
//  jobListWriteStream.write('step,job_name,job_time\n');

//  const machineListWriteStream = fs.createWriteStream(path.join(dataDir, `${outputPrefix}_machineList.csv`));
//  machineListWriteStream.write('step,machine_name,window_index,remaining_time,job_names\n');

 let batchCount = 1;
 let currentBatch = {};
 let stepCountInBatch = 0;
 let totalStepsProcessed = 0;
 const generatedBatchFiles = []; // Array to store names of generated batch files

 // Create a pipeline for processing the JSON file
 const pipeline = chain([
     fs.createReadStream(inputJsonFile),
     parser(),
     streamObject()
 ]);

 pipeline.on('data', ({ key, value }) => {
     // key is the step number (e.g., "0", "1", "2")
     // value is the StepInfo object

     // Add to current batch
     currentBatch[key] = value;
     stepCountInBatch++;
     totalStepsProcessed++;

     // Export reward to CSV
     rewardWriteStream.write(`${key},${value.reward}\n`);

     // Export fullReward to CSV
     if (value.info && value.info.fullReward !== undefined) {
         fullRewardWriteStream.write(`${key},${value.info.fullReward}\n`);
     }

     // Export jobList to CSV
    //  if (value.info && Array.isArray(value.info.jobList)) {
    //      value.info.jobList.forEach(job => {
    //          jobListWriteStream.write(`${key},${job.job_name},${job.job_time}\n`);
    //      });
    //  }

     // Export machineList to CSV
    //  if (value.info && Array.isArray(value.info.machineList)) {
    //      value.info.machineList.forEach((machine, machineIndex) => {
    //          if (Array.isArray(machine.machine_window)) {
    //              machine.machine_window.forEach((window, windowIndex) => {
    //                  const jobNames = window.job_in_window
    //                      .map(job => job.job_name)
    //                      .join('|');

    //                  machineListWriteStream.write(
    //                      `${key},${machine.machine_name},${windowIndex},${window.remaining_time},"${jobNames}"\n`
    //                  );
    //              });
    //          }
    //      });
    //  }

     // Write batch file when batch size is reached
     if (stepCountInBatch >= batchSize) {
         const batchFileName = `${outputPrefix}_batch_${batchCount}.json`;
         const batchFilePath = path.join(dataDir, batchFileName);
         fs.writeFileSync(batchFilePath, JSON.stringify(currentBatch, null, 2));
         console.log(`Batch file ${batchFileName} created with ${stepCountInBatch} steps.`);
         generatedBatchFiles.push(batchFileName); // Add filename to the list

         // Reset for next batch
         currentBatch = {};
         stepCountInBatch = 0;
         batchCount++;
     }
 });

 pipeline.on('end', () => {
     // Write the final batch if there are remaining steps
     if (stepCountInBatch > 0) {
         const batchFileName = `${outputPrefix}_batch_${batchCount}.json`;
         const batchFilePath = path.join(dataDir, batchFileName);
         fs.writeFileSync(batchFilePath, JSON.stringify(currentBatch, null, 2));
         console.log(`Batch file ${batchFileName} created with ${stepCountInBatch} steps.`);
         generatedBatchFiles.push(batchFileName); // Add filename to the list
     }

     // Close CSV write streams
     rewardWriteStream.end();
     fullRewardWriteStream.end();
     jobListWriteStream.end();
     machineListWriteStream.end();

     // Generate list_files.json in the data directory
     const listFilesPath = path.join(dataDir, 'list_files.json');
     fs.writeFileSync(listFilesPath, JSON.stringify(generatedBatchFiles, null, 2));
     console.log(`list_files.json created in ${dataDir}`);

     console.log(`Processing completed. Total steps processed: ${totalStepsProcessed}`);
 });

 pipeline.on('error', (err) => {
     console.error('Error processing JSON stream:', err);

     // Close all write streams
     rewardWriteStream.end();
     fullRewardWriteStream.end();
     jobListWriteStream.end();
     machineListWriteStream.end();

     process.exit(1);
 });