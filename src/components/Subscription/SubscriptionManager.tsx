import { createTemplateEditorTab } from "./TemplateEditorTab";

export interface SubscriptionTab {
  readonly name: string;
  readonly key: string;
}

export interface SubscriptionManagerView {
  readonly tabs: SubscriptionTab[];
  readonly activeTabKey: string;
}

export function createSubscriptionManager(): SubscriptionManagerView {
  const templateTab = createTemplateEditorTab();
  const tabs: SubscriptionTab[] = [
    { name: "订阅列表", key: "list" },
    { name: "模板编辑", key: "template" },
  ];

  if (!templateTab.hasAdvancedPermission) {
    return { tabs: [tabs[0]], activeTabKey: "list" };
  }

  return { tabs, activeTabKey: "template" };
}
