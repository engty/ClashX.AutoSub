import { getFusionHistory } from "../../../hooks/useTemplateEditor.js";
import { fetchLinkExpiry } from "../../../services/subscriptionAPI.js";

export function createSnapshotBanner(resolveExpiry) {
  const resolver = typeof resolveExpiry === "function" ? resolveExpiry : fetchLinkExpiry;

  return getFusionHistory().map((entry) => {
    const providerId = entry.best ? entry.best.provider_id || entry.best.providerId : null;
    const seconds = providerId ? resolver(providerId) : null;
    const highlight = typeof seconds === "number"
      ? seconds <= 60
        ? "danger"
        : seconds <= 300
        ? "warning"
        : null
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
