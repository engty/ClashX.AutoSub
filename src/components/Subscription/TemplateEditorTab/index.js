import { getDiffPaths, getTemplateState } from "../../../hooks/useTemplateEditor.js";
import { createDiffViewer } from "./DiffViewer.js";
import { createConflictDialog } from "./ConflictDialog.js";

export function createTemplateEditorTab() {
  const state = getTemplateState();
  const diffPaths = getDiffPaths();
  const diffViewer = createDiffViewer(state.templateYaml, diffPaths);
  const conflictDialog = createConflictDialog(diffViewer.paths.length > 0);

  const sections = ["providers", "rules", "diff"];
  if (state.hasAdvancedPermission) {
    sections.push("custom-yaml");
  }

  return {
    sections,
    diffPaths: diffViewer.paths,
    conflicts: conflictDialog.messages,
    hasAdvancedPermission: state.hasAdvancedPermission,
  };
}
