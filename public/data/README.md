Take the JSON you want to view, change it name to environment-steps.json

To process the big JSON into smaller JSON, use the process_json.js

Run this command
cd public/data

node ./process_json.cjs {file-name} {number-of-step-in-each-batch} {output-prefix}

node ./process_json.cjs environment-steps.json 10000 30-2-3-1

Will generate array of step detail property for graph rendering, split the big JSON to smaller one and provide file list for the app to process

