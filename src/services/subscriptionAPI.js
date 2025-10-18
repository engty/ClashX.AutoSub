import { recordOperation } from "../state/templateOperations.js";

export async function updateProviderLink(payload) {
  recordOperation(`update:${payload.providerId}:${payload.newUrl}`);
  return payload;
}
