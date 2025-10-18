import assert from "node:assert";
import { replaceLinks, resetTemplateEditor } from "../../src/hooks/useTemplateEditor.js";
import { getOperations } from "../../src/state/templateOperations.js";

export async function runUiTests() {
  resetTemplateEditor();
  await replaceLinks("providerA", "https://example.com/new");
  assert.deepStrictEqual(getOperations(), [
    "update:providerA:https://example.com/new",
    "snapshot:providerA",
    "diff:providerA",
    "template:290",
  ]);
}
