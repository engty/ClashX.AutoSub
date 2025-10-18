const entries = [];

export async function fetchAuditLog() {
  return [...entries];
}

export async function appendAuditLog(entry) {
  entries.unshift(entry);
  if (entries.length > 10) {
    entries.length = 10;
  }
}

export function resetAuditLog() {
  entries.length = 0;
}
