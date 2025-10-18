use crate::models::template::{FusionMetric, FusionTestResult};
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

pub fn record_fusion(
    region: &str,
    metrics: Vec<FusionMetric>,
) -> Result<FusionTestResult, TemplateError> {
    template_service::record_fusion_metrics(region, metrics)
}

pub fn fusion_history() -> Vec<FusionTestResult> {
    template_service::get_fusion_results()
}

pub fn rollback_fusion(region: &str) -> Option<FusionTestResult> {
    template_service::rollback_fusion(region)
}

pub fn export_template(template_yaml: &str, password: &str) -> String {
    template_service::export_template(template_yaml, password)
}

pub fn import_template(encrypted: &str, password: &str) -> Result<String, TemplateError> {
    template_service::import_template(encrypted, password)
}
