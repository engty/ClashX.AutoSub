use clashx_autosub::services::template_service;

const SAMPLE_YAML: &str = "proxy-providers:\n  providerA:\n    url: https://example.com\n";

#[test]
fn export_and_import_roundtrip() {
    let password = "123456";
    let token = template_service::export_template(SAMPLE_YAML, password);
    let restored = template_service::import_template(&token, password).expect("import");
    assert_eq!(restored, SAMPLE_YAML);
}

#[test]
fn import_with_wrong_password_fails() {
    let password = "secret";
    let token = template_service::export_template(SAMPLE_YAML, password);
    let result = template_service::import_template(&token, "wrong");
    assert!(result.is_err());
}
