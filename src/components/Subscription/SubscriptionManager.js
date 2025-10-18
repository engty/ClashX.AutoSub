import { createTemplateEditorTab } from "./TemplateEditorTab/index.js";

export function createSubscriptionManager() {
  const templateTab = createTemplateEditorTab();
  const tabs = [
    { name: "订阅列表", key: "list" },
  ];

  if (templateTab.hasAdvancedPermission) {
    tabs.push({ name: "模板编辑", key: "template" });
    return { tabs, activeTabKey: "template" };
  }

  return { tabs, activeTabKey: "list" };
}
