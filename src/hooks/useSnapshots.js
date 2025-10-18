import { fetchAuditLog } from "../services/auditLog.js";

export async function useSnapshots() {
  return fetchAuditLog();
}
