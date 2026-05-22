use crate::data;
use axum::{
    body::Body,
    extract::{Path, State},
    http::{header, StatusCode},
    response::{IntoResponse, Response},
    routing::{delete, get, post},
    Router,
};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::Arc;
use tokio::fs;

// ─────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Account {
    pub id: String,
    pub name: String,
    #[serde(rename = "pathRank")]
    pub path_rank: String,
    pub experience: u32,
    pub coins: u32,
    pub gold: u32,
    pub hp: f64,
    #[serde(rename = "chestState")]
    pub chest_state: ChestState,
    #[serde(rename = "shopState")]
    pub shop_state: ShopState,
    #[serde(rename = "graveState")]
    pub grave_state: GraveState,
    pub inventory: HashMap<String, Value>,
    pub equipment: HashMap<String, Option<String>>,
    #[serde(rename = "最後座標")]
    pub last_position: Option<Value>,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    #[serde(rename = "updatedAt")]
    pub updated_at: String,
    pub records: Vec<Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChestState {
    #[serde(rename = "dayKey")]
    pub day_key: String,
    pub opened: Vec<String>,
    #[serde(rename = "fieldLoot")]
    pub field_loot: Vec<Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ShopState {
    #[serde(rename = "dayKey")]
    pub day_key: String,
    pub purchases: HashMap<String, u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GraveState {
    pub unlocked: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AccountSummary {
    pub id: String,
    pub name: String,
    #[serde(rename = "pathRank")]
    pub path_rank: String,
    pub experience: u32,
    pub coins: u32,
    #[serde(rename = "最後座標")]
    pub last_position: Option<Value>,
    #[serde(rename = "updatedAt")]
    pub updated_at: String,
    #[serde(rename = "recordsCount")]
    pub records_count: usize,
    #[serde(rename = "bestRank")]
    pub best_rank: Option<String>,
}

#[derive(Debug, Clone)]
pub struct AppState {
    pub accounts_dir: PathBuf,
    pub static_dir: PathBuf,
}

// ─────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────

const MAX_RECORDS: usize = 20;
const DONATION_COST: u32 = 50;
const RENAME_COST: u32 = 5;
const PLAYER_MAX_HP: f64 = 180.0;
const RESONANCE_MAX: u32 = 5;
const RESONANCE_COPY_COST: u32 = 2;
const RESONANCE_COIN_BASE: u32 = 5;
const SHOP_INFINITE_ITEM_KEY: &str = "pureIncenseCandle";
const SHOP_INFINITE_ITEM_PRICE: u32 = 25;
const SHOP_DAILY_ITEM_COUNT: usize = 10;
const CHEST_DAILY_COUNT: usize = 20;
const COIN_REWARD_BASE: u32 = 12;
const COIN_REWARD_PER_RANK: u32 = 3;
const COIN_REWARD_PER_MEMORY: u32 = 2;
const COIN_REWARD_DEFEAT: u32 = 3;

// ─────────────────────────────────────────────────────
// Router
// ─────────────────────────────────────────────────────

pub fn router(state: Arc<AppState>) -> Router {
    Router::new()
        .route("/api/ping", get(|| async { "pong" }))
        .route("/api/accounts", get(list_accounts).post(create_account))
        .route("/api/accounts/:id", get(get_account).delete(delete_account))
        .route("/api/debug", get(debug_state))
        .route("/api/accounts/:id/location", post(save_location))
        .route("/api/accounts/:id/rename", post(rename_account))
        .route("/api/accounts/:id/equipment", post(equip_item))
        .route("/api/accounts/:id/records", post(save_record))
        .route("/api/accounts/:id/donation", post(donation))
        .route("/api/accounts/:id/shop", get(get_shop))
        .route("/api/accounts/:id/shop-buy", post(shop_buy))
        .route("/api/accounts/:id/chests-open", post(open_chest))
        .route("/api/accounts/:id/field-loot-collect", post(collect_loot))
        .route("/api/accounts/:id/resonance", post(resonance))
        .route("/api/accounts/:id/resonance-transform", post(resonance_transform))
        .route("/api/accounts/:id/inventory-lock", post(inventory_lock))
        .route("/api/accounts/:id/blacksmith-smelt", post(blacksmith_smelt))
        .route("/api/accounts/:id/clear-records", post(clear_records))
        .route("/api/accounts/:id/grave-bond", post(grave_bond))
        .route("/api/accounts/:id/resonance-all", post(resonance_all))
        .route("/api/accounts/:id/resonance-transform-all", post(resonance_transform_all))
        .route("/api/audio/zone-bgm", get(zone_bgm))
        .fallback(serve_static)
        .with_state(state)
}

async fn serve_static(
    State(state): State<Arc<AppState>>,
    req: axum::http::Request<Body>,
) -> Response {
    let path = req.uri().path().trim_start_matches('/');
    let file_path = if path.is_empty() {
        state.static_dir.join("index.html")
    } else {
        state.static_dir.join(path)
    };
    match fs::read(&file_path).await {
        Ok(data) => {
            let mime = mime_for(&file_path);
            Response::builder()
                .status(StatusCode::OK)
                .header(header::CONTENT_TYPE, mime)
                .header(header::CACHE_CONTROL, "no-store")
                .body(Body::from(data))
                .unwrap()
        }
        Err(_) => json_response(StatusCode::NOT_FOUND, &json!({"error":"Not found"})),
    }
}

fn mime_for(path: &PathBuf) -> &'static str {
    match path.extension().and_then(|e| e.to_str()) {
        Some("html") => "text/html; charset=utf-8",
        Some("css") => "text/css; charset=utf-8",
        Some("js") => "text/javascript; charset=utf-8",
        Some("json") => "application/json; charset=utf-8",
        Some("png") => "image/png",
        Some("flac") => "audio/flac",
        Some("mp3") => "audio/mpeg",
        Some("ogg") => "audio/ogg",
        Some("wav") => "audio/wav",
        Some("aif") | Some("aiff") | Some("aifc") => "audio/aiff",
        Some("m4a") => "audio/mp4",
        _ => "application/octet-stream",
    }
}

// ─────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────

fn json_response<T: Serialize>(status: StatusCode, data: &T) -> Response {
    Response::builder()
        .status(status)
        .header(header::CONTENT_TYPE, "application/json; charset=utf-8")
        .header("Access-Control-Allow-Origin", "*")
        .header("Access-Control-Allow-Headers", "Content-Type")
        .header("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS")
        .body(Body::from(serde_json::to_string(data).unwrap_or_default()))
        .unwrap()
}

fn json_ok<T: Serialize>(data: &T) -> Response {
    json_response(StatusCode::OK, data)
}

fn json_created<T: Serialize>(data: &T) -> Response {
    json_response(StatusCode::CREATED, data)
}

fn json_err(status: StatusCode, msg: &str) -> Response {
    json_response(status, &json!({"error": msg}))
}

async fn read_account(state: &AppState, id: &str) -> Option<Account> {
    let path = state.accounts_dir.join(format!("{}.json", id));
    let data = fs::read_to_string(&path).await.ok()?;
    match serde_json::from_str::<Account>(&data) {
        Ok(acc) => Some(acc),
        Err(e) => {
            eprintln!("read_account error for {}: {}", id, e);
            None
        }
    }
}

async fn write_account(state: &AppState, account: &Account) -> Result<Account, String> {
    fs::create_dir_all(&state.accounts_dir).await.map_err(|e| e.to_string())?;
    let path = state.accounts_dir.join(format!("{}.json", account.id));
    let json = serde_json::to_string_pretty(account).map_err(|e| e.to_string())?;
    fs::write(&path, json).await.map_err(|e| e.to_string())?;
    Ok(account.clone())
}

fn normalize_name(name: &str) -> String {
    name.trim().replace(char::is_whitespace, " ").chars().take(24).collect()
}

fn account_id_for(name: &str) -> String {
    use sha2::{Digest, Sha256};
    let key = normalize_name(name).to_lowercase();
    let hash = Sha256::digest(key.as_bytes());
    format!("account-{}", hex::encode(&hash[..8]))
}

// Simple hex encoding (avoid extra crate)
mod hex {
    pub fn encode(bytes: &[u8]) -> String {
        bytes.iter().map(|b| format!("{:02x}", b)).collect()
    }
}

fn clean_name(name: &str) -> String {
    normalize_name(name)
}

fn same_name(a: &str, b: &str) -> bool {
    clean_name(a).to_lowercase() == clean_name(b).to_lowercase()
}

fn rank_index(rank: &str) -> usize {
    data::progression()
        .path_requirements
        .iter()
        .position(|r| r.label == rank)
        .unwrap_or(0)
}

fn player_max_hp(inventory: &HashMap<String, Value>, equipment: &HashMap<String, Option<String>>) -> f64 {
    let prayer_key = equipment.get("prayer").and_then(|v| v.as_deref()).unwrap_or("");
    let items = data::items();
    let mut bonus = 0.0;
    if let Some(item) = items.item_map.get(prayer_key) {
        // Simplified: check for HP stats in resonance data
        bonus = 0.0; // Full resonance stat resolution would go here
        let _ = item;
    }
    PLAYER_MAX_HP + bonus
}

fn inventory_owned(entry: &Value) -> bool {
    if let Some(copies) = entry.get("copies").and_then(|c| c.as_array()) {
        return !copies.is_empty();
    }
    if let Some(qty) = entry.get("quantity").and_then(|q| q.as_u64()) {
        return qty > 0;
    }
    false
}

fn add_inventory_copy(inventory: &mut HashMap<String, Value>, key: &str, count: u32) {
    let items = data::items();
    let default = json!({"copies": [], "locked": false});
    let entry = inventory.entry(key.to_string()).or_insert_with(|| default.clone());
    if data::item_is_stackable(key) {
        let max = items.item_map.get(key).and_then(|i| if i.max > 0 { Some(i.max) } else { None }).unwrap_or(99);
        let qty = entry.get("quantity").and_then(|q| q.as_u64()).unwrap_or(0) as u32;
        entry["quantity"] = json!(std::cmp::min(max, qty + count));
    } else {
        let copies = entry["copies"].as_array_mut().unwrap();
        for _ in 0..count {
            copies.push(json!({"level": 0, "locked": false}));
        }
    }
}

fn remove_inventory_copy(inventory: &mut HashMap<String, Value>, key: &str) -> bool {
    if data::item_is_stackable(key) {
        let entry = inventory.get_mut(key);
        if let Some(e) = entry {
            let qty = e.get("quantity").and_then(|q| q.as_u64()).unwrap_or(0) as u32;
            if qty > 0 && !e.get("locked").and_then(|l| l.as_bool()).unwrap_or(false) {
                e["quantity"] = json!(qty - 1);
                return true;
            }
        }
        return false;
    }
    let entry = inventory.get_mut(key);
    if let Some(e) = entry {
        let copies = e["copies"].as_array_mut().unwrap();
        if let Some(idx) = copies.iter().position(|c| !c.get("locked").and_then(|l| l.as_bool()).unwrap_or(false)) {
            copies.remove(idx);
            return true;
        }
    }
    false
}

// ─────────────────────────────────────────────────────
// Account CRUD
// ─────────────────────────────────────────────────────

async fn list_accounts(State(state): State<Arc<AppState>>) -> Response {
    let mut accounts = Vec::new();
    if let Ok(mut dir) = fs::read_dir(&state.accounts_dir).await {
        while let Ok(Some(entry)) = dir.next_entry().await {
            if let Some(name) = entry.file_name().to_str() {
                if name.ends_with(".json") {
                    if let Ok(data) = fs::read_to_string(entry.path()).await {
                        if let Ok(mut account) = serde_json::from_str::<Account>(&data) {
                            account = normalize_account(account);
                            accounts.push(AccountSummary {
                                id: account.id,
                                name: account.name,
                                path_rank: account.path_rank,
                                experience: account.experience,
                                coins: account.coins,
                                last_position: account.last_position,
                                updated_at: account.updated_at,
                                records_count: account.records.len(),
                                best_rank: best_record_rank(&account.records),
                            });
                        }
                    }
                }
            }
        }
    }
    accounts.sort_by(|a, b| b.updated_at.cmp(&a.updated_at));
    json_ok(&json!({"accounts": accounts}))
}

fn best_record_rank(records: &[Value]) -> Option<String> {
    records
        .iter()
        .filter_map(|r| r.get("rank").and_then(|v| v.as_str()).map(|s| s.to_string()))
        .next()
}

async fn create_account(State(state): State<Arc<AppState>>, body: String) -> Response {
    let body: Value = match serde_json::from_str(&body) {
        Ok(v) => v,
        Err(_) => return json_err(StatusCode::BAD_REQUEST, "Invalid JSON"),
    };
    let name = clean_name(body.get("name").and_then(|v| v.as_str()).unwrap_or(""));
    if name.is_empty() {
        return json_err(StatusCode::BAD_REQUEST, "Name is required");
    }

    // Check existing
    let existing_id = account_id_for(&name);
    if read_account(&state, &existing_id).await.is_some() {
        if let Some(account) = read_account(&state, &existing_id).await {
            return json_ok(&json!({"account": account, "existing": true}));
        }
    }

    let now = data::today_key();
    let default_inv = default_inventory();
    let id = existing_id;
    let account = Account {
        id: id.clone(),
        name: name.clone(),
        path_rank: "荒・初段".to_string(),
        experience: 0,
        coins: 0,
        gold: 0,
        hp: PLAYER_MAX_HP,
        chest_state: ChestState {
            day_key: now.clone(),
            opened: vec![],
            field_loot: vec![],
        },
        shop_state: ShopState {
            day_key: now.clone(),
            purchases: HashMap::new(),
        },
        grave_state: GraveState { unlocked: vec![] },
        inventory: default_inv,
        equipment: default_equipment(),
        last_position: None,
        created_at: now.clone(),
        updated_at: now.clone(),
        records: vec![],
    };
    let saved = write_account(&state, &account).await;
    match saved {
        Ok(a) => json_created(&json!({"account": a, "existing": false})),
        Err(e) => json_err(StatusCode::INTERNAL_SERVER_ERROR, &e),
    }
}

fn default_inventory() -> HashMap<String, Value> {
    let items = data::items();
    let mut inv = HashMap::new();
    for (key, default_val) in &items.inventory_default {
        if data::item_is_stackable(key) {
            let qty = default_val.get("quantity").and_then(|q| q.as_u64()).unwrap_or(0);
            inv.insert(key.clone(), json!({"quantity": qty, "locked": false}));
        } else {
            let copies: Vec<Value> = if let Some(arr) = default_val.get("copies").and_then(|c| c.as_array()) {
                arr.iter().map(|c| {
                    let lvl = if c.is_number() { c.as_u64().unwrap_or(0) } else { c.get("level").and_then(|l| l.as_u64()).unwrap_or(0) };
                    json!({"level": lvl, "locked": false})
                }).collect()
            } else if default_val.as_u64().unwrap_or(0) > 0 {
                vec![json!({"level": 0, "locked": false})]
            } else {
                vec![]
            };
            inv.insert(key.clone(), json!({"copies": copies}));
        }
    }
    inv
}

fn default_equipment() -> HashMap<String, Option<String>> {
    let items = data::items();
    items.equipment_slots.iter().map(|s| (s.key.clone(), None)).collect()
}

fn normalize_account(mut account: Account) -> Account {
    let exp = find_exp_for_rank(&account.path_rank, account.experience);
    account.experience = exp;
    let progress = progress_for_exp(exp);
    account.path_rank = progress.rank;
    // Normalize inventory
    let items = data::items();
    for (key, _) in items.inventory_default.clone() {
        let entry = account.inventory.entry(key.clone()).or_insert_with(|| json!({"copies":[]}));
        if data::item_is_stackable(&key) {
            // Ensure quantity field exists
            if !entry.get("quantity").is_some() {
                let qty = entry.as_u64().unwrap_or(0);
                *entry = json!({"quantity": qty, "locked": false});
            }
        } else {
            // Ensure copies array with proper objects
            if let Some(copies) = entry.get_mut("copies") {
                if let Some(arr) = copies.as_array_mut() {
                    let normalized: Vec<Value> = arr.iter().map(|c| {
                        if c.is_number() {
                            json!({"level": c.as_u64().unwrap_or(0), "locked": false})
                        } else {
                            let lvl = c.get("level").and_then(|l| l.as_u64()).unwrap_or(0);
                            let locked = c.get("locked").and_then(|l| l.as_bool()).unwrap_or(false);
                            json!({"level": lvl, "locked": locked})
                        }
                    }).collect();
                    *copies = serde_json::to_value(normalized).unwrap_or(json!([]));
                }
            } else {
                *entry = json!({"copies": []});
            }
        }
    }
    account
}

fn find_exp_for_rank(rank: &str, fallback: u32) -> u32 {
    if fallback > 0 { return fallback; }
    data::progression()
        .path_requirements
        .iter()
        .find(|r| r.label == rank)
        .map(|r| r.required)
        .unwrap_or(0)
}

struct ProgressInfo {
    rank: String,
    rank_index: usize,
    next_rank: String,
    progress: f64,
    total_exp: u32,
    level_required: u32,
    level_exp: u32,
}

fn progress_for_exp(exp: u32) -> ProgressInfo {
    let reqs = &data::progression().path_requirements;
    let mut current = &reqs[0];
    for r in reqs {
        if r.required > exp { break; }
        current = r;
    }
    let next = reqs.get(current.index as usize + 1);
    let next_required = next.map(|n| n.required).unwrap_or(current.required);
    let level_required = if next.is_some() { next_required - current.required } else { 0 };
    let level_exp = if next.is_some() { exp.saturating_sub(current.required) } else { 0 };
    let progress = if level_required > 0 {
        (level_exp as f64 / level_required as f64).min(1.0)
    } else { 1.0 };

    ProgressInfo {
        rank: current.label.clone(),
        rank_index: current.index as usize,
        next_rank: next.map(|n| n.label.clone()).unwrap_or(current.label.clone()),
        progress,
        total_exp: exp,
        level_required,
        level_exp,
    }
}

async fn get_account(State(state): State<Arc<AppState>>, Path(id): Path<String>) -> Response {
    match read_account(&state, &id).await {
        Some(account) => json_ok(&json!({"account": normalize_account(account)})),
        None => json_err(StatusCode::NOT_FOUND, "Account not found"),
    }
}

async fn delete_account(State(state): State<Arc<AppState>>, Path(id): Path<String>) -> Response {
    let path = state.accounts_dir.join(format!("{}.json", id));
    let _ = fs::remove_file(&path).await;
    json_ok(&json!({"deleted": true}))
}

// ─────────────────────────────────────────────────────
// Location
// ─────────────────────────────────────────────────────

async fn save_location(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
    body: String,
) -> Response {
    let mut account = match read_account(&state, &id).await {
        Some(a) => a,
        None => return json_err(StatusCode::NOT_FOUND, "Account not found"),
    };
    let body: Value = match serde_json::from_str(&body) { Ok(v) => v, Err(_) => return json_err(StatusCode::BAD_REQUEST, "Invalid") };
    if let Some(pos) = body.get("最後座標").or(body.get("lastPosition")) {
        account.last_position = Some(pos.clone());
    }
    account.updated_at = data::today_key();
    match write_account(&state, &account).await {
        Ok(a) => json_ok(&json!({"account": a})),
        Err(e) => json_err(StatusCode::INTERNAL_SERVER_ERROR, &e),
    }
}

// ─────────────────────────────────────────────────────
// Rename
// ─────────────────────────────────────────────────────

async fn rename_account(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
    body: String,
) -> Response {
    let mut account = match read_account(&state, &id).await {
        Some(a) => a,
        None => return json_err(StatusCode::NOT_FOUND, "Account not found"),
    };
    let body: Value = match serde_json::from_str(&body) { Ok(v) => v, Err(_) => return json_err(StatusCode::BAD_REQUEST, "Invalid") };
    let new_name = clean_name(body.get("name").and_then(|v| v.as_str()).unwrap_or(""));
    if new_name.is_empty() { return json_err(StatusCode::BAD_REQUEST, "Name is required"); }
    if same_name(&new_name, &account.name) { return json_err(StatusCode::BAD_REQUEST, "Name unchanged"); }
    if account.coins < RENAME_COST { return json_err(StatusCode::BAD_REQUEST, "Not enough coins"); }
    account.coins -= RENAME_COST;
    account.name = new_name;
    account.id = account_id_for(&account.name);
    account.updated_at = data::today_key();
    match write_account(&state, &account).await {
        Ok(a) => json_ok(&json!({"account": a, "cost": RENAME_COST})),
        Err(e) => json_err(StatusCode::INTERNAL_SERVER_ERROR, &e),
    }
}

// ─────────────────────────────────────────────────────
// Equipment
// ─────────────────────────────────────────────────────

async fn equip_item(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
    body: String,
) -> Response {
    let mut account = match read_account(&state, &id).await {
        Some(a) => a,
        None => return json_err(StatusCode::NOT_FOUND, "Account not found"),
    };
    let body: Value = match serde_json::from_str(&body) { Ok(v) => v, Err(_) => return json_err(StatusCode::BAD_REQUEST, "Invalid") };
    let slot = body.get("slot").and_then(|v| v.as_str()).unwrap_or("");
    let item_key = body.get("itemKey").and_then(|v| v.as_str());
    let items = data::items();
    if !items.equipment_slots.iter().any(|s| s.key == slot) {
        return json_err(StatusCode::BAD_REQUEST, "Unknown equipment slot");
    }
    if let Some(key) = item_key {
        if key.is_empty() {
            account.equipment.insert(slot.to_string(), None);
        } else {
            if let Some(item) = items.item_map.get(key) {
                if item.category != slot { return json_err(StatusCode::BAD_REQUEST, "Wrong slot"); }
                if !inventory_owned(account.inventory.get(key).unwrap_or(&json!(null))) {
                    return json_err(StatusCode::BAD_REQUEST, "Not owned");
                }
            }
            account.equipment.insert(slot.to_string(), Some(key.to_string()));
        }
    }
    account.hp = player_max_hp(&account.inventory, &account.equipment);
    account.updated_at = data::today_key();
    match write_account(&state, &account).await {
        Ok(a) => json_ok(&json!({"account": a})),
        Err(e) => json_err(StatusCode::INTERNAL_SERVER_ERROR, &e),
    }
}

// ─────────────────────────────────────────────────────
// Records
// ─────────────────────────────────────────────────────

async fn save_record(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
    body: String,
) -> Response {
    let mut account = match read_account(&state, &id).await {
        Some(a) => a,
        None => return json_err(StatusCode::NOT_FOUND, "Account not found"),
    };
    let body: Value = match serde_json::from_str(&body) { Ok(v) => v, Err(_) => return json_err(StatusCode::BAD_REQUEST, "Invalid") };
    let record = match body.get("record") { Some(r) => r.clone(), None => return json_err(StatusCode::BAD_REQUEST, "Record required") };
    let exp_gain = record.get("expGained").and_then(|v| v.as_u64()).unwrap_or(0) as u32;
    let coin_gain = record.get("coinsGained").and_then(|v| v.as_u64()).unwrap_or(0) as u32;
    account.experience += exp_gain;
    account.coins = account.coins.saturating_add(coin_gain);
    let progress = progress_for_exp(account.experience);
    account.path_rank = progress.rank;
    let mut saved_record = record.clone();
    saved_record["path"] = json!(account.path_rank);
    account.records.insert(0, saved_record);
    account.records.truncate(MAX_RECORDS);
    account.updated_at = data::today_key();
    match write_account(&state, &account).await {
        Ok(a) => json_ok(&json!({"account": a})),
        Err(e) => json_err(StatusCode::INTERNAL_SERVER_ERROR, &e),
    }
}

// ─────────────────────────────────────────────────────
// Donation
// ─────────────────────────────────────────────────────

async fn donation(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
    body: String,
) -> Response {
    let mut account = match read_account(&state, &id).await {
        Some(a) => a,
        None => return json_err(StatusCode::NOT_FOUND, "Account not found"),
    };
    let body: Value = match serde_json::from_str(&body) { Ok(v) => v, Err(_) => return json_err(StatusCode::BAD_REQUEST, "Invalid") };
    let rewards: Vec<String> = body.get("rewards")
        .and_then(|v| v.as_array())
        .map(|a| a.iter().filter_map(|v| v.as_str().map(String::from)).collect())
        .unwrap_or_else(|| {
            body.get("reward").and_then(|v| v.as_str()).map(|s| vec![s.to_string()]).unwrap_or_default()
        });
    if rewards.is_empty() { return json_err(StatusCode::BAD_REQUEST, "Reward required"); }
    let cost = DONATION_COST * rewards.len() as u32;
    if account.coins < cost { return json_err(StatusCode::BAD_REQUEST, "Not enough coins"); }
    account.coins -= cost;
    for reward in &rewards {
        add_inventory_copy(&mut account.inventory, reward, 1);
    }
    account.updated_at = data::today_key();
    match write_account(&state, &account).await {
        Ok(a) => json_ok(&json!({"account": a, "rewards": rewards, "cost": cost})),
        Err(e) => json_err(StatusCode::INTERNAL_SERVER_ERROR, &e),
    }
}

// ─────────────────────────────────────────────────────
// Shop
// ─────────────────────────────────────────────────────

async fn get_shop(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
) -> Response {
    let mut account = match read_account(&state, &id).await {
        Some(a) => a,
        None => return json_err(StatusCode::NOT_FOUND, "Account not found"),
    };
    let today = data::today_key();
    if account.shop_state.day_key != today {
        account.shop_state = ShopState { day_key: today.clone(), purchases: HashMap::new() };
    }
    let shop = shop_view(&account.shop_state);
    json_ok(&json!({"shop": shop, "account": account}))
}

fn shop_view(shop_state: &ShopState) -> Value {
    let items = data::items();
    let today = &shop_state.day_key;
    let daily = daily_shop_stock(today);
    let daily_entries: Vec<Value> = daily.iter().map(|(key, stock)| {
        let bought = shop_state.purchases.get(key).copied().unwrap_or(0);
        let remaining = stock.saturating_sub(bought);
        let item = items.item_map.get(key);
        let quality = item.map(|i| data::item_quality(i)).unwrap_or("white");
        let price = shop_price_for_quality(quality);
        json!({
            "itemKey": key, "itemName": item.map(|i| i.name.as_str()).unwrap_or(""),
            "rarity": quality, "price": price, "stock": stock,
            "bought": bought, "remaining": remaining, "infinite": false
        })
    }).collect();

    let infinite_item = items.item_map.get(SHOP_INFINITE_ITEM_KEY);
    let infinite = if let Some(item) = infinite_item {
        vec![json!({
            "itemKey": SHOP_INFINITE_ITEM_KEY,
            "itemName": item.name,
            "rarity": data::item_quality(item),
            "price": SHOP_INFINITE_ITEM_PRICE,
            "stock": null, "bought": 0, "remaining": null, "infinite": true
        })]
    } else { vec![] };

    json!({"dayKey": today, "daily": daily_entries, "infinite": infinite})
}

fn shop_price_for_quality(q: &str) -> u32 {
    match q {
        "white" => 40, "green" => 100, "blue" => 300, "purple" => 1000, _ => 40,
    }
}

fn daily_shop_stock(day_key: &str) -> Vec<(String, u32)> {
    let items = data::items();
    let mut rng = data::SeededRng::new(data::hash_string(&format!("shop:{}", day_key)));
    let mut stock: HashMap<String, u32> = HashMap::new();
    let weights: HashMap<String, u32> = [
        ("white".to_string(), 70), ("green".to_string(), 20),
        ("blue".to_string(), 8), ("purple".to_string(), 2),
    ].into();

    let candidates: HashMap<String, Vec<&data::ItemDefinition>> = ["white", "green", "blue", "purple"].iter().map(|&q| {
        let list: Vec<_> = items.items.iter()
            .filter(|i| i.consumable && i.category == "special" && !i.shop_infinite && data::item_quality(i) == q)
            .collect();
        (q.to_string(), list)
    }).collect();

    for _ in 0..SHOP_DAILY_ITEM_COUNT {
        let quality = data::weighted_choice(&weights, &mut rng);
        let list = candidates.get(&quality).unwrap_or(&candidates["white"]);
        if let Some(item) = rng.choice(list) {
            *stock.entry(item.key.clone()).or_insert(0) += 1;
        }
    }
    stock.into_iter().collect()
}

async fn shop_buy(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
    body: String,
) -> Response {
    let mut account = match read_account(&state, &id).await {
        Some(a) => a,
        None => return json_err(StatusCode::NOT_FOUND, "Account not found"),
    };
    let body: Value = match serde_json::from_str(&body) { Ok(v) => v, Err(_) => return json_err(StatusCode::BAD_REQUEST, "Invalid") };
    let item_key = body.get("itemKey").and_then(|v| v.as_str()).unwrap_or("");
    let items = data::items();
    let item = match items.item_map.get(item_key) { Some(i) => i, None => return json_err(StatusCode::BAD_REQUEST, "Unknown item") };
    if !item.consumable { return json_err(StatusCode::BAD_REQUEST, "Not purchasable"); }

    let today = data::today_key();
    if account.shop_state.day_key != today {
        account.shop_state = ShopState { day_key: today.clone(), purchases: HashMap::new() };
    }

    let is_infinite = item_key == SHOP_INFINITE_ITEM_KEY;
    let price = if is_infinite { SHOP_INFINITE_ITEM_PRICE } else { shop_price_for_quality(data::item_quality(item)) };

    if !is_infinite {
        let daily = daily_shop_stock(&today);
        let stock = daily.iter().find(|(k, _)| k == item_key).map(|(_, s)| *s).unwrap_or(0);
        let bought = account.shop_state.purchases.get(item_key).copied().unwrap_or(0);
        if bought >= stock { return json_err(StatusCode::CONFLICT, "Sold out"); }
    }

    if account.coins < price { return json_err(StatusCode::BAD_REQUEST, "Not enough coins"); }
    account.coins -= price;
    add_inventory_copy(&mut account.inventory, item_key, 1);
    if !is_infinite {
        *account.shop_state.purchases.entry(item_key.to_string()).or_insert(0) += 1;
    }
    account.updated_at = today;
    match write_account(&state, &account).await {
        Ok(a) => json_ok(&json!({"account": a, "itemKey": item_key, "price": price, "shop": shop_view(&a.shop_state)})),
        Err(e) => json_err(StatusCode::INTERNAL_SERVER_ERROR, &e),
    }
}

// ─────────────────────────────────────────────────────
// Chest
// ─────────────────────────────────────────────────────

fn active_chest_ids(day_key: &str) -> Vec<String> {
    let chest = data::chest();
    let mut pool: Vec<String> = chest.spawn_points.iter().map(|p| p.id.clone()).collect();
    let mut rng = data::SeededRng::new(data::hash_string(day_key));
    for i in (1..pool.len()).rev() {
        let pick = (rng.next() * (i + 1) as f64) as usize % (i + 1);
        pool.swap(i, pick);
    }
    pool.truncate(CHEST_DAILY_COUNT);
    pool
}

async fn open_chest(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
    body: String,
) -> Response {
    let mut account = match read_account(&state, &id).await {
        Some(a) => a,
        None => return json_err(StatusCode::NOT_FOUND, "Account not found"),
    };
    let body: Value = match serde_json::from_str(&body) { Ok(v) => v, Err(_) => return json_err(StatusCode::BAD_REQUEST, "Invalid") };
    let chest_id = body.get("chestId").and_then(|v| v.as_str()).unwrap_or("");

    let today = data::today_key();
    if account.chest_state.day_key != today {
        account.chest_state = ChestState { day_key: today.clone(), opened: vec![], field_loot: vec![] };
    }

    let active_ids = active_chest_ids(&today);
    if !active_ids.contains(&chest_id.to_string()) { return json_err(StatusCode::BAD_REQUEST, "Chest not active"); }
    if account.chest_state.opened.contains(&chest_id.to_string()) { return json_err(StatusCode::CONFLICT, "Already opened"); }

    let coins = 8 + (data::hash_string(&format!("coin:{}:{}", chest_id, today)) % 15);
    let exp = 1 + (data::hash_string(&format!("exp:{}:{}", chest_id, today)) % 20);
    account.coins = account.coins.saturating_add(coins);
    account.experience = account.experience.saturating_add(exp);

    // Add a random reward item
    let items = data::items();
    let donation_items: Vec<&data::ItemDefinition> = items.items.iter().filter(|i| i.donation).collect();
    if let Some(reward) = donation_items.get(data::hash_string(&format!("drop:{}:{}", chest_id, today)) as usize % donation_items.len()) {
        account.chest_state.field_loot.push(json!({
            "id": format!("loot-{}", data::hash_string(&format!("lootid:{}:{}:{}", chest_id, today, account.chest_state.field_loot.len()))),
            "chestId": chest_id,
            "itemKey": reward.key,
            "slot": 0
        }));
    }

    account.chest_state.opened.push(chest_id.to_string());
    let progress = progress_for_exp(account.experience);
    account.path_rank = progress.rank;
    account.updated_at = today;
    match write_account(&state, &account).await {
        Ok(a) => json_ok(&json!({"account": a, "chestId": chest_id, "coinsGained": coins, "expGained": exp})),
        Err(e) => json_err(StatusCode::INTERNAL_SERVER_ERROR, &e),
    }
}

async fn collect_loot(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
    body: String,
) -> Response {
    let mut account = match read_account(&state, &id).await {
        Some(a) => a,
        None => return json_err(StatusCode::NOT_FOUND, "Account not found"),
    };
    let body: Value = match serde_json::from_str(&body) { Ok(v) => v, Err(_) => return json_err(StatusCode::BAD_REQUEST, "Invalid") };
    let loot_id = body.get("lootId").and_then(|v| v.as_str()).unwrap_or("");
    if let Some(idx) = account.chest_state.field_loot.iter().position(|l| l.get("id").and_then(|i| i.as_str()) == Some(loot_id)) {
        let loot = account.chest_state.field_loot.remove(idx);
        let item_key = loot.get("itemKey").and_then(|v| v.as_str()).unwrap_or("");
        add_inventory_copy(&mut account.inventory, item_key, 1);
        account.updated_at = data::today_key();
        match write_account(&state, &account).await {
            Ok(a) => json_ok(&json!({"account": a, "collected": loot})),
            Err(e) => json_err(StatusCode::INTERNAL_SERVER_ERROR, &e),
        }
    } else {
        json_err(StatusCode::NOT_FOUND, "Loot not found")
    }
}

// ─────────────────────────────────────────────────────
// Resonance
// ─────────────────────────────────────────────────────

async fn resonance(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
    body: String,
) -> Response {
    let mut account = match read_account(&state, &id).await {
        Some(a) => a,
        None => return json_err(StatusCode::NOT_FOUND, "Account not found"),
    };
    let body: Value = match serde_json::from_str(&body) { Ok(v) => v, Err(_) => return json_err(StatusCode::BAD_REQUEST, "Invalid") };
    let item_key = body.get("itemKey").and_then(|v| v.as_str()).unwrap_or("");
    let level = body.get("resonanceLevel").and_then(|v| v.as_u64()).unwrap_or(0) as u32;
    if level >= RESONANCE_MAX { return json_err(StatusCode::BAD_REQUEST, "Already maxed"); }
    if data::item_is_stackable(item_key) { return json_err(StatusCode::BAD_REQUEST, "Stackable items cannot resonate"); }

    let quality_mult = data::items().item_map.get(item_key)
        .map(|i| *data::items().resonance.quality_multipliers.get(data::item_quality(i)).unwrap_or(&1))
        .unwrap_or(1);
    let coin_cost = (RESONANCE_COIN_BASE as f64).powi((level + 1) as i32) as u32 * quality_mult;

    let entry = account.inventory.entry(item_key.to_string()).or_insert_with(|| json!({"copies": []}));
    let copies = entry["copies"].as_array_mut().unwrap();
    let matching: Vec<usize> = copies.iter().enumerate()
        .filter(|(_, c)| c.get("level").and_then(|l| l.as_u64()).unwrap_or(0) as u32 == level && !c.get("locked").and_then(|l| l.as_bool()).unwrap_or(false))
        .map(|(i, _)| i)
        .collect();

    if matching.len() < RESONANCE_COPY_COST as usize { return json_err(StatusCode::BAD_REQUEST, "Not enough copies"); }
    if account.coins < coin_cost { return json_err(StatusCode::BAD_REQUEST, "Not enough coins"); }

    account.coins -= coin_cost;
    for &idx in matching.iter().take(RESONANCE_COPY_COST as usize).rev() {
        copies.remove(idx);
    }
    copies.push(json!({"level": level + 1, "locked": false}));

    account.updated_at = data::today_key();
    match write_account(&state, &account).await {
        Ok(a) => json_ok(&json!({
            "account": a, "itemKey": item_key, "resonanceLevel": level + 1,
            "copyCost": RESONANCE_COPY_COST, "coinCost": coin_cost,
        })),
        Err(e) => json_err(StatusCode::INTERNAL_SERVER_ERROR, &e),
    }
}

async fn resonance_all(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
) -> Response {
    let mut account = match read_account(&state, &id).await {
        Some(a) => a,
        None => return json_err(StatusCode::NOT_FOUND, "Account not found"),
    };
    let items = data::items();
    let mut operations = Vec::new();
    let coins_before = account.coins;

    for item in &items.items {
        if data::item_is_stackable(&item.key) { continue; }
        for level in 0..RESONANCE_MAX {
            loop {
                let quality_mult = items.resonance.quality_multipliers.get(data::item_quality(item)).unwrap_or(&1);
                let coin_cost = (RESONANCE_COIN_BASE as f64).powi((level + 1) as i32) as u32 * quality_mult;
                let entry = account.inventory.entry(item.key.clone()).or_insert_with(|| json!({"copies": []}));
                let copies = entry["copies"].as_array().unwrap();
                let matching: Vec<usize> = copies.iter().enumerate()
                    .filter(|(_, c)| c.get("level").and_then(|l| l.as_u64()).unwrap_or(0) as u32 == level && !c.get("locked").and_then(|l| l.as_bool()).unwrap_or(false))
                    .map(|(i, _)| i).collect();
                if matching.len() < RESONANCE_COPY_COST as usize || account.coins < coin_cost { break; }
                account.coins -= coin_cost;
                let copies = entry["copies"].as_array_mut().unwrap();
                for &idx in matching.iter().take(RESONANCE_COPY_COST as usize).rev() { copies.remove(idx); }
                copies.push(json!({"level": level + 1, "locked": false}));
                operations.push(json!({"itemKey": item.key, "itemName": item.name, "fromLevel": level, "resonanceLevel": level + 1}));
            }
        }
    }

    account.updated_at = data::today_key();
    match write_account(&state, &account).await {
        Ok(a) => json_ok(&json!({
            "account": a, "operations": operations, "count": operations.len(),
            "coinCost": coins_before - account.coins,
        })),
        Err(e) => json_err(StatusCode::INTERNAL_SERVER_ERROR, &e),
    }
}

// ─────────────────────────────────────────────────────
// Resonance Transform
// ─────────────────────────────────────────────────────

async fn resonance_transform(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
    body: String,
) -> Response {
    let mut account = match read_account(&state, &id).await {
        Some(a) => a,
        None => return json_err(StatusCode::NOT_FOUND, "Account not found"),
    };
    let body: Value = match serde_json::from_str(&body) { Ok(v) => v, Err(_) => return json_err(StatusCode::BAD_REQUEST, "Invalid") };
    let item_key = body.get("itemKey").and_then(|v| v.as_str()).unwrap_or("");
    let mode = body.get("mode").and_then(|v| v.as_str()).unwrap_or("");
    if data::item_is_stackable(item_key) { return json_err(StatusCode::BAD_REQUEST, "Stackable cannot transform"); }

    let items = data::items();
    let source_item = match items.item_map.get(item_key) { Some(i) => i, None => return json_err(StatusCode::BAD_REQUEST, "Unknown item") };
    let current_quality = data::item_quality(source_item);

    match mode {
        "promote-quality" => {
            let target_q = match data::next_quality(current_quality) { Some(q) => q, None => return json_err(StatusCode::BAD_REQUEST, "Already highest") };
            let candidates: Vec<&data::ItemDefinition> = items.items.iter()
                .filter(|i| i.donation && !data::item_is_stackable(&i.key) && data::item_quality(i) == target_q && i.key != item_key)
                .collect();
            if candidates.is_empty() { return json_err(StatusCode::BAD_REQUEST, "No candidates"); }
            if !remove_inventory_copy(&mut account.inventory, item_key) { return json_err(StatusCode::BAD_REQUEST, "Copy not found"); }
            let idx = data::hash_string(&format!("transform:{}:{}", item_key, account.updated_at)) as usize % candidates.len();
            let target = candidates[idx];
            add_inventory_copy(&mut account.inventory, &target.key, 1);
            account.updated_at = data::today_key();
            match write_account(&state, &account).await {
                Ok(a) => json_ok(&json!({
                    "account": a, "mode": mode,
                    "source": {"itemKey": item_key, "itemName": source_item.name, "quality": current_quality},
                    "result": {"itemKey": target.key, "itemName": target.name, "quality": data::item_quality(target)},
                })),
                Err(e) => json_err(StatusCode::INTERNAL_SERVER_ERROR, &e),
            }
        }
        _ => json_err(StatusCode::BAD_REQUEST, "Unknown mode"),
    }
}

async fn resonance_transform_all(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
) -> Response {
    let mut account = match read_account(&state, &id).await {
        Some(a) => a,
        None => return json_err(StatusCode::NOT_FOUND, "Account not found"),
    };
    let items = data::items();
    let mut operations = Vec::new();
    for item in &items.items {
        if data::item_is_stackable(&item.key) { continue; }
        let current_q = data::item_quality(item);
        if data::next_quality(current_q).is_none() { continue; }
        let target_q = data::next_quality(current_q).unwrap();
        let candidates: Vec<&data::ItemDefinition> = items.items.iter()
            .filter(|i| i.donation && !data::item_is_stackable(&i.key) && data::item_quality(i) == target_q)
            .collect();
        if candidates.is_empty() { continue; }
        while remove_inventory_copy(&mut account.inventory, &item.key) {
            let idx = (operations.len() * 7 + 3) % candidates.len();
            let target = candidates[idx];
            add_inventory_copy(&mut account.inventory, &target.key, 1);
            operations.push(json!({"sourceKey": item.key, "targetKey": target.key}));
        }
    }
    account.updated_at = data::today_key();
    match write_account(&state, &account).await {
        Ok(a) => json_ok(&json!({"account": a, "mode": "promote-quality", "operations": operations, "count": operations.len()})),
        Err(e) => json_err(StatusCode::INTERNAL_SERVER_ERROR, &e),
    }
}

// ─────────────────────────────────────────────────────
// Inventory Lock
// ─────────────────────────────────────────────────────

async fn inventory_lock(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
    body: String,
) -> Response {
    let mut account = match read_account(&state, &id).await {
        Some(a) => a,
        None => return json_err(StatusCode::NOT_FOUND, "Account not found"),
    };
    let body: Value = match serde_json::from_str(&body) { Ok(v) => v, Err(_) => return json_err(StatusCode::BAD_REQUEST, "Invalid") };
    let item_key = body.get("itemKey").and_then(|v| v.as_str()).unwrap_or("");
    let copy_idx = body.get("copyIndex").and_then(|v| v.as_u64()).unwrap_or(0) as usize;

    let entry = account.inventory.entry(item_key.to_string()).or_insert_with(|| json!({"copies": []}));
    if data::item_is_stackable(item_key) {
        let locked = entry.get("locked").and_then(|l| l.as_bool()).unwrap_or(false);
        entry["locked"] = json!(!locked);
    } else {
        let copies = entry["copies"].as_array_mut().unwrap();
        if let Some(copy) = copies.get_mut(copy_idx) {
            let locked = copy.get("locked").and_then(|l| l.as_bool()).unwrap_or(false);
            copy["locked"] = json!(!locked);
        } else { return json_err(StatusCode::BAD_REQUEST, "Copy not found"); }
    }
    account.updated_at = data::today_key();
    match write_account(&state, &account).await {
        Ok(a) => json_ok(&json!({"account": a})),
        Err(e) => json_err(StatusCode::INTERNAL_SERVER_ERROR, &e),
    }
}

// ─────────────────────────────────────────────────────
// Blacksmith
// ─────────────────────────────────────────────────────

async fn blacksmith_smelt(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
    body: String,
) -> Response {
    let mut account = match read_account(&state, &id).await {
        Some(a) => a,
        None => return json_err(StatusCode::NOT_FOUND, "Account not found"),
    };
    let body: Value = match serde_json::from_str(&body) { Ok(v) => v, Err(_) => return json_err(StatusCode::BAD_REQUEST, "Invalid") };
    let selections = body.get("selections").and_then(|v| v.as_array()).cloned().unwrap_or_default();
    if selections.is_empty() { return json_err(StatusCode::BAD_REQUEST, "No selections"); }

    let items = data::items();
    let mut ore_gain = 0u32;
    let mut gold_gain = 0u32;
    let mut results = Vec::new();

    for sel in &selections {
        let key = sel.get("itemKey").and_then(|v| v.as_str()).unwrap_or("");
        let copy_idx = sel.get("copyIndex").and_then(|v| v.as_u64()).unwrap_or(0) as usize;
        let item = match items.item_map.get(key) { Some(i) => i, None => continue };
        if item.category != "weapon" || data::item_is_stackable(key) { continue; }

        let entry = account.inventory.entry(key.to_string()).or_insert_with(|| json!({"copies": []}));
        let copies = entry["copies"].as_array_mut().unwrap();
        if copy_idx >= copies.len() { continue; }
        if copies[copy_idx].get("locked").and_then(|l| l.as_bool()).unwrap_or(false) { continue; }

        let quality = data::item_quality(item);
        let reward = smelt_reward(quality);
        copies.remove(copy_idx);
        ore_gain += reward.0;
        gold_gain += reward.1;
        results.push(json!({"itemKey": key, "itemName": item.name, "quality": quality, "ore": reward.0, "gold": reward.1}));
    }

    if results.is_empty() { return json_err(StatusCode::BAD_REQUEST, "No valid items"); }
    if account.coins < ore_gain { return json_err(StatusCode::BAD_REQUEST, "Not enough coins"); }
    account.coins -= ore_gain;
    add_inventory_copy(&mut account.inventory, "ore", ore_gain);
    account.gold = account.gold.saturating_add(gold_gain);
    account.updated_at = data::today_key();
    match write_account(&state, &account).await {
        Ok(a) => json_ok(&json!({"account": a, "ore": ore_gain, "gold": gold_gain, "results": results})),
        Err(e) => json_err(StatusCode::INTERNAL_SERVER_ERROR, &e),
    }
}

fn smelt_reward(quality: &str) -> (u32, u32) {
    match quality {
        "white" => (5, 0), "green" => (20, 0), "blue" => (100, 0),
        "purple" => (500, 0), "gold" => (1500, 1), "roseGold" => (2000, 10),
        _ => (0, 0),
    }
}

// ─────────────────────────────────────────────────────
// Clear Records / Grave Bond
// ─────────────────────────────────────────────────────

async fn clear_records(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
) -> Response {
    let mut account = match read_account(&state, &id).await {
        Some(a) => a,
        None => return json_err(StatusCode::NOT_FOUND, "Account not found"),
    };
    account.records.clear();
    account.updated_at = data::today_key();
    match write_account(&state, &account).await {
        Ok(a) => json_ok(&json!({"account": a})),
        Err(e) => json_err(StatusCode::INTERNAL_SERVER_ERROR, &e),
    }
}

async fn grave_bond(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
    body: String,
) -> Response {
    let mut account = match read_account(&state, &id).await {
        Some(a) => a,
        None => return json_err(StatusCode::NOT_FOUND, "Account not found"),
    };
    let body: Value = match serde_json::from_str(&body) { Ok(v) => v, Err(_) => return json_err(StatusCode::BAD_REQUEST, "Invalid") };
    let grave_id = body.get("graveId").and_then(|v| v.as_str()).unwrap_or("");
    if account.grave_state.unlocked.contains(&grave_id.to_string()) {
        return json_ok(&json!({"account": account, "graveId": grave_id, "alreadyUnlocked": true}));
    }
    if !remove_inventory_copy(&mut account.inventory, SHOP_INFINITE_ITEM_KEY) {
        return json_err(StatusCode::BAD_REQUEST, "Missing incense candle");
    }
    account.grave_state.unlocked.push(grave_id.to_string());
    account.updated_at = data::today_key();
    match write_account(&state, &account).await {
        Ok(a) => json_ok(&json!({"account": a, "graveId": grave_id, "unlocked": true})),
        Err(e) => json_err(StatusCode::INTERNAL_SERVER_ERROR, &e),
    }
}

// ─────────────────────────────────────────────────────
// Zone BGM (stub)
// ─────────────────────────────────────────────────────

async fn debug_state(State(state): State<Arc<AppState>>) -> Response {
    let mut files = Vec::new();
    if let Ok(mut dir) = fs::read_dir(&state.accounts_dir).await {
        while let Ok(Some(entry)) = dir.next_entry().await {
            files.push(entry.file_name().to_string_lossy().to_string());
        }
    }
    json_ok(&json!({
        "accounts_dir": state.accounts_dir.to_string_lossy(),
        "static_dir": state.static_dir.to_string_lossy(),
        "files": files,
    }))
}

async fn zone_bgm() -> Response {
    let tracks: Vec<String> = vec![];
    json_ok(&json!({"tracks": tracks}))
}
