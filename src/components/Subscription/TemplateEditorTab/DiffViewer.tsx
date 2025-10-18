import YAML from "yaml";

export interface DiffViewerView {
  readonly paths: string[];
}

export function createDiffViewer(updatedYaml: string, predefinedPaths: string[]): DiffViewerView {
  if (predefinedPaths.length > 0) {
    return { paths: [...predefinedPaths] };
  }

  // 默认行为：比较更新后的 YAML 与其自身，返回空 diff。
  YAML.parse(updatedYaml);
  return { paths: [] };
}
