export function cloneTemplate(template) {
  return JSON.parse(JSON.stringify(template));
}

export function stringifyTemplate(template) {
  return JSON.stringify(template, null, 2);
}

export function parseTemplate(serialized) {
  if (!serialized.trim()) {
    return {};
  }
  return JSON.parse(serialized);
}
