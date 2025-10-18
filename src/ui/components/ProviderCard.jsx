import { useEffect, useMemo, useState } from "react";

const HIGHLIGHT_LABEL = {
  danger: "即将失效 (≤ 60 秒)",
  warning: "即将过期 (≤ 5 分钟)",
};

export default function ProviderCard({ provider, onUpdate }) {
  const [draftUrl, setDraftUrl] = useState(provider.url);
  const [secondsInput, setSecondsInput] = useState(
    provider.expirySeconds != null ? String(provider.expirySeconds) : ""
  );
  const [longTerm, setLongTerm] = useState(provider.expirySeconds == null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setDraftUrl(provider.url);
    setSecondsInput(provider.expirySeconds != null ? String(provider.expirySeconds) : "");
    setLongTerm(provider.expirySeconds == null);
    setMessage("");
  }, [provider.id, provider.url, provider.expirySeconds]);

  const highlightLabel = provider.highlight ? HIGHLIGHT_LABEL[provider.highlight] : "";

  const expiryDescription = useMemo(() => {
    if (longTerm) {
      return "长期有效";
    }
    if (provider.expirySeconds == null) {
      return provider.expiryDisplay || "遵循模板设置";
    }
    if (provider.expirySeconds < 60) {
      return `${provider.expirySeconds} 秒 (建议立即刷新)`;
    }
    if (provider.expirySeconds < 3600) {
      return `${Math.round(provider.expirySeconds / 60)} 分钟`;
    }
    return `${Math.round(provider.expirySeconds / 3600)} 小时`;
  }, [longTerm, provider.expirySeconds, provider.expiryDisplay]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const payload = { newUrl: draftUrl };
      if (longTerm) {
        payload.expiryPolicy = "never";
      } else if (secondsInput.trim()) {
        const numeric = Number(secondsInput.trim());
        if (!Number.isFinite(numeric) || numeric <= 0) {
          throw new Error("有效期必须为正整数或留空");
        }
        payload.expirySeconds = Math.floor(numeric);
      }
      await onUpdate(provider.id, payload);
      setMessage("已保存修改");
    } catch (err) {
      setMessage(err.message || "保存失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={`provider-card ${provider.highlight ?? ""}`}>
      <header>
        <h2>{provider.name}</h2>
        <span className="tag">{provider.type || "http"}</span>
      </header>
      <dl className="provider-meta">
        <div>
          <dt>当前链接</dt>
          <dd>{provider.url}</dd>
        </div>
        <div>
          <dt>有效期策略</dt>
          <dd>
            {expiryDescription}
            {highlightLabel && <span className="tag danger-tag">{highlightLabel}</span>}
          </dd>
        </div>
        {provider.interval != null && (
          <div>
            <dt>刷新间隔</dt>
            <dd>{provider.interval} 秒</dd>
          </div>
        )}
      </dl>
      <form onSubmit={handleSubmit} className="provider-form">
        <label>
          新链接
          <input
            type="url"
            required
            value={draftUrl}
            onChange={(event) => setDraftUrl(event.target.value)}
            placeholder="https://example.com/subscribe"
          />
        </label>
        <label className="expiry-row">
          <span>设置有效期 (秒，可选)</span>
          <div className="expiry-inputs">
            <input
              type="number"
              min="1"
              step="1"
              value={longTerm ? "" : secondsInput}
              disabled={longTerm}
              onChange={(event) => setSecondsInput(event.target.value)}
              placeholder="留空表示保持原策略"
            />
            <label className="checkbox">
              <input
                type="checkbox"
                checked={longTerm}
                onChange={(event) => setLongTerm(event.target.checked)}
              />
              设为长期有效
            </label>
          </div>
        </label>
        <div className="form-actions">
          <button type="submit" disabled={saving}>
            {saving ? "保存中..." : "保存"}
          </button>
          <span className="form-message">{message}</span>
        </div>
      </form>
    </section>
  );
}
