import {
  getDiffPaths,
  getTemplateState,
} from "../../../hooks/useTemplateEditor.js";
import { createDiffViewer } from "./DiffViewer.js";
import { createConflictDialog } from "./ConflictDialog.js";
import { createSnapshotBanner } from "./SnapshotBanner.js";
import { createImportExportControls } from "./ImportExportControls.js";

export function createTemplateEditorTab() {
  const state = getTemplateState();
  const diffPaths = getDiffPaths();
  const diffViewer = createDiffViewer(state.templateYaml, diffPaths);
  const conflictDialog = createConflictDialog(diffViewer.paths.length > 0);
  const snapshots = createSnapshotBanner(fetchExpirySeconds);
  function fetchExpirySeconds(region) {
    if (typeof window !== 'undefined' && window.fetchExpirySeconds) {
      return window.fetchExpirySeconds(region);
    }
    return 300;
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
