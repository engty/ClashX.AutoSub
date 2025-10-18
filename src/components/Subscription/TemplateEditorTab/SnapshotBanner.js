import { getFusionHistory } from "../../../hooks/useTemplateEditor.js";
import { fetchLinkExpiry } from "../../../services/subscriptionAPI.js";

export function createSnapshotBanner() {
  return getFusionHistory().map((entry) => {
    const providerId = entry.best ? entry.best.provider_id || entry.best.providerId : null;
    const seconds = providerId ? fetchLinkExpiry(providerId) : null;
    const highlight = seconds === null
      ? null
      : seconds <= 60
      ? "danger"
      : seconds <= 300
      ? "warning"
      : null;

    return {
      region: entry.region,
      bestNode: entry.best ? entry.best.node : null,
      total: entry.metrics.length,
      seconds,
      highlight,
    };
  });
}
