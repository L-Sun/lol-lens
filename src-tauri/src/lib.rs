mod commands;
mod utils;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let handle = app.handle();
            let cert = utils::load_root_cert()?;
            let _ = rustls::crypto::aws_lc_rs::default_provider().install_default();
            handle.plugin(utils::ws_plugin(&cert)?)?;
            handle.plugin(utils::http_plugin(&cert)?)?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            crate::commands::get_lcu_port_token,
            crate::commands::is_lol_running,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
