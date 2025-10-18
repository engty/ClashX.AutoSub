const operations = [];

export function recordOperation(op) {
  operations.push(op);
}

export function getOperations() {
  return [...operations];
}

export function resetOperations() {
  operations.length = 0;
}
