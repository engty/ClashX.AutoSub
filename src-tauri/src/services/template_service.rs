use crate::models::template::{
    FusionMetric, FusionStatus, FusionTestResult, TemplateSnapshot,
};
use crate::services::audit_log_service;
use once_cell::sync::Lazy;
use serde_json::Value;
use serde_yaml;
use std::collections::BTreeMap;
use std::sync::Mutex;
use thiserror::Error;
use uuid::Uuid;

#[derive(Debug)]
pub struct TemplateUpdate {
    pub updated_yaml: String,
    pub changed_paths: Vec<String>,
    pub snapshot_id: String,
}

#[derive(Error, Debug)]
pub enum TemplateError {
    #[error("模板中未找到订阅源 `{0}`")]
    ProviderNotFound(String),
    #[error("模板 YAML 解析失败: {0}")]
    ParseError(#[from] serde_yaml::Error),
    #[error("订阅源 `{0}` 缺少 url 字段")]
    ProviderMissingUrl(String),
    #[error("融合测试数据为空")]
    EmptyFusionMetrics,
}

static FUSION_RESULTS: Lazy<Mutex<Vec<FusionTestResult>>> = Lazy::new(|| Mutex::new(Vec::new()));

pub fn replace_subscription_links(
    template_yaml: &str,
    provider_id: &str,
    new_url: &str,
) -> Result<TemplateUpdate, TemplateError> {
    let mut document: Value = serde_yaml::from_str(template_yaml)?;
    let mut changed_paths = Vec::new();

    let providers = document
        .get_mut("proxy-providers")
        .and_then(Value::as_object_mut)
        .ok_or_else(|| TemplateError::ProviderNotFound(provider_id.to_string()))?;

    let provider = providers
        .get_mut(provider_id)
        .and_then(Value::as_object_mut)
        .ok_or_else(|| TemplateError::ProviderNotFound(provider_id.to_string()))?;

    let url_entry = provider
        .get_mut("url")
        .ok_or_else(|| TemplateError::ProviderMissingUrl(provider_id.to_string()))?;

    if url_entry.as_str() != Some(new_url) {
        *url_entry = Value::String(new_url.to_string());
        changed_paths.push(format!("proxy-providers.{provider_id}.url"));
    }

    let updated_yaml = serde_yaml::to_string(&document)?;
    let snapshot_id = Uuid::new_v4().to_string();

    Ok(TemplateUpdate {
        updated_yaml,
        changed_paths,
        snapshot_id,
    })
}

pub fn perform_dry_run(template_yaml: &str) -> Result<(), TemplateError> {
    let _: Value = serde_yaml::from_str(template_yaml)?;
    Ok(())
}

pub fn persist_snapshot(update: &TemplateUpdate) -> TemplateSnapshot {
    audit_log_service::append_entry();
    TemplateSnapshot {
        id: update.snapshot_id.clone(),
        diff_paths: update.changed_paths.clone(),
    }
}

pub fn compute_diff(original: &Value, updated: &Value) -> BTreeMap<String, Value> {
    let mut diff = BTreeMap::new();
    compute_diff_recursive("", original, updated, &mut diff);
    diff
}

fn compute_diff_recursive(
    path: &str,
    original: &Value,
    updated: &Value,
    diff: &mut BTreeMap<String, Value>,
) {
    if original == updated {
        return;
    }

    match (original, updated) {
        (Value::Object(orig_map), Value::Object(updated_map)) => {
            for (key, updated_value) in updated_map {
                let next_path = if path.is_empty() {
                    key.to_string()
                } else {
                    format!("{path}.{key}")
                };

                match orig_map.get(key) {
                    Some(orig_value) => {
                        compute_diff_recursive(&next_path, orig_value, updated_value, diff)
                    }
                    None => {
                        diff.insert(next_path, updated_value.clone());
                    }
                }
            }
        }
        _ => {
            diff.insert(path.to_string(), updated.clone());
        }
    }
}

pub fn record_fusion_metrics(
    region: &str,
    metrics: Vec<FusionMetric>,
) -> Result<FusionTestResult, TemplateError> {
    if metrics.is_empty() {
        return Err(TemplateError::EmptyFusionMetrics);
    }

    let mut sorted = metrics;
    sorted.sort_by_key(|metric| metric.latency);
    let best = sorted
        .iter()
        .find(|metric| matches!(metric.status, FusionStatus::Success))
        .cloned();

    let result = FusionTestResult {
        region: region.to_string(),
        metrics: sorted.clone(),
        best,
    };

    if let Ok(mut history) = FUSION_RESULTS.lock() {
        history.push(result.clone());
    }

    audit_log_service::append_entry();
    Ok(result)
}

pub fn get_fusion_results() -> Vec<FusionTestResult> {
    FUSION_RESULTS
        .lock()
        .map(|history| history.clone())
        .unwrap_or_default()
}

pub fn rollback_fusion(region: &str) -> Option<FusionTestResult> {
    if let Ok(mut history) = FUSION_RESULTS.lock() {
        if let Some(index) = history.iter().rposition(|entry| entry.region == region) {
            return Some(history.remove(index));
        }
    }
    None
}
