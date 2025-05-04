use crate::AppData;

#[tauri::command]
pub async fn invoke_lcu_api_command(
    state: tauri::State<'_, AppData>,
    method: &str,
    endpoint: &str,
) -> Result<serde_json::Value, String> {
    let guard = state.lcu.client.read().await;

    if let Some(client) = &*guard {
        match method {
            "get" => {
                let response = client.get(endpoint).await.map_err(|e| e.to_string())?;
                Ok(response)
            }
            _ => Err("Invalid method".to_string()),
        }
    } else {
        Err("Lcu client not connected".to_string())
    }
}
