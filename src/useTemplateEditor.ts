import { updateProviderLink } from "./services/subscriptionAPI";
import { saveTemplateSnapshot } from "./services/templateAPI";

export async function replaceLinks(providerId: string, url: string) {
  await updateProviderLink({ providerId, newUrl: url });
  await saveTemplateSnapshot({ snapshotName: providerId });
}
