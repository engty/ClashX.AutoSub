import { recordOperation } from "../state/templateOperations.js";

export async function saveTemplateSnapshot(payload) {
  recordOperation(`snapshot:${payload.snapshotName}`);
  return { snapshotId: `${payload.snapshotName}-${Date.now()}` };
}

export async function validateTemplateYaml(serialized) {
  JSON.parse(serialized);
  recordOperation("validate");
}
