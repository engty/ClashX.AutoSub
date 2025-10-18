import {
  getDiffPaths,
  getTemplateState,
} from "../../../hooks/useTemplateEditor.js";
import { createDiffViewer } from "./DiffViewer.js";
import { createConflictDialog } from "./ConflictDialog.js";
import { createSnapshotBanner } from "./SnapshotBanner.js";
import { createImportExportControls } from "./ImportExportControls.js";
import { fetchLinkExpiry } from "../../../services/subscriptionAPI.js";

export function createTemplateEditorTab() {
  const state = getTemplateState();
  const providerMap = new Map(state.providers.map((provider) => [provider.name, provider]));
  const diffPaths = getDiffPaths();
  const diffViewer = createDiffViewer(state.templateYaml, diffPaths);
  const conflictDialog = createConflictDialog(diffViewer.paths.length > 0);
  const snapshots = createSnapshotBanner(fetchExpirySeconds);
  function fetchExpirySeconds(providerId) {
    if (!providerId) {
      return null;
    }

    const overrideResult = normalizeExpiry(fetchLinkExpiry(providerId));
    if (overrideResult.matched) {
      return overrideResult.seconds;
    }

    const provider = providerMap.get(providerId);
    if (!provider) {
      return null;
    }

    const metadataCandidates = [provider.expirySeconds, provider.expiryPolicy];
    for (const candidate of metadataCandidates) {
      const result = normalizeExpiry(candidate);
      if (result.matched) {
        return result.seconds;
      }
    }

    const intervalResult = normalizeExpiry(provider.interval);
    if (intervalResult.matched) {
      return intervalResult.seconds;
    }

    return null;
  }

  function normalizeExpiry(value) {
    if (value === undefined || value === null) {
      return { matched: false };
    }

    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) {
        return { matched: false };
      }
      const lower = trimmed.toLowerCase();
      if (lower === "never" || lower === "none" || lower === "no-expiry" || lower === "永久" || lower === "不限" || lower === "infinite") {
        return { matched: true, seconds: null };
      }
      const numeric = Number(trimmed);
      if (Number.isFinite(numeric)) {
        return {
          matched: true,
          seconds: numeric > 0 ? Math.floor(numeric) : null,
        };
      }
      return { matched: false };
    }

    if (typeof value === "number") {
      if (!Number.isFinite(value) || value <= 0) {
        return { matched: true, seconds: null };
      }
      return { matched: true, seconds: Math.floor(value) };
    }

    return { matched: false };
  }

  const controls = createImportExportControls();

  const sections = ["providers", "rules", "diff"];
  if (state.hasAdvancedPermission) {
    sections.push("custom-yaml");
  }

  return {
    sections,
    diffPaths: diffViewer.paths,
    conflicts: conflictDialog.messages,
    hasAdvancedPermission: state.hasAdvancedPermission,
    snapshots,
    async export(password) {
      return controls.exportTemplate(password);
    },
    async importData(password, encrypted) {
      await controls.importTemplate(password, encrypted);
      return getTemplateState();
    },
  };
}
