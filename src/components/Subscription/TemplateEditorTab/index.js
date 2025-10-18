import {
  getDiffPaths,
  getTemplateState,
  exportTemplate,
  importTemplate,
} from "../../../hooks/useTemplateEditor.js";
import { createDiffViewer } from "./DiffViewer.js";
import { createConflictDialog } from "./ConflictDialog.js";
import { createSnapshotBanner } from "./SnapshotBanner.js";

export function createTemplateEditorTab() {
  const state = getTemplateState();
  const diffPaths = getDiffPaths();
  const diffViewer = createDiffViewer(state.templateYaml, diffPaths);
  const conflictDialog = createConflictDialog(diffViewer.paths.length > 0);
  const snapshots = createSnapshotBanner();

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
      return exportTemplate(password);
    },
    async importData(password, encrypted) {
      await importTemplate(password, encrypted);
      return getTemplateState();
    },
  };
}
