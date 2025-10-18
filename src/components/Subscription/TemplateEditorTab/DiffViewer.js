export function createDiffViewer(updatedYaml, predefinedPaths = []) {
  if (predefinedPaths.length > 0) {
    return { paths: [...predefinedPaths] };
  }

  try {
    JSON.parse(updatedYaml);
  } catch (_err) {
    return { paths: ["invalid-template"] };
  }

  return { paths: [] };
}
