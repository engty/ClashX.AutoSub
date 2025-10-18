import { exportTemplate, importTemplate } from "../../../hooks/useTemplateEditor.js";

export function createImportExportControls() {
  return {
    async exportTemplate(password) {
      if (!password) throw new Error("导出需要口令");
      return exportTemplate(password);
    },
    async importTemplate(password, encrypted) {
      if (!password) throw new Error("导入需要口令");
      await importTemplate(password, encrypted);
    },
  };
}
