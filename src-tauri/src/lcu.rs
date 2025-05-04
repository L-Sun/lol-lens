use anyhow::Result;
use shaco::rest::RESTClient;
use std::sync::Arc;
use std::time::Duration;
use tokio::sync::RwLock;
use tokio::task::JoinHandle;

pub struct Lcu {
    pub client: Arc<RwLock<Option<RESTClient>>>,
    listen_handle: Option<JoinHandle<Result<()>>>,
    retry_interval: Duration,
}

impl Lcu {
    pub fn new(retry_interval: Duration) -> Self {
        let mut result = Self {
            client: Arc::new(RwLock::new(None)),
            listen_handle: None,
            retry_interval,
        };
        result.listen();
        result
    }

    pub fn listen(&mut self) {
        if self.listen_handle.is_some() {
            return;
        }

        let client_clone = self.client.clone();
        let retry_interval = self.retry_interval;
        let listen_handle = tokio::spawn(async move {
            let update_connection = async |connect: bool| -> Result<()> {
                let mut guard = client_clone.write().await;
                *guard = if connect {
                    Some(
                        RESTClient::new(Some(get_lcu_port_token()?))
                            .map_err(|_| anyhow::anyhow!("Failed to create lcu client"))?,
                    )
                } else {
                    None
                };
                Ok(())
            };
            let mut prev_running = false;
            loop {
                let curr_running = lol_running();
                if !prev_running && curr_running {
                    update_connection(true).await?;
                } else if prev_running && !curr_running {
                    update_connection(true).await?;
                }
                prev_running = curr_running;
                tokio::time::sleep(retry_interval).await;
            }
        });
        self.listen_handle = Some(listen_handle);
    }
}

impl Default for Lcu {
    fn default() -> Self {
        Self::new(Duration::from_secs(1))
    }
}

impl Drop for Lcu {
    fn drop(&mut self) {
        if let Some(listen_handle) = &self.listen_handle {
            listen_handle.abort();
        }
    }
}

fn lol_running() -> bool {
    use sysinfo::System;

    let sys = System::new_all();
    sys.processes()
        .iter()
        .any(|(_, p)| p.name() == "LeagueClientUx.exe")
}

fn get_lcu_port_token() -> Result<shaco::model::auth::AuthInfo> {
    use base64::{engine::general_purpose, Engine};
    use regex::Regex;
    use std::{os::windows::ffi::OsStrExt, str::FromStr};

    let tmp_path = std::env::temp_dir().join("lol_command.txt");

    unsafe {
        use windows_sys::{w, Win32::UI::Shell::ShellExecuteW};

        let command = std::ffi::OsString::from_str(&format!(
            r#"-NoExit -Command "Get-WmiObject -Query 'SELECT CommandLine FROM Win32_Process WHERE Name=''LeagueClientUx.exe''' | Format-List CommandLine | Out-File -Width 9999 -Encoding UTF8 -FilePath '{}'""#,
            tmp_path.display()
        ))?;

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
            return Err(anyhow::anyhow!("Failed to execute command"));
        }
    }

    let command_info = std::fs::read_to_string(&tmp_path)?;
    std::fs::remove_file(&tmp_path)?;

    let port = Regex::new(r#"--app-port=(\d+)"#)?
        .captures(&command_info)
        .unwrap()
        .get(1)
        .unwrap()
        .as_str()
        .to_string();

    let auth_token = Regex::new(r#"--remoting-auth-token=(\w+)"#)?
        .captures(&command_info)
        .unwrap()
        .get(1)
        .unwrap()
        .as_str()
        .to_string();

    let token = general_purpose::STANDARD.encode(format!("riot:{}", auth_token));

    Ok(shaco::model::auth::AuthInfo { port, token })
}

#[cfg(test)]
mod test {
    use super::*;
    #[test]
    fn test_get_lcu_port_token() {
        let auth_info = get_lcu_port_token().unwrap();
        println!("app_port: {}", auth_info.port);
        println!("remoting_auth_token: {}", auth_info.token);
        assert_ne!(auth_info.port, "");
        assert_ne!(auth_info.token, "");
    }

    #[tokio::test]
    async fn lcu_client_listen() {
        let mut lcu = Lcu::default();
        lcu.listen();
        tokio::time::sleep(Duration::from_secs(10)).await;
        assert!(lcu.client.read().await.is_some());
    }
}
