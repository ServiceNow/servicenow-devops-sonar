const core = require('@actions/core');
const axios = require('axios');

function circularSafeStringify(obj) {
    const seen = new WeakSet();
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
      }
      return value;
    });
}

(async function main() {
    const instanceUrl = core.getInput('instance-url', { required: true });
    const toolId = core.getInput('tool-id', { required: true });
    const username = core.getInput('devops-integration-user-name', { required: true });
    const password = core.getInput('devops-integration-user-password', { required: true });
    const jobname = core.getInput('job-name', { required: true });
    const projectKey = core.getInput('sonar-project-key', { required: true });
    const orgKey = core.getInput('sonar-org-key', { required: false });
    const sonarUrl = core.getInput('sonar-host-url', { required: true });

    let githubContext = core.getInput('context-github', { required: true });

    try {
        githubContext = JSON.parse(githubContext);
    } catch (e) {
        core.setFailed(`Exception parsing github context ${e}`);
    }

    const endpoint = `${instanceUrl}/api/sn_devops/devops/tool/softwarequality?toolId=${toolId}`;

    let payload;
    
    try {
        payload = {
            toolId: toolId,
            runId: `${githubContext.run_id}`,
            runNumber: `${githubContext.run_number}`,
            runAttempt: `${githubContext.run_attempt}`,
            job: `${jobname}`,
            sha: `${githubContext.sha}`,
            workflow: `${githubContext.workflow}`,
            projectKey: `${projectKey}`,
            orgKey: `${orgKey}`,
            sonarUrl: `${sonarUrl}`,
            repository: `${githubContext.repository}`,
            ref: `${githubContext.ref}`,
            refName: `${githubContext.ref_name}`,
            refType: `${githubContext.ref_type}`
        };
        core.debug(`Sonar Custom Action payload is : ${JSON.stringify(payload)}\n\n`);
    } catch (e) {
        core.setFailed(`Exception setting the payload ${e}`);
        return;
    }

    let result;

    try {
        const token = `${username}:${password}`;
        const encodedToken = Buffer.from(token).toString('base64');

        const defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Basic ' + `${encodedToken}`
        };

        let httpHeaders = { headers: defaultHeaders };
        core.debug("[ServiceNow DevOps], Sending Request for Sonar, Request Header :"+JSON.stringify(httpHeaders)+", Payload :"+JSON.stringify(payload)+"\n");
        result = await axios.post(endpoint, JSON.stringify(payload), httpHeaders);
        if(result.data) core.debug("[ServiceNow DevOps], Receiving response for Sonar, Response :"+circularSafeStringify(result)+"\n");
    } catch (e) {
        core.debug('[ServiceNow DevOps] Register Sonar Scan Summaries, Error: '+JSON.stringify(e)+"\n");
        if(e.response && e.response.data) {
            var responseObject=circularSafeStringify(e.response.data);
            core.debug('[ServiceNow DevOps] Register Sonar Scan Summaries, Status code :'+e.response.status+', Response data :'+responseObject+"\n");          
        }

        if (e.message.includes('ECONNREFUSED') || e.message.includes('ENOTFOUND') || e.message.includes('405')) {
            core.setFailed('ServiceNow Instance URL is NOT valid. Please correct the URL and try again.');
        } else if (e.message.includes('401')) {
            core.setFailed('Invalid username and password or Invalid token and toolid. Please correct the input parameters and try again.');
        } else if(e.message.includes('400') || e.message.includes('404')){
            let errMsg = '[ServiceNow DevOps] Register Sonar Scan Summaries are not Successful. ';
            let errMsgSuffix = ' Please provide valid inputs.';
            let responseData = e.response.data;
            if (responseData && responseData.result && responseData.result.errorMessage) {
                errMsg = errMsg + responseData.result.errorMessage + errMsgSuffix;
                core.setFailed(errMsg);
            }
            else if (responseData && responseData.result && responseData.result.details && responseData.result.details.errors) {
                let errors = responseData.result.details.errors;
                for (var index in errors) {
                    errMsg = errMsg + errors[index].message + errMsgSuffix;
                }
                core.setFailed(errMsg);
            }
        } else {
            core.setFailed(`ServiceNow DevOps Event to register Sonar Scan Summaries is not created. Please check ServiceNow logs for more details.`);
        }
    }
    
    
})();