#[tauri::command]
pub async fn get_lcu_port_token() -> Result<serde_json::Value, String> {
    use base64::{engine::general_purpose, Engine};
    use regex::Regex;
    use std::{os::windows::ffi::OsStrExt, str::FromStr};

    let tmp_path = std::env::temp_dir().join("lol_command.txt");

    unsafe {
        use windows_sys::{w, Win32::UI::Shell::ShellExecuteW};

        let command = std::ffi::OsString::from_str(&format!(
            r#"-NoExit -Command "Get-WmiObject -Query 'SELECT CommandLine FROM Win32_Process WHERE Name=''LeagueClientUx.exe''' | Format-List CommandLine | Out-File -Width 9999 -Encoding UTF8 -FilePath '{}'""#,
            tmp_path.display()
        )).map_err(|e| e.to_string())?;

        // convert command to ptr
        let command = command
            .encode_wide()
            .chain(std::iter::once(0))
            .collect::<Vec<_>>();

        let result = ShellExecuteW(
            std::ptr::null_mut(),
            w!("runas"),
            w!("powershell.exe"),
            command.as_ptr(),
            std::ptr::null_mut(),
            0,
        );

        if result as i32 <= 32 {
            return Err("Failed to execute command".to_string());
        }
    }

    let command_info = std::fs::read_to_string(&tmp_path).unwrap();
    std::fs::remove_file(&tmp_path).unwrap();

    let port = Regex::new(r#""--app-port=(\d+)""#)
        .unwrap()
        .captures(&command_info)
        .unwrap()
        .get(1)
        .unwrap()
        .as_str();

    let auth_token = Regex::new(r#""--remoting-auth-token=([^\s]+)""#)
        .unwrap()
        .captures(&command_info)
        .unwrap()
        .get(1)
        .unwrap()
        .as_str();

    let token = general_purpose::STANDARD.encode(format!("riot:{}", auth_token));

    Ok(serde_json::json!({
        "port": port,
        "token": token,
    }))
}

#[tauri::command]
pub fn is_lol_running() -> bool {
    use sysinfo::System;

    let sys = System::new_all();
    sys.processes()
        .iter()
        .any(|(_, p)| p.name() == "LeagueClientUx.exe")
}
