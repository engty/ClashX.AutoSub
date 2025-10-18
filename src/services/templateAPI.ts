import YAML from "yaml";
import { recordOperation } from "../state/templateOperations";

export interface SaveTemplatePayload {
  readonly snapshotName: string;
  readonly diffOnly?: boolean;
}

export async function saveTemplateSnapshot(payload: SaveTemplatePayload): Promise<{ snapshotId: string }> {
  recordOperation(`snapshot:${payload.snapshotName}`);
  return { snapshotId: `${payload.snapshotName}-${Date.now()}` };
}

export async function validateTemplateYaml(yaml: string): Promise<void> {
  YAML.parse(yaml);
  recordOperation("validate");
}
