import { getFusionHistoryFromApi, getTemplateLogs } from "../services/templateAPI.js";

export async function useSnapshots() {
  return {
    logs: await getTemplateLogs(),
    fusion: await getFusionHistoryFromApi(),
  };
}
