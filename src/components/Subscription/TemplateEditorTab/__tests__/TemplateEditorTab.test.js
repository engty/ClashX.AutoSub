import assert from "node:assert";
import { createTemplateEditorTab } from "../index.js";
import { createFilterAssistant } from "../FilterAssistant.js";
import { createCustomConfigInput } from "../CustomConfigInput.js";
import {
  resetTemplateEditor,
  setAdvancedPermission,
} from "../../../../hooks/useTemplateEditor.js";
import { getOperations, resetOperations } from "../../../../state/templateOperations.js";
import { setLinkExpiryForTest, resetLinkExpiryOverrides } from "../../../../services/subscriptionAPI.js";

export function runTemplateEditorTabTests() {
  resetTemplateEditor();
  setAdvancedPermission(true);
  resetOperations();
  resetLinkExpiryOverrides();
  setLinkExpiryForTest("providerA", 45);

  const view = createTemplateEditorTab();
  assert.ok(view.sections.includes("providers"));
  assert.ok(view.sections.includes("diff"));
  assert.deepStrictEqual(view.diffPaths, []);
  assert.deepStrictEqual(view.snapshots, []);

  setAdvancedPermission(false);
  const input = createCustomConfigInput({ hasAdvancedPermission: false });
  assert.strictEqual(input.readonly, true);
  return assert.rejects(() => input.format("{\"demo\":true}"), /暂无权限/)
    .then(() => {
      const assistant = createFilterAssistant();
      assert.strictEqual(assistant.mode, "keyword");
      assistant.setMode("regex");
      assert.strictEqual(assistant.mode, "regex");
    })
    .then(async () => {
      resetTemplateEditor();
      resetOperations();
      const fullView = createTemplateEditorTab();
      const exported = await fullView.export("pass123");
      assert.match(exported, /^[A-Za-z0-9+/=]+$/);
      await fullView.importData("pass123", exported);
      assert.ok(getOperations().includes("import:pass123"));
      const countdown = fullView.snapshots.find((item) => item.region === "Japan");
      if (countdown) {
        assert.strictEqual(countdown.highlight, "danger");
      }
    });
}
