import { fetchAuditLog } from "../services/auditLog";

export async function useSnapshots() {
  return await fetchAuditLog();
}
