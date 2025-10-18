import { updateProviderLink } from "../services/subscriptionAPI.js";
import {
  saveTemplateSnapshot,
  validateTemplateYaml,
  exportTemplate as exportTemplateApi,
  importTemplate as importTemplateApi,
} from "../services/templateAPI.js";
import { recordOperation, resetOperations } from "../state/templateOperations.js";
import {
  storeFusionResult,
  getFusionResults,
  removeFusionResult,
  resetFusionResults,
} from "../state/fusionStore.js";
import { cloneTemplate, stringifyTemplate, parseTemplate } from "../utils/templateSerializer.js";

const DEFAULT_TEMPLATE = {
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
  "proxy-groups": [],
  rules: ["MATCH,providerA"],
};

const state = {
  template: cloneTemplate(DEFAULT_TEMPLATE),
  diffPaths: [],
  hasAdvancedPermission: true,
};

export function resetTemplateEditor() {
  state.template = cloneTemplate(DEFAULT_TEMPLATE);
  state.diffPaths = [];
  resetFusionResults();
  resetOperations();
}

export function setAdvancedPermission(enabled) {
  state.hasAdvancedPermission = Boolean(enabled);
}

export function getTemplateYaml() {
  return stringifyTemplate(state.template);
}

export function getDiffPaths() {
  return [...state.diffPaths];
}

export async function replaceLinks(providerId, url) {
  const templateYaml = getTemplateYaml();
  await updateProviderLink({ providerId, newUrl: url });
  await saveTemplateSnapshot({ snapshotName: providerId });

  const provider = state.template["proxy-providers"][providerId];
  if (!provider) {
    throw new Error(`订阅源 ${providerId} 不存在`);
  }

  if (provider.url !== url) {
    provider.url = url;
    state.diffPaths = [`proxy-providers.${providerId}.url`];
    recordOperation(`diff:${providerId}`);
  }

  // 记录原始 YAML，仅用于对比。
  recordOperation(`template:${templateYaml.length}`);
}

export function getTemplateState() {
  return {
    providers: Object.entries(state.template["proxy-providers"]).map(([name, info]) => ({
      name,
      url: info.url,
      type: info.type,
      interval: info.interval,
      expirySeconds: info["link-expiry-seconds"] ?? info.linkExpirySeconds ?? info.expirySeconds ?? null,
      expiryPolicy: info["link-expiry"] ?? info.linkExpiry ?? null,
    })),
    rules: [...state.template.rules],
    hasAdvancedPermission: state.hasAdvancedPermission,
    diffPaths: getDiffPaths(),
    templateYaml: getTemplateYaml(),
  };
}

export async function applyCustomYaml(serialized) {
  if (!state.hasAdvancedPermission) {
    throw new Error("暂无权限编辑自定义 YAML");
  }
  await validateTemplateYaml(serialized);
  state.template = parseTemplate(serialized);
  state.diffPaths = [];
}

export async function exportTemplate(password) {
  const yaml = getTemplateYaml();
  return exportTemplateApi(password, yaml);
}

export async function importTemplate(password, encrypted) {
  const yaml = await importTemplateApi(password, encrypted);
  state.template = parseTemplate(yaml);
  state.diffPaths = [];
}

export function getFusionHistory() {
  return getFusionResults().map((entry) => ({
    region: entry.region,
    best: entry.best ? { ...entry.best } : undefined,
    metrics: entry.metrics.map((m) => ({ ...m })),
  }));
}

export async function recordFusionMetrics(region, metrics) {
  if (!Array.isArray(metrics) || metrics.length === 0) {
    throw new Error("缺少融合测试结果");
  }

  const sorted = [...metrics].sort((a, b) => a.latency - b.latency);
  const best = sorted[0];
  const snapshot = cloneTemplate(state.template);

  state.template.rules = [`AUTO ${region} -> ${best.node}`];
  state.diffPaths = [`fusion.${region}`];
  storeFusionResult({
    region,
    metrics: sorted,
    best,
    snapshot,
  });
  recordOperation(`fusion:${region}:${best.node}`);
}

export function rollbackFusion(region) {
  const entry = removeFusionResult(region);
  if (!entry) {
    return;
  }
  state.template = cloneTemplate(entry.snapshot);
  state.diffPaths = [];
  recordOperation(`fusion-rollback:${region}`);
}
