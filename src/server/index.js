import express from "express";
import fs from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";

const app = express();
const PORT = Number(process.env.PORT || 3001);

const USER_CONFIG_PATH = path.resolve("yaml/user-config.yaml");
const TEMPLATE_PATH = path.resolve("yaml/template.yaml");

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/providers", async (_req, res) => {
  try {
    const snapshot = await loadConfiguration();
    const providers = Object.entries(snapshot.document["proxy-providers"] || {}).map(
      ([name, info]) => toProviderPayload(name, info)
    );
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
  const { newUrl, expirySeconds, expiryPolicy } = req.body || {};

  if (!newUrl || typeof newUrl !== "string") {
    return res.status(400).json({ error: "新链接不能为空" });
  }

  try {
    const snapshot = await loadConfiguration();
    const providers = snapshot.document["proxy-providers"];
    if (!providers || !providers[providerId]) {
      return res.status(404).json({ error: "订阅源不存在" });
    }

    providers[providerId].url = newUrl.trim();

    if (expiryPolicy === "never") {
      delete providers[providerId]["link-expiry-seconds"];
      providers[providerId]["link-expiry"] = "never";
    } else if (expirySeconds !== undefined) {
      if (expirySeconds === null || expirySeconds === "") {
        delete providers[providerId]["link-expiry-seconds"];
      } else {
        const numeric = Number(expirySeconds);
        if (!Number.isFinite(numeric) || numeric <= 0) {
          return res.status(400).json({ error: "有效期必须为正整数" });
        }
        providers[providerId]["link-expiry-seconds"] = Math.floor(numeric);
        delete providers[providerId]["link-expiry"];
      }
    }

    await ensureUserConfigDirectory();
    await fs.writeFile(USER_CONFIG_PATH, YAML.stringify(snapshot.document), "utf8");

    const refreshed = toProviderPayload(providerId, providers[providerId]);
    res.json({ provider: refreshed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "保存失败" });
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

function toProviderPayload(name, info) {
  const resolvedExpiry = resolveExpiry(info);
  return {
    id: name,
    name,
    type: info.type || "http",
    url: info.url || "",
    interval: info.interval ?? null,
    expirySeconds: resolvedExpiry.seconds,
    expiryDisplay: resolvedExpiry.display,
    highlight: resolvedExpiry.highlight,
  };
}

function resolveExpiry(provider) {
  const policy = provider?.["link-expiry"];
  const explicitSeconds = provider?.["link-expiry-seconds"];
  const interval = provider?.interval;

  const parsedPolicy = interpretExpiry(policy);
  if (parsedPolicy !== undefined) {
    return parsedPolicy;
  }

  const parsedExplicit = interpretExpiry(explicitSeconds);
  if (parsedExplicit !== undefined) {
    return parsedExplicit;
  }

  const parsedInterval = interpretExpiry(interval);
  if (parsedInterval !== undefined) {
    return parsedInterval;
  }

  return { seconds: null, display: "遵循默认策略", highlight: null };
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
      return { seconds: null, display: "长期有效", highlight: null };
    }
    const numeric = Number(lowered);
    if (Number.isFinite(numeric)) {
      return normaliseSeconds(numeric);
    }
    return { seconds: null, display: `策略：${value}`, highlight: null };
  }

  if (typeof value === "number") {
    return normaliseSeconds(value);
  }

  return undefined;
}

function normaliseSeconds(value) {
  if (!Number.isFinite(value) || value <= 0) {
    return { seconds: null, display: "长期有效", highlight: null };
  }
  const seconds = Math.floor(value);
  return {
    seconds,
    display: `${seconds} 秒`,
    highlight: computeHighlight(seconds),
  };
}

function computeHighlight(seconds) {
  if (seconds == null) {
    return null;
  }
  if (seconds <= 60) {
    return "danger";
  }
  if (seconds <= 300) {
    return "warning";
  }
  return null;
}
