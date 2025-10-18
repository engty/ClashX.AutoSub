import { recordOperation } from "../state/templateOperations.js";

export async function updateProviderLink(payload) {
  recordOperation(`update:${payload.providerId}:${payload.newUrl}`);
  return payload;
}

export function fetchLinkExpiry(providerId) {
  if (linkExpiryOverrides.has(providerId)) {
    return linkExpiryOverrides.get(providerId);
  }
  recordOperation(`expiry:${providerId}`);
  return null;
}

const linkExpiryOverrides = new Map();
export function setLinkExpiryForTest(providerId, seconds) {
  linkExpiryOverrides.set(providerId, seconds);
}
export function resetLinkExpiryOverrides() {
  linkExpiryOverrides.clear();
}
