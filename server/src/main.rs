use local_ip_address::local_ip;
use qrcodegen::QrCode;
use qrcodegen::QrCodeEcc;
use rdev::{simulate, Button, EventType, SimulateError};
use serde::Deserialize;
use std::convert::Infallible;
use std::net::SocketAddr;
use warp::ws::{Message, WebSocket};
use warp::Filter;

#[tokio::main]
async fn main() {
    // Get local IP address
    let ip = local_ip().expect("Failed to get local IP");
    let port = 3030;
    let addr = SocketAddr::new(ip, port);
    let url = format!("http://{}:{}", ip, port);

    // Generate QR code SVG
    let qr = QrCode::encode_text(&url, QrCodeEcc::Low).unwrap();
    let svg = qr.to_svg_string(4);

    // Route for QR code
    let qr_route = warp::path("qr").map(move || warp::reply::html(svg.clone()));

    // Route for static files (client will be served from /client)
    let static_route = warp::fs::dir("../client/dist");

    // WebSocket route for mouse control
    let ws_route = warp::path("ws")
        .and(warp::ws())
        .map(|ws: warp::ws::Ws| ws.on_upgrade(handle_ws));

    let routes = qr_route.or(ws_route).or(static_route);
    #[derive(Deserialize, Debug)]
    #[serde(tag = "type")]
    enum MouseAction {
        #[serde(rename = "move")]
        Move { x: i32, y: i32 },
        #[serde(rename = "click")]
        Click { button: String },
    }

    async fn handle_ws(ws: WebSocket) {
        let (mut tx, mut rx) = ws.split();

        while let Some(Ok(msg)) = rx.next().await {
            if let Ok(text) = msg.to_str() {
                if let Ok(action) = serde_json::from_str::<MouseAction>(text) {
                    match action {
                        MouseAction::Move { x, y } => {
                            if let Err(e) = simulate(EventType::MouseMove {
                                x: x as f64,
                                y: y as f64,
                            }) {
                                eprintln!("Failed to move mouse: {:?}", e);
                            }
                        }
                        MouseAction::Click { button } => {
                            let btn = match button.as_str() {
                                "left" => Button::Left,
                                "right" => Button::Right,
                                "middle" => Button::Middle,
                                _ => {
                                    eprintln!("Unknown button: {}", button);
                                    continue;
                                }
                            };
                            if let Err(e) = simulate(EventType::ButtonPress(btn)) {
                                eprintln!("Failed to press button: {:?}", e);
                            }
                            if let Err(e) = simulate(EventType::ButtonRelease(btn)) {
                                eprintln!("Failed to release button: {:?}", e);
                            }
                        }
                    }
                }
            }
        }
    }

    println!("Server running at {}", url);
    println!("Scan the QR code at {}/qr", url);

    // Restrict server access to local network clients
    let local_routes = routes.with(warp::filters::addr::remote().and_then(
        |remote_addr: Option<SocketAddr>| async move {
            if let Some(addr) = remote_addr {
                if addr.ip().is_private() {
                    Ok::<_, warp::Rejection>(())
                } else {
                    Err(warp::reject::custom(warp::reject::Forbidden))
                }
            } else {
                Err(warp::reject::custom(warp::reject::Forbidden))
            }
        },
    ));

    // Start the server with restricted access
    warp::serve(local_routes).run(addr).await;
}
