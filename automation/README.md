# Automation Workflows

## Variance Flag Workflow

- **Status:** No Apps Script source for the workflow is stored in this repository. A search of the tree (2024-10-09) confirmed that `automation/apps-script/variance_flag/` has never been committed.
- **Current integration:** The "Automation Center" UI in the dashboard surfaces configuration metadata only. There is no backend or Apps Script automation wired up from this codebase yet.
- **Source of truth:** The Variance Flag workflow is currently maintained directly inside Google Workspace. Request the existing Apps Script project (if one is already in use) from the Operations Automation team before making changes.
- **How to capture it in Git:** Once you have access, export the Apps Script via **File → Download project** in the Apps Script editor and commit it under `automation/apps-script/variance_flag/VarianceFlag.gs` (include the manifest, if present).
- **Redeployment steps:** Open the Google Apps Script project, choose **Deploy → Manage deployments**, and create a new deployment (Web App or Headless) tied to the Variance Flag sheet/document. Document the deployment ID in this README once it is issued.

> ℹ️ Until the script is exported and linked to this repository, automation changes must be coordinated directly within Google Apps Script. Remember to update this README with the deployment ID and any service account permissions when the code is checked in.
