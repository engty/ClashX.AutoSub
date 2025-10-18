use crate::services::{
    audit_log_service,
    subscription_service,
    template_service::{self, TemplateError},
};

pub fn validate_yaml(contents: &str) -> Result<(), TemplateError> {
    template_service::perform_dry_run(contents)
}

pub fn save_snapshot(
    template_yaml: &str,
    provider_id: &str,
    new_url: &str,
) -> Result<crate::models::template::TemplateSnapshot, TemplateError> {
    let update = subscription_service::update_link(template_yaml, provider_id, new_url)?;
    Ok(template_service::persist_snapshot(&update))
}

pub fn get_logs() -> Vec<String> {
    audit_log_service::fetch_entries()
}
