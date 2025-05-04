mod commands;
mod lcu;

use lcu::Lcu;
use tauri::Manager;

struct AppData {
    lcu: Lcu,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            app.manage(AppData {
                lcu: Lcu::default(),
            });
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            crate::commands::invoke_lcu_api_command
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
