import assert from "node:assert";
import {
  resetTemplateEditor,
  recordFusionMetrics,
  getFusionHistory,
  rollbackFusion,
  getTemplateState,
} from "../useTemplateEditor.js";

export async function runUseTemplateEditorFusionTests() {
  resetTemplateEditor();
  const metrics = [
    { node: "Tokyo-1", latency: 120, providerId: "providerA" },
    { node: "Tokyo-2", latency: 60, providerId: "providerB" },
  ];

  await recordFusionMetrics("Japan", metrics);

  const history = getFusionHistory();
  assert.strictEqual(history.length, 1);
  assert.strictEqual(history[0].region, "Japan");
  assert.strictEqual(history[0].best.node, "Tokyo-2");

  const stateAfter = getTemplateState();
  assert.strictEqual(stateAfter.rules[0], "AUTO Japan -> Tokyo-2");

  rollbackFusion("Japan");
  const state = getTemplateState();
  assert.strictEqual(state.rules[0], "MATCH,providerA");
  assert.strictEqual(getFusionHistory().length, 0);
}
