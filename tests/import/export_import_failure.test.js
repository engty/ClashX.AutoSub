import assert from "node:assert";
import { exportTemplate, importTemplate, resetTemplateEditor } from "../../src/hooks/useTemplateEditor.js";

export async function runExportImportFailureTests() {
  resetTemplateEditor();
  const token = await exportTemplate("pwd", "测试模板");
  await assert.rejects(() => importTemplate("wrong", token), /导入口令不正确/);
}
