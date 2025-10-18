const operations: string[] = [];

export function recordOperation(op: string): void {
  operations.push(op);
}

export function getOperations(): readonly string[] {
  return operations;
}

export function resetOperations(): void {
  operations.length = 0;
}
