import { useEffect, useState } from "react";

const LONG_TERM_MINUTES = 60 * 24 * 30;

function deriveMinutesInput(source, isNew) {
  if (source.expiryMinutes != null) {
    return String(source.expiryMinutes);
  }
  if (source.isLongTerm) {
    return String(LONG_TERM_MINUTES);
  }
  return isNew ? "" : String(LONG_TERM_MINUTES);
}

const HIGHLIGHT_LABEL = {
  danger: "即将过期 (≤ 1 分钟)",
  warning: "即将过期 (≤ 5 分钟)",
};

export default function ProviderCard({ provider, onSave, onDelete, isNew = false }) {
  const [nameInput, setNameInput] = useState(provider.name ?? "");
  const [draftUrl, setDraftUrl] = useState(provider.url ?? "");
  const [minutesInput, setMinutesInput] = useState(deriveMinutesInput(provider, isNew));
  const [longTerm, setLongTerm] = useState(
    isNew
      ? false
      : provider.isLongTerm ??
        (provider.expiryMinutes != null && Number(provider.expiryMinutes) >= LONG_TERM_MINUTES)
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isOpen, setIsOpen] = useState(isNew);

  useEffect(() => {
    setDraftUrl(provider.url ?? "");
    setMinutesInput(deriveMinutesInput(provider, isNew));
    setNameInput(provider.name ?? "");
    setLongTerm(
      isNew
        ? false
        : provider.isLongTerm ??
            (provider.expiryMinutes != null && Number(provider.expiryMinutes) >= LONG_TERM_MINUTES)
    );
    setMessage("");
    setIsOpen(isNew);
  }, [isNew, provider.expiryMinutes, provider.isLongTerm, provider.name, provider.url]);

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
      if (!draftUrl.trim()) {
        throw new Error("订阅链接不能为空");
      }

      let minutesValue;
      const trimmedMinutes = minutesInput.trim();
      if (longTerm) {
        minutesValue = LONG_TERM_MINUTES;
      } else if (trimmedMinutes) {
        const numeric = Number(trimmedMinutes);
        if (!Number.isFinite(numeric) || numeric <= 0) {
          throw new Error("有效期必须为正整数分钟或留空");
        }
        minutesValue = Math.floor(numeric);
      } else {
        throw new Error("请填写有效期（分钟）或勾选长期有效");
      }

      if (isNew) {
        if (!nameInput.trim()) {
          throw new Error("订阅名称不能为空");
        }
        await onSave({
          name: nameInput.trim(),
          url: draftUrl.trim(),
          expiryMinutes: minutesValue,
        });
        setMessage("订阅已创建");
      } else {
        await onSave({
          newUrl: draftUrl.trim(),
          expiryMinutes: minutesValue,
        });
        setMessage("已保存修改");
      }
    } catch (err) {
      setMessage(err.message || "保存失败");
    } finally {
      setSaving(false);
    }
  }

  async function handleCopy() {
    try {
      if (!draftUrl) {
        throw new Error("暂无可复制的订阅链接");
      }
      await navigator.clipboard.writeText(draftUrl);
      setMessage("链接已复制");
    } catch (err) {
      console.error("复制订阅链接失败", err);
      setMessage(err.message || "复制失败，请手动复制");
    }
  }

  async function handleDelete() {
    const confirmMessage = isNew
      ? "确定要取消这个新的订阅吗？"
      : `确定要删除订阅源「${provider.name}」吗？此操作不可恢复。`;
    if (!window.confirm(confirmMessage)) {
      return;
    }
    try {
      setSaving(true);
      await onDelete();
    } catch (err) {
      setMessage(err.message || "删除失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={`provider-card ${provider.highlight ?? ""} ${isOpen ? "open" : "closed"}`}>
      <div className="card-header">
        <div className="card-heading">
          {isNew ? (
            <input
              type="text"
              className="name-input"
              value={nameInput}
              onChange={(event) => setNameInput(event.target.value)}
              onFocus={(event) => event.stopPropagation()}
              placeholder="订阅名称"
            />
          ) : (
            <h2>{provider.name}</h2>
          )}
          <span className={`tag ${statusClass}`}>{statusLabel}</span>
        </div>
        <div className="card-meta">
          {highlightLabel && <span className="tag danger-tag">{highlightLabel}</span>}
          <button
            type="button"
            className="card-toggle"
            onClick={() => setIsOpen((value) => !value)}
            aria-expanded={isOpen}
            aria-label={isOpen ? "收起" : "展开"}
          >
            <span className={`chevron ${isOpen ? "chevron-open" : ""}`} aria-hidden="true">
              ▾
            </span>
          </button>
        </div>
      </div>
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
                value={minutesInput}
                disabled={longTerm}
                onChange={(event) => setMinutesInput(event.target.value)}
                placeholder="有效期（单位分钟，留空不修改）"
              />
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={longTerm}
                  onChange={(event) => {
                    const checked = event.target.checked;
                    setLongTerm(checked);
                    if (checked) {
                      setMinutesInput(String(LONG_TERM_MINUTES));
                    } else if (minutesInput === String(LONG_TERM_MINUTES)) {
                      setMinutesInput("");
                    }
                  }}
                />
                <span className="checkbox-label">长期有效</span>
              </label>
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" disabled={saving}>
              {saving ? "保存中..." : "保存"}
            </button>
            <button
              type="button"
              className="danger-button"
              onClick={handleDelete}
              disabled={saving}
            >
              删除
            </button>
            <span className="form-message">{message}</span>
          </div>
        </form>
      )}
    </section>
  );
}
