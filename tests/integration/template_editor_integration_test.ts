import { beforeEach, describe, expect, it } from "vitest";
import { replaceLinks } from "../../src/useTemplateEditor";
import { getOperations, resetOperations } from "../../src/state/templateOperations";

describe("template editor integration", () => {
  beforeEach(() => {
    resetOperations();
  });

  it("updates snapshot and audit log when link replacements occur", async () => {
    await replaceLinks("providerA", "https://example.com/new");

    expect(getOperations()).toEqual([
      "update:providerA:https://example.com/new",
      "snapshot:providerA",
    ]);
  });
});
