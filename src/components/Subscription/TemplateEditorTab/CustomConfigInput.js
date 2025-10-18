import { applyCustomYaml, getTemplateState } from "../../../hooks/useTemplateEditor.js";

export function createCustomConfigInput(options) {
  return {
    readonly: !options.hasAdvancedPermission,
    async format(serialized) {
      if (!options.hasAdvancedPermission) {
        throw new Error("暂无权限编辑自定义 YAML");
      }
      await applyCustomYaml(serialized);
      return getTemplateState().templateYaml;
    },
  };
}
