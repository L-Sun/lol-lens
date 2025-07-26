fn main() {
    if !cfg!(debug_assertions) {
        let mut windows = tauri_build::WindowsAttributes::new();
        windows = windows.app_manifest(include_str!("manifest.xml"));
        let attr = tauri_build::Attributes::new().windows_attributes(windows);
        tauri_build::try_build(attr).expect("failed to build")
    } else {
        tauri_build::build()
    }
}
