import assert from "node:assert";
import { createTemplateEditorTab } from "../index.js";
import { createFilterAssistant } from "../FilterAssistant.js";
import { createCustomConfigInput } from "../CustomConfigInput.js";
import { resetTemplateEditor, setAdvancedPermission } from "../../../../hooks/useTemplateEditor.js";

export function runTemplateEditorTabTests() {
  resetTemplateEditor();
  setAdvancedPermission(true);

  const view = createTemplateEditorTab();
  assert.ok(view.sections.includes("providers"));
  assert.ok(view.sections.includes("diff"));
  assert.deepStrictEqual(view.diffPaths, []);

  setAdvancedPermission(false);
  const input = createCustomConfigInput({ hasAdvancedPermission: false });
  assert.strictEqual(input.readonly, true);
  return assert.rejects(() => input.format("{\"demo\":true}"), /暂无权限/)
    .then(() => {
      const assistant = createFilterAssistant();
      assert.strictEqual(assistant.mode, "keyword");
      assistant.setMode("regex");
      assert.strictEqual(assistant.mode, "regex");
    });
}
