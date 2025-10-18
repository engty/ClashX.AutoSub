import { getFusionHistory } from "../../../hooks/useTemplateEditor.js";

export function createSnapshotBanner() {
  return getFusionHistory().map((entry) => ({
    region: entry.region,
    bestNode: entry.best ? entry.best.node : null,
    total: entry.metrics.length,
  }));
}
