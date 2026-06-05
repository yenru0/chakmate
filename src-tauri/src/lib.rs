#[tauri::command]
fn validate_scan_path(path: String) -> bool {
  std::path::Path::new(&path).is_dir()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_store::Builder::new().build())
    .plugin(tauri_plugin_log::Builder::default().build())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .invoke_handler(tauri::generate_handler![validate_scan_path])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}