import assert from "node:assert";
import { replaceLinks, resetTemplateEditor } from "../../src/hooks/useTemplateEditor.js";
import { getOperations } from "../../src/state/templateOperations.js";

export async function runIntegrationTests() {
  resetTemplateEditor();
  await replaceLinks("providerA", "https://new.example.com");
  assert.deepStrictEqual(getOperations(), [
    "update:providerA:https://new.example.com",
    "snapshot:providerA",
    "diff:providerA",
    "template:290",
  ]);
}
