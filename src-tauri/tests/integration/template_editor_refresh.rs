use clashx_autosub::services::template_service;
use serde_yaml::Value;

const SAMPLE_YAML: &str = r#"
proxy-providers:
  providerA:
    url: https://old.example.com
    type: http
    interval: 3600
  providerB:
    url: https://stay.example.com
    type: http
rules:
  - MATCH,providerA
"#;

#[test]
fn refresh_preserves_non_link_fields() {
    let updated = template_service::replace_subscription_links(
        SAMPLE_YAML,
        "providerA",
        "https://fresh.example.com",
    )
    .expect("link replacement should succeed");

    let original: Value = serde_yaml::from_str(SAMPLE_YAML).expect("original yaml valid");
    let refreshed: Value =
        serde_yaml::from_str(&updated.updated_yaml).expect("updated yaml valid");

    assert_eq!(
        refreshed["proxy-providers"]["providerA"]["url"],
        Value::String("https://fresh.example.com".into())
    );
    assert_eq!(
        original["proxy-providers"]["providerA"]["type"],
        refreshed["proxy-providers"]["providerA"]["type"],
        "non-url fields should remain unchanged"
    );
    assert_eq!(
        original["rules"],
        refreshed["rules"],
        "rules must be preserved"
    );
}
