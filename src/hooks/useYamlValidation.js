import { validateTemplateYaml } from "../services/templateAPI.js";

export async function useYamlValidation(yaml) {
  await validateTemplateYaml(yaml);
}
