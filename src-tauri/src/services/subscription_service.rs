use crate::services::template_service::{self, TemplateError, TemplateUpdate};

pub fn update_link(
    template_yaml: &str,
    provider_id: &str,
    new_url: &str,
) -> Result<TemplateUpdate, TemplateError> {
    template_service::replace_subscription_links(template_yaml, provider_id, new_url)
}
