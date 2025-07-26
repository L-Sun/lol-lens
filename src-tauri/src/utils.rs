use anyhow::Result;
use rustls::{
    pki_types::{pem::PemObject, CertificateDer},
    ClientConfig, RootCertStore,
};
use std::sync::Arc;
use tauri::{plugin::TauriPlugin, Runtime};
use tokio_tungstenite::Connector;

pub fn load_root_cert() -> Result<CertificateDer<'static>> {
    let pem = include_bytes!("../riotgames.pem");
    let cert = CertificateDer::from_pem_slice(pem)?;
    Ok(cert)
}

pub fn ws_plugin<R: Runtime>(cert: &CertificateDer) -> Result<TauriPlugin<R>> {
    let mut root_store = RootCertStore::empty();
    root_store.add(cert.clone())?;

    let config = Arc::new(
        ClientConfig::builder()
            .with_root_certificates(root_store)
            .with_no_client_auth(),
    );

    Ok(tauri_plugin_websocket::Builder::new()
        .tls_connector(Connector::Rustls(config))
        .build())
}

pub fn http_plugin<R: Runtime>(cert: &CertificateDer) -> Result<TauriPlugin<R>> {
    Ok(tauri_plugin_http::init(Some(
        reqwest::Certificate::from_der(&cert)?,
    )))
}
