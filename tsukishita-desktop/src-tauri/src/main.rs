#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod data;
mod server;

use std::net::TcpStream;
use std::sync::Arc;
use std::time::Duration;
use tauri::Manager;

fn wait_for_server() -> bool {
    for _ in 0..30 {
        std::thread::sleep(Duration::from_millis(300));
        if TcpStream::connect_timeout(
            &"127.0.0.1:4173".parse().unwrap(),
            Duration::from_millis(200),
        )
        .is_ok()
        {
            return true;
        }
    }
    false
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // Already running? Reuse existing server
            if TcpStream::connect_timeout(
                &"127.0.0.1:4173".parse().unwrap(),
                Duration::from_millis(100),
            )
            .is_ok()
            {
                return Ok(());
            }

            let resource_dir = app
                .path()
                .resource_dir()
                .expect("failed to resolve resource dir");

            // Use app data dir for persistent data (writable, survives updates)
            let data_dir = app
                .path()
                .app_data_dir()
                .unwrap_or_else(|_| resource_dir.clone());

            let accounts_dir = data_dir.join("accounts");
            let static_dir = resource_dir;

            let state = Arc::new(server::AppState {
                accounts_dir,
                static_dir,
            });

            let router = server::router(state);

            std::thread::spawn(move || {
                let rt = tokio::runtime::Runtime::new()
                    .expect("failed to create tokio runtime");

                rt.block_on(async {
                    let listener = tokio::net::TcpListener::bind("127.0.0.1:4173")
                        .await
                        .expect("failed to bind port 4173");

                    println!("月下祓行 listening on http://127.0.0.1:4173/");

                    axum::serve(listener, router)
                        .await
                        .expect("server error");
                });
            });

            wait_for_server();

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
