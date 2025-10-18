import YAML from "yaml";
import { updateProviderLink } from "./services/subscriptionAPI";
import { saveTemplateSnapshot, validateTemplateYaml } from "./services/templateAPI";
import { recordOperation, resetOperations } from "./state/templateOperations";

type ProviderMap = Record<string, { url: string; type: string; interval?: number }>;

interface TemplateDocument {
  "proxy-providers": ProviderMap;
  rules: string[];
}

const DEFAULT_TEMPLATE: TemplateDocument = {
  "proxy-providers": {
    providerA: {
      url: "https://old.example.com",
      type: "http",
      interval: 3600,
    },
    providerB: {
      url: "https://stay.example.com",
      type: "http",
    },
  },
  rules: ["MATCH,providerA"],
};

interface TemplateState {
  template: TemplateDocument;
  diffPaths: string[];
  hasAdvancedPermission: boolean;
}

const state: TemplateState = {
  template: JSON.parse(JSON.stringify(DEFAULT_TEMPLATE)),
  diffPaths: [],
  hasAdvancedPermission: true,
};

export function resetTemplateEditor(): void {
  state.template = JSON.parse(JSON.stringify(DEFAULT_TEMPLATE));
  state.diffPaths = [];
  resetOperations();
}

export function setAdvancedPermission(enabled: boolean): void {
  state.hasAdvancedPermission = enabled;
}

export function getTemplateYaml(): string {
  return YAML.stringify(state.template);
}

export function getDiffPaths(): string[] {
  return [...state.diffPaths];
}

export async function replaceLinks(providerId: string, url: string): Promise<void> {
  const templateYaml = getTemplateYaml();
  await updateProviderLink({ providerId, newUrl: url });
  await saveTemplateSnapshot({ snapshotName: providerId });

  const providers = state.template["proxy-providers"];
  const provider = providers[providerId];
  if (!provider) {
    throw new Error(`订阅源 ${providerId} 不存在`);
  }

  if (provider.url !== url) {
    provider.url = url;
    state.diffPaths = [`proxy-providers.${providerId}.url`];
    recordOperation(`diff:${providerId}`);
  }
}

export function getTemplateState() {
  return {
    providers: Object.entries(state.template["proxy-providers"]).map(([name, info]) => ({
      name,
      url: info.url,
      type: info.type,
      interval: info.interval,
    })),
    rules: [...state.template.rules],
    hasAdvancedPermission: state.hasAdvancedPermission,
    diffPaths: getDiffPaths(),
    templateYaml: getTemplateYaml(),
  };
}

export async function applyCustomYaml(yaml: string): Promise<void> {
  if (!state.hasAdvancedPermission) {
    throw new Error("暂无权限编辑自定义 YAML");
  }
  await validateTemplateYaml(yaml);
  const parsed = YAML.parse(yaml) as TemplateDocument;
  state.template = parsed;
  state.diffPaths = [];
}
