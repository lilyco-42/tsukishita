use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// ── Embedded JSON blobs ──────────────────────────────

const ITEMS_JSON: &str = include_str!("../../../items-data.json");
const PROGRESSION_JSON: &str = include_str!("../../../progression-data.json");
const CHEST_JSON: &str = include_str!("../../../chest-data.json");

// ── Item types ───────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ItemDefinition {
    pub key: String,
    pub name: String,
    #[serde(default)]
    pub icon: String,
    #[serde(default)]
    pub category: String,
    #[serde(default)]
    pub rarity: String,
    #[serde(default)]
    pub quality: String,
    #[serde(default)]
    pub consumable: bool,
    #[serde(default)]
    pub stackable: bool,
    #[serde(default)]
    pub donation: bool,
    #[serde(rename = "shopInfinite", default)]
    pub shop_infinite: bool,
    #[serde(default)]
    pub max: u32,
    #[serde(default)]
    pub effect: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ItemsData {
    pub categories: Vec<Category>,
    #[serde(rename = "equipmentSlots")]
    pub equipment_slots: Vec<EquipmentSlot>,
    pub resonance: ResonanceConfig,
    pub items: Vec<ItemDefinition>,
    #[serde(rename = "itemMap")]
    pub item_map: HashMap<String, ItemDefinition>,
    #[serde(rename = "inventoryDefault")]
    pub inventory_default: HashMap<String, serde_json::Value>,
    #[serde(rename = "resonanceTierOrder")]
    pub resonance_tier_order: Vec<String>,
    #[serde(rename = "resonanceTierLabels")]
    pub resonance_tier_labels: HashMap<String, String>,
    #[serde(rename = "resonanceLevelToTierKey")]
    pub resonance_level_to_tier_key: HashMap<String, String>,
    #[serde(rename = "resonanceTierKeyToLevel")]
    pub resonance_tier_key_to_level: HashMap<String, u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Category {
    pub key: String,
    pub name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EquipmentSlot {
    pub key: String,
    pub name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResonanceConfig {
    pub max: u32,
    pub names: Vec<String>,
    #[serde(rename = "noneName")]
    pub none_name: String,
    #[serde(rename = "copyCost")]
    pub copy_cost: u32,
    #[serde(rename = "coinBase")]
    pub coin_base: u32,
    #[serde(rename = "qualityMultipliers")]
    pub quality_multipliers: HashMap<String, u32>,
}

// ── Progression ──────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProgressionData {
    #[serde(rename = "plaqueExperience")]
    pub plaque_experience: HashMap<String, u32>,
    #[serde(rename = "pathRequirements")]
    pub path_requirements: Vec<PathRequirement>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PathRequirement {
    #[serde(default)]
    pub realm: String,
    #[serde(default)]
    pub level: u32,
    #[serde(default)]
    pub required: u32,
    #[serde(default)]
    pub index: u32,
    #[serde(default)]
    pub label: String,
}

// ── Chest ────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChestData {
    #[serde(rename = "dailyCount")]
    pub daily_count: u32,
    #[serde(rename = "spawnPoints")]
    pub spawn_points: Vec<ChestSpawnPoint>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChestSpawnPoint {
    pub id: String,
    #[serde(rename = "sceneX")]
    pub scene_x: f64,
    #[serde(rename = "sceneZ")]
    pub scene_z: f64,
    #[serde(default)]
    pub rotation: f64,
    #[serde(default)]
    pub scale: f64,
}

// ── Lazy init ────────────────────────────────────────

use std::sync::OnceLock;

static ITEMS: OnceLock<ItemsData> = OnceLock::new();
static PROGRESSION: OnceLock<ProgressionData> = OnceLock::new();
static CHEST: OnceLock<ChestData> = OnceLock::new();

pub fn items() -> &'static ItemsData {
    ITEMS.get_or_init(|| serde_json::from_str(ITEMS_JSON).expect("items-data.json"))
}

pub fn progression() -> &'static ProgressionData {
    PROGRESSION.get_or_init(|| serde_json::from_str(PROGRESSION_JSON).expect("progression-data.json"))
}

pub fn chest() -> &'static ChestData {
    CHEST.get_or_init(|| serde_json::from_str(CHEST_JSON).expect("chest-data.json"))
}

