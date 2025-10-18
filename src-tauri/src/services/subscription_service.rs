use crate::models::template::{FusionMetric, FusionTestResult};
use crate::services::template_service::{self, TemplateError, TemplateUpdate};

pub fn update_link(
    template_yaml: &str,
    provider_id: &str,
    new_url: &str,
) -> Result<TemplateUpdate, TemplateError> {
    template_service::replace_subscription_links(template_yaml, provider_id, new_url)
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
