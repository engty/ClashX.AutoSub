use once_cell::sync::Lazy;
use std::sync::Mutex;
use std::time::{SystemTime, UNIX_EPOCH};

static AUDIT_LOG: Lazy<Mutex<Vec<String>>> = Lazy::new(|| Mutex::new(Vec::new()));

pub fn fetch_entries() -> Vec<String> {
    AUDIT_LOG
        .lock()
        .map(|entries| entries.clone())
        .unwrap_or_default()
}

pub fn append_entry() {
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or_default();
    if let Ok(mut entries) = AUDIT_LOG.lock() {
        entries.push(format!("snapshot recorded at {timestamp}"));
    }
}

#[cfg(test)]
pub fn reset() {
    if let Ok(mut entries) = AUDIT_LOG.lock() {
        entries.clear();
    }
}
