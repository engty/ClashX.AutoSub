import YAML from "yaml";
import { getDiffPaths, getTemplateState } from "../../../hooks/useTemplateEditor";
import { createDiffViewer } from "./DiffViewer";
import { createConflictDialog } from "./ConflictDialog";

export interface TemplateEditorTabView {
  readonly sections: string[];
  readonly diffPaths: string[];
  readonly conflicts: string[];
  readonly hasAdvancedPermission: boolean;
}

export function createTemplateEditorTab(): TemplateEditorTabView {
  const state = getTemplateState();
  const diffPaths = getDiffPaths();
  const diffViewer = createDiffViewer(state.templateYaml, diffPaths);
  const conflictDialog = createConflictDialog(diffViewer.paths.length > 0);

  const sections = ["providers", "rules", "diff"];
  if (state.hasAdvancedPermission) {
    sections.push("custom-yaml");
  }

  YAML.parse(state.templateYaml);

  return {
    sections,
    diffPaths: diffViewer.paths,
    conflicts: conflictDialog.messages,
    hasAdvancedPermission: state.hasAdvancedPermission,
  };
}
