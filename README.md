# ServiceNow DevOps Register Sonar Details GitHub Action

This custom action needs to be added at step level in a job to register sonar details in ServiceNow instance.

# Usage
## Step 1: Prepare values for setting up your secrets for Actions
- credentials (Devops integration token of a GitHub tool created in ServiceNow DevOps or username and password for a ServiceNow devops integration user)
- instance URL for your ServiceNow dev, test, prod, etc. environments
- tool_id of your GitHub tool created in ServiceNow DevOps
- sonar URL for your SonarQube instance or Sonar Cloud, for example **https://sonarcloud.io**
- sonar organization the key for your organization in Sonar instance, for example **devops**
- sonar project the key for your project in Sonar instance, for example **org.examples:demo**

## Step 2: Configure Secrets in your GitHub Ogranization or GitHub repository
On GitHub, go in your organization settings or repository settings, click on the _Secrets > Actions_ and create a new secret.

For token based authentication which is available from @v2.0 , create secrets called 
- `SN_INSTANCE_URL` your ServiceNow instance URL, for example **https://test.service-now.com**
- `SN_ORCHESTRATION_TOOL_ID` only the **sys_id** is required for the GitHub tool created in your ServiceNow instance
- `SN_DEVOPS_INTEGRATION_TOKEN` required for token based authentication
- `SONAR_URL` the URL of your Sonar instance, for example **https://sonarcloud.io**
- `SONAR_PROJECT_KEY` the project key in your Sonar instance, for example **org.examples:demo**
- `SONAR_ORG_KEY` the project key in your Sonar instance, for example **devops**

For basic authentication, create secrets called 
- `SN_INSTANCE_URL` your ServiceNow instance URL, for example **https://test.service-now.com**
- `SN_ORCHESTRATION_TOOL_ID` only the **sys_id** is required for the GitHub tool created in your ServiceNow instance
- `SN_DEVOPS_USER`
- `SN_DEVOPS_PASSWORD`
- `SONAR_URL` the URL of your Sonar instance, for example **https://sonarcloud.io**
- `SONAR_PROJECT_KEY` the project key in your Sonar instance, for example **org.examples:demo**

## Step 3: Configure the GitHub Action if need to adapt for your needs or workflows
## For Token based Authentication which is available from @v2.0 , at ServiceNow instance
```yaml
build:
    name: Build
    runs-on: ubuntu-latest
    steps:
      - name: ServiceNow DevOps Sonar Scan Results
        uses: ServiceNow/servicenow-devops-sonar@v2.0
        with:
          devops-integration-token: ${{ secrets.SN_DEVOPS_INTEGRATION_TOKEN}}
          instance-url: ${{ secrets.SN_INSTANCE_URL }}
          tool-id: ${{ secrets.SN_ORCHESTRATION_TOOL_ID }}
          context-github: ${{ toJSON(github) }}
          job-name: 'Build'
          sonar-host-url: ${{ secrets.SONAR_URL }}
          sonar-project-key: ${{ secrets.SONAR_PROJECT_KEY }}
```
## For Basic Authentication at ServiceNow instance
```yaml
build:
    name: Build
    runs-on: ubuntu-latest
    steps:
      - name: ServiceNow DevOps Sonar Scan Results
        uses: ServiceNow/servicenow-devops-sonar@v1.34.2
        with:
          devops-integration-user-name: ${{ secrets.SN_DEVOPS_USER }}
          devops-integration-user-password: ${{ secrets.SN_DEVOPS_PASSWORD }}
          instance-url: ${{ secrets.SN_INSTANCE_URL }}
          tool-id: ${{ secrets.SN_ORCHESTRATION_TOOL_ID }}
          context-github: ${{ toJSON(github) }}
          job-name: 'Build'
          sonar-host-url: ${{ secrets.SONAR_URL }}
          sonar-project-key: ${{ secrets.SONAR_PROJECT_KEY }}
          sonar-org-key: ${{ secrets.SONAR_ORG_KEY }}
```
The values for secrets should be setup in Step 1. Secrets should be created in Step 2. The Step Name should be **ServiceNow DevOps Sonar Scan Results**.

## Inputs

### `devops-integration-user-name`

**Optional**  DevOps Integration Username to ServiceNow instance for basic authentication.

### `devops-integration-user-password`

**Optional**  DevOps Integration User Password to ServiceNow instance for basic authentication. 

### `devops-integration-token`

**Optional**  DevOps Security Token of GitHub tool created in ServiceNow instance for token based authentication. 

### `instance-url`

**Required**  URL of ServiceNow instance to register the sonar details, for example _https://test.service-now.com_.

### `tool-id`

**Required**  Orchestration Tool Id for GitHub created in ServiceNow DevOps

### `context-github`

**Required**  Github context contains information about the workflow run details.

### `job-name`

**Required**  Display name of the job given for attribute _name_ in which _steps_ have been added for ServiceNow sonar custom action.

### `sonar-host-url`

**Required**  URL of SonarQube server instance or Sonar Cloud, for example _https://sonarcloud.io_.

### `sonar-project-key`

**Required**  The project key in your Sonar instance URL.

### `sonar-org-key`

The organization key in your Sonar instance URL. This is required only when your scan summaries available in Sonar Cloud.

## Outputs
No outputs produced.

# Notices

## Support Model

ServiceNow customers may request support through the [Now Support (HI) portal](https://support.servicenow.com/nav_to.do?uri=%2Fnow_support_home.do).

## Governance Model

Initially, ServiceNow product management and engineering representatives will own governance of these integrations to ensure consistency with roadmap direction. In the longer term, we hope that contributors from customers and our community developers will help to guide prioritization and maintenance of these integrations. At that point, this governance model can be updated to reflect a broader pool of contributors and maintainers. 