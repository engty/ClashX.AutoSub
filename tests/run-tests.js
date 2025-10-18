import { runTemplateEditorTabTests } from "../src/components/Subscription/TemplateEditorTab/__tests__/TemplateEditorTab.test.js";
import { runIntegrationTests } from "./integration/template_editor_integration_test.js";
import { runUiTests } from "./ui/template-editor.spec.js";

async function main() {
  const results = [];

  try {
    await runTemplateEditorTabTests();
    results.push("TemplateEditorTab 测试通过");
  } catch (err) {
    console.error("TemplateEditorTab 测试失败:", err);
    process.exitCode = 1;
  }

  try {
    await runIntegrationTests();
    results.push("集成测试通过");
  } catch (err) {
    console.error("集成测试失败:", err);
    process.exitCode = 1;
  }

  try {
    await runUiTests();
    results.push("UI 测试通过");
  } catch (err) {
    console.error("UI 测试失败:", err);
    process.exitCode = 1;
  }

  if (process.exitCode !== 1) {
    results.forEach((line) => console.log(line));
    console.log("所有测试完成");
  }
}

main();
