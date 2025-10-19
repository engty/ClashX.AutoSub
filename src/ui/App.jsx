import { useCallback, useEffect, useState } from "react";
import ProviderCard from "./components/ProviderCard.jsx";

const STATUS_VISIBILITY_MS = 4000;

export default function App() {
  const [providers, setProviders] = useState([]);
  const [draftProviders, setDraftProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const loadProviders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/providers");
      if (!response.ok) {
        throw new Error(`获取订阅信息失败: ${response.status}`);
      }
      const payload = await response.json();
      setProviders(payload.providers ?? []);
    } catch (err) {
      console.error(err);
      setError(err.message || "无法加载订阅信息");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProviders();
  }, [loadProviders]);

  useEffect(() => {
    if (!statusMessage) {
      return undefined;
    }
    const timer = setTimeout(() => setStatusMessage(""), STATUS_VISIBILITY_MS);
    return () => clearTimeout(timer);
  }, [statusMessage]);

  const handleUpdate = async (providerId, payload) => {
    setError("");
    try {
      const response = await fetch(`/api/providers/${encodeURIComponent(providerId)}/link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const failure = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(failure.error || "保存失败");
      }
      const updated = await response.json();
      setProviders((current) =>
        current.map((item) => (item.id === updated.provider.id ? updated.provider : item))
      );
      setStatusMessage(`订阅源 ${providerId} 已更新，正在重新检测...`);
      await loadProviders();
      setStatusMessage(`订阅源 ${providerId} 已更新并完成检测`);
    } catch (err) {
      console.error(err);
      setError(err.message || "更新失败");
      throw err;
    }
  };

  const handleCreate = async (draftId, payload) => {
    setError("");
    try {
      const response = await fetch(`/api/providers/${encodeURIComponent(payload.name)}/link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newUrl: payload.url,
          expiryMinutes: payload.expiryMinutes,
          allowCreate: true,
        }),
      });
      if (!response.ok) {
        const failure = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(failure.error || "新增失败");
      }
      setStatusMessage(`订阅源 ${payload.name} 已创建，正在检测...`);
      await loadProviders();
      setStatusMessage(`订阅源 ${payload.name} 已创建并完成检测`);
      setDraftProviders((current) => current.filter((item) => item.id !== draftId));
    } catch (err) {
      console.error(err);
      setError(err.message || "新增失败");
      throw err;
    }
  };

  const handleDelete = async (providerId) => {
    setError("");
    try {
      const response = await fetch(`/api/providers/${encodeURIComponent(providerId)}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const failure = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(failure.error || "删除失败");
      }
      setStatusMessage(`订阅源 ${providerId} 已删除`);
      await loadProviders();
    } catch (err) {
      console.error(err);
      setError(err.message || "删除失败");
      throw err;
    }
  };

  const handleDiscardDraft = (draftId) => {
    setDraftProviders((current) => current.filter((item) => item.id !== draftId));
  };

  const handleAddDraft = () => {
    setDraftProviders((current) => [
      ...current,
      {
        id: `__draft_${Date.now()}`,
        name: "",
        url: "",
        expiryMinutes: null,
        isLongTerm: false,
        highlight: null,
        isValid: null,
      },
    ]);
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>ClashX AutoSub 订阅配置</h1>
        <div className="header-actions">
          {statusMessage && <span className="status-message">{statusMessage}</span>}
          <button
            type="button"
            className={`refresh-button${loading ? " is-loading" : ""}`}
            onClick={loadProviders}
            disabled={loading}
            aria-label={loading ? "加载中..." : "刷新数据"}
            title={loading ? "加载中..." : "刷新数据"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12 17q-1.825 0-3.187-1.137T7.1 13h1.55q.325 1.1 1.238 1.8t2.112.7q1.45 0 2.475-1.025T15.5 12t-1.025-2.475T12 8.5q-.725 0-1.35.263t-1.1.737H11V11H7V7h1.5v1.425q.675-.65 1.575-1.037T12 7q2.075 0 3.538 1.463T17 12t-1.463 3.538T12 17m-7 4q-.825 0-1.412-.587T3 19v-4h2v4h4v2zm10 0v-2h4v-4h2v4q0 .825-.587 1.413T19 21zM3 9V5q0-.825.588-1.412T5 3h4v2H5v4zm16 0V5h-4V3h4q.825 0 1.413.588T21 5v4z"
              />
            </svg>
          </button>
        </div>
        {error && <div className="error-banner">{error}</div>}
      </header>
      <main>
        {loading && <p className="info">正在读取订阅配置...</p>}
        {!loading && providers.length === 0 && draftProviders.length === 0 && (
          <p className="info">尚未配置订阅源，请在用户配置中添加 `proxy-providers`。</p>
        )}
        <div className="provider-grid">
          {providers.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              onSave={(payload) => handleUpdate(provider.id, payload)}
              onDelete={() => handleDelete(provider.id)}
            />
          ))}
          {draftProviders.map((draft) => (
            <ProviderCard
              key={draft.id}
              provider={draft}
              isNew
              onSave={(payload) => handleCreate(draft.id, payload)}
              onDelete={() => handleDiscardDraft(draft.id)}
            />
          ))}
          <button type="button" className="add-provider-button" onClick={handleAddDraft}>
            +
          </button>
        </div>
      </main>
    </div>
  );
}
