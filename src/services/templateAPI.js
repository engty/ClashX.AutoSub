import { recordOperation } from "../state/templateOperations.js";
import { getFusionResults } from "../state/fusionStore.js";
import { fetchAuditLog } from "./auditLog.js";

export async function saveTemplateSnapshot(payload) {
  recordOperation(`snapshot:${payload.snapshotName}`);
  return { snapshotId: `${payload.snapshotName}-${Date.now()}` };
}

export async function validateTemplateYaml(serialized) {
  JSON.parse(serialized);
  recordOperation("validate");
}

export async function getFusionHistoryFromApi() {
  return getFusionResults();
}

export async function getTemplateLogs() {
  return fetchAuditLog();
}
