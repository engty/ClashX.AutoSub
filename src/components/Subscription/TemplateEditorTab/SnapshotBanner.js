import { getFusionHistory } from "../../../hooks/useTemplateEditor.js";

export function createSnapshotBanner(fetchExpiry) {
  return getFusionHistory().map((entry) => {
    const seconds = fetchExpiry ? fetchExpiry(entry.region) : null;
    const highlight = seconds === null ? null : seconds <= 60 ? 'danger' : seconds <= 300 ? 'warning' : null;
    return {
      region: entry.region,
      bestNode: entry.best ? entry.best.node : null,
      total: entry.metrics.length,
      seconds,
      highlight,
    };
  });
}
