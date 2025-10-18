#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[tauri::command]
fn app_health_check() -> &'static str {
    "ok"
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![app_health_check])
        .run(tauri::generate_context!())
        .expect("运行 Tauri 应用失败");
}
