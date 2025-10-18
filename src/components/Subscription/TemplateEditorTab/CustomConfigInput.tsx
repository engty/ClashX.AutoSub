import YAML from "yaml";
import { applyCustomYaml } from "../../../hooks/useTemplateEditor";

export interface CustomConfigInputOptions {
  hasAdvancedPermission: boolean;
}

export interface CustomConfigInputView {
  readonly readonly: boolean;
  format(yaml: string): Promise<string>;
}

export function createCustomConfigInput(options: CustomConfigInputOptions): CustomConfigInputView {
  return {
    readonly: !options.hasAdvancedPermission,
    async format(yaml: string): Promise<string> {
      if (!options.hasAdvancedPermission) {
        throw new Error("暂无权限编辑自定义 YAML");
      }
      const formatted = YAML.stringify(YAML.parse(yaml));
      await applyCustomYaml(formatted);
      return formatted;
    },
  };
}
