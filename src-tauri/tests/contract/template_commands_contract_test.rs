use clashx_autosub::services::template_service;

const SAMPLE_YAML: &str = r#"
proxy-providers:
  providerA:
    url: https://old.example.com
    type: http
  providerB:
    url: https://stay.example.com
    type: http
rules:
  - MATCH,providerA
"#;

#[test]
fn save_template_returns_snapshot_id_and_diff_restricted_to_links() {
    let update = template_service::replace_subscription_links(
        SAMPLE_YAML,
        "providerA",
        "https://new.example.com",
    )
    .expect("link replacement should succeed");

    assert_eq!(
        update.changed_paths,
        vec!["proxy-providers.providerA.url"]
    );
    assert!(
        !update.snapshot_id.is_empty(),
        "snapshot id should be generated"
    );

    let snapshot = template_service::persist_snapshot(&update);
    assert_eq!(
        snapshot.diff_paths,
        vec!["proxy-providers.providerA.url"]
    );
}
