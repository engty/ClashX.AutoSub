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

export async function exportTemplate(password, templateYaml) {
  const payload = Buffer.from(`${password}::${templateYaml}`, "utf8").toString("base64");
  recordOperation(`export:${password}`);
  return payload;
}

export async function importTemplate(password, encrypted) {
  const decoded = Buffer.from(encrypted, "base64").toString("utf8");
  const prefix = `${password}::`;
  if (!decoded.startsWith(prefix)) {
    throw new Error("导入口令不正确");
  }
  const yaml = decoded.slice(prefix.length);
  await validateTemplateYaml(yaml);
  recordOperation(`import:${password}`);
  return yaml;
}

export async function getFusionHistoryFromApi() {
  return getFusionResults();
}

export async function getTemplateLogs() {
  return fetchAuditLog();
}
