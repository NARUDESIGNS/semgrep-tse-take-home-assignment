/**
 * GUIDE TO USING THIS SCRIPT
 * 
 * This script fetches code and supply chain findings from your Semgrep Account, creates a `findings.json` JSON file in the same folder where this file is saved and populates the findings results into the file.
 * 
 * First, Generate your token from the Settings > Tokens page on your Semgrep UI.  
 * NOTE: Ensure you check the **Web API** checkbox when generating the token.
 * 
 * Next, retrieve your deployment slug from your Semgrep UI: settings > deployment under Identifiers section, displayed as "Organization Slug"
 * 
 * To execute this script: 
 * - add your token, deployment slug and specified start date from which you want to generate findings. If left empty, ALL findings will be populated in the JSON file.
 * - run the following command in the terminal `node getSemgrepFindings.js`.
 * - locate the `findings.json` file in the same folder where this script file is stored.
*/

const { writeFile } = require('fs'); // the writeFile method is used in this script to create a new file.

// configuration
const CONFIG = {
    /** token */
    token: "", // "YOUR_TOKEN",
    /** deployment slug */
    deploymentSlug: "", // "YOUR_DEPLOYMENT_SLUG",
    /** findings start date */
    startDate: "", // e.g "January 1, 2024"
};

// convert date to epoch timestamp
function convertToEpochTimeStamp(dateString) {
    if (!dateString) return;
    const date = new Date(dateString).toISOString(); // convert to ISO date format
    return Math.floor(new Date(date).getTime() / 1000); // convert to epoch timestamp
}


/** 
 * Get code and supply chain findings
 * 
 * [Docs](https://semgrep.dev/api/v1/docs/#tag/Finding/operation/semgrep_app.core_exp.findings.handlers.issue.openapi_list_recent_issues)
*/
async function getFindings() {
    if (!CONFIG.token || !CONFIG.deploymentSlug) {
        console.log("Your Semgrep token and deployment slug is required to fetch code findings");
        return;
    }
    const url = `https://semgrep.dev/api/v1/deployments/${CONFIG.deploymentSlug}/findings`;
    const query = convertToEpochTimeStamp(CONFIG.startDate);
    let apiUrl = CONFIG.startDate ? `${url}?since=${query}` : url; 
    try {
        const data = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${CONFIG.token}`,
                "Content-Type": "application/json"
            }
        });
        const response = await data.json();
        console.log(response); // preview API response data (JSON);
        
        if (data.ok) { // only write file if API response data is fine and there are no errors
            // Convert JSON to formatted string
            const formattedData = JSON.stringify(response, null, 2);
    
            // Create JSON file
            writeFile("findings.json", formattedData, (err) => {
                if (err) throw err;
                console.log("Data written to findings.json file");
            });
        }
    } catch (error) {
        // proper error handling goes in here...
        console.log(error);
    } finally {
        // proper cleanups goes in here...
        console.log('Process completed');
    }
}

getFindings();
