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

import { getFusionHistory } from '../../src/hooks/useTemplateEditor.js';

export async function runCountdownTests() {
  const history = getFusionHistory();
  if (history.length === 0) {
    console.log('暂无融合记录，倒计时测试跳过');
    return;
  }
  console.log('倒计时测试完成');
}
