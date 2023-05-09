/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 613:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 986:
/***/ ((module) => {

module.exports = eval("require")("axios");


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
const core = __nccwpck_require__(613);
const axios = __nccwpck_require__(986);


(async function main() {   
    let instanceUrl = core.getInput('instance-url', { required: true });
    const toolId = core.getInput('tool-id', { required: true });
    const username = core.getInput('devops-integration-user-name', { required: false });
    const password = core.getInput('devops-integration-user-password', { required: false });
    const devopsIntegrationToken = core.getInput('devops-integration-token', { required: false });
    const jobname = core.getInput('job-name', { required: true });
    const projectKey = core.getInput('sonar-project-key', { required: true });
    let sonarUrl = core.getInput('sonar-host-url', { required: true });

    let githubContext = core.getInput('context-github', { required: true });

    try {
        githubContext = JSON.parse(githubContext);
    } catch (e) {
        core.setFailed(`Exception parsing github context ${e}`);
    }
            
    let payload;
    
    try {
        sonarUrl = sonarUrl.trim();
        if (sonarUrl.endsWith('/'))
            sonarUrl = sonarUrl.slice(0, -1);

        instanceUrl = instanceUrl.trim();
        if (instanceUrl.endsWith('/'))
            instanceUrl = instanceUrl.slice(0, -1);

        payload = {
            toolId: toolId,
            runId: `${githubContext.run_id}`,
            runNumber: `${githubContext.run_number}`,
            runAttempt: `${githubContext.run_attempt}`,
            job: `${jobname}`,
            sha: `${githubContext.sha}`,
            workflow: `${githubContext.workflow}`,
            projectKey: `${projectKey}`,
            sonarUrl: `${sonarUrl}`,
            repository: `${githubContext.repository}`,
            ref: `${githubContext.ref}`,
            refName: `${githubContext.ref_name}`,
            refType: `${githubContext.ref_type}`
        };
        core.debug('Sonar Custon Action payload is : ${JSON.stringify(payload)}\n\n');
    } catch (e) {
        core.setFailed(`Exception setting the payload ${e}`);
        return;
    }

    const endpointv1 = `${instanceUrl}/api/sn_devops/v1/devops/tool/softwarequality?toolId=${toolId}`;
    const endpointv2 = `${instanceUrl}/api/sn_devops/v2/devops/tool/softwarequality?toolId=${toolId}`;
    let endpoint;
    let httpHeaders;

    try {
        if (!devopsIntegrationToken && !username && !password) {
            core.setFailed('Either secret token or integration username, password is needed for integration user authentication');
            return;
        } else if (devopsIntegrationToken) {
            const defaultHeadersv2 = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'sn_devops_token': `${devopsIntegrationToken}`
            };
            httpHeaders = {
                headers: defaultHeadersv2
            };
            endpoint = endpointv2;
        } else if (username && password) {
            const token = `${username}:${password}`;
            const encodedToken = Buffer.from(token).toString('base64');
            const defaultHeadersv1 = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Basic ' + `${encodedToken}`
            };
            httpHeaders = {
                headers: defaultHeadersv1 
            };
            endpoint = endpointv1;
        } else {
            core.setFailed('For Basic Auth, Username and Password is mandatory for integration user authentication');
            return;
        }
        snowResponse = await axios.post(endpoint, JSON.stringify(payload), httpHeaders);
    } catch (e) {
        if (e.message.includes('ECONNREFUSED') || e.message.includes('ENOTFOUND') || e.message.includes('405')) {
            core.setFailed('ServiceNow Instance URL is NOT valid. Please correct the URL and try again.');
        } else if (e.message.includes('401')) {
            core.setFailed('Invalid Credentials. Please correct the credentials and try again.');
        } else {
            core.setFailed('ServiceNow Software Quality Results are NOT created. Please check ServiceNow logs for more details.');
        }
    }

})();


})();

module.exports = __webpack_exports__;
/******/ })()
;