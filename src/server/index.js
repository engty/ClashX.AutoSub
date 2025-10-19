import express from "express";
import fs from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";

const app = express();
const PORT = Number(process.env.PORT || 3001);

const USER_CONFIG_PATH = path.resolve("yaml/user-config.yaml");
const TEMPLATE_PATH = path.resolve("yaml/template.yaml");
const SECONDS_PER_MINUTE = 60;
const LONG_TERM_THRESHOLD_SECONDS = 60 * 60 * 24 * 30; // 30 天
const LONG_TERM_MINUTES = LONG_TERM_THRESHOLD_SECONDS / SECONDS_PER_MINUTE;

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/providers", async (_req, res) => {
  try {
    const snapshot = await loadConfiguration();
    const baseProviders = Object.entries(snapshot.document["proxy-providers"] || {}).map(
      ([name, info]) => toProviderPayload(name, info)
    );
    const providers = await enrichProvidersWithHealth(baseProviders);
    res.json({
      source: snapshot.source,
      providers,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "无法读取订阅配置" });
  }
});

app.post("/api/providers/:providerId/link", async (req, res) => {
  const { providerId } = req.params;
  const { newUrl, expiryMinutes, allowCreate } = req.body || {};

  if (!newUrl || typeof newUrl !== "string") {
    return res.status(400).json({ error: "新链接不能为空" });
  }

  try {
    const snapshot = await loadConfiguration();
    if (!snapshot.document["proxy-providers"] || typeof snapshot.document["proxy-providers"] !== "object") {
      snapshot.document["proxy-providers"] = {};
    }
    const providers = snapshot.document["proxy-providers"];

    const templateBlueprint = await getProviderTemplateBlueprint();
    let providerEntry = providers[providerId];
    if (!providerEntry) {
      if (!allowCreate) {
        return res.status(404).json({ error: "订阅源不存在" });
      }
      providerEntry = await buildProviderEntry(newUrl, expiryMinutes);
      providers[providerId] = providerEntry;
    } else {
      providerEntry.url = newUrl.trim();
      delete providerEntry["link-expiry"];
      delete providerEntry["link-expiry-seconds"];

      const intervalConfig = computeIntervalFromMinutes(expiryMinutes, templateBlueprint.interval);
      if (intervalConfig.apply) {
        if (intervalConfig.value === undefined) {
          delete providerEntry.interval;
        } else {
          providerEntry.interval = intervalConfig.value;
        }
      }
    }

    await writeUserConfiguration(snapshot.document);

    const refreshedBase = toProviderPayload(providerId, providerEntry);
    const [refreshed] = await enrichProvidersWithHealth([refreshedBase]);
    res.json({ provider: refreshed });
  } catch (err) {
    console.error(err);
    if (err?.statusCode === 400) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message || "保存失败" });
  }
});

app.post("/api/providers", async (req, res) => {
  const { name, url, expiryMinutes } = req.body || {};
  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "订阅名称不能为空" });
  }
  if (!url || typeof url !== "string" || !url.trim()) {
    return res.status(400).json({ error: "订阅链接不能为空" });
  }

  try {
    const snapshot = await loadConfiguration();
    if (!snapshot.document["proxy-providers"] || typeof snapshot.document["proxy-providers"] !== "object") {
      snapshot.document["proxy-providers"] = {};
    }
    const providers = snapshot.document["proxy-providers"];
    const trimmedName = name.trim();
    if (providers[trimmedName]) {
      return res.status(409).json({ error: "订阅名称已存在" });
    }

    const entry = await buildProviderEntry(url, expiryMinutes);

    providers[trimmedName] = entry;
    await writeUserConfiguration(snapshot.document);

    const [provider] = await enrichProvidersWithHealth([toProviderPayload(trimmedName, entry)]);
    res.status(201).json({ provider });
  } catch (err) {
    console.error(err);
    if (err?.statusCode === 400) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message || "新增失败" });
  }
});

app.delete("/api/providers/:providerId", async (req, res) => {
  const { providerId } = req.params;
  try {
    const snapshot = await loadConfiguration();
    const providers = snapshot.document["proxy-providers"];
    if (!providers || !providers[providerId]) {
      return res.status(404).json({ error: "订阅源不存在" });
    }

    delete providers[providerId];
    await writeUserConfiguration(snapshot.document);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "删除失败" });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: `未找到接口 ${req.path}` });
});

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});

async function loadConfiguration() {
  const userConfig = await loadYaml(USER_CONFIG_PATH);
  if (userConfig) {
    return { document: userConfig, source: "user" };
  }
  const templateConfig = await loadYaml(TEMPLATE_PATH);
  if (!templateConfig) {
    throw new Error("未找到可用的 YAML 配置");
  }
  return { document: templateConfig, source: "template" };
}

async function loadYaml(targetPath) {
  try {
    const contents = await fs.readFile(targetPath, "utf8");
    return YAML.parse(contents);
  } catch (err) {
    if (err.code === "ENOENT") {
      return null;
    }
    console.warn(`读取 ${targetPath} 失败:`, err.message);
    throw err;
  }
}

async function ensureUserConfigDirectory() {
  const directory = path.dirname(USER_CONFIG_PATH);
  await fs.mkdir(directory, { recursive: true });
}

async function writeUserConfiguration(document) {
  await ensureUserConfigDirectory();
  await fs.writeFile(USER_CONFIG_PATH, YAML.stringify(document), "utf8");
}

let providerTemplateCache = null;

async function getProviderTemplateBlueprint() {
  if (providerTemplateCache) {
    return providerTemplateCache;
  }
  const templateConfig = await loadYaml(TEMPLATE_PATH);
  const providers = templateConfig?.["proxy-providers"];
  if (!providers || Object.keys(providers).length === 0) {
    throw new Error("模板缺少 proxy-providers 参考项");
  }
  const firstKey = Object.keys(providers)[0];
  providerTemplateCache = deepClone(providers[firstKey]);
  return providerTemplateCache;
}

async function buildProviderEntry(url, expiryMinutes) {
  const blueprint = await getProviderTemplateBlueprint();
  const entry = deepClone(blueprint);
  entry.url = url.trim();
  const intervalConfig = computeIntervalFromMinutes(
    expiryMinutes ?? null,
    blueprint.interval
  );
  if (intervalConfig.apply) {
    if (intervalConfig.value === undefined) {
      delete entry.interval;
    } else {
      entry.interval = intervalConfig.value;
    }
  }
  return entry;
}

function computeIntervalFromMinutes(minutes, templateInterval) {
  if (minutes === undefined) {
    return { apply: false, value: undefined };
  }
  if (minutes === null || minutes === "") {
    return { apply: true, value: LONG_TERM_THRESHOLD_SECONDS };
  }
  const numeric = Number(minutes);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    throw createValidationError("有效期必须为正整数分钟或留空");
  }
  return { apply: true, value: Math.floor(numeric * 60) };
}

function createValidationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function deepClone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function toProviderPayload(name, info) {
  const resolvedExpiry = resolveExpiry(info);
  return {
    id: name,
    name,
    type: info.type || "http",
    url: info.url || "",
    interval: info.interval ?? null,
    expirySeconds: resolvedExpiry.seconds,
    expiryMinutes: resolvedExpiry.minutes,
    isLongTerm: resolvedExpiry.isLongTerm,
    expiryDisplay: resolvedExpiry.display,
    highlight: resolvedExpiry.highlight,
  };
}

function resolveExpiry(provider) {
  let seconds = null;
  if (typeof provider?.interval === "number" && Number.isFinite(provider.interval)) {
    seconds = provider.interval;
  } else {
    const policy = provider?.["link-expiry"];
    const explicitSeconds = provider?.["link-expiry-seconds"];
    const parsedPolicy = interpretExpiry(policy);
    if (parsedPolicy !== undefined && parsedPolicy.seconds != null) {
      seconds = parsedPolicy.seconds;
    } else {
      const parsedExplicit = interpretExpiry(explicitSeconds);
      if (parsedExplicit !== undefined && parsedExplicit.seconds != null) {
        seconds = parsedExplicit.seconds;
      }
    }
  }

  if (seconds != null && (!Number.isFinite(seconds) || seconds <= 0)) {
    seconds = null;
  }

  const isLongTerm = seconds != null && seconds >= LONG_TERM_THRESHOLD_SECONDS;
  const minutes =
    seconds == null
      ? null
      : isLongTerm
      ? LONG_TERM_MINUTES
      : Math.max(1, Math.round(seconds / SECONDS_PER_MINUTE));

  const display =
    seconds == null
      ? "遵循默认策略"
      : isLongTerm
      ? "长期有效 (≥30 天)"
      : `${minutes} 分钟`;

  return {
    seconds,
    minutes,
    display,
    isLongTerm,
    highlight: computeHighlightMinutes(minutes, isLongTerm),
  };
}

function interpretExpiry(value) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value === "string") {
    const lowered = value.trim().toLowerCase();
    if (!lowered) {
      return undefined;
    }
    if (["never", "none", "no-expiry", "infinite", "永久", "不限"].includes(lowered)) {
      return { seconds: null, minutes: null, display: "长期有效", highlight: null };
    }
    const numeric = Number(lowered);
    if (Number.isFinite(numeric)) {
      return normaliseSeconds(numeric);
    }
    return { seconds: null, minutes: null, display: `策略：${value}`, highlight: null };
  }

  if (typeof value === "number") {
    return normaliseSeconds(value);
  }

  return undefined;
}

function normaliseSeconds(value) {
  if (!Number.isFinite(value) || value <= 0) {
    return { seconds: null, minutes: null, display: "长期有效", highlight: null };
  }
  const seconds = Math.floor(value);
  const isLongTerm = seconds >= LONG_TERM_THRESHOLD_SECONDS;
  const minutes = isLongTerm
    ? LONG_TERM_MINUTES
    : Math.max(1, Math.round(seconds / SECONDS_PER_MINUTE));
  const display =
    isLongTerm && minutes === LONG_TERM_MINUTES
      ? "长期有效 (≥30 天)"
      : minutes >= 60
      ? `${Math.round(minutes / 60)} 小时`
      : `${minutes} 分钟`;
  return {
    seconds,
    minutes,
    display,
    isLongTerm,
    highlight: computeHighlightMinutes(minutes, isLongTerm),
  };
}

function computeHighlightMinutes(minutes, isLongTerm = false) {
  if (minutes == null || isLongTerm) {
    return null;
  }
  if (minutes <= 1) {
    return "danger";
  }
  if (minutes <= 5) {
    return "warning";
  }
  return null;
}

const SKIP_SUBSCRIPTION_CHECK = process.env.SKIP_SUBSCRIPTION_CHECK === "1";
const SUBSCRIPTION_CHECK_TIMEOUT = Number(process.env.SUBSCRIPTION_CHECK_TIMEOUT ?? 5000);
const SUBSCRIPTION_KEYWORD_PATTERN =
  /(proxies\s*:|proxy-groups\s*:|proxy-providers\s*:|^https?:\/\/|^(ss|ssr|vmess|vless|trojan|socks5|tuic|wireguard):)/im;

async function enrichProvidersWithHealth(providers) {
  if (providers.length === 0) {
    return providers;
  }
  if (SKIP_SUBSCRIPTION_CHECK) {
    return providers.map((provider) => ({ ...provider, isValid: null }));
  }
  const results = await Promise.allSettled(
    providers.map((provider) => detectSubscriptionHealth(provider.url))
  );
  return providers.map((provider, index) => ({
    ...provider,
    isValid: results[index].status === "fulfilled" ? results[index].value === true : false,
  }));
}

async function detectSubscriptionHealth(url) {
  if (!url) {
    return false;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SUBSCRIPTION_CHECK_TIMEOUT);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "ClashX.AutoSub/1.0",
        Accept: "application/octet-stream, text/plain, application/yaml, */*",
      },
    });
    if (!response.ok) {
      return false;
    }
    const text = await response.text();
    return isSubscriptionPayload(text);
  } catch (err) {
    console.warn(`校验订阅链接失败 (${url}):`, err?.message ?? err);
    return false;
  } finally {
    clearTimeout(timer);
  }
}

function isSubscriptionPayload(raw) {
  const trimmed = raw.trim();
  if (!trimmed) {
    return false;
  }
  if (looksLikeClashContent(trimmed)) {
    return true;
  }
  if (looksLikeBase64(trimmed)) {
    try {
      const decoded = Buffer.from(trimmed.replace(/\s+/g, ""), "base64").toString("utf8");
      return looksLikeClashContent(decoded);
    } catch (err) {
      return false;
    }
  }
  return false;
}

function looksLikeClashContent(text) {
  return SUBSCRIPTION_KEYWORD_PATTERN.test(text);
}

function looksLikeBase64(text) {
  const compact = text.replace(/[\r\n\s]+/g, "");
  if (!compact || compact.length < 16 || compact.length % 4 !== 0) {
    return false;
  }
  if (!/^[A-Za-z0-9+/=]+$/.test(compact)) {
    return false;
  }
  return true;
}
