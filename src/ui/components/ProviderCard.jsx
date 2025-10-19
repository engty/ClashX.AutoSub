import { useEffect, useState } from "react";

const HIGHLIGHT_LABEL = {
  danger: "已失效",
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
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setDraftUrl(provider.url);
    setSecondsInput(provider.expirySeconds != null ? String(provider.expirySeconds) : "");
    setLongTerm(provider.expirySeconds == null);
    setMessage("");
    setIsOpen(false);
  }, [provider.id, provider.url, provider.expirySeconds]);

  const highlightLabel = provider.highlight ? HIGHLIGHT_LABEL[provider.highlight] : "";

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
    } catch (err) {
      setMessage(err.message || "保存失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      className={`provider-card ${provider.highlight ?? ""} ${isOpen ? "open" : "closed"}`}
    >
      <button
        type="button"
        className="card-toggle"
        onClick={() => setIsOpen((value) => !value)}
        aria-expanded={isOpen}
      >
        <div className="card-heading">
          <h2>{provider.name}</h2>
          <span className="tag">{provider.type || "http"}</span>
        </div>
        <div className="card-meta">
          {highlightLabel && <span className="tag danger-tag">{highlightLabel}</span>}
          <span className={`chevron ${isOpen ? "chevron-open" : ""}`} aria-hidden="true">
            ▾
          </span>
        </div>
      </button>
      {isOpen && (
        <form onSubmit={handleSubmit} className="provider-form">
          <label>
            订阅链接
            <input
              type="url"
              required
              value={draftUrl}
              onChange={(event) => setDraftUrl(event.target.value)}
              placeholder="https://example.com/subscribe"
              className="new-link-input"
            />
          </label>
          <label className="expiry-row">
            <div className="expiry-inputs">
              <input
                type="number"
                min="1"
                step="1"
                value={longTerm ? "" : secondsInput}
                disabled={longTerm}
                onChange={(event) => setSecondsInput(event.target.value)}
                placeholder="有效期（单位秒，留空不修改）"
              />
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={longTerm}
                  onChange={(event) => setLongTerm(event.target.checked)}
                />
              </label>长期有效
            </div>
          </label>
          <div className="form-actions">
            <button type="submit" disabled={saving}>
              {saving ? "保存中..." : "保存"}
            </button>
            <span className="form-message">{message}</span>
          </div>
        </form>
      )}
    </section>
  );
}
