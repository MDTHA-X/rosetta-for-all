const fs = require('fs');
const path = require('path');

const collections = [
  'server/postman/rosetta_collection.json',
  'server/postman/Rosetta_All_107_Tests.postman_collection.json'
];

collections.forEach(relativePath => {
  const collectionPath = path.join(__dirname, relativePath);

  try {
    if (!fs.existsSync(collectionPath)) return;
    
    const data = fs.readFileSync(collectionPath, 'utf8');
    const collection = JSON.parse(data);

    if (!collection.event) {
      collection.event = [];
    }

    // Check if prerequest already exists
    const hasPreRequest = collection.event.some(e => e.listen === 'prerequest');

    if (!hasPreRequest) {
      collection.event.push({
        listen: 'prerequest',
        script: {
          type: 'text/javascript',
          exec: [
            "// 1. Generate a unique ID for this specific test run",
            "if (!pm.collectionVariables.get('testRunId')) {",
            "    pm.collectionVariables.set('testRunId', pm.variables.replaceIn('{{$guid}}'));",
            "}",
            "",
            "// 2. Capture the exact time this specific request started",
            "pm.variables.set('reqTimestamp', new Date().toISOString());",
            "",
            "// 3. Log the outgoing request name to the Postman Console for debugging",
            "console.log(`[${pm.variables.get('testRunId')}] 🚀 Starting Request: ${pm.info.requestName} at ${pm.variables.get('reqTimestamp')}`);"
          ]
        }
      });

      fs.writeFileSync(collectionPath, JSON.stringify(collection, null, 2), 'utf8');
      console.log(`Successfully added pre-request script to ${relativePath}.`);
    } else {
      console.log(`Pre-request script already exists in ${relativePath}.`);
    }
  } catch (error) {
    console.error(`Error modifying ${relativePath}:`, error);
  }
});
