#[derive(Debug)]
pub struct ProxyProvider {
    pub name: String,
    pub url: String,
}

#[derive(Debug, Clone)]
pub struct TemplateSnapshot {
    pub id: String,
    pub diff_paths: Vec<String>,
}

#[derive(Debug, Clone)]
pub enum FusionStatus {
    Success,
    Failure(String),
}

#[derive(Debug, Clone)]
pub struct FusionMetric {
    pub node: String,
    pub latency: u32,
    pub provider_id: String,
    pub status: FusionStatus,
}

#[derive(Debug, Clone)]
pub struct FusionTestResult {
    pub region: String,
    pub metrics: Vec<FusionMetric>,
    pub best: Option<FusionMetric>,
}
