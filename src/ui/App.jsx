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
          <button type="button" onClick={loadProviders} disabled={loading}>
            {loading ? "加载中..." : "刷新数据"}
          </button>
          {statusMessage && <span className="status-message">{statusMessage}</span>}
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
