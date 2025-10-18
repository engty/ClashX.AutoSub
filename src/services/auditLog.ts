export interface AuditLogEntry {
  readonly id: string;
  readonly message: string;
  readonly createdAt: string;
}

export async function fetchAuditLog(): Promise<never> {
  throw new Error("TODO: bridge to template.get_logs Tauri command");
}

export async function appendAuditLog(_entry: AuditLogEntry): Promise<never> {
  throw new Error("TODO: log template editor activity");
}
