import { validateTemplateYaml } from "../services/templateAPI";

export async function useYamlValidation(yaml: string): Promise<void> {
  await validateTemplateYaml(yaml);
}
