export interface AuditLogEntry {
  readonly id: string;
  readonly message: string;
  readonly createdAt: string;
}

const entries: AuditLogEntry[] = [];

export async function fetchAuditLog(): Promise<readonly AuditLogEntry[]> {
  return [...entries];
}

export async function appendAuditLog(entry: AuditLogEntry): Promise<void> {
  entries.unshift(entry);
  if (entries.length > 10) {
    entries.length = 10;
  }
}

export function resetAuditLog(): void {
  entries.length = 0;
}
