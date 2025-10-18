use clashx_autosub::models::template::{FusionMetric, FusionStatus};
use clashx_autosub::services::subscription_service;

#[test]
fn fusion_records_latency_and_allows_rollback() {
    let metrics = vec![
        FusionMetric {
            node: "Tokyo-1".into(),
            latency: 120,
            provider_id: "providerA".into(),
            status: FusionStatus::Success,
        },
        FusionMetric {
            node: "Tokyo-2".into(),
            latency: 60,
            provider_id: "providerB".into(),
            status: FusionStatus::Success,
        },
    ];

    let result = subscription_service::record_fusion("Japan", metrics).expect("record fusion");
    let best = result.best.expect("best node available");
    assert_eq!(best.node, "Tokyo-2");

    let history = subscription_service::fusion_history();
    assert_eq!(history.len(), 1);
    assert_eq!(history[0].region, "Japan");

    subscription_service::rollback_fusion("Japan");
    assert!(subscription_service::fusion_history().is_empty());
}
