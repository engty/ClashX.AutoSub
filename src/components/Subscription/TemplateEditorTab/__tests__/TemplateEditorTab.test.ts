import { beforeEach, describe, expect, it } from "vitest";
import { createTemplateEditorTab } from "../index";
import { createFilterAssistant } from "../FilterAssistant";
import { createCustomConfigInput } from "../CustomConfigInput";
import { resetTemplateEditor, setAdvancedPermission } from "../../../hooks/useTemplateEditor";

describe("TemplateEditorTab", () => {
  beforeEach(() => {
    resetTemplateEditor();
    setAdvancedPermission(true);
  });

  it("renders diff viewer and basic sections", () => {
    const view = createTemplateEditorTab();
    expect(view.sections).toContain("providers");
    expect(view.sections).toContain("diff");
    expect(view.diffPaths).toEqual([]);
  });

  it("enforces read-only custom YAML when没有高级权限", async () => {
    setAdvancedPermission(false);
    const input = createCustomConfigInput({ hasAdvancedPermission: false });
    expect(input.readonly).toBe(true);
    await expect(input.format("name: demo"))
      .rejects.toThrowError(/暂无权限/);
  });

  it("allows切换过滤助手模式", () => {
    const assistant = createFilterAssistant();
    expect(assistant.mode).toBe("keyword");
    assistant.setMode("regex");
    expect(assistant.mode).toBe("regex");
  });
});
