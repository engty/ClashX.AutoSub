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
