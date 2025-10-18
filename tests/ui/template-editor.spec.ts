import { describe, expect, it } from "vitest";
import { replaceLinks } from "../../src/hooks/useTemplateEditor";
import { getOperations, resetOperations } from "../../src/state/templateOperations";

describe("模板编辑 UI 流程", () => {
  it("在链接替换时记录更新与快照", async () => {
    resetOperations();
    await replaceLinks("providerA", "https://example.com/new");
    expect(getOperations()).toEqual([
      "update:providerA:https://example.com/new",
      "snapshot:providerA",
      "diff:providerA",
    ]);
  });
});
