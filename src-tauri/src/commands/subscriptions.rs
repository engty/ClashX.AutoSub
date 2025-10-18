use serde_yaml::Value;
use std::fs;
use std::path::Path;

const USER_CONFIG_PATH: &str = "yaml/user-config.yaml";
const TEMPLATE_PATH: &str = "yaml/template.yaml";

pub fn link_expiry_seconds(provider_id: &str) -> u32 {
    resolve_expiry(provider_id).unwrap_or(0)
}

fn resolve_expiry(provider_id: &str) -> Option<u32> {
    let document = load_configuration()?;
    let providers = document.get("proxy-providers")?.as_mapping()?;
    let provider = providers.get(&Value::String(provider_id.to_string()))?.as_mapping()?;

    let explicit_expiry = provider
        .get(&Value::String("link-expiry-seconds".to_string()))
        .and_then(parse_seconds);
    if explicit_expiry.is_some() {
        return explicit_expiry;
    }

    let policy_expiry = provider
        .get(&Value::String("link-expiry".to_string()))
        .and_then(parse_policy);
    if policy_expiry.is_some() {
        return policy_expiry;
    }

    provider
        .get(&Value::String("interval".to_string()))
        .and_then(parse_seconds)
}

fn load_configuration() -> Option<Value> {
    load_yaml(USER_CONFIG_PATH).or_else(|| load_yaml(TEMPLATE_PATH))
}

fn load_yaml(path: &str) -> Option<Value> {
    let file_path = Path::new(path);
    if !file_path.exists() {
        return None;
    }
    let contents = fs::read_to_string(file_path).ok()?;
    serde_yaml::from_str(&contents).ok()
}

fn parse_seconds(value: &Value) -> Option<u32> {
    match value {
        Value::Number(num) => num
            .as_u64()
            .or_else(|| num.as_i64().and_then(|v| if v >= 0 { Some(v as u64) } else { None }))
            .and_then(|val| if val == 0 { None } else { u32::try_from(val).ok() }),
        Value::String(text) => {
            let trimmed = text.trim();
            if trimmed.is_empty() {
                return None;
            }
            let lowered = trimmed.to_lowercase();
            if matches!(
                lowered.as_str(),
                "never" | "none" | "no-expiry" | "infinite" | "永久" | "不限"
            ) {
                return None;
            }
            trimmed
                .parse::<u64>()
                .ok()
                .filter(|val| *val > 0)
                .and_then(|val| u32::try_from(val).ok())
        }
        _ => None,
    }
}

fn parse_policy(value: &Value) -> Option<u32> {
    match value {
        Value::String(text) => parse_seconds(&Value::String(text.clone())),
        other => parse_seconds(other),
    }
}
