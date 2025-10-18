import assert from "node:assert";
import { replaceLinks, resetTemplateEditor, recordFusionMetrics } from "../../src/hooks/useTemplateEditor.js";
import { getOperations } from "../../src/state/templateOperations.js";
import { setLinkExpiryForTest, resetLinkExpiryOverrides } from "../../src/services/subscriptionAPI.js";
import { createSnapshotBanner } from "../../src/components/Subscription/TemplateEditorTab/SnapshotBanner.js";

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

export async function runCountdownTests() {
  resetTemplateEditor();
  resetLinkExpiryOverrides();
  await recordFusionMetrics("Japan", [
    { node: "Tokyo", latency: 80, providerId: "providerA", provider_id: "providerA" },
  ]);
  setLinkExpiryForTest("providerA", 50);
  const snapshots = createSnapshotBanner();
  const countdown = snapshots.find((item) => item.region === "Japan");
  if (!countdown) {
    throw new Error("未生成倒计时信息");
  }
  assert.strictEqual(countdown.highlight, "danger");
}
