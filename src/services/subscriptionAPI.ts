export interface UpdateLinksPayload {
  readonly providerId: string;
  readonly newUrl: string;
}

import { recordOperation } from "../state/templateOperations";

export async function updateProviderLink(payload: UpdateLinksPayload): Promise<{ providerId: string; newUrl: string }> {
  recordOperation(`update:${payload.providerId}:${payload.newUrl}`);
  // 真实环境下这里会调用 Tauri invoke，例如：
  // await invoke("subscription_update_links", { ...payload });
  return payload;
}
