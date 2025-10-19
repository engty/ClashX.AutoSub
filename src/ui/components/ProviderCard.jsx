import { useEffect, useState } from "react";

const HIGHLIGHT_LABEL = {
  danger: "即将过期 (≤ 1 分钟)",
  warning: "即将过期 (≤ 5 分钟)",
};

export default function ProviderCard({ provider, onUpdate }) {
  const [draftUrl, setDraftUrl] = useState(provider.url);
  const [minutesInput, setMinutesInput] = useState(
    provider.expiryMinutes != null ? String(provider.expiryMinutes) : ""
  );
  const [longTerm, setLongTerm] = useState(provider.expiryMinutes == null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setDraftUrl(provider.url);
    setMinutesInput(provider.expiryMinutes != null ? String(provider.expiryMinutes) : "");
    setLongTerm(provider.expiryMinutes == null);
    setMessage("");
    setIsOpen(false);
  }, [provider.id, provider.url, provider.expirySeconds]);

  useEffect(() => {
    if (!message) {
      return undefined;
    }
    const timer = setTimeout(() => setMessage(""), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  const highlightLabel = provider.highlight ? HIGHLIGHT_LABEL[provider.highlight] : "";
  const statusClass =
    provider.isValid === false ? "tag-invalid" : provider.isValid === true ? "tag-valid" : "tag-neutral";
  const statusLabel =
    provider.isValid === false ? "无效" : provider.isValid === true ? "有效" : "检测中";

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const payload = { newUrl: draftUrl };
      if (longTerm) {
        payload.expiryPolicy = "never";
      } else if (minutesInput.trim()) {
        const numeric = Number(minutesInput.trim());
        if (!Number.isFinite(numeric) || numeric <= 0) {
          throw new Error("有效期必须为正整数分钟或留空");
        }
        payload.expirySeconds = Math.floor(numeric * 60);
      }
      await onUpdate(provider.id, payload);
    } catch (err) {
      setMessage(err.message || "保存失败");
    } finally {
      setSaving(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(draftUrl);
      setMessage("链接已复制");
    } catch (err) {
      console.error("复制订阅链接失败", err);
      setMessage("复制失败，请手动复制");
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
          <span className={`tag ${statusClass}`}>{statusLabel}</span>
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
            <div className="link-input-row">
              <input
                type="url"
                required
                value={draftUrl}
                onChange={(event) => setDraftUrl(event.target.value)}
                placeholder="https://example.com/subscribe"
                className="new-link-input"
              />
              <button
                type="button"
                className="copy-button"
                onClick={handleCopy}
                aria-label="复制订阅链接"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  role="img"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    d="M9 3a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v6a4 4 0 0 1-4 4h-6a4 4 0 0 1-4-4V3zm4-2a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-6zM3 11a4 4 0 0 1 4-4h2v2H7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2h2v2a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-6z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>
          </label>
          <div className="expiry-row">
            <div className="expiry-inputs">
              <input
                type="number"
                min="1"
                step="1"
                value={longTerm ? "" : minutesInput}
                disabled={longTerm}
                onChange={(event) => setMinutesInput(event.target.value)}
                placeholder="有效期（单位分钟，留空不修改）"
              />
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={longTerm}
                  onChange={(event) => setLongTerm(event.target.checked)}
                />
                <span className="checkbox-label">长期有效</span>
              </label>
            </div>
          </div>
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