// ── Helpers ──────────────────────────────────────────

pub fn item_quality(item: &ItemDefinition) -> &str {
    if item.rarity.is_empty() { &item.quality } else { &item.rarity }
}

pub const QUALITY_ORDER: &[&str] = &["white", "green", "blue", "purple", "gold", "roseGold"];

pub fn next_quality(q: &str) -> Option<&'static str> {
    QUALITY_ORDER
        .iter()
        .position(|&x| x == q)
        .and_then(|i| QUALITY_ORDER.get(i + 1))
        .copied()
}

pub fn item_is_stackable(key: &str) -> bool {
    items()
        .item_map
        .get(key)
        .map(|item| item.consumable || item.stackable)
        .unwrap_or(false)
}

pub fn today_key() -> String {
    // Simple date key: YYYY-MM-DD
    // We don't use chrono to keep deps minimal
    #[cfg(not(target_arch = "wasm32"))]
    {
        use std::time::SystemTime;
        let dur = SystemTime::now()
            .duration_since(SystemTime::UNIX_EPOCH)
            .unwrap_or_default();
        let secs = dur.as_secs();
        let days = secs / 86400;
        // Convert unix epoch days to date
        let (y, m, d) = civil_from_days(days as i64 + 719468);
        format!("{:04}-{:02}-{:02}", y, m, d)
    }
    #[cfg(target_arch = "wasm32")]
    "2026-01-01".to_string()
}

fn civil_from_days(z: i64) -> (i64, u32, u32) {
    // Howard Hinnant's algorithm: https://howardhinnant.github.io/date_algorithms.html
    // z is already days since civil epoch (1970-01-01 + 719468)
    let era = (if z >= 0 { z } else { z - 146096 }) / 146097;
    let doe = (z - era * 146097) as u32;
    let yoe = (doe - doe / 1460 + doe / 36524 - doe / 146096) / 365;
    let y = yoe as i64 + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let d = doy - (153 * mp + 2) / 5 + 1;
    let m = if mp < 10 { mp + 3 } else { mp - 9 };
    (if m <= 2 { y + 1 } else { y }, m, d)
}

// ── RNG ──────────────────────────────────────────────

pub fn hash_string(s: &str) -> u32 {
    let mut hash: u32 = 2166136261;
    for b in s.bytes() {
        hash ^= b as u32;
        hash = hash.wrapping_mul(16777619);
    }
    hash
}

pub struct SeededRng {
    state: u32,
}

impl SeededRng {
    pub fn new(seed: u32) -> Self {
        Self { state: seed }
    }

    pub fn next(&mut self) -> f64 {
        self.state = self.state.wrapping_mul(1664525).wrapping_add(1013904223);
        self.state as f64 / 4294967296.0
    }

    pub fn choice<'a, T>(&mut self, items: &'a [T]) -> Option<&'a T> {
        if items.is_empty() {
            return None;
        }
        let idx = (self.next() * items.len() as f64) as usize;
        items.get(idx.min(items.len() - 1))
    }
}

pub fn weighted_choice(weights: &HashMap<String, u32>, rng: &mut SeededRng) -> String {
    let total: u32 = weights.values().sum();
    if total == 0 {
        return "white".to_string();
    }
    let roll = rng.next() * total as f64;
    let mut cumulative = 0u32;
    for (key, w) in weights {
        cumulative += w;
        if (roll as u32) < cumulative {
            return key.clone();
        }
    }
    weights.keys().last().cloned().unwrap_or("white".to_string())
}
