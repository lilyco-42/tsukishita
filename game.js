const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const sceneMount = document.querySelector("#scene3d");
const minimapCanvas = document.querySelector("#minimap");
const minimapCtx = minimapCanvas?.getContext("2d");

const MAP_SIZE = 4000;
const WEST_REGION_SIZE = 8000;
const SOUTH_REGION_SIZE = 8000;
const WORLD = {
  minX: -WEST_REGION_SIZE,
  maxX: MAP_SIZE,
  minY: 0,
  maxY: MAP_SIZE + SOUTH_REGION_SIZE,
  w: MAP_SIZE + WEST_REGION_SIZE,
  h: MAP_SIZE + SOUTH_REGION_SIZE,
  cx: MAP_SIZE / 2,
  cy: MAP_SIZE / 2,
  r: MAP_SIZE / 2,
  currentMinX: 0,
  currentMaxX: MAP_SIZE,
  currentMinY: 0,
  currentMaxY: MAP_SIZE,
};
const AIR_WALL_HALF = MAP_SIZE / 2;
const BATTLE_ARENA_RADIUS = 800;
const AIR_WALL_RADIUS = BATTLE_ARENA_RADIUS;
const VISUAL_WORLD_SIZE = MAP_SIZE * 5;
const CAMERA_WORLD_HEIGHT = 320;
const CAMERA_WORLD_HEIGHT_MOBILE = 430;
const CAMERA_ANCHOR_X = 0.5;
const CAMERA_ANCHOR_Y = 0.56;
const CAMERA_3D_OFFSET = { x: 0, y: 3.45, z: 3.55 };
const CAMERA_3D_LOOK_AHEAD = { x: 0, y: 0.28, z: -0.42 };
const CAMERA_YAW_SPEED = 1.85;
const CAMERA_PITCH_SPEED = 0.82;
const CAMERA_PITCH_MIN = -Math.PI / 2;
const CAMERA_PITCH_MAX = Math.PI / 2;
const TWO_PI = Math.PI * 2;
const PLAYER_MAX_HP = 180;
const POLLUTION_GAIN_RATE = 0.55;
const MAX_RECORDS = 20;
const PURIFY_BASE_DURATION = 0.48;
const PURIFY_MAX_DURATION = 0.95;
const PURIFY_DISTANCE = 170;
const SLASH_RANGE = 85;
const SHORT_SLASH_RANGE_FACTOR = 0.25;
const LONG_SLASH_RANGE_FACTOR = 0.5;
const LONG_SLASH_WEAPON_NAMES = new Set(["祭銅太刀", "鳴鈴薙刀", "裂願長刀", "緋櫻太刀", "斷念薙刀"]);
const SLASH_HALF_ANGLE = Math.PI / 3;
const SLASH_DIRECTION_OFFSET = 0;
const SLASH_3D_DISPLAY_OFFSET = Math.PI;
const FRAGMENT_SPAWN_RADIUS = 400;
const BATTLE_EXIT_GRACE = 10;
const MINIMAP_WORLD_RADIUS = 900;
const API_BASE = location.protocol === "file:" ? "http://127.0.0.1:4173" : "";
const BATTLE_BGM_SOURCES = ["./Battle.m4a", "./Battle.flac"];
const ZONE_BGM_PLAYLIST_ENDPOINT = `${API_BASE}/api/audio/zone-bgm`;
const ZONE_BGM_SOURCES = ["./BGM Zone 1/zone1.flac"];
const SUZU_SFX_SOURCES = {
  gate: ["./suzu.wav", "./suzu.aif", "./神楽鈴.wav", "./神樂鈴.wav", "./神楽鈴.aif", "./神樂鈴.aif"],
  purify: ["./suzu-long.wav", "./suzu-long.aif", "./神樂鈴-長.wav", "./神楽鈴-長.wav", "./神樂鈴-長.aif", "./神楽鈴-長.aif"],
};
const THREE_URL = "./vendor/three.module.js";
const WORLD_SCALE = 64;
const MAP_SCENE_HALF = AIR_WALL_HALF / WORLD_SCALE;
const WORLD_SCENE_MIN_X = (WORLD.minX - WORLD.cx) / WORLD_SCALE;
const WORLD_SCENE_MAX_X = (WORLD.maxX - WORLD.cx) / WORLD_SCALE;
const WORLD_SCENE_MIN_Z = (WORLD.minY - WORLD.cy) / WORLD_SCALE;
const WORLD_SCENE_MAX_Z = (WORLD.maxY - WORLD.cy) / WORLD_SCALE;
const WORLD_SCENE_WIDTH = WORLD_SCENE_MAX_X - WORLD_SCENE_MIN_X;
const WORLD_SCENE_DEPTH = WORLD_SCENE_MAX_Z - WORLD_SCENE_MIN_Z;
const WORLD_SCENE_CENTER_X = (WORLD_SCENE_MIN_X + WORLD_SCENE_MAX_X) / 2;
const WORLD_SCENE_CENTER_Z = (WORLD_SCENE_MIN_Z + WORLD_SCENE_MAX_Z) / 2;
const MAIN_CITY_SCENE_SIZE = MAP_SIZE / WORLD_SCALE;
const MAIN_CITY_SCENE_HALF = MAIN_CITY_SCENE_SIZE / 2;
const MAIN_CITY_TERRAIN_HEIGHT = 0.08;
const MAIN_CITY_SCENE = {
  x: WORLD_SCENE_MIN_X + 44.3,
  z: WORLD_SCENE_MAX_Z - 44.3,
  size: MAIN_CITY_SCENE_SIZE,
  half: MAIN_CITY_SCENE_HALF,
  rotation: Math.PI / 4,
};
const BATTLE_SCENE = { x: 8.2, z: -2.4 };
const BATTLE_CENTER = {
  x: WORLD.cx + BATTLE_SCENE.x * WORLD_SCALE,
  y: WORLD.cy + BATTLE_SCENE.z * WORLD_SCALE,
};
const BATTLE_PLAYER_START = { x: BATTLE_CENTER.x, y: BATTLE_CENTER.y + 300 };
const BATTLE_BOSS_START = { x: BATTLE_CENTER.x, y: BATTLE_CENTER.y - 170 };
const VILLAGE_SCENE = { x: -12, z: 10 };
const SMALL_ACTOR_SCALE = 0.25;
const TORII_SCALE_MULTIPLIER = 3;
const PLAYER_SPEED_SCALE = 0.25;
const PLAYER_MOVE_BOOST = 1.5;
const BOSS_SKILL_SCALE = SMALL_ACTOR_SCALE;
const BOSS_SKILL_SPEED_SCALE = PLAYER_SPEED_SCALE;
const EXPLORE_MOVE_SPEED = 245 * PLAYER_SPEED_SCALE * PLAYER_MOVE_BOOST;
const BATTLE_MOVE_SPEED = 270 * PLAYER_SPEED_SCALE * PLAYER_MOVE_BOOST;
const PURIFY_MOVE_SPEED = 116 * PLAYER_SPEED_SCALE * PLAYER_MOVE_BOOST;
const DASH_MOVE_SPEED = 720 * PLAYER_SPEED_SCALE;
const JUMP_DURATION = 0.42;
const JUMP_COOLDOWN = 0.56;
const JUMP_3D_HEIGHT = 0.56 * SMALL_ACTOR_SCALE;
const JUMP_2D_HEIGHT = 46;
const CLIMB_ATTACH_DISTANCE = 16;
const CLIMB_DETACH_DISTANCE = 30;
const CLIMB_SURFACE_GAP = 1.2;
const CLIMB_ASCEND_SPEED = 1.06;
const CLIMB_DESCEND_SPEED = 1.18;
const CLIMB_IDLE_SLIDE_SPEED = 0.38;
const CLIMB_LATERAL_SPEED = 86;
const CLIMB_FORCE_DRAIN_ASCEND = 12;
const CLIMB_FORCE_DRAIN_LATERAL = 4;
const CLIMB_GRAVITY = 3.8;
const CLIMB_2D_HEIGHT_SCALE = 148;
const CLIMB_MIN_START_FORCE = 4;
const CLIMB_MIN_HEIGHT = 0.16;
const CLIMB_TOP_SNAP = 0.025;
const PLATFORM_HEIGHT_SNAP = 0.08;
const PLATFORM_COLLISION_CLEARANCE = 0.05;
const PLATFORM_EDGE_MARGIN = 8;
const WORLD_MAP_MIN_ZOOM = 0.7;
const WORLD_MAP_MAX_ZOOM = 4;
const WORLD_MAP_ZOOM_STEP = 1.25;
const WORLD_MAP_PINCH_ZOOM_SENSITIVITY = 0.0014;
const FORCE_RECOVER_EXPLORE = 14;
const FORCE_RECOVER_BATTLE = 9;
const GLIDE_FORCE_DRAIN_EXPLORE = 18;
const GLIDE_FORCE_DRAIN_BATTLE = 22;
const GLIDE_MIN_FORCE_EXPLORE = 10;
const GLIDE_MIN_FORCE_BATTLE = 18;
const PLAYER_COLLISION_RADIUS = 15 * SMALL_ACTOR_SCALE;
const BOSS_COLLISION_RADIUS = 48 * SMALL_ACTOR_SCALE;
const SHRUNK_PROP_KINDS = new Set(["lantern", "torii", "musician", "donationBox"]);
const SHRINE_SCENE = { x: VILLAGE_SCENE.x - 5.8, z: VILLAGE_SCENE.z - 16.5 };
const DONATION_BOX_SCENE = { x: SHRINE_SCENE.x + 0.18, z: SHRINE_SCENE.z + 1.16 };
const SHRINE_HILL_SCENE = { x: SHRINE_SCENE.x, z: SHRINE_SCENE.z + 0.72, rx: 4.9, rz: 3.6 };
const NORTHWEST_BASIN_SCENE = { x: -78.4, z: -14.0, radius: 15.6 };
const TERRAIN_HEIGHT_MIN = -0.58;
const TERRAIN_HEIGHT_MAX = 6.25;
const TERRAIN_MESH_SEGMENTS = 192;
const TERRAIN_WALKABLE_SLOPE = 0.42;
const TERRAIN_COLLISION_STEP_CLEARANCE = 0.055;
const TERRAIN_COLLISION_SAMPLE_RADIUS = 28;
const TERRAIN_FEATURES = [
  { kind: "mountain", name: "西北荒岳·主峰", sceneX: -88.8, sceneZ: -27.1, rx: 8.8, rz: 6.2, rotation: 0.23, height: 6.34, curve: 1.22, layers: 9, color: 0x4d5548, edge: 0xc0c0ad },
  { kind: "mountain", name: "西北荒岳·鋸背", sceneX: -84.2, sceneZ: -24.8, rx: 5.4, rz: 3.8, rotation: -0.42, height: 1.76, curve: 1.38, layers: 7, color: 0x465140, edge: 0xb7baa2 },
  { kind: "mountain", name: "西北荒岳·北壁", sceneX: -92.0, sceneZ: -30.0, rx: 4.6, rz: 2.8, rotation: 0.08, height: 1.36, curve: 1.28, layers: 6, color: 0x5a5d52, edge: 0xc7c2aa },
  { kind: "mountain", name: "西北外山·副峰", sceneX: -72.2, sceneZ: -30.4, rx: 8.8, rz: 3.4, rotation: -0.16, height: 1.12, curve: 1.82, layers: 6, color: 0x3f513b, edge: 0xa8b291 },
  { kind: "mountain", name: "北境遠山", sceneX: 10.8, sceneZ: -29.0, rx: 16.0, rz: 2.8, rotation: -0.08, height: 0.92, curve: 1.68, layers: 6, color: 0x3b4e38, edge: 0xaeb89b },
  { kind: "lowland", name: "西北盆地·主凹", sceneX: NORTHWEST_BASIN_SCENE.x, sceneZ: NORTHWEST_BASIN_SCENE.z, rx: 10.4, rz: 8.6, rotation: 0.12, depth: 0.42, curve: 1.35, layers: 5, color: 0x132112, edge: 0x566f4e },
  { kind: "lowland", name: "西北盆地·西凹", sceneX: -87.4, sceneZ: -19.2, rx: 6.6, rz: 4.8, rotation: 0.34, depth: 0.28, curve: 1.4, layers: 4, color: 0x142413, edge: 0x4f6749 },
  { kind: "lowland", name: "西北盆地·東凹", sceneX: -70.9, sceneZ: -13.1, rx: 6.3, rz: 5.4, rotation: -0.22, depth: 0.26, curve: 1.4, layers: 4, color: 0x152613, edge: 0x55704d },
  { kind: "lowland", name: "西北盆地·南凹", sceneX: -79.1, sceneZ: -6.4, rx: 8.4, rz: 4.9, rotation: 0.04, depth: 0.24, curve: 1.45, layers: 4, color: 0x162714, edge: 0x5a7350 },
  { kind: "meadow", name: "西北盆地·底原", sceneX: -77.6, sceneZ: -13.2, rx: 14.6, rz: 11.4, rotation: -0.08, height: -0.1, curve: 1.6, layers: 3, color: 0x2f4b2a, edge: 0x708861 },
  { kind: "hill", name: "西北盆地·北緣", sceneX: -78.8, sceneZ: -25.6, rx: 10.2, rz: 4.2, rotation: -0.04, height: 0.24, layers: 4, color: 0x2b4528, edge: 0x8ca37a },
  { kind: "hill", name: "西北盆地·西緣", sceneX: -90.8, sceneZ: -14.2, rx: 4.2, rz: 9.2, rotation: 0.16, height: 0.26, layers: 4, color: 0x294126, edge: 0x879f75 },
  { kind: "hill", name: "西北盆地·東緣", sceneX: -66.6, sceneZ: -14.0, rx: 4.8, rz: 9.7, rotation: -0.22, height: 0.22, layers: 4, color: 0x2d4729, edge: 0x90a87c },
  { kind: "hill", name: "西北盆地·南緣", sceneX: -79.6, sceneZ: -2.6, rx: 9.8, rz: 4.3, rotation: 0.08, height: 0.2, layers: 4, color: 0x2f4a2b, edge: 0x8da578 },
  { kind: "meadow", name: "西側空原", sceneX: -62.0, sceneZ: 0.8, rx: 20.8, rz: 16.2, rotation: -0.08, height: 0.04, layers: 4, color: 0x35522d, edge: 0x778e62 },
  { kind: "hill", name: "西端緩丘", sceneX: -84.6, sceneZ: -18.8, rx: 8.4, rz: 5.6, rotation: 0.34, height: 0.3, layers: 5, color: 0x2d4829, edge: 0x9aaf84 },
  { kind: "hill", name: "西北林丘", sceneX: -49.6, sceneZ: -23.2, rx: 10.6, rz: 4.2, rotation: -0.24, height: 0.26, layers: 5, color: 0x2b4428, edge: 0x8fa77c },
  { kind: "lowland", name: "西南窪地", sceneX: -72.8, sceneZ: 20.4, rx: 13.4, rz: 5.8, rotation: 0.16, layers: 4, color: 0x172713, edge: 0x5b7650 },
  { kind: "meadow", name: "西境草坡", sceneX: -43.6, sceneZ: 18.6, rx: 8.8, rz: 6.2, rotation: -0.42, height: 0.08, layers: 3, color: 0x3b5b31, edge: 0x7f9568 },
  { kind: "hill", name: "神社山坡", sceneX: SHRINE_HILL_SCENE.x, sceneZ: SHRINE_HILL_SCENE.z, rx: SHRINE_HILL_SCENE.rx, rz: SHRINE_HILL_SCENE.rz, rotation: -0.08, height: 0.62, layers: 6, color: 0x38512f, edge: 0xd2cfba },
  { kind: "hill", name: "西北杉丘", sceneX: -25.2, sceneZ: -18.4, rx: 6.8, rz: 4.3, rotation: 0.28, height: 0.42, layers: 5, color: 0x2d4528, edge: 0xa9b890 },
  { kind: "hill", name: "北側稜線", sceneX: -5.6, sceneZ: -26.2, rx: 11.2, rz: 3.7, rotation: -0.18, height: 0.34, layers: 5, color: 0x314b2c, edge: 0x9aaa87 },
  { kind: "hill", name: "東境丘陵", sceneX: 20.8, sceneZ: -22.0, rx: 8.8, rz: 4.8, rotation: -0.48, height: 0.36, layers: 5, color: 0x294126, edge: 0x8fa77c },
  { kind: "hill", name: "南東小丘", sceneX: 24.4, sceneZ: 15.8, rx: 6.0, rz: 7.6, rotation: 0.4, height: 0.28, layers: 4, color: 0x334b2d, edge: 0x98a878 },
  { kind: "lowland", name: "南東低地", sceneX: 17.8, sceneZ: 19.2, rx: 8.8, rz: 5.4, rotation: 0.18, layers: 4, color: 0x172713, edge: 0x5b7650 },
  { kind: "lowland", name: "南原濕地", sceneX: -5.4, sceneZ: 25.6, rx: 10.8, rz: 3.8, rotation: -0.14, layers: 4, color: 0x1a2d19, edge: 0x5f7b52 },
  { kind: "meadow", name: "村外草坡", sceneX: -18.8, sceneZ: 17.6, rx: 7.0, rz: 4.8, rotation: 0.34, layers: 3, color: 0x3a5630, edge: 0x7c8f66 },
  { kind: "meadow", name: "南方荒原", sceneX: -36.0, sceneZ: 48.0, rx: 18.0, rz: 12.0, rotation: 0.12, height: 0.04, layers: 4, color: 0x314d2b, edge: 0x748b62 },
  { kind: "lowland", name: "南方濕地", sceneX: 16.0, sceneZ: 62.0, rx: 14.0, rz: 9.0, rotation: -0.2, layers: 4, color: 0x172713, edge: 0x5b7650 },
  { kind: "hill", name: "南境丘陵", sceneX: -58.0, sceneZ: 76.0, rx: 13.0, rz: 7.0, rotation: 0.28, height: 0.32, layers: 5, color: 0x2b4528, edge: 0x8fa77c },
  { kind: "hill", name: "東南丘陵", sceneX: 24.0, sceneZ: 83.0, rx: 16.0, rz: 6.0, rotation: -0.34, height: 0.28, layers: 5, color: 0x304b2c, edge: 0x92a780 },
  { kind: "meadow", name: "南端草海", sceneX: -6.0, sceneZ: 90.0, rx: 28.0, rz: 4.0, rotation: 0.05, height: 0.05, layers: 3, color: 0x385632, edge: 0x81956a },
];
const ROAD_WIDTH = 132;
const LANTERN_CLEAR_RADIUS = 74;
const ROAD_SCENE_POINTS = [
  { x: VILLAGE_SCENE.x - 4.0, z: VILLAGE_SCENE.z + 7.0 },
  { x: VILLAGE_SCENE.x - 4.0, z: VILLAGE_SCENE.z + 4.6 },
  { x: VILLAGE_SCENE.x - 4.6, z: VILLAGE_SCENE.z + 1.9 },
  { x: VILLAGE_SCENE.x - 3.1, z: VILLAGE_SCENE.z + 0.1 },
  { x: VILLAGE_SCENE.x - 0.4, z: VILLAGE_SCENE.z - 0.3 },
  { x: VILLAGE_SCENE.x + 1.8, z: VILLAGE_SCENE.z - 0.6 },
  { x: VILLAGE_SCENE.x - 1.9, z: VILLAGE_SCENE.z - 0.4 },
  { x: VILLAGE_SCENE.x - 3.4, z: VILLAGE_SCENE.z - 3.2 },
  { x: VILLAGE_SCENE.x - 2.6, z: VILLAGE_SCENE.z - 5.8 },
  { x: VILLAGE_SCENE.x - 4.6, z: VILLAGE_SCENE.z - 9.6 },
  { x: VILLAGE_SCENE.x - 5.4, z: VILLAGE_SCENE.z - 13.0 },
  { x: SHRINE_SCENE.x, z: SHRINE_SCENE.z + 2.1 },
];
const VILLAGE_CENTER = {
  x: WORLD.cx + VILLAGE_SCENE.x * WORLD_SCALE,
  y: WORLD.cy + VILLAGE_SCENE.z * WORLD_SCALE,
};
const MAIN_CITY_CENTER = {
  x: WORLD.cx + MAIN_CITY_SCENE.x * WORLD_SCALE,
  y: WORLD.cy + MAIN_CITY_SCENE.z * WORLD_SCALE,
};
const MAP_ANCHORS = [
  { key: "village", name: "中立村落", label: "村", x: VILLAGE_CENTER.x, y: VILLAGE_CENTER.y },
  { key: "southwestCity", name: "西南主城", label: "城", x: MAIN_CITY_CENTER.x, y: MAIN_CITY_CENTER.y },
];
const MUSICIAN_SCENE = { x: VILLAGE_SCENE.x - 0.65, z: VILLAGE_SCENE.z - 0.15 };
const BLACKSMITH_SCENE = { x: VILLAGE_SCENE.x + 4.9, z: VILLAGE_SCENE.z - 2.75 };
const SHOP_SCENE = { x: VILLAGE_SCENE.x - 2.35, z: VILLAGE_SCENE.z + 1.12 };
const VILLAGE_HEAD_SCENE = { x: VILLAGE_SCENE.x - 6.22, z: VILLAGE_SCENE.z + 0.8 };
const MUSICIAN = {
  x: WORLD.cx + MUSICIAN_SCENE.x * WORLD_SCALE,
  y: WORLD.cy + MUSICIAN_SCENE.z * WORLD_SCALE,
  r: 20 * SMALL_ACTOR_SCALE,
  talkRadius: 58,
};
const DONATION_BOX = {
  x: WORLD.cx + DONATION_BOX_SCENE.x * WORLD_SCALE,
  y: WORLD.cy + DONATION_BOX_SCENE.z * WORLD_SCALE,
  r: 22 * SMALL_ACTOR_SCALE,
  talkRadius: 78,
};
const ENCOUNTER_RING = {
  x: BATTLE_CENTER.x,
  y: BATTLE_CENTER.y,
  r: BATTLE_ARENA_RADIUS,
};
const LANDING_DURATION = 2.6;
const AUDIO_SETTINGS_KEY = "tsukishita-audio-settings-v3";
const DEFAULT_AUDIO_SETTINGS = { sfxVolume: 0.5, bgmVolume: 0.5 };
const SFX_GAIN_BOOST = 10;
const BGM_GAIN_BOOST = 1.25;
const MAX_AUDIO_SETTING = 1;
const MAX_TONE_GAIN = 0.34;
const COIN_REWARD_DEFEAT = 3;
const COIN_REWARD_BASE = 12;
const COIN_REWARD_PER_RANK = 3;
const COIN_REWARD_PER_MEMORY = 2;
const DONATION_COST = 50;
const DONATION_TEN_COUNT = 10;
const RENAME_COST = 5;
const TORII_HEAL_PERCENT = 0.02;
const SHRINE_HEAL_PER_SECOND = 0.02;
const SHRINE_HEAL_RADIUS = 170;
const ITEM_DATA = window.TSUKISHITA_ITEM_DATA;
const CHEST_DATA = window.TSUKISHITA_CHEST_DATA;
const DONATION_REWARDS = ITEM_DATA.items;
const ITEM_DEFINITIONS = ITEM_DATA.itemMap;
const INVENTORY_DEFAULT = ITEM_DATA.inventoryDefault;
const INVENTORY_CATEGORIES = ITEM_DATA.categories;
const EQUIPMENT_SLOTS = ITEM_DATA.equipmentSlots;
const HIDDEN_CHEST_SPAWN_POINTS = CHEST_DATA?.spawnPoints || [];
const HIDDEN_CHEST_SPAWN_MAP = CHEST_DATA?.spawnMap || {};
const DAILY_CHEST_COUNT = CHEST_DATA?.dailyCount || 20;
const CHEST_OPEN_RADIUS = 56;
const FIELD_LOOT_COLLECT_RADIUS = 44;
const SHOP_INFINITE_ITEM_KEY = "pureIncenseCandle";
const SHOP_INTERACT_RADIUS = 52;
const GRAVE_INTERACT_RADIUS = 42;
const BLACKSMITH_SMELT_REWARDS = {
  white: { ore: 5, gold: 0 },
  green: { ore: 20, gold: 0 },
  blue: { ore: 100, gold: 0 },
  purple: { ore: 500, gold: 0 },
  gold: { ore: 1500, gold: 1 },
  roseGold: { ore: 2000, gold: 10 },
};
const RESONANCE_DATA = ITEM_DATA.resonance || { max: 5, names: ["一銘", "二銘", "三銘", "四銘", "真銘"] };
const ITEM_RESONANCE_RESOLVER = ITEM_DATA.getItemResonanceData || (() => null);
const RESONANCE_MAX = RESONANCE_DATA.max || 5;
const RESONANCE_NAMES = RESONANCE_DATA.names || ["一銘", "二銘", "三銘", "四銘", "真銘"];
const RESONANCE_NONE_NAME = RESONANCE_DATA.noneName || "無";
const RESONANCE_COPY_COST = RESONANCE_DATA.copyCost || 2;
const RESONANCE_COIN_BASE = RESONANCE_DATA.coinBase || 5;
const RESONANCE_TIER_ORDER = ITEM_DATA.resonanceTierOrder || ["none", "first", "second", "third", "fourth", "true"];
const RESONANCE_TIER_LABELS = ITEM_DATA.resonanceTierLabels || { none: "無", first: "初", second: "二", third: "三", fourth: "四", true: "真" };
const RESONANCE_LEVEL_TO_TIER_KEY = ITEM_DATA.resonanceLevelToTierKey || { 0: "none", 1: "first", 2: "second", 3: "third", 4: "fourth", 5: "true" };
const RESONANCE_TIER_KEY_TO_LEVEL = ITEM_DATA.resonanceTierKeyToLevel || { none: 0, first: 1, second: 2, third: 3, fourth: 4, true: 5 };
const RESONANCE_QUALITY_MULTIPLIERS = RESONANCE_DATA.qualityMultipliers || {
  white: 1,
  green: 2,
  blue: 3,
  purple: 5,
  gold: 7,
  roseGold: 10,
};
const BASE_CRIT_RATE_PCT = 0;
const BASE_CRIT_DAMAGE_BONUS_PCT = 50;
const DONATION_QUALITY_WEIGHTS = {
  white: 60,
  green: 25,
  blue: 10,
  purple: 4.5,
  gold: 0.4,
  roseGold: 0.1,
};
const DISTANCE_FOG = {
  color: 0xded8c2,
  near: 10.5,
  far: 38,
  cameraFar: 90,
};

const ui = {
  hpBar: document.querySelector("#hpBar"),
  pollutionBar: document.querySelector("#pollutionBar"),
  pollutionMeterRow: document.querySelector("#pollutionMeterRow"),
  forceBar: document.querySelector("#forceBar"),
  pathRank: document.querySelector("#pathRank"),
  formBar: document.querySelector("#formBar"),
  aspectBar: document.querySelector("#aspectBar"),
  wishBar: document.querySelector("#wishBar"),
  phaseSeal: document.querySelector("#phaseSeal"),
  memoryStrip: document.querySelector("#memoryStrip"),
  messageLog: document.querySelector("#messageLog"),
  startScreen: document.querySelector("#startScreen"),
  topActions: document.querySelector("#topActions"),
  menuButton: document.querySelector("#menuButton"),
  resultScreen: document.querySelector("#resultScreen"),
  restartButton: document.querySelector("#restartButton"),
  resultPlaque: document.querySelector("#resultPlaque"),
  resultRank: document.querySelector("#resultRank"),
  resultMeaning: document.querySelector("#resultMeaning"),
  resultPath: document.querySelector("#resultPath"),
  resultMemory: document.querySelector("#resultMemory"),
  resultTime: document.querySelector("#resultTime"),
  resultExpRank: document.querySelector("#resultExpRank"),
  resultExpGain: document.querySelector("#resultExpGain"),
  resultExpBar: document.querySelector("#resultExpBar"),
  resultExpText: document.querySelector("#resultExpText"),
  resultExpNext: document.querySelector("#resultExpNext"),
  bestRecord: document.querySelector("#bestRecord"),
  recordList: document.querySelector("#recordList"),
  accountList: document.querySelector("#accountList"),
  registerForm: document.querySelector("#registerForm"),
  accountNameInput: document.querySelector("#accountNameInput"),
  accountStatus: document.querySelector("#accountStatus"),
  returnButton: document.querySelector("#returnButton"),
  sideMenuScreen: document.querySelector("#sideMenuScreen"),
  sideMenuScrim: document.querySelector("#sideMenuScrim"),
  sideMenuCloseButton: document.querySelector("#sideMenuCloseButton"),
  sideMenuRealmMark: document.querySelector("#sideMenuRealmMark"),
  sideMenuName: document.querySelector("#sideMenuName"),
  sideMenuRank: document.querySelector("#sideMenuRank"),
  sideMenuAccountMark: document.querySelector("#sideMenuAccountMark"),
  sideMenuCharacterButton: document.querySelector("#sideMenuCharacterButton"),
  sideMenuInventoryButton: document.querySelector("#sideMenuInventoryButton"),
  sideMenuCodexButton: document.querySelector("#sideMenuCodexButton"),
  sideMenuSettingsButton: document.querySelector("#sideMenuSettingsButton"),
  worldMapScreen: document.querySelector("#worldMapScreen"),
  worldMapCloseButton: document.querySelector("#worldMapCloseButton"),
  worldMapScroll: document.querySelector("#worldMapScroll"),
  worldMapStage: document.querySelector("#worldMapStage"),
  worldMapCanvas: document.querySelector("#worldMapCanvas"),
  villageMapAnchor: document.querySelector("#villageMapAnchor"),
  southwestCityMapAnchor: document.querySelector("#southwestCityMapAnchor"),
  worldMapRegionLabel: document.querySelector("#worldMapRegionLabel"),
  worldMapZoomInButton: document.querySelector("#worldMapZoomInButton"),
  worldMapZoomOutButton: document.querySelector("#worldMapZoomOutButton"),
  worldMapZoomResetButton: document.querySelector("#worldMapZoomResetButton"),
  worldMapZoomLabel: document.querySelector("#worldMapZoomLabel"),
  shopScreen: document.querySelector("#shopScreen"),
  shopRealmMark: document.querySelector("#shopRealmMark"),
  shopCloseButton: document.querySelector("#shopCloseButton"),
  shopDayLabel: document.querySelector("#shopDayLabel"),
  shopCoinLabel: document.querySelector("#shopCoinLabel"),
  shopInfiniteList: document.querySelector("#shopInfiniteList"),
  shopDailyList: document.querySelector("#shopDailyList"),
  blacksmithScreen: document.querySelector("#blacksmithScreen"),
  blacksmithRealmMark: document.querySelector("#blacksmithRealmMark"),
  blacksmithCloseButton: document.querySelector("#blacksmithCloseButton"),
  blacksmithCoinAmount: document.querySelector("#blacksmithCoinAmount"),
  blacksmithGoldAmount: document.querySelector("#blacksmithGoldAmount"),
  blacksmithInventoryList: document.querySelector("#blacksmithInventoryList"),
  blacksmithEmpty: document.querySelector("#blacksmithEmpty"),
  blacksmithSettlementItems: document.querySelector("#blacksmithSettlementItems"),
  blacksmithCoinCost: document.querySelector("#blacksmithCoinCost"),
  blacksmithOreGain: document.querySelector("#blacksmithOreGain"),
  blacksmithGoldGain: document.querySelector("#blacksmithGoldGain"),
  blacksmithSmeltButton: document.querySelector("#blacksmithSmeltButton"),
  characterScreen: document.querySelector("#characterScreen"),
  characterCloseButton: document.querySelector("#characterCloseButton"),
  characterRealmMark: document.querySelector("#characterRealmMark"),
  characterName: document.querySelector("#characterName"),
  characterRank: document.querySelector("#characterRank"),
  characterStats: document.querySelector("#characterStats"),
  equipmentSlots: document.querySelector("#equipmentSlots"),
  backpackScreen: document.querySelector("#backpackScreen"),
  backpackRealmMark: document.querySelector("#backpackRealmMark"),
  backpackCloseButton: document.querySelector("#backpackCloseButton"),
  coinAmount: document.querySelector("#coinAmount"),
  goldAmount: document.querySelector("#goldAmount"),
  inventoryList: document.querySelector("#inventoryList"),
  inventoryDetail: document.querySelector("#inventoryDetail"),
  inventoryTabs: [...document.querySelectorAll("[data-inventory-category]")],
  itemQualityFilterButtons: [...document.querySelectorAll("[data-quality-filter]")],
  itemQualitySortButtons: [...document.querySelectorAll("[data-quality-sort]")],
  backpackEmpty: document.querySelector("#backpackEmpty"),
  codexScreen: document.querySelector("#codexScreen"),
  codexRealmMark: document.querySelector("#codexRealmMark"),
  codexCloseButton: document.querySelector("#codexCloseButton"),
  codexList: document.querySelector("#codexList"),
  settingsScreen: document.querySelector("#settingsScreen"),
  settingsRealmMark: document.querySelector("#settingsRealmMark"),
  settingsCloseButton: document.querySelector("#settingsCloseButton"),
  settingsMenu: document.querySelector("#settingsMenu"),
  settingsBackButton: document.querySelector("#settingsBackButton"),
  settingsMenuAccount: document.querySelector("#settingsMenuAccount"),
  settingsMenuAudio: document.querySelector("#settingsMenuAudio"),
  settingsMenuCredits: document.querySelector("#settingsMenuCredits"),
  settingsAccountPage: document.querySelector("#settingsAccountPage"),
  settingsAudioPage: document.querySelector("#settingsAudioPage"),
  settingsCreditsPage: document.querySelector("#settingsCreditsPage"),
  settingsAccountName: document.querySelector("#settingsAccountName"),
  settingsAccountRank: document.querySelector("#settingsAccountRank"),
  renameForm: document.querySelector("#renameForm"),
  renameNameInput: document.querySelector("#renameNameInput"),
  renameAccountButton: document.querySelector("#renameAccountButton"),
  sfxVolumeSlider: document.querySelector("#sfxVolumeSlider"),
  sfxVolumeValue: document.querySelector("#sfxVolumeValue"),
  bgmVolumeSlider: document.querySelector("#bgmVolumeSlider"),
  bgmVolumeValue: document.querySelector("#bgmVolumeValue"),
  bgmStatus: document.querySelector("#bgmStatus"),
  testSfxButton: document.querySelector("#testSfxButton"),
  testBgmButton: document.querySelector("#testBgmButton"),
  clearRecordsButton: document.querySelector("#clearRecordsButton"),
  deleteAccountButton: document.querySelector("#deleteAccountButton"),
  itemPopup: document.querySelector("#itemPopup"),
  itemPopupCard: document.querySelector("#itemPopupCard"),
  itemPopupKicker: document.querySelector("#itemPopupKicker"),
  itemPopupIcon: document.querySelector("#itemPopupIcon"),
  itemPopupName: document.querySelector("#itemPopupName"),
  itemPopupMeta: document.querySelector("#itemPopupMeta"),
  itemPopupCloseButton: document.querySelector("#itemPopupCloseButton"),
  ultimateParticleLayers: [...document.querySelectorAll(".ultimate-particle-layer")],
};

const progression = window.TSUKISHITA_PROGRESSION;
const keys = new Set();
let pointerWorld = { x: WORLD.cx, y: WORLD.cy };
let pressedSlash = false;
let pressedDash = false;
let pressedJump = false;
let pressedObserve = false;
let pressedCollect = false;
let pressedPurify = false;
let pressedTenDonation = false;
let lastTime = performance.now();
let running = false;
let settingsPausedMode = null;
let settingsPausedBgm = false;
let sideMenuPausedMode = null;
let sideMenuPausedBgm = false;
let worldMapPausedMode = null;
let worldMapPausedBgm = false;
let worldMapZoom = 1;
let shopPausedMode = null;
let shopPausedBgm = false;
let shopBusy = false;
let currentShop = null;
let blacksmithPausedMode = null;
let blacksmithPausedBgm = false;
let blacksmithBusy = false;
let blacksmithSelections = new Map();
let graveBondBusy = false;
let backpackPausedMode = null;
let backpackPausedBgm = false;
let characterPausedMode = null;
let characterPausedBgm = false;
let codexPausedMode = null;
let codexPausedBgm = false;
let backpackReturnToMenu = false;
let characterReturnToMenu = false;
let codexReturnToMenu = false;
let settingsReturnToMenu = false;
let equipmentBusy = false;
let activeInventoryCategory = "special";
let activeItemQualityFilter = "all";
let itemQualitySort = false;
let selectedInventoryEntry = null;
let inventoryClickLockTargetViewId = null;
let backpackVisibleEntries = [];
let resonanceBusy = false;
let itemTransformBusy = false;
let itemPopupQueue = [];
let itemPopupNextTimer = 0;
const ultimateParticleTimers = new Map();
let cameraYaw = 0;
let cameraPitch = 0;
let view = { scale: 1, baseScale: 1, ox: 0, oy: 0, w: 0, h: 0, cx: WORLD.cx, cy: WORLD.cy, anchorX: 0, anchorY: 0 };
let audio;
let sfxGain;
let suzuBuffers = {};
let suzuBufferPromises = {};
let purifySuzuSource = null;
let purifySuzuGain = null;
let purifySuzuToken = 0;
let bgmGain;
let bgmBuffer;
let bgmBufferPromise;
let bgmSource;
let bgmStartedAt = 0;
let bgmOffset = 0;
let bgmRequested = false;
let bgmPlaying = false;
let bgmPlayToken = 0;
let bgmLoadError = null;
let zoneBgmSources = [...ZONE_BGM_SOURCES];
let zoneBgmSourcesPromise;
const zoneBgmBuffers = new Map();
const zoneBgmBufferPromises = new Map();
let zoneBgmSource;
let zoneBgmStartedAt = 0;
let zoneBgmOffset = 0;
let zoneBgmRequested = false;
let zoneBgmPlaying = false;
let zoneBgmPlayToken = 0;
let zoneBgmLoadError = null;
let zoneBgmCurrentSource = "";
let zoneBgmCurrentBuffer = null;
let audioSettings = loadAudioSettings();
let selfTestLogged = false;
let accounts = [];
let activeAccount = null;
let donationBusy = false;
let chestBusy = false;
let fieldLootBusy = false;
let locationSaveTimer = 0;
let locationSaveBusy = false;
let locationSaveQueued = false;
let lastSavedLocationKey = "";
let hoveredButton = null;
let lastButtonHoverSound = 0;
let THREE;
let renderer3d;
let scene3d;
let camera3d;
let world3d;
let dynamic3d;
let player3d;
let boss3d;
let wishCore3d;
let slashSector3d;
let slashArc3d;
let slashRange3dValue = 0;
let observeRing3d;
let purifyRing3d;
let mistField3d;
let outerMist3d;
let lanternLights3d = [];
let lanternGlow3d = [];
let chestObjects3d = new Map();
let terrainObjects3d = new Map();
let villageDecorAssets = null;
let lastCameraTarget;
let threeReady = false;
let threeFailed = false;
const selfTest = new URLSearchParams(window.location.search).has("selftest");

const ranks = [
  { name: "荒壱", tier: "rough", meaning: "尚未成形，戰鬥粗糙但有力量。" },
  { name: "荒弐", tier: "rough", meaning: "刀勢已有輪廓，心仍被執念牽動。" },
  { name: "澄壱", tier: "clear", meaning: "心開始清明，不再完全被穢氣拖走。" },
  { name: "澄弐", tier: "clear", meaning: "能守住心燈，在混濁中辨認方向。" },
  { name: "巧壱", tier: "skill", meaning: "型與勢開始相合，斬擊確實破形。" },
  { name: "巧弐", tier: "skill", meaning: "技法成熟，能掌握破綻與動能。" },
  { name: "妙壱", tier: "subtle", meaning: "看見了敵人的相，也看見戰鬥之理。" },
  { name: "妙弐", tier: "subtle", meaning: "能在刀光中辨認願核，不被表象欺瞞。" },
  { name: "粋壱", tier: "stylish", meaning: "收放有度，俐落、克制地取勝。" },
  { name: "粋弐", tier: "stylish", meaning: "遊、斬、祓銜接流暢，餘勢不亂。" },
  { name: "雅壱", tier: "elegant", meaning: "戰鬥已近祓儀，斬而不執。" },
  { name: "雅弐", tier: "elegant", meaning: "祓而不亂，願望在靜處回聲。" },
  { name: "極", tier: "ultimate", meaning: "斬、祓、遊與型、勢、心皆歸一。" },
];

const memoryTexts = [
  { short: "守る", full: "「我只是想守住那盞燈。」" },
  { short: "待つ", full: "「祭囃子停了，可孩子還沒回家。」" },
  { short: "名", full: "「若有人喚我真名，我便能放手。」" },
];

const STATIC_PROPS = [
  { kind: "shrine", sceneX: SHRINE_SCENE.x, sceneZ: SHRINE_SCENE.z, scale: 1.12, rotation: 0 },
  { kind: "donationBox", sceneX: DONATION_BOX_SCENE.x, sceneZ: DONATION_BOX_SCENE.z, scale: SMALL_ACTOR_SCALE, rotation: 0 },
  { kind: "torii", sceneX: SHRINE_SCENE.x, sceneZ: SHRINE_SCENE.z + 2.0, scale: 1.06 * SMALL_ACTOR_SCALE * TORII_SCALE_MULTIPLIER, rotation: 0 },
  { kind: "house", sceneX: VILLAGE_SCENE.x - 7.1, sceneZ: VILLAGE_SCENE.z + 0.2, scale: 0.95, rotation: -0.16 },
  { kind: "house", sceneX: VILLAGE_SCENE.x - 7.0, sceneZ: VILLAGE_SCENE.z + 2.1, scale: 0.98, rotation: 0.03 },
  { kind: "house", sceneX: VILLAGE_SCENE.x - 6.85, sceneZ: VILLAGE_SCENE.z + 4.0, scale: 1.02, rotation: 0.02 },
  { kind: "house", sceneX: VILLAGE_SCENE.x - 6.45, sceneZ: VILLAGE_SCENE.z + 6.0, scale: 1.0, rotation: -0.28 },
  { kind: "house", sceneX: VILLAGE_SCENE.x - 0.75, sceneZ: VILLAGE_SCENE.z - 2.45, scale: 1.02, rotation: -0.72 },
  { kind: "house", sceneX: VILLAGE_SCENE.x + 1.65, sceneZ: VILLAGE_SCENE.z - 2.1, scale: 1.12, rotation: -0.16 },
  { kind: "house", sceneX: VILLAGE_SCENE.x + 3.35, sceneZ: VILLAGE_SCENE.z - 1.45, scale: 0.86, rotation: 0.18 },
  { kind: "house", sceneX: VILLAGE_SCENE.x - 0.4, sceneZ: VILLAGE_SCENE.z + 2.8, scale: 1.56, rotation: -0.68 },
  { kind: "blacksmithShop", sceneX: BLACKSMITH_SCENE.x, sceneZ: BLACKSMITH_SCENE.z, scale: 0.92, rotation: -0.08 },
  { kind: "villageShop", sceneX: SHOP_SCENE.x, sceneZ: SHOP_SCENE.z, scale: 0.94, rotation: 0.22 },
  { kind: "fence", sceneX: VILLAGE_SCENE.x + 4.65, sceneZ: VILLAGE_SCENE.z - 0.8, scale: 0.56, rotation: 1.92 },
  { kind: "fence", sceneX: VILLAGE_SCENE.x + 4.95, sceneZ: VILLAGE_SCENE.z + 0.12, scale: 0.56, rotation: 1.68 },
  { kind: "fence", sceneX: VILLAGE_SCENE.x + 4.82, sceneZ: VILLAGE_SCENE.z + 1.12, scale: 0.56, rotation: 1.5 },
  { kind: "fence", sceneX: VILLAGE_SCENE.x + 5.04, sceneZ: VILLAGE_SCENE.z + 2.0, scale: 0.56, rotation: 1.38 },
  { kind: "lantern", sceneX: SHRINE_SCENE.x - 0.82, sceneZ: SHRINE_SCENE.z + 2.02 },
  { kind: "lantern", sceneX: SHRINE_SCENE.x + 0.82, sceneZ: SHRINE_SCENE.z + 2.02 },
  { kind: "lantern", sceneX: VILLAGE_SCENE.x - 1.32, sceneZ: VILLAGE_SCENE.z - 0.74 },
  { kind: "lantern", sceneX: VILLAGE_SCENE.x + 1.02, sceneZ: VILLAGE_SCENE.z - 0.82 },
  { kind: "lantern", sceneX: VILLAGE_SCENE.x - 4.18, sceneZ: VILLAGE_SCENE.z + 2.28 },
  { kind: "musician", sceneX: MUSICIAN_SCENE.x, sceneZ: MUSICIAN_SCENE.z, scale: SMALL_ACTOR_SCALE },
  {
    kind: "npc",
    role: "blacksmith",
    name: "鐵匠",
    sceneX: BLACKSMITH_SCENE.x - 0.62,
    sceneZ: BLACKSMITH_SCENE.z + 0.72,
    scale: SMALL_ACTOR_SCALE,
    rotation: -0.18,
    robe: 0x6a2d1b,
    message: "鐵匠「刀は火と水で目を覚ます。材料が揃えば、いつかその刃も鍛え直してやろう。」",
  },
  {
    kind: "npc",
    role: "shopkeeper",
    name: "店員",
    sceneX: SHOP_SCENE.x + 0.64,
    sceneZ: SHOP_SCENE.z - 0.68,
    scale: SMALL_ACTOR_SCALE,
    rotation: 0.3,
    robe: 0x2f6a53,
    message: "店員「旅の支度なら任せて。祓具も護符も、仕入れが整ったら並べるつもりよ。」",
  },
  {
    kind: "npc",
    role: "elder",
    name: "村長",
    sceneX: VILLAGE_HEAD_SCENE.x,
    sceneZ: VILLAGE_HEAD_SCENE.z,
    scale: SMALL_ACTOR_SCALE,
    rotation: 0.1,
    robe: 0x6b5a3a,
    message: "村長「紅き境へ向かうなら、帰る道を忘れるな。祓行は勝つことより、戻ることが肝心じゃ。」",
  },
  { kind: "torii", sceneX: BATTLE_SCENE.x - 10.7, sceneZ: BATTLE_SCENE.z + 6.55, scale: 1.08 * SMALL_ACTOR_SCALE * TORII_SCALE_MULTIPLIER, rotation: -0.58 },
  { kind: "torii", sceneX: BATTLE_SCENE.x - 3.9, sceneZ: BATTLE_SCENE.z - 7.2, scale: 0.82 * SMALL_ACTOR_SCALE * TORII_SCALE_MULTIPLIER, rotation: 0.16 },
  { kind: "lantern", sceneX: BATTLE_SCENE.x - 11.18, sceneZ: BATTLE_SCENE.z + 5.82 },
  { kind: "lantern", sceneX: BATTLE_SCENE.x - 9.98, sceneZ: BATTLE_SCENE.z + 7.18 },
  { kind: "lantern", sceneX: BATTLE_SCENE.x - 5.7, sceneZ: BATTLE_SCENE.z + 2.8 },
  { kind: "lantern", sceneX: BATTLE_SCENE.x + 0.7, sceneZ: BATTLE_SCENE.z - 6.15 },
];

function buildMainCityBuildingLayout() {
  const rng = makeSeededRng(0x45a11c);
  const buildings = [];
  const rows = [-25.5, -18.5, -11.5, 11.5, 18.5, 25.5];
  const cols = [-25.5, -18.5, -11.5, 11.5, 18.5, 25.5];
  let index = 0;
  const addBuilding = (localX, localZ, options = {}) => {
    const point = mainCityScenePoint(localX, localZ);
    const type = options.type || (index % 9 === 0 ? "merchant" : index % 13 === 0 ? "storehouse" : "townhouse");
    const width = options.width || (type === "merchant" ? 2.7 : type === "storehouse" ? 2.25 : 1.95 + rng() * 0.55);
    const depth = options.depth || (type === "merchant" ? 2.05 : type === "storehouse" ? 1.9 : 1.55 + rng() * 0.45);
    const floors = options.floors || (type === "merchant" || rng() > 0.62 ? 2 : 1);
    const rotation = MAIN_CITY_SCENE.rotation + (options.turn ? Math.PI / 2 : 0) + (rng() - 0.5) * (options.jitter ?? 0.055);
    buildings.push({
      key: `main-city-building-${index}`,
      type,
      localX,
      localZ,
      sceneX: point.x,
      sceneZ: point.z,
      rotation,
      width,
      depth,
      floors,
      roof: options.roof || (index % 4 === 0 ? "redTile" : "darkTile"),
      accent: index % 5,
    });
    index += 1;
  };

  for (const localZ of rows) {
    for (const localX of cols) {
      if (Math.abs(localX) < 8 && Math.abs(localZ) < 8) continue;
      if (Math.abs(localX) > MAIN_CITY_SCENE.half - 3 || Math.abs(localZ) > MAIN_CITY_SCENE.half - 3) continue;
      addBuilding(localX + (rng() - 0.5) * 0.9, localZ + (rng() - 0.5) * 0.9, {
        turn: Math.abs(localX) > Math.abs(localZ),
      });
    }
  }

  addBuilding(0, -27.9, { type: "gatehouse", width: 5.4, depth: 1.55, floors: 2, roof: "redTile", jitter: 0, turn: false });
  addBuilding(27.9, 0, { type: "gatehouse", width: 5.2, depth: 1.55, floors: 2, roof: "darkTile", jitter: 0, turn: true });
  addBuilding(-7.2, 0, { type: "merchant", width: 3.35, depth: 2.2, floors: 2, roof: "redTile", jitter: 0.03, turn: true });
  addBuilding(7.2, 0, { type: "merchant", width: 3.35, depth: 2.2, floors: 2, roof: "darkTile", jitter: 0.03, turn: true });
  addBuilding(0, 7.2, { type: "storehouse", width: 2.8, depth: 2.15, floors: 1, roof: "darkTile", jitter: 0.03 });
  return buildings;
}

function buildMainCitySakuraLayout() {
  const rng = makeSeededRng(0x5a6b7c);
  const trees = [];
  const addTree = (localX, localZ, scale = 1, colorShift = 0) => {
    const point = mainCityScenePoint(localX + (rng() - 0.5) * 0.42, localZ + (rng() - 0.5) * 0.42);
    trees.push({
      key: `main-city-sakura-${trees.length}`,
      localX,
      localZ,
      sceneX: point.x,
      sceneZ: point.z,
      scale: scale * (0.9 + rng() * 0.22),
      rotation: rng() * TWO_PI,
      colorShift,
    });
  };
  for (const z of [-22, -15, -8, 8, 15, 22]) {
    addTree(-4.2, z, 0.82, rng());
    addTree(4.2, z, 0.82, rng());
  }
  for (const x of [-22, -15, -8, 8, 15, 22]) {
    addTree(x, -4.2, 0.78, rng());
    addTree(x, 4.2, 0.78, rng());
  }
  for (const [x, z, s] of [
    [-27.6, -27.2, 0.92],
    [-25.2, 25.4, 0.88],
    [25.4, -25.8, 0.9],
    [24.7, 24.5, 0.86],
    [-8.2, -8.0, 0.72],
    [8.2, 8.0, 0.72],
  ]) addTree(x, z, s, rng());
  return trees;
}

const MAIN_CITY_BUILDINGS = buildMainCityBuildingLayout();
const MAIN_CITY_SAKURA_TREES = buildMainCitySakuraLayout();

function makeSeededRng(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function sceneSegmentDistance(sceneX, sceneZ, a, b) {
  const dx = b.x - a.x;
  const dz = b.z - a.z;
  const lengthSq = dx * dx + dz * dz || 1;
  const t = clamp(((sceneX - a.x) * dx + (sceneZ - a.z) * dz) / lengthSq, 0, 1);
  return Math.hypot(sceneX - (a.x + dx * t), sceneZ - (a.z + dz * t));
}

function distanceToRoadScene(sceneX, sceneZ) {
  let distance = Infinity;
  for (let i = 0; i < ROAD_SCENE_POINTS.length - 1; i += 1) {
    distance = Math.min(distance, sceneSegmentDistance(sceneX, sceneZ, ROAD_SCENE_POINTS[i], ROAD_SCENE_POINTS[i + 1]));
  }
  return distance;
}

function mainCityLocal(sceneX, sceneZ) {
  const rotation = MAIN_CITY_SCENE.rotation || 0;
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  const dx = sceneX - MAIN_CITY_SCENE.x;
  const dz = sceneZ - MAIN_CITY_SCENE.z;
  return {
    x: cos * dx + sin * dz,
    z: -sin * dx + cos * dz,
  };
}

function mainCityScenePoint(localX, localZ) {
  const rotation = MAIN_CITY_SCENE.rotation || 0;
  return {
    x: MAIN_CITY_SCENE.x + Math.cos(rotation) * localX - Math.sin(rotation) * localZ,
    z: MAIN_CITY_SCENE.z + Math.sin(rotation) * localX + Math.cos(rotation) * localZ,
  };
}

function scenePointInMainCity(sceneX, sceneZ, padding = 0) {
  const local = mainCityLocal(sceneX, sceneZ);
  return Math.abs(local.x) <= MAIN_CITY_SCENE.half + padding
    && Math.abs(local.z) <= MAIN_CITY_SCENE.half + padding;
}

function mainCityInfluence(sceneX, sceneZ, edgeSoftness = 3.4) {
  const local = mainCityLocal(sceneX, sceneZ);
  const edge = Math.max(Math.abs(local.x), Math.abs(local.z));
  return clamp((MAIN_CITY_SCENE.half - edge) / Math.max(0.001, edgeSoftness), 0, 1);
}

function staticPropClearanceScene(prop) {
  const scale = prop.scale || 1;
  if (prop.kind === "house") return 1.55 * scale;
  if (prop.kind === "blacksmithShop" || prop.kind === "villageShop") return 1.7 * scale;
  if (prop.kind === "shrine") return 2.35 * scale;
  if (prop.kind === "torii") return 1.2 * scale;
  if (prop.kind === "fence") return 0.58 * scale;
  if (prop.kind === "lantern") return 0.55;
  if (prop.kind === "donationBox") return 0.55;
  if (prop.kind === "musician" || prop.kind === "npc") return 0.62;
  return 0.9 * scale;
}

function scenePointInWorldBounds(sceneX, sceneZ, margin = 0) {
  return sceneX >= WORLD_SCENE_MIN_X + margin
    && sceneX <= WORLD_SCENE_MAX_X - margin
    && sceneZ >= WORLD_SCENE_MIN_Z + margin
    && sceneZ <= WORLD_SCENE_MAX_Z - margin;
}

function scenePointIsOpen(sceneX, sceneZ, options = {}) {
  const roadPadding = options.roadPadding ?? 1.32;
  const propPadding = options.propPadding ?? 0.82;
  const battlePadding = options.battlePadding ?? 0.72;
  if (!scenePointInWorldBounds(sceneX, sceneZ, 0.68)) return false;
  if (options.avoidMainCity !== false && scenePointInMainCity(sceneX, sceneZ, 1.6)) return false;
  if (options.avoidBattle !== false) {
    const battleRadius = BATTLE_ARENA_RADIUS / WORLD_SCALE;
    if (Math.hypot(sceneX - BATTLE_SCENE.x, sceneZ - BATTLE_SCENE.z) < battleRadius + battlePadding) return false;
  }
  if (distanceToRoadScene(sceneX, sceneZ) < roadPadding) return false;
  for (const prop of STATIC_PROPS) {
    if (Math.hypot(sceneX - prop.sceneX, sceneZ - prop.sceneZ) < staticPropClearanceScene(prop) + propPadding) return false;
  }
  return true;
}

function addTerrainDetail(details, detail, options = {}) {
  if (!scenePointIsOpen(detail.sceneX, detail.sceneZ, options)) return false;
  details.push(detail);
  return true;
}

function addTerrainCluster(details, rng, cluster) {
  let added = 0;
  const rotation = cluster.rotation || 0;
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  for (let attempt = 0; added < cluster.count && attempt < cluster.count * 5; attempt += 1) {
    const angle = rng() * TWO_PI;
    const radius = Math.sqrt(rng());
    const localX = Math.cos(angle) * cluster.rx * radius;
    const localZ = Math.sin(angle) * cluster.rz * radius;
    const sceneX = cluster.sceneX + cos * localX - sin * localZ;
    const sceneZ = cluster.sceneZ + sin * localX + cos * localZ;
    const scale = (cluster.scaleMin || 0.7) + rng() * ((cluster.scaleMax || 1.1) - (cluster.scaleMin || 0.7));
    const type = cluster.type || (rng() < 0.55 ? "cedar" : rng() < 0.76 ? "pine" : "broadleaf");
    const options = {
      roadPadding: cluster.kind === "bush" ? 0.88 : 1.32,
      propPadding: cluster.kind === "bush" ? 0.46 : 0.78,
      battlePadding: cluster.kind === "bush" ? 0.34 : 0.72,
    };
    if (addTerrainDetail(details, {
      kind: cluster.kind,
      type,
      sceneX,
      sceneZ,
      scale,
      rotation: rng() * TWO_PI,
      colorShift: rng(),
    }, options)) {
      added += 1;
    }
  }
}

function addRoadsideCedars(details, rng) {
  const sideOffset = ROAD_WIDTH / WORLD_SCALE * 0.78;
  for (let i = 6; i < ROAD_SCENE_POINTS.length - 1; i += 1) {
    const a = ROAD_SCENE_POINTS[i];
    const b = ROAD_SCENE_POINTS[i + 1];
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const length = Math.hypot(dx, dz);
    if (length < 0.01) continue;
    const nx = -dz / length;
    const nz = dx / length;
    for (let step = 1.1; step < length - 0.6; step += 1.75) {
      const t = step / length;
      const side = (Math.floor(step * 10) + i) % 2 === 0 ? -1 : 1;
      const sceneX = a.x + dx * t + nx * sideOffset * side + (rng() - 0.5) * 0.22;
      const sceneZ = a.z + dz * t + nz * sideOffset * side + (rng() - 0.5) * 0.22;
      addTerrainDetail(details, {
        kind: "tree",
        type: "cedar",
        sceneX,
        sceneZ,
        scale: 0.62 + rng() * 0.36,
        rotation: rng() * TWO_PI,
        colorShift: rng(),
      }, { roadPadding: 1.08, propPadding: 0.62, battlePadding: 0.72 });
    }
  }
}

function buildTerrainDetails() {
  const rng = makeSeededRng(0x715a4d);
  const details = [];
  const clusters = [
    { kind: "tree", type: "cedar", sceneX: SHRINE_SCENE.x + 0.08, sceneZ: SHRINE_SCENE.z - 4.4, rx: 2.3, rz: 1.3, rotation: -0.06, count: 6, scaleMin: 0.58, scaleMax: 0.9 },
    { kind: "bush", sceneX: SHRINE_SCENE.x - 2.8, sceneZ: SHRINE_SCENE.z + 1.7, rx: 1.45, rz: 2.1, rotation: 0.18, count: 12, scaleMin: 0.42, scaleMax: 0.7 },
    { kind: "bush", sceneX: SHRINE_SCENE.x + 2.82, sceneZ: SHRINE_SCENE.z + 1.74, rx: 1.45, rz: 2.1, rotation: -0.18, count: 12, scaleMin: 0.42, scaleMax: 0.7 },
    { kind: "bush", sceneX: SHRINE_SCENE.x + 0.12, sceneZ: SHRINE_SCENE.z - 2.4, rx: 2.8, rz: 1.1, rotation: 0.04, count: 10, scaleMin: 0.44, scaleMax: 0.74 },
    { kind: "tree", type: "cedar", sceneX: -84.4, sceneZ: -18.6, rx: 7.2, rz: 4.4, rotation: 0.34, count: 32, scaleMin: 0.7, scaleMax: 1.18 },
    { kind: "tree", type: "pine", sceneX: -49.4, sceneZ: -23.0, rx: 9.4, rz: 3.5, rotation: -0.24, count: 28, scaleMin: 0.66, scaleMax: 1.1 },
    { kind: "tree", type: "broadleaf", sceneX: -62.0, sceneZ: -2.4, rx: 15.0, rz: 11.8, rotation: -0.08, count: 34, scaleMin: 0.54, scaleMax: 0.96 },
    { kind: "tree", type: "willow", sceneX: -73.2, sceneZ: 20.6, rx: 11.2, rz: 4.8, rotation: 0.16, count: 22, scaleMin: 0.58, scaleMax: 0.98 },
    { kind: "bush", sceneX: -72.8, sceneZ: 20.4, rx: 13.0, rz: 5.4, rotation: 0.16, count: 46, scaleMin: 0.38, scaleMax: 0.78 },
    { kind: "bush", sceneX: -43.4, sceneZ: 18.6, rx: 8.2, rz: 5.4, rotation: -0.42, count: 34, scaleMin: 0.4, scaleMax: 0.8 },
    { kind: "bush", sceneX: -91.0, sceneZ: 7.2, rx: 2.0, rz: 18.0, rotation: 0.03, count: 30, scaleMin: 0.44, scaleMax: 0.86 },
    { kind: "tree", type: "cedar", sceneX: -25.6, sceneZ: -18.8, rx: 5.8, rz: 3.4, rotation: 0.28, count: 24, scaleMin: 0.75, scaleMax: 1.25 },
    { kind: "tree", type: "pine", sceneX: -6.2, sceneZ: -26.0, rx: 8.0, rz: 2.8, rotation: -0.18, count: 20, scaleMin: 0.68, scaleMax: 1.15 },
    { kind: "tree", type: "pine", sceneX: 20.8, sceneZ: -22.2, rx: 7.2, rz: 3.8, rotation: -0.48, count: 22, scaleMin: 0.7, scaleMax: 1.18 },
    { kind: "tree", sceneX: 26.2, sceneZ: 14.2, rx: 4.8, rz: 6.6, rotation: 0.36, count: 18, scaleMin: 0.68, scaleMax: 1.08 },
    { kind: "tree", sceneX: -25.4, sceneZ: 22.8, rx: 4.8, rz: 5.2, rotation: -0.24, count: 16, scaleMin: 0.64, scaleMax: 1.04 },
    { kind: "tree", type: "broadleaf", sceneX: -20.8, sceneZ: -4.8, rx: 4.2, rz: 5.2, rotation: 0.12, count: 14, scaleMin: 0.62, scaleMax: 1.0 },
    { kind: "tree", type: "willow", sceneX: -4.8, sceneZ: 25.4, rx: 8.2, rz: 2.6, rotation: -0.14, count: 14, scaleMin: 0.62, scaleMax: 0.98 },
    { kind: "bush", sceneX: -19.0, sceneZ: 17.4, rx: 6.4, rz: 3.8, rotation: 0.34, count: 32, scaleMin: 0.48, scaleMax: 0.92 },
    { kind: "bush", sceneX: 17.8, sceneZ: 19.2, rx: 8.2, rz: 4.8, rotation: 0.18, count: 36, scaleMin: 0.44, scaleMax: 0.88 },
    { kind: "bush", sceneX: -14.4, sceneZ: 6.8, rx: 5.2, rz: 4.2, rotation: -0.1, count: 24, scaleMin: 0.42, scaleMax: 0.78 },
    { kind: "bush", sceneX: 28.2, sceneZ: -8.8, rx: 2.4, rz: 9.2, rotation: 0.03, count: 22, scaleMin: 0.48, scaleMax: 0.94 },
    { kind: "tree", type: "broadleaf", sceneX: -42.0, sceneZ: 46.0, rx: 15.0, rz: 9.4, rotation: 0.12, count: 28, scaleMin: 0.58, scaleMax: 1.02 },
    { kind: "tree", type: "willow", sceneX: 15.8, sceneZ: 61.6, rx: 12.0, rz: 7.6, rotation: -0.2, count: 22, scaleMin: 0.58, scaleMax: 0.98 },
    { kind: "tree", type: "cedar", sceneX: -57.6, sceneZ: 76.0, rx: 10.8, rz: 5.6, rotation: 0.28, count: 24, scaleMin: 0.72, scaleMax: 1.22 },
    { kind: "tree", type: "pine", sceneX: 23.8, sceneZ: 82.6, rx: 13.6, rz: 4.8, rotation: -0.34, count: 24, scaleMin: 0.68, scaleMax: 1.16 },
    { kind: "bush", sceneX: -8.0, sceneZ: 44.8, rx: 16.0, rz: 4.8, rotation: 0.08, count: 42, scaleMin: 0.4, scaleMax: 0.84 },
    { kind: "bush", sceneX: -34.0, sceneZ: 67.0, rx: 10.0, rz: 6.4, rotation: -0.18, count: 30, scaleMin: 0.42, scaleMax: 0.88 },
    { kind: "bush", sceneX: 8.0, sceneZ: 89.0, rx: 20.0, rz: 3.6, rotation: 0.02, count: 34, scaleMin: 0.42, scaleMax: 0.86 },
  ];
  for (const cluster of clusters) addTerrainCluster(details, rng, cluster);
  addRoadsideCedars(details, rng);
  return details
    .sort((a, b) => a.sceneZ - b.sceneZ)
    .map((detail, index) => ({
      ...detail,
      id: `terrain-${detail.kind}-${index}`,
      hp: detail.kind === "tree" ? Math.round(42 + detail.scale * 36) : 0,
    }));
}

const TERRAIN_DETAILS = buildTerrainDetails();
const terrainDetailState = new Map(TERRAIN_DETAILS.map((detail) => [detail.id, { hp: detail.hp, cut: false }]));
const TORII_GATES = STATIC_PROPS
  .map((prop, index) => ({ ...prop, index }))
  .filter((prop) => prop.kind === "torii");
const VILLAGE_NPCS = STATIC_PROPS
  .map((prop, index) => ({ ...prop, index, ...scenePointToWorld(prop.sceneX, prop.sceneZ), talkRadius: 52 }))
  .filter((prop) => prop.kind === "npc");
const VILLAGE_DECOR_PROPS = buildVillageDecorLayout();
const OVERWORLD_LANDMARKS = buildOverworldLandmarkLayout();
const GRAVE_MARKERS = buildGraveMarkers();
const STATIC_COLLIDERS = [
  ...STATIC_PROPS.flatMap(makeStaticPropColliders),
  ...MAIN_CITY_BUILDINGS.flatMap(makeMainCityBuildingColliders),
  ...MAIN_CITY_SAKURA_TREES.flatMap(makeMainCitySakuraCollider),
  ...makeShrineDecorColliders(),
  ...VILLAGE_DECOR_PROPS.flatMap(makeVillageDecorColliders),
  ...OVERWORLD_LANDMARKS.flatMap(makeLandmarkColliders),
  ...TERRAIN_DETAILS.flatMap(makeTerrainDetailColliders),
];
const STATIC_COLLIDER_SET = new Set(STATIC_COLLIDERS);

const state = {};

function resetGame(options = {}) {
  const battle = Boolean(options.battle);
  const playerStart = options.playerStart ? options.playerStart : battle ? BATTLE_PLAYER_START : VILLAGE_CENTER;
  const bossStart = BATTLE_BOSS_START;
  const maxHp = playerMaxHp();
  const savedHp = currentAccountHp(activeAccount);
  const startPollution = clamp(Number(options.startPollution) || 0, 0, 100);
  const shield = battle ? battleStartShield(maxHp) : 0;
  Object.assign(state, {
    mode: battle ? "playing" : "ready",
    time: 0,
    shake: 0,
    slow: 1,
    landingTimer: 0,
    landingDuration: LANDING_DURATION,
    battleExitTimer: BATTLE_EXIT_GRACE,
    battleExitOutside: false,
    toriiBellTimes: {},
    message: battle ? "祭の夜、守護願は縛となった。" : "村外の赤き境へ踏み入れば、祓行が始まる。",
    messageTimer: 5,
    player: {
      x: playerStart.x,
      y: playerStart.y,
      vx: 0,
      vy: 0,
      r: PLAYER_COLLISION_RADIUS,
      hp: savedHp,
      maxHp,
      shield,
      pollution: startPollution,
      force: 24,
      height: 0,
      fallSpeed: 0,
      climb: null,
      platform: null,
      arenaFocusTime: 0,
      lifeStealCd: 0,
      autoHealCount: 0,
      reviveCount: 0,
      periodicDamageImmunityCd: 0,
      attackInterferenceTimer: 0,
      attackInterferencePct: 0,
      forceYuuUntilBattleEnd: false,
      yuuNoForceDrain: false,
      dodgeStrikeReady: false,
      speedBoostTimer: 0,
      kaguraWaveTimer: 3,
      face: -Math.PI / 2,
      slashCd: 0,
      slashTime: 0,
      slashId: 0,
      slashHit: false,
      dashCd: 0,
      dashTime: 0,
      glideActive: false,
      jumpCd: 0,
      jumpTime: 0,
      iFrame: 0,
      observePulse: 0,
      purifyLock: 0,
      purifyCast: 0,
      purifyDuration: 0,
      purifyStartWish: 0,
      purifyCd: 0,
      pathRank: "荒・初段",
    },
    boss: {
      x: bossStart.x,
      y: bossStart.y,
      vx: 0,
      vy: 0,
      r: BOSS_COLLISION_RADIUS,
      maxForm: 360,
      form: 360,
      aspect: 0,
      wish: 0,
      phase: "shape",
      attackTimer: 1.1,
      pattern: 0,
      hurtFlash: 0,
      agitation: 0,
      nameKnown: false,
    },
    projectiles: [],
    zones: [],
    fragments: [],
    particles: [],
    echoes: [],
    metrics: {
      startHp: savedHp,
      startPollution,
      damageTaken: 0,
      pollutionTaken: 0,
      slashes: 0,
      hits: 0,
      dashes: 0,
      cleanDodges: 0,
      wrongSlashes: 0,
      memories: 0,
      purifyBreaks: 0,
    },
    result: null,
  });

  ui.resultScreen.hidden = true;
  ui.resultScreen.classList.remove("show");
  document.body.dataset.mode = state.mode;
  setMemoryUi();
  updateUi();
}

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const cameraHeight = width < 760 ? CAMERA_WORLD_HEIGHT_MOBILE : CAMERA_WORLD_HEIGHT;
  const scale = height / cameraHeight;
  view = {
    scale,
    baseScale: scale,
    ox: 0,
    oy: 0,
    w: width,
    h: height,
    cx: view.cx,
    cy: view.cy,
    anchorX: width * CAMERA_ANCHOR_X,
    anchorY: height * CAMERA_ANCHOR_Y,
  };
  syncCameraView();
  if (renderer3d && camera3d) {
    renderer3d.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer3d.setSize(width, height);
    camera3d.aspect = width / height;
    camera3d.updateProjectionMatrix();
  }
  if (ui.worldMapScreen && !ui.worldMapScreen.hidden) requestAnimationFrame(renderWorldMap);
}

function syncCameraView() {
  const groundScale = view.baseScale || view.scale;
  const skyScale = Math.min(view.w, view.h) / (MAP_SIZE * 0.72);
  const displayMode = getDisplayMode();
  let scale = groundScale;
  let focus = state.player || { x: WORLD.cx, y: WORLD.cy };
  if (displayMode === "account") {
    focus = VILLAGE_CENTER;
    scale = skyScale;
  } else if (displayMode === "landing") {
    const t = clamp(state.landingTimer / Math.max(0.001, state.landingDuration), 0, 1);
    const eased = 1 - (1 - t) ** 3;
    focus = {
      x: VILLAGE_CENTER.x + ((state.player?.x || VILLAGE_CENTER.x) - VILLAGE_CENTER.x) * eased,
      y: VILLAGE_CENTER.y + ((state.player?.y || VILLAGE_CENTER.y) - VILLAGE_CENTER.y) * eased,
    };
    scale = skyScale + (groundScale - skyScale) * eased;
  }
  view.scale = scale;
  view.cx = focus.x;
  view.cy = focus.y;
  view.anchorX = view.w * CAMERA_ANCHOR_X;
  view.anchorY = view.h * CAMERA_ANCHOR_Y;
  view.ox = view.anchorX - view.cx * view.scale;
  view.oy = view.anchorY - view.cy * view.scale;
}

function getDisplayMode() {
  if (state.mode === "settings" && settingsPausedMode) return settingsPausedMode;
  if (state.mode === "sideMenu" && sideMenuPausedMode) return sideMenuPausedMode;
  if (state.mode === "worldMap" && worldMapPausedMode) return worldMapPausedMode;
  if (state.mode === "shop" && shopPausedMode) return shopPausedMode;
  if (state.mode === "blacksmith" && blacksmithPausedMode) return blacksmithPausedMode;
  if (state.mode === "backpack" && backpackPausedMode) return backpackPausedMode;
  if (state.mode === "character" && characterPausedMode) return characterPausedMode;
  if (state.mode === "codex" && codexPausedMode) return codexPausedMode;
  return state.mode;
}

function pathRealmName(rankLabel = "") {
  const realm = String(rankLabel).split("・")[0];
  return ["荒", "澄", "巧", "妙", "粋", "雅", "極"].includes(realm) ? realm : "荒";
}

function pathStageName(rankLabel = "") {
  const stage = String(rankLabel).split("・")[1];
  return stage || "初段";
}

function formatSideMenuRank(progress) {
  if (!progress) return "祓道階·初段 EXP 0";
  return `祓道階·${pathStageName(progress.rank)} EXP ${progress.totalExp}`;
}

function pathRealmTheme(rankLabel = "") {
  const realm = pathRealmName(rankLabel);
  return {
    荒: "rough",
    澄: "clear",
    巧: "skill",
    妙: "subtle",
    粋: "stylish",
    雅: "elegant",
    極: "ultimate",
  }[realm] || "rough";
}

function updatePathRealmTheme(progress = getAccountProgress(activeAccount)) {
  document.body.dataset.pathRealm = pathRealmTheme(progress.rank);
  if (ui.sideMenuRealmMark) ui.sideMenuRealmMark.textContent = pathRealmName(progress.rank);
  if (ui.shopRealmMark) ui.shopRealmMark.textContent = pathRealmName(progress.rank);
  if (ui.blacksmithRealmMark) ui.blacksmithRealmMark.textContent = pathRealmName(progress.rank);
  if (ui.backpackRealmMark) ui.backpackRealmMark.textContent = pathRealmName(progress.rank);
  if (ui.characterRealmMark) ui.characterRealmMark.textContent = pathRealmName(progress.rank);
  if (ui.codexRealmMark) ui.codexRealmMark.textContent = pathRealmName(progress.rank);
  if (ui.settingsRealmMark) ui.settingsRealmMark.textContent = pathRealmName(progress.rank);
  syncUltimatePanelParticles();
}

function screenToWorld(clientX, clientY) {
  syncCameraView();
  return {
    x: (clientX - view.ox) / view.scale,
    y: (clientY - view.oy) / view.scale,
  };
}

function worldLen(value) {
  return value / WORLD_SCALE;
}

function terrainFeatureLocal(sceneX, sceneZ, feature) {
  const rotation = feature.rotation || 0;
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  const dx = sceneX - feature.sceneX;
  const dz = sceneZ - feature.sceneZ;
  return {
    x: (cos * dx + sin * dz) / feature.rx,
    z: (-sin * dx + cos * dz) / feature.rz,
  };
}

function terrainFeatureInfluence(sceneX, sceneZ, feature) {
  const local = terrainFeatureLocal(sceneX, sceneZ, feature);
  const t = 1 - local.x * local.x - local.z * local.z;
  if (t <= 0) return 0;
  const curve = Number.isFinite(Number(feature.curve))
    ? Math.max(0.5, Number(feature.curve))
    : feature.kind === "mountain"
      ? 1.75
      : feature.kind === "lowland"
        ? 1.45
        : 2;
  return Math.pow(t, curve);
}

function terrainFeatureSignedHeight(feature) {
  if (feature.kind === "lowland") {
    const depth = Number.isFinite(Number(feature.depth))
      ? Math.abs(Number(feature.depth))
      : Number.isFinite(Number(feature.height))
        ? Math.abs(Number(feature.height))
        : 0.16;
    return -depth;
  }
  if (Number.isFinite(Number(feature.height))) return Number(feature.height);
  return feature.kind === "mountain" ? 1 : 0.24;
}

function terrainDetailNoise(sceneX, sceneZ, seed = 0) {
  const value = Math.sin(sceneX * 12.9898 + sceneZ * 78.233 + seed * 37.719) * 43758.5453123;
  return value - Math.floor(value);
}

function terrainMicroHeight(sceneX, sceneZ) {
  const roadDistance = distanceToRoadScene(sceneX, sceneZ);
  const roadFade = clamp((roadDistance - ROAD_WIDTH / WORLD_SCALE * 0.46) / 1.15, 0.18, 1);
  const broad = Math.sin(sceneX * 0.62 + sceneZ * 0.31) * 0.012
    + Math.sin(sceneX * 1.12 - sceneZ * 0.74 + 1.7) * 0.008;
  const fine = (terrainDetailNoise(sceneX, sceneZ, 3) - 0.5) * 0.014;
  return (broad + fine) * roadFade;
}

function sceneSurfaceHeight(sceneX, sceneZ) {
  let height = 0;
  for (const feature of TERRAIN_FEATURES) {
    height += terrainFeatureSignedHeight(feature) * terrainFeatureInfluence(sceneX, sceneZ, feature);
  }
  height += terrainMicroHeight(sceneX, sceneZ);
  const city = mainCityInfluence(sceneX, sceneZ);
  if (city > 0) height = height * (1 - city * 0.94) + MAIN_CITY_TERRAIN_HEIGHT * city * 0.94;
  return clamp(height, TERRAIN_HEIGHT_MIN, TERRAIN_HEIGHT_MAX);
}

function sceneHillHeight(sceneX, sceneZ) {
  return sceneSurfaceHeight(sceneX, sceneZ);
}

function worldGroundHeight(x, y) {
  return sceneHillHeight((x - WORLD.cx) / WORLD_SCALE, (y - WORLD.cy) / WORLD_SCALE);
}

function terrainCollisionEnabledForEntity(entity) {
  if (!entity || entity.climb) return false;
  return playerHeightOffset(entity) <= PLATFORM_HEIGHT_SNAP;
}

function terrainFootprintStats(entity, x, y) {
  const sampleRadius = Math.max(TERRAIN_COLLISION_SAMPLE_RADIUS, (entity?.r || 0) * 3.2);
  const samples = [
    [0, 0],
    [sampleRadius, 0],
    [-sampleRadius, 0],
    [0, sampleRadius],
    [0, -sampleRadius],
    [sampleRadius * 0.707, sampleRadius * 0.707],
    [-sampleRadius * 0.707, sampleRadius * 0.707],
    [sampleRadius * 0.707, -sampleRadius * 0.707],
    [-sampleRadius * 0.707, -sampleRadius * 0.707],
  ];
  let min = Infinity;
  let max = -Infinity;
  for (const [dx, dy] of samples) {
    const sx = clamp(x + dx, WORLD.minX, WORLD.maxX);
    const sy = clamp(y + dy, WORLD.minY, WORLD.maxY);
    const height = worldGroundHeight(sx, sy);
    min = Math.min(min, height);
    max = Math.max(max, height);
  }
  return {
    min,
    max,
    range: max - min,
    sampleRadiusScene: sampleRadius / WORLD_SCALE,
  };
}

function terrainPositionWalkable(entity, x, y, previousX = x, previousY = y) {
  if (!terrainCollisionEnabledForEntity(entity)) return true;
  const footprint = terrainFootprintStats(entity, x, y);
  const allowedFootprintRise = TERRAIN_COLLISION_STEP_CLEARANCE
    + footprint.sampleRadiusScene * 2 * TERRAIN_WALKABLE_SLOPE;
  if (footprint.range > allowedFootprintRise) return false;

  const previousHeight = worldGroundHeight(previousX, previousY);
  const nextHeight = worldGroundHeight(x, y);
  const sceneDistance = Math.max(0.001, Math.hypot(x - previousX, y - previousY) / WORLD_SCALE);
  const allowedStepRise = TERRAIN_COLLISION_STEP_CLEARANCE + sceneDistance * TERRAIN_WALKABLE_SLOPE;
  return nextHeight - previousHeight <= allowedStepRise;
}

function resolveTerrainFloorCollision(entity, previousX, previousY) {
  if (!terrainCollisionEnabledForEntity(entity)) return false;
  if (terrainPositionWalkable(entity, entity.x, entity.y, previousX, previousY)) return false;

  const attemptedX = entity.x;
  const attemptedY = entity.y;
  const canSlideX = terrainPositionWalkable(entity, attemptedX, previousY, previousX, previousY);
  const canSlideY = terrainPositionWalkable(entity, previousX, attemptedY, previousX, previousY);

  if (canSlideX && !canSlideY) {
    entity.y = previousY;
    entity.vy = 0;
    return true;
  }
  if (canSlideY && !canSlideX) {
    entity.x = previousX;
    entity.vx = 0;
    return true;
  }
  if (canSlideX && canSlideY) {
    const xTravel = Math.abs(attemptedX - previousX);
    const yTravel = Math.abs(attemptedY - previousY);
    if (xTravel >= yTravel) {
      entity.y = previousY;
      entity.vy = 0;
    } else {
      entity.x = previousX;
      entity.vx = 0;
    }
    return true;
  }

  entity.x = previousX;
  entity.y = previousY;
  entity.vx = 0;
  entity.vy = 0;
  return true;
}

function worldTo3(x, y, height = 0) {
  const sceneX = (x - WORLD.cx) / WORLD_SCALE;
  const sceneZ = (y - WORLD.cy) / WORLD_SCALE;
  return new THREE.Vector3(sceneX, height + sceneHillHeight(sceneX, sceneZ), sceneZ);
}

function scenePointToWorld(sceneX, sceneZ) {
  return {
    x: WORLD.cx + sceneX * WORLD_SCALE,
    y: WORLD.cy + sceneZ * WORLD_SCALE,
  };
}

function toriiLocalPosition(x, y, gate) {
  const center = scenePointToWorld(gate.sceneX, gate.sceneZ);
  const rotation = gate.rotation ?? 0.08;
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  const dx = x - center.x;
  const dy = y - center.y;
  return {
    x: cos * dx + sin * dy,
    y: -sin * dx + cos * dy,
  };
}

function recoverPlayerHp(amount, options = {}) {
  const p = state.player;
  if (!p) return 0;
  const before = p.hp;
  p.hp = clamp(p.hp + amount, 0, p.maxHp);
  const gained = p.hp - before;
  if (gained <= 0) return 0;
  syncActiveAccountHp(p.hp);
  if (options.particles !== false) {
    addParticle(options.x ?? p.x, options.y ?? p.y, options.color || "#e1c887", options.particleCount || 8, options.particleSpread || 84);
  }
  if (options.message && state.messageTimer <= (options.maxMessageTimer ?? 0.18)) {
    flashMessage(options.message, options.messageDuration || 1.2);
  }
  return gained;
}

function recoverPlayerHpPercent(percent, options = {}) {
  const p = state.player;
  if (!p || percent <= 0) return 0;
  return recoverPlayerHp(p.maxHp * percent, options);
}

function playerInShrineGround(p = state.player) {
  if (!p) return false;
  return Math.hypot(p.x - DONATION_BOX.x, p.y - DONATION_BOX.y) <= SHRINE_HEAL_RADIUS;
}

function applyShrineRestoration(dt) {
  const p = state.player;
  if (!p || !playerInShrineGround(p)) return;
  const gained = recoverPlayerHpPercent(SHRINE_HEAL_PER_SECOND * dt, {
    particles: false,
    message: "",
  });
  if (gained <= 0) return;
  if (Math.sin(state.time * 7.5) > 0.92) addParticle(p.x, p.y, "#eee6d2", 3, 36);
}

function updateToriiPassage(prevX, prevY, nextX, nextY) {
  if (Math.hypot(nextX - prevX, nextY - prevY) < 1) return;
  for (const gate of TORII_GATES) {
    const before = toriiLocalPosition(prevX, prevY, gate);
    const after = toriiLocalPosition(nextX, nextY, gate);
    if (before.y === after.y) continue;
    const crossed = (before.y <= 0 && after.y > 0) || (before.y >= 0 && after.y < 0);
    if (!crossed) continue;
    const t = before.y / (before.y - after.y);
    if (t < 0 || t > 1) continue;
    const crossX = before.x + (after.x - before.x) * t;
    const halfWidth = Math.max(34, (gate.scale || SMALL_ACTOR_SCALE) * WORLD_SCALE * 1.9);
    if (Math.abs(crossX) > halfWidth) continue;
    const last = state.toriiBellTimes?.[gate.index] ?? -Infinity;
    if (state.time - last < 0.85) continue;
    state.toriiBellTimes[gate.index] = state.time;
    playSuzuBell("gate");
    recoverPlayerHpPercent(TORII_HEAL_PERCENT, {
      x: nextX,
      y: nextY,
      message: "鳥居をくぐり、心燈がわずかに息を吹き返す。",
      particleCount: 10,
      particleSpread: 92,
      maxMessageTimer: 0.12,
    });
  }
}

function makeClimbableCollider(collider, climbHeight, climbKind = "step", topMargin = 0) {
  return {
    ...collider,
    climbable: true,
    climbHeight: Math.max(CLIMB_MIN_HEIGHT, climbHeight),
    climbKind,
    ...(topMargin > 0 ? { topMargin } : {}),
  };
}

function houseVariantForScene(sceneX, sceneZ) {
  const seed = ((Math.round((sceneX + 64) * 97) ^ Math.round((sceneZ + 64) * 193)) >>> 0) || 1;
  return seed % 6;
}

function makeStaticPropColliders(prop) {
  const center = scenePointToWorld(prop.sceneX, prop.sceneZ);
  const visualScale = prop.scale || 1;
  if (prop.kind === "lantern") {
    return [makeClimbableCollider({
      type: "circle",
      label: "lantern",
      x: center.x,
      y: center.y,
      r: Math.max(3.5, 0.3 * SMALL_ACTOR_SCALE * WORLD_SCALE),
    }, 0.12 * SMALL_ACTOR_SCALE, "step")];
  }
  if (prop.kind === "musician") {
    return [{ type: "circle", label: "musician", x: center.x, y: center.y, r: 22 * visualScale }];
  }
  if (prop.kind === "npc") {
    return [{ type: "circle", label: prop.role || "villager", x: center.x, y: center.y, r: 20 * visualScale }];
  }
  if (prop.kind === "donationBox") {
    const scale = prop.scale || 1;
    return [makeClimbableCollider(
      sceneRectCollider("donation-box", prop.sceneX, prop.sceneZ, prop.rotation || 0, scale, 0, 0, 0.36, 0.23),
      0.42 * scale,
      "step",
    )];
  }
  if (prop.kind === "fence") {
    const scale = prop.scale || 1;
    return [makeClimbableCollider(
      sceneRectCollider("fence", prop.sceneX, prop.sceneZ, prop.rotation || 0, scale, 0, 0, 0.41, 0.06),
      0.61 * scale,
      "fence",
    )];
  }
  if (prop.kind === "shrine") {
    const scale = prop.scale || 1;
    return [
      makeClimbableCollider(
        sceneRectCollider("shrine", prop.sceneX, prop.sceneZ, prop.rotation || 0, scale, 0, 0, 0.95, 0.71),
        1.24 * scale,
        "wall",
        18 * scale,
      ),
      makeClimbableCollider(sceneRectCollider("shrine-step-low", prop.sceneX, prop.sceneZ, prop.rotation || 0, scale, 0, 0.94, 0.58, 0.17), 0.08 * scale, "step"),
      makeClimbableCollider(sceneRectCollider("shrine-step-mid", prop.sceneX, prop.sceneZ, prop.rotation || 0, scale, 0, 1.04, 0.5, 0.17), 0.16 * scale, "step"),
      makeClimbableCollider(sceneRectCollider("shrine-step-high", prop.sceneX, prop.sceneZ, prop.rotation || 0, scale, 0, 1.14, 0.42, 0.17), 0.24 * scale, "step"),
    ];
  }
  if (prop.kind === "house" || prop.kind === "blacksmithShop" || prop.kind === "villageShop") {
    const scale = prop.scale || 1;
    const house = prop.kind === "house";
    const rotation = prop.rotation || 0;
    const colliders = [
      makeClimbableCollider(
        sceneRectCollider(prop.kind, prop.sceneX, prop.sceneZ, rotation, scale, 0, 0, house ? 0.75 : 0.79, house ? 0.56 : 0.59),
        (house ? 1.2 : 1.14) * scale,
        "wall",
        (house ? 16 : 18) * scale,
      ),
    ];
    if (house) {
      colliders.push(
        makeClimbableCollider(sceneRectCollider("house-veranda", prop.sceneX, prop.sceneZ, rotation, scale, 0, -0.68, 0.56, 0.16), 0.13 * scale, "step"),
        makeClimbableCollider(sceneRectCollider("house-step-low", prop.sceneX, prop.sceneZ, rotation, scale, 0, -0.98, 0.24, 0.12), 0.06 * scale, "step"),
        makeClimbableCollider(sceneRectCollider("house-step-high", prop.sceneX, prop.sceneZ, rotation, scale, 0, -0.88, 0.18, 0.1), 0.11 * scale, "step"),
      );
      const variant = houseVariantForScene(prop.sceneX, prop.sceneZ);
      if (variant === 1 || variant === 4) {
        const side = variant === 1 ? -1 : 1;
        colliders.push(makeClimbableCollider(
          sceneRectCollider("house-side-shed", prop.sceneX, prop.sceneZ, rotation, scale, side * 0.94, 0.22, 0.24, 0.25),
          0.52 * scale,
          "wall",
          8 * scale,
        ));
      }
      if (variant === 0 || variant === 2 || variant === 5) {
        colliders.push(makeClimbableCollider(
          sceneRectCollider("house-yard-fence", prop.sceneX, prop.sceneZ, rotation, scale, 0, 0.82, 0.51, 0.04),
          0.42 * scale,
          "fence",
        ));
      }
    } else {
      colliders.push(makeClimbableCollider(sceneRectCollider(`${prop.kind}-front-deck`, prop.sceneX, prop.sceneZ, rotation, scale, 0, -0.68, 0.55, 0.1), 0.12 * scale, "step"));
      if (prop.kind === "blacksmithShop") {
        colliders.push(
          makeClimbableCollider(sceneRectCollider("blacksmith-forge", prop.sceneX, prop.sceneZ, rotation, scale, -0.42, -0.44, 0.21, 0.19), 0.28 * scale, "step"),
          makeClimbableCollider(sceneRectCollider("blacksmith-anvil", prop.sceneX, prop.sceneZ, rotation, scale, 0.56, -0.36, 0.21, 0.14), 0.32 * scale, "step"),
        );
      }
      if (prop.kind === "villageShop") {
        for (const side of [-1, 1]) {
          colliders.push(makeClimbableCollider(
            sceneRectCollider("shop-display-box", prop.sceneX, prop.sceneZ, rotation, scale, side * 0.56, -0.5, 0.13, 0.12),
            0.25 * scale,
            "step",
          ));
        }
        colliders.push(
          makeClimbableCollider(sceneRectCollider("shop-side-board", prop.sceneX, prop.sceneZ, rotation, scale, -0.66, -0.18, 0.14, 0.04), 0.52 * scale, "wall"),
          makeClimbableCollider(sceneRectCollider("shop-side-board", prop.sceneX, prop.sceneZ, rotation, scale, 0.66, -0.12, 0.04, 0.14), 0.52 * scale, "wall"),
        );
      }
    }
    return colliders;
  }

  const scale = visualScale;
  const rotation = prop.rotation ?? 0.08;
  const postRadius = Math.max(3.5, 0.21 * scale * WORLD_SCALE);
  const left = sceneLocalColliderPoint(prop.sceneX, prop.sceneZ, rotation, scale, -0.78, 0);
  const right = sceneLocalColliderPoint(prop.sceneX, prop.sceneZ, rotation, scale, 0.78, 0);

  const postHeight = Math.max(CLIMB_MIN_HEIGHT, 1.54 * visualScale);
  return [
    { type: "circle", label: "torii-post", x: left.x, y: left.y, r: postRadius, climbable: true, climbHeight: postHeight, climbKind: "post" },
    { type: "circle", label: "torii-post", x: right.x, y: right.y, r: postRadius, climbable: true, climbHeight: postHeight, climbKind: "post" },
  ];
}

function sceneLocalColliderPoint(sceneX, sceneZ, rotation, scale, localX = 0, localZ = 0) {
  const point = localScenePoint(sceneX, sceneZ, rotation, localX * scale, localZ * scale);
  return scenePointToWorld(point.x, point.z);
}

function sceneCircleCollider(label, sceneX, sceneZ, rotation, scale, localX, localZ, radiusScene) {
  const point = sceneLocalColliderPoint(sceneX, sceneZ, rotation, scale, localX, localZ);
  return {
    type: "circle",
    label,
    x: point.x,
    y: point.y,
    r: Math.max(3.5, radiusScene * scale * WORLD_SCALE),
  };
}

function sceneRectCollider(label, sceneX, sceneZ, rotation, scale, localX, localZ, halfWScene, halfHScene, rotationOffset = 0) {
  const point = sceneLocalColliderPoint(sceneX, sceneZ, rotation, scale, localX, localZ);
  return {
    type: "rect",
    label,
    x: point.x,
    y: point.y,
    halfW: Math.max(3.5, halfWScene * scale * WORLD_SCALE),
    halfH: Math.max(3.5, halfHScene * scale * WORLD_SCALE),
    rotation: rotation + rotationOffset,
  };
}

function makeMainCityBuildingColliders(building) {
  const body = makeClimbableCollider(
    sceneRectCollider("main-city-building", building.sceneX, building.sceneZ, building.rotation, 1, 0, 0, building.width * 0.5, building.depth * 0.5),
    (building.floors > 1 ? 1.75 : 1.12),
    "wall",
    (building.floors > 1 ? 22 : 16),
  );
  const step = makeClimbableCollider(
    sceneRectCollider("main-city-step", building.sceneX, building.sceneZ, building.rotation, 1, 0, -building.depth * 0.56, building.width * 0.28, 0.12),
    0.1,
    "step",
  );
  return [body, step];
}

function makeMainCitySakuraCollider(tree) {
  const center = scenePointToWorld(tree.sceneX, tree.sceneZ);
  return [makeClimbableCollider({
    type: "circle",
    label: "sakura-tree",
    x: center.x,
    y: center.y,
    r: Math.max(6, 0.13 * tree.scale * WORLD_SCALE),
  }, 1.1 * tree.scale, "tree")];
}

function makeShrineDecorColliders() {
  const rect = (label, localX, localZ, scale, rotation, childX, childZ, halfW, halfH, rotationOffset = 0) => (
    sceneRectCollider(label, SHRINE_SCENE.x + localX, SHRINE_SCENE.z + localZ, rotation, scale, childX, childZ, halfW, halfH, rotationOffset)
  );
  const circle = (label, localX, localZ, scale, rotation, childX, childZ, radius) => (
    sceneCircleCollider(label, SHRINE_SCENE.x + localX, SHRINE_SCENE.z + localZ, rotation, scale, childX, childZ, radius)
  );
  const colliders = [];

  for (const gate of [
    { x: 0, z: 3.92, s: 0.76, r: 0 },
    { x: 0, z: 2.76, s: 0.5, r: 0 },
    { x: 0, z: 1.16, s: 0.42, r: 0 },
  ]) {
    for (const side of [-1, 1]) {
      colliders.push(makeClimbableCollider(
        circle("shrine-torii-post", gate.x, gate.z, gate.s, gate.r, side * 0.58, 0, 0.12),
        1.12 * gate.s,
        "post",
      ));
    }
  }

  for (const z of [2.84, 1.92, 1.04, 0.18]) {
    for (const side of [-1, 1]) {
      const scale = z > 1.4 ? 0.36 : 0.32;
      colliders.push(makeClimbableCollider(
        circle("shrine-stone-lantern", side * 1.14, z, scale, side * 0.08, 0, 0, 0.22),
        0.86 * scale,
        "step",
      ));
    }
  }

  for (const side of [-1, 1]) {
    colliders.push(
      makeClimbableCollider(rect("komainu", side * 0.94, 0.66, 0.46, side * -0.24, 0, 0, 0.22, 0.17), 0.42 * 0.46, "step"),
      makeClimbableCollider(rect("offering-table", side * 1.06, -0.12, 0.36, side * 0.08, 0, 0, 0.25, 0.14), 0.2 * 0.36, "step"),
    );
  }

  colliders.push(
    makeClimbableCollider(rect("chozuya", -1.8, 1.42, 0.54, 0.18, 0, 0, 0.38, 0.25), 0.42 * 0.54, "step"),
    makeClimbableCollider(rect("ema-stand", 1.76, 1.28, 0.5, -0.14, 0, 0, 0.43, 0.06), 0.72 * 0.5, "wall"),
    makeClimbableCollider(rect("omikuji-rope", 2.1, 1.98, 0.46, 0.16, 0, 0, 0.45, 0.05), 0.58 * 0.46, "wall"),
    makeClimbableCollider(circle("sacred-tree", -2.16, 0.02, 0.58, -0.1, 0, 0, 0.18), 1.08 * 0.58, "tree"),
    makeClimbableCollider(circle("side-pine", 2.24, -0.22, 0.62, 0.06, 0, 0, 0.12), 0.84 * 0.62, "tree"),
  );

  const stepScale = 1.08;
  for (let i = 0; i < 5; i += 1) {
    colliders.push(makeClimbableCollider(
      rect("mossy-stone-step", 0, 1.16, stepScale, 0, 0, 0.62 - i * 0.26, (1.22 - i * 0.08) * 0.5, 0.13),
      0.08 + i * 0.035,
      "step",
    ));
  }

  for (const marker of [
    { x: -1.72, z: 3.34, s: 0.44, r: -0.22 },
    { x: 1.72, z: 3.34, s: 0.44, r: 0.22 },
    { x: -1.88, z: 2.02, s: 0.42, r: -0.18 },
    { x: 1.88, z: 2.02, s: 0.42, r: 0.18 },
    { x: -1.64, z: 0.7, s: 0.38, r: -0.14 },
    { x: 1.64, z: 0.7, s: 0.38, r: 0.14 },
  ]) {
    colliders.push(makeClimbableCollider(
      rect("shrine-border-stone", marker.x, marker.z, marker.s, marker.r, 0, 0, 0.18, 0.13),
      0.16 * marker.s,
      "step",
    ));
  }

  return colliders;
}

function villageDecorPlacement(prop) {
  const rng = makeSeededRng(prop.seed || 0xdec0);
  const jitter = prop.jitter ?? 0.08;
  const sceneX = prop.sceneX + (rng() - 0.5) * jitter;
  const sceneZ = prop.sceneZ + (rng() - 0.5) * jitter;
  const scale = (prop.scale || 1) * (0.92 + rng() * 0.16);
  const rotation = (prop.rotation || 0) + (rng() - 0.5) * (prop.rotationJitter ?? 0.22);
  return { sceneX, sceneZ, scale, rotation };
}

function makeVillageDecorColliders(prop) {
  const place = villageDecorPlacement(prop);
  const circle = (label, localX, localZ, radius) => sceneCircleCollider(label, place.sceneX, place.sceneZ, place.rotation, place.scale, localX, localZ, radius);
  const rect = (label, localX, localZ, halfW, halfH, rotationOffset = 0) => sceneRectCollider(label, place.sceneX, place.sceneZ, place.rotation, place.scale, localX, localZ, halfW, halfH, rotationOffset);
  switch (prop.kind) {
    case "bambooFence":
      return [{
        ...rect("bamboo-fence", 0, 0, 0.56, 0.05),
        climbable: true,
        climbHeight: Math.max(CLIMB_MIN_HEIGHT, 0.35 * place.scale),
        climbKind: "fence",
      }];
    case "woodenBucket":
      return [{
        ...circle("wooden-bucket", 0, 0, 0.19),
        climbable: true,
        climbHeight: Math.max(CLIMB_MIN_HEIGHT, 0.18 * place.scale),
        climbKind: "step",
      }];
    case "waterWell":
      return [{
        ...circle("water-well", 0, 0, 0.46),
        climbable: true,
        climbHeight: Math.max(CLIMB_MIN_HEIGHT, 0.38 * place.scale),
        climbKind: "wall",
      }];
    case "stackedFirewood":
      return [{
        ...rect("stacked-firewood", 0, 0, 0.38, 0.18),
        climbable: true,
        climbHeight: Math.max(CLIMB_MIN_HEIGHT, 0.24 * place.scale),
        climbKind: "step",
      }];
    case "strawBundle":
      return [{
        ...rect("straw-bundle", 0, 0, 0.38, 0.16),
        climbable: true,
        climbHeight: Math.max(CLIMB_MIN_HEIGHT, 0.18 * place.scale),
        climbKind: "step",
      }];
    case "ceramicJar":
      return [{
        ...circle("ceramic-jar", 0, 0, 0.22),
        climbable: true,
        climbHeight: Math.max(CLIMB_MIN_HEIGHT, 0.25 * place.scale),
        climbKind: "step",
      }];
    case "woodenCrate":
      return [{
        ...rect("wooden-crate", 0, 0, 0.22, 0.2),
        climbable: true,
        climbHeight: Math.max(CLIMB_MIN_HEIGHT, 0.2 * place.scale),
        climbKind: "step",
      }];
    case "hangingCloths":
      return [rect("hanging-cloths", 0, 0, 0.5, 0.055)];
    case "paperLantern":
      return [circle("paper-lantern", 0, 0, 0.1)];
    case "woodenSign":
      return [{
        ...rect("wooden-sign", 0, 0, 0.11, 0.07),
        climbable: true,
        climbHeight: Math.max(CLIMB_MIN_HEIGHT, 0.28 * place.scale),
        climbKind: "post",
      }];
    case "farmingTools":
      return [rect("farming-tools", 0, 0, 0.18, 0.07, 0.18)];
    default:
      return [];
  }
}

function landmarkPlacement(landmark) {
  const rng = makeSeededRng(landmark.seed || 0x4a5a);
  const sceneX = landmark.sceneX + (rng() - 0.5) * 0.16;
  const sceneZ = landmark.sceneZ + (rng() - 0.5) * 0.16;
  const rotation = (landmark.rotation || 0) + (rng() - 0.5) * 0.16;
  const scale = (landmark.scale || 1) * (0.94 + rng() * 0.12);
  return { sceneX, sceneZ, rotation, scale };
}

function buildGraveMarkers() {
  const markers = [];
  for (const landmark of OVERWORLD_LANDMARKS) {
    if (landmark.kind !== "graveyard") continue;
    const place = landmarkPlacement(landmark);
    const seed = Number(landmark.seed || 0).toString(16);
    for (let i = 0; i < 7; i += 1) {
      const localX = -0.54 + (i % 3) * 0.52;
      const localZ = -0.32 + Math.floor(i / 3) * 0.42;
      const point = sceneLocalColliderPoint(place.sceneX, place.sceneZ, place.rotation, place.scale, localX, localZ);
      markers.push({
        id: `grave-${seed}-${i + 1}`,
        x: point.x,
        y: point.y,
        index: i + 1,
      });
    }
  }
  return markers;
}

function advanceLandmarkGroundDetailsRng(rng, kind) {
  const groundCount = kind === "bambooGrove" || kind === "abandonedShrine" ? 18 : 10;
  for (let i = 0; i < groundCount; i += 1) {
    rng();
    rng();
    rng();
    if (rng() < 0.42) {
      rng();
      rng();
      rng();
      rng();
    } else if (rng() < 0.72) {
      rng();
      rng();
      rng();
    } else {
      rng();
      rng();
    }
  }
  if (kind === "abandonedShrine" || kind === "bambooGrove") {
    for (let i = 0; i < 8; i += 1) {
      rng();
      rng();
      rng();
      rng();
    }
  }
}

function makeLandmarkColliders(landmark) {
  const place = landmarkPlacement(landmark);
  const circle = (label, localX, localZ, radius) => sceneCircleCollider(label, place.sceneX, place.sceneZ, place.rotation, place.scale, localX, localZ, radius);
  const rect = (label, localX, localZ, halfW, halfH, rotationOffset = 0) => sceneRectCollider(label, place.sceneX, place.sceneZ, place.rotation, place.scale, localX, localZ, halfW, halfH, rotationOffset);
  if (landmark.kind === "jizo") {
    return [{
      ...circle("jizo", 0, 0, 0.23),
      climbable: true,
      climbHeight: Math.max(CLIMB_MIN_HEIGHT, 0.34 * place.scale),
      climbKind: "step",
    }];
  }
  if (landmark.kind === "stoneMarker") {
    return [{
      ...rect("stone-marker", 0, 0, 0.19, 0.15),
      climbable: true,
      climbHeight: Math.max(CLIMB_MIN_HEIGHT, 0.26 * place.scale),
      climbKind: "step",
    }];
  }
  if (landmark.kind === "abandonedShrine") {
    return [
      {
        ...rect("abandoned-shrine", 0, 0, 0.46, 0.34),
        climbable: true,
        climbHeight: Math.max(CLIMB_MIN_HEIGHT, 0.64 * place.scale),
        climbKind: "wall",
      },
      circle("abandoned-shrine-lantern", 0.74, -0.18, 0.13),
    ];
  }
  if (landmark.kind === "bambooGrove") {
    const rng = makeSeededRng(landmark.seed || 0x4a5a);
    rng();
    rng();
    rng();
    rng();
    advanceLandmarkGroundDetailsRng(rng, landmark.kind);
    const colliders = [];
    for (let i = 0; i < 11; i += 1) {
      const angle = rng() * TWO_PI;
      const distance = 0.48 + rng() * 1.05;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      const height = 1.25 + rng() * 0.6;
      const radius = 0.026 + rng() * 0.012;
      rng();
      rng();
      rng();
      rng();
      rng();
      rng();
      rng();
      colliders.push(makeClimbableCollider(
        circle("bamboo-stalk", x, z, Math.max(0.055, radius * 1.35)),
        height * place.scale,
        "tree",
      ));
    }
    for (let i = -2; i <= 2; i += 1) {
      const width = 0.34 + rng() * 0.08;
      const depth = 0.22 + rng() * 0.08;
      const x = i * 0.28 + (rng() - 0.5) * 0.04;
      const z = -0.12 + i * 0.1;
      rng();
      colliders.push(makeClimbableCollider(
        rect("bamboo-grove-step-stone", x, z, width * 0.5, depth * 0.5),
        CLIMB_MIN_HEIGHT,
        "step",
      ));
    }
    return colliders;
  }
  if (landmark.kind === "oldWell") {
    return [
      {
        ...circle("old-well", 0, 0, 0.45),
        climbable: true,
        climbHeight: Math.max(CLIMB_MIN_HEIGHT, 0.38 * place.scale),
        climbKind: "wall",
      },
      {
        ...circle("old-well-bucket", 0.38, 0.32, 0.13),
        climbable: true,
        climbHeight: CLIMB_MIN_HEIGHT,
        climbKind: "step",
      },
    ];
  }
  if (landmark.kind === "graveyard") {
    const graves = [];
    for (let i = 0; i < 7; i += 1) {
      const x = -0.54 + (i % 3) * 0.52;
      const z = -0.32 + Math.floor(i / 3) * 0.42;
      graves.push({
        ...rect("grave-marker", x, z, 0.12, 0.09, (i % 2 ? 0.05 : -0.04)),
        climbable: true,
        climbHeight: Math.max(CLIMB_MIN_HEIGHT, 0.2 * place.scale),
        climbKind: "step",
      });
    }
    return graves;
  }
  if (landmark.kind === "brokenCart") {
    return [
      {
        ...rect("broken-cart", 0, 0, 0.56, 0.3, -0.18),
        climbable: true,
        climbHeight: Math.max(CLIMB_MIN_HEIGHT, 0.32 * place.scale),
        climbKind: "step",
      },
      {
        ...rect("cart-crate", -0.34, 0.2, 0.18, 0.16, -0.28),
        climbable: true,
        climbHeight: Math.max(CLIMB_MIN_HEIGHT, 0.22 * place.scale),
        climbKind: "step",
      },
      {
        ...rect("cart-straw", 0.36, 0.16, 0.2, 0.13, 0.3),
        climbable: true,
        climbHeight: Math.max(CLIMB_MIN_HEIGHT, 0.18 * place.scale),
        climbKind: "step",
      },
    ];
  }
  if (landmark.kind === "farmerStorage") {
    return [
      {
        ...circle("storage-barrel", -0.42, -0.2, 0.2),
        climbable: true,
        climbHeight: Math.max(CLIMB_MIN_HEIGHT, 0.28 * place.scale),
        climbKind: "step",
      },
      {
        ...circle("storage-barrel", 0.02, -0.2, 0.2),
        climbable: true,
        climbHeight: Math.max(CLIMB_MIN_HEIGHT, 0.28 * place.scale),
        climbKind: "step",
      },
      {
        ...rect("storage-crate", -0.18, 0.38, 0.18, 0.16, 0.2),
        climbable: true,
        climbHeight: Math.max(CLIMB_MIN_HEIGHT, 0.22 * place.scale),
        climbKind: "step",
      },
      {
        ...rect("storage-straw", 0.62, 0.42, 0.18, 0.12, -0.2),
        climbable: true,
        climbHeight: Math.max(CLIMB_MIN_HEIGHT, 0.18 * place.scale),
        climbKind: "step",
      },
    ];
  }
  if (landmark.kind === "riversideLantern") {
    return [
      {
        ...circle("riverside-lantern", -0.94, -0.34, 0.14),
        climbable: true,
        climbHeight: CLIMB_MIN_HEIGHT,
        climbKind: "step",
      },
      {
        ...circle("stepping-stone", -0.56, -0.08, 0.13),
        climbable: true,
        climbHeight: CLIMB_MIN_HEIGHT,
        climbKind: "step",
      },
      {
        ...circle("stepping-stone", 0, -0.1, 0.13),
        climbable: true,
        climbHeight: CLIMB_MIN_HEIGHT,
        climbKind: "step",
      },
      {
        ...circle("stepping-stone", 0.56, -0.08, 0.13),
        climbable: true,
        climbHeight: CLIMB_MIN_HEIGHT,
        climbKind: "step",
      },
    ];
  }
  if (landmark.kind === "corruptedPrayer") {
    return [
      {
        ...rect("corrupted-offering-stone", 0, 0.12, 0.28, 0.2, 0.18),
        climbable: true,
        climbHeight: Math.max(CLIMB_MIN_HEIGHT, 0.22 * place.scale),
        climbKind: "step",
      },
      circle("corrupted-stake", 0.5, 0, 0.08),
      circle("corrupted-stake", -0.5, 0.04, 0.08),
    ];
  }
  return [];
}

function terrainDetailStatus(detail) {
  return terrainDetailState.get(detail.id);
}

function terrainDetailIsCut(detailOrId) {
  const id = typeof detailOrId === "string" ? detailOrId : detailOrId?.id;
  return Boolean(id && terrainDetailState.get(id)?.cut);
}

function makeTerrainDetailColliders(detail) {
  if (detail.kind !== "tree") return [];
  const center = scenePointToWorld(detail.sceneX, detail.sceneZ);
  return [{
    type: "circle",
    label: "tree",
    terrainId: detail.id,
    x: center.x,
    y: center.y,
    r: Math.max(4.2, 0.085 * detail.scale * WORLD_SCALE),
    climbable: true,
    climbHeight: Math.max(CLIMB_MIN_HEIGHT, 0.58 + detail.scale * 0.66),
    climbKind: "tree",
  }];
}

async function initThreeScene() {
  if (!sceneMount || threeReady || threeFailed) return;
  document.body.dataset.three = "loading";
  try {
    document.body.dataset.threeStage = "import";
    THREE = await import(THREE_URL);
    document.body.dataset.threeStage = "scene";
    scene3d = new THREE.Scene();
    scene3d.background = new THREE.Color(0x5f5a51);
    scene3d.fog = new THREE.Fog(DISTANCE_FOG.color, DISTANCE_FOG.near, DISTANCE_FOG.far);

    document.body.dataset.threeStage = "camera";
    camera3d = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, DISTANCE_FOG.cameraFar);
    camera3d.position.set(0, 8.8, 10.8);
    lastCameraTarget = new THREE.Vector3(0, 0.7, 0);

    document.body.dataset.threeStage = "renderer";
    renderer3d = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer3d.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer3d.setSize(window.innerWidth, window.innerHeight);
    renderer3d.shadowMap.enabled = true;
    renderer3d.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer3d.outputColorSpace = THREE.SRGBColorSpace;
    sceneMount.append(renderer3d.domElement);
    canvas.classList.add("hidden-fallback");

    document.body.dataset.threeStage = "world";
    world3d = new THREE.Group();
    dynamic3d = new THREE.Group();
    scene3d.add(world3d, dynamic3d);
    document.body.dataset.threeStage = "static-world";
    buildStatic3DWorld();
    document.body.dataset.threeStage = "actors";
    player3d = makePlayer3D();
    boss3d = makeBoss3D();
    world3d.add(player3d, boss3d);
    threeReady = true;
    document.body.dataset.three = "ready";
    document.body.dataset.threeStage = "ready";
    resize();
  } catch (error) {
    threeFailed = true;
    sceneMount.hidden = true;
    canvas.classList.remove("hidden-fallback");
    document.body.dataset.three = "failed";
    document.body.dataset.threeError = error?.name || "three-load-failed";
    document.body.dataset.threeMessage = String(error?.message || error || "three-load-failed").slice(0, 180);
    console.warn("Three.js failed to load; using 2D fallback.", error);
  }
}

function terrainColorForHeight(sceneX, sceneZ, height) {
  const color = new THREE.Color(
    height < -0.22 ? 0x172713
      : height < -0.06 ? 0x21361f
        : height > 4.8 ? 0x747265
          : height > 2.5 ? 0x5d6458
            : height > 1.05 ? 0x5f6355
              : height > 0.54 ? 0x40543a
                : 0x263a22,
  );
  const detail = terrainDetailNoise(sceneX * 1.8, sceneZ * 1.8, 19);
  if (detail > 0.74) color.lerp(new THREE.Color(0x3d5534), 0.12);
  else if (detail < 0.18) color.lerp(new THREE.Color(0x1a2918), 0.1);
  if (distanceToRoadScene(sceneX, sceneZ) < ROAD_WIDTH / WORLD_SCALE * 0.52) {
    color.lerp(new THREE.Color(0x5c574c), 0.22);
  }
  const city = mainCityInfluence(sceneX, sceneZ, 4.8);
  if (city > 0) color.lerp(new THREE.Color(0x53534c), city * 0.72);
  return color;
}

function makeTerrainGroundMesh() {
  const segmentsX = TERRAIN_MESH_SEGMENTS;
  const segmentsZ = TERRAIN_MESH_SEGMENTS;
  const vertices = [];
  const colors = [];
  const indices = [];
  for (let zIndex = 0; zIndex <= segmentsZ; zIndex += 1) {
    const zRatio = zIndex / segmentsZ;
    const sceneZ = WORLD_SCENE_MIN_Z + WORLD_SCENE_DEPTH * zRatio;
    for (let xIndex = 0; xIndex <= segmentsX; xIndex += 1) {
      const xRatio = xIndex / segmentsX;
      const sceneX = WORLD_SCENE_MIN_X + WORLD_SCENE_WIDTH * xRatio;
      const height = sceneSurfaceHeight(sceneX, sceneZ);
      vertices.push(sceneX, height, sceneZ);
      const color = terrainColorForHeight(sceneX, sceneZ, height);
      colors.push(color.r, color.g, color.b);
    }
  }
  const row = segmentsX + 1;
  for (let zIndex = 0; zIndex < segmentsZ; zIndex += 1) {
    for (let xIndex = 0; xIndex < segmentsX; xIndex += 1) {
      const a = zIndex * row + xIndex;
      const b = a + 1;
      const c = a + row;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const ground = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.96,
      metalness: 0.015,
      side: THREE.DoubleSide,
    }),
  );
  ground.name = "Signed Heightfield Ground";
  ground.receiveShadow = true;
  return ground;
}

function makeTerrainBoundarySkirtMesh() {
  const bottom = TERRAIN_HEIGHT_MIN - 0.32;
  const segments = Math.max(64, Math.floor(TERRAIN_MESH_SEGMENTS * 0.72));
  const vertices = [];
  const colors = [];
  const indices = [];
  const addVertex = (sceneX, sceneZ, y) => {
    vertices.push(sceneX, y, sceneZ);
    const color = terrainColorForHeight(sceneX, sceneZ, y).lerp(new THREE.Color(0x10180f), 0.46);
    colors.push(color.r, color.g, color.b);
    return vertices.length / 3 - 1;
  };
  const addEdge = (edge) => {
    const startIndex = vertices.length / 3;
    for (let i = 0; i <= segments; i += 1) {
      const t = i / segments;
      let sceneX = WORLD_SCENE_MIN_X;
      let sceneZ = WORLD_SCENE_MIN_Z;
      if (edge === "north") {
        sceneX = WORLD_SCENE_MIN_X + WORLD_SCENE_WIDTH * t;
        sceneZ = WORLD_SCENE_MIN_Z;
      } else if (edge === "south") {
        sceneX = WORLD_SCENE_MIN_X + WORLD_SCENE_WIDTH * t;
        sceneZ = WORLD_SCENE_MAX_Z;
      } else if (edge === "west") {
        sceneX = WORLD_SCENE_MIN_X;
        sceneZ = WORLD_SCENE_MIN_Z + WORLD_SCENE_DEPTH * t;
      } else {
        sceneX = WORLD_SCENE_MAX_X;
        sceneZ = WORLD_SCENE_MIN_Z + WORLD_SCENE_DEPTH * t;
      }
      addVertex(sceneX, sceneZ, sceneSurfaceHeight(sceneX, sceneZ) - 0.012);
      addVertex(sceneX, sceneZ, bottom);
    }
    for (let i = 0; i < segments; i += 1) {
      const topA = startIndex + i * 2;
      const bottomA = topA + 1;
      const topB = topA + 2;
      const bottomB = topA + 3;
      indices.push(topA, bottomA, topB, topB, bottomA, bottomB);
    }
  };
  addEdge("north");
  addEdge("south");
  addEdge("west");
  addEdge("east");
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const skirt = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.98,
      metalness: 0.01,
      side: THREE.DoubleSide,
    }),
  );
  skirt.name = "Terrain Edge Fill";
  skirt.receiveShadow = true;
  return skirt;
}

function buildStatic3DWorld() {
  lanternLights3d = [];
  lanternGlow3d = [];
  chestObjects3d = new Map();
  const hemi = new THREE.HemisphereLight(0xd8d0bb, 0x1b0d0a, 1.55);
  scene3d.add(hemi);

  const moonLight = new THREE.DirectionalLight(0xf7f0da, 2.25);
  moonLight.position.set(6, 10, 4);
  moonLight.castShadow = true;
  moonLight.shadow.mapSize.set(1024, 1024);
  scene3d.add(moonLight);

  const miasmaLight = new THREE.PointLight(0x6f4c86, 1.35, 16);
  miasmaLight.position.set(0, 2.4, -2.4);
  scene3d.add(miasmaLight);

  const farGround = new THREE.Mesh(
    new THREE.PlaneGeometry(worldLen(VISUAL_WORLD_SIZE), worldLen(VISUAL_WORLD_SIZE)),
    new THREE.MeshStandardMaterial({ color: 0x1b2818, roughness: 0.96, metalness: 0.02 }),
  );
  farGround.name = "Infinite Visual Ground";
  farGround.rotation.x = -Math.PI / 2;
  farGround.position.y = TERRAIN_HEIGHT_MIN - 0.08;
  farGround.receiveShadow = true;
  world3d.add(farGround);

  const ground = makeTerrainGroundMesh();
  ground.name = "Playable World Ground";
  world3d.add(ground);
  world3d.add(makeTerrainBoundarySkirtMesh());

  outerMist3d = new THREE.Mesh(
    new THREE.PlaneGeometry(worldLen(VISUAL_WORLD_SIZE), worldLen(VISUAL_WORLD_SIZE)),
    new THREE.MeshBasicMaterial({
      color: DISTANCE_FOG.color,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  outerMist3d.name = "Outer Map Mist";
  outerMist3d.rotation.x = -Math.PI / 2;
  outerMist3d.position.y = -0.018;
  outerMist3d.renderOrder = -2;
  world3d.add(outerMist3d);

  const worldBorder = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(WORLD_SCENE_MIN_X, 0.022, WORLD_SCENE_MIN_Z),
      new THREE.Vector3(WORLD_SCENE_MAX_X, 0.022, WORLD_SCENE_MIN_Z),
      new THREE.Vector3(WORLD_SCENE_MAX_X, 0.022, WORLD_SCENE_MAX_Z),
      new THREE.Vector3(WORLD_SCENE_MIN_X, 0.022, WORLD_SCENE_MAX_Z),
    ]),
    new THREE.LineBasicMaterial({ color: 0xcaa65a, transparent: true, opacity: 0.36 }),
  );
  world3d.add(worldBorder);

  const gridStep = worldLen(320);
  for (let sceneX = WORLD_SCENE_MIN_X + gridStep; sceneX < WORLD_SCENE_MAX_X - 0.001; sceneX += gridStep) {
    const vertical = makeGroundLine(new THREE.Vector3(sceneX, 0.018, WORLD_SCENE_MIN_Z), new THREE.Vector3(sceneX, 0.018, WORLD_SCENE_MAX_Z));
    world3d.add(vertical);
  }
  for (let sceneZ = WORLD_SCENE_MIN_Z + gridStep; sceneZ < WORLD_SCENE_MAX_Z - 0.001; sceneZ += gridStep) {
    const horizontal = makeGroundLine(new THREE.Vector3(WORLD_SCENE_MIN_X, 0.018, sceneZ), new THREE.Vector3(WORLD_SCENE_MAX_X, 0.018, sceneZ));
    world3d.add(horizontal);
  }

  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(0.7, 32, 16),
    new THREE.MeshBasicMaterial({ color: 0xf7f0da }),
  );
  moon.position.set(6.6, 6.2, -8.8);
  scene3d.add(moon);

  makeTerrainFeatures3D();
  makeStoneRoad();
  makeMainCity3D();
  makeGroundSurfaceDetails3D();
  makeTerrainDetails3D();

  for (const prop of STATIC_PROPS) {
    if (prop.kind === "torii") makeTorii(prop.sceneX, prop.sceneZ, prop.scale, prop.rotation ?? 0.08);
    if (prop.kind === "lantern") makeLantern(prop.sceneX, prop.sceneZ, prop.scale || SMALL_ACTOR_SCALE);
    if (prop.kind === "house") makeHouse(prop.sceneX, prop.sceneZ, prop.scale, prop.rotation || 0);
    if (prop.kind === "blacksmithShop") makeWorkshop(prop.sceneX, prop.sceneZ, prop.scale, prop.rotation || 0, "blacksmith");
    if (prop.kind === "villageShop") makeWorkshop(prop.sceneX, prop.sceneZ, prop.scale, prop.rotation || 0, "shop");
    if (prop.kind === "musician") makeMusician(prop.sceneX, prop.sceneZ, prop.scale || 1);
    if (prop.kind === "npc") makeVillagerNpc(prop.sceneX, prop.sceneZ, prop.scale || SMALL_ACTOR_SCALE, prop);
    if (prop.kind === "fence") makeFence(prop.sceneX, prop.sceneZ, prop.scale || 1, prop.rotation || 0);
    if (prop.kind === "shrine") makeShrine(prop.sceneX, prop.sceneZ, prop.scale || 1, prop.rotation || 0);
    if (prop.kind === "donationBox") makeDonationBox(prop.sceneX, prop.sceneZ, prop.scale || 1, prop.rotation || 0);
  }
  makeVillageDecor3D();
  makeShrineDecor3D();
  makeRitualArena3D();
  makeOverworldLandmarks3D();
  makeDailyChestProps3D();
  makeMistField();
}

function makeGroundRing(radius, color, opacity) {
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(radius - 0.012, radius + 0.012, 128),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity, side: THREE.DoubleSide }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.02;
  return ring;
}

function slashArcStartAngle() {
  return -Math.PI / 2 + SLASH_3D_DISPLAY_OFFSET - SLASH_HALF_ANGLE;
}

function makeSlashSectorGeometry(range) {
  return new THREE.CircleGeometry(worldLen(range), 48, slashArcStartAngle(), SLASH_HALF_ANGLE * 2);
}

function makeSlashArcGeometry(range) {
  const radius = worldLen(range);
  return new THREE.RingGeometry(Math.max(0.01, radius - 0.024), radius + 0.024, 64, 1, slashArcStartAngle(), SLASH_HALF_ANGLE * 2);
}

function updateSlashRangeGeometry3D(range) {
  if (!slashSector3d || !slashArc3d || Math.abs(slashRange3dValue - range) < 0.001) return;
  slashRange3dValue = range;
  slashSector3d.geometry.dispose();
  slashArc3d.geometry.dispose();
  slashSector3d.geometry = makeSlashSectorGeometry(range);
  slashArc3d.geometry = makeSlashArcGeometry(range);
}

function makeGroundSquare(size, color, opacity) {
  const half = size / 2;
  const points = [
    new THREE.Vector3(-half, 0.02, -half),
    new THREE.Vector3(half, 0.02, -half),
    new THREE.Vector3(half, 0.02, half),
    new THREE.Vector3(-half, 0.02, half),
  ];
  return new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity }),
  );
}

function makeGroundLine(start, end) {
  return new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([start, end]),
    new THREE.LineBasicMaterial({ color: 0xeee6d2, transparent: true, opacity: 0.08 }),
  );
}

function finishMesh(mesh, name = "") {
  if (name) mesh.name = name;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function addBox3D(group, material, width, height, depth, x, y, z, rx = 0, ry = 0, rz = 0, name = "") {
  const mesh = finishMesh(new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material), name);
  mesh.position.set(x, y, z);
  mesh.rotation.set(rx, ry, rz);
  group.add(mesh);
  return mesh;
}

function addCylinder3D(group, material, topRadius, bottomRadius, height, segments, x, y, z, rx = 0, ry = 0, rz = 0, name = "") {
  const mesh = finishMesh(new THREE.Mesh(new THREE.CylinderGeometry(topRadius, bottomRadius, height, segments), material), name);
  mesh.position.set(x, y, z);
  mesh.rotation.set(rx, ry, rz);
  group.add(mesh);
  return mesh;
}

function addSphere3D(group, material, radius, widthSegments, heightSegments, x, y, z, sx = 1, sy = 1, sz = 1, name = "") {
  const mesh = finishMesh(new THREE.Mesh(new THREE.SphereGeometry(radius, widthSegments, heightSegments), material), name);
  mesh.position.set(x, y, z);
  mesh.scale.set(sx, sy, sz);
  group.add(mesh);
  return mesh;
}

function getVillageDecorAssets() {
  if (villageDecorAssets) return villageDecorAssets;
  const makeStandard = (color, roughness = 0.82, metalness = 0.02) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
  const makeFlat = (color, opacity = 1) => new THREE.MeshBasicMaterial({
    color,
    transparent: opacity < 1,
    opacity,
    side: THREE.DoubleSide,
  });
  villageDecorAssets = {
    materials: {
      bamboo: makeStandard(0x5f7a4a, 0.9),
      bambooDark: makeStandard(0x31462c, 0.92),
      warmWood: makeStandard(0x6f4528, 0.78),
      darkWood: makeStandard(0x2f2118, 0.86),
      straw: makeStandard(0xb7a35e, 0.96),
      strawDark: makeStandard(0x7f6a32, 0.96),
      stone: makeStandard(0x66635b, 0.94),
      stoneDark: makeStandard(0x383833, 0.96),
      ceramic: makeStandard(0x8f8172, 0.9),
      ceramicDark: makeStandard(0x50483f, 0.92),
      paper: makeFlat(0xefe7d4, 0.84),
      fadedRed: makeFlat(0x8c2f24, 0.86),
      vermilion: makeStandard(0x8f241d, 0.68, 0.02),
      weatheredVermilion: makeStandard(0x5f2b23, 0.84, 0.01),
      moss: makeStandard(0x4f6a3c, 0.94),
      soil: makeStandard(0x2d2119, 0.98),
      wornDirt: makeFlat(0x6b5637, 0.24),
      yardGrass: makeFlat(0x3b5b31, 0.18),
      leaf: makeStandard(0x446b35, 0.96),
      fallenLeaf: makeStandard(0x7f4f24, 0.96),
      grassSoft: makeStandard(0x355f30, 0.98),
      flowerWhite: makeFlat(0xf3ead8, 0.9),
      flowerPink: makeFlat(0xd58b92, 0.86),
      water: makeFlat(0x223a3c, 0.38),
      firefly: makeFlat(0xd9c76a, 0.74),
      ash: makeFlat(0x12100f, 0.42),
      clothBlue: makeFlat(0x38566a, 0.86),
      clothWhite: makeFlat(0xded8c8, 0.82),
      clothRed: makeFlat(0x7d2c24, 0.84),
      ink: makeFlat(0x221713, 0.94),
      rope: makeStandard(0xb99247, 0.86, 0.01),
      candle: makeFlat(0xf0c26a, 0.92),
      curseRed: makeFlat(0xd13a32, 0.72),
      curseGlow: makeFlat(0xff5246, 0.48),
      blackenedStone: makeStandard(0x201b18, 0.96, 0.01),
      talismanRed: makeFlat(0x8f241d, 0.8),
      plaster: makeStandard(0xded8c8, 0.92),
      bambooPanel: makeStandard(0xc8bd94, 0.94),
      tileRoof: makeStandard(0x181513, 0.86),
      roofEdge: makeStandard(0x2b211b, 0.86),
      cityStone: makeStandard(0x5a5a52, 0.95, 0.01),
      cityStoneDark: makeStandard(0x343531, 0.96, 0.01),
      cityPaver: makeStandard(0x6b6960, 0.94, 0.01),
      cityPaverLine: makeFlat(0xd2cab9, 0.16),
      cityBrick: makeStandard(0x9a604a, 0.86, 0.015),
      cityBrickLight: makeStandard(0xb27a5d, 0.86, 0.015),
      cityTileRoof: makeStandard(0x1d2024, 0.82, 0.025),
      cityRedTileRoof: makeStandard(0x60302a, 0.82, 0.025),
      sakuraTrunk: makeStandard(0x5b3828, 0.88, 0.01),
      sakuraBloom: makeFlat(0xf2c6cf, 0.9),
      sakuraBloomDeep: makeFlat(0xd8899b, 0.78),
    },
    geometries: {
      box: new THREE.BoxGeometry(1, 1, 1),
      plane: new THREE.PlaneGeometry(1, 1),
      cylinder8: new THREE.CylinderGeometry(1, 1, 1, 8),
      cylinder12: new THREE.CylinderGeometry(1, 1, 1, 12),
      cylinder16: new THREE.CylinderGeometry(1, 1, 1, 16),
      sphere: new THREE.SphereGeometry(1, 12, 8),
    },
    labelMaterials: new Map(),
  };
  return villageDecorAssets;
}

function decorLabelMaterial(label) {
  const assets = getVillageDecorAssets();
  const key = label || "blank";
  if (assets.labelMaterials.has(key)) return assets.labelMaterials.get(key);
  const labelCanvas = document.createElement("canvas");
  labelCanvas.width = 160;
  labelCanvas.height = 96;
  const labelCtx = labelCanvas.getContext("2d");
  labelCtx.fillStyle = "#efe7d4";
  labelCtx.fillRect(0, 0, labelCanvas.width, labelCanvas.height);
  labelCtx.strokeStyle = "#6f4528";
  labelCtx.lineWidth = 8;
  labelCtx.strokeRect(7, 7, labelCanvas.width - 14, labelCanvas.height - 14);
  labelCtx.fillStyle = "#221713";
  labelCtx.font = label.length > 2 ? "700 36px serif" : "700 50px serif";
  labelCtx.textAlign = "center";
  labelCtx.textBaseline = "middle";
  labelCtx.fillText(label, labelCanvas.width / 2, labelCanvas.height / 2 + 2);
  const texture = new THREE.CanvasTexture(labelCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
  assets.labelMaterials.set(key, material);
  return material;
}

function addDecorBox(group, material, width, height, depth, x, y, z, rx = 0, ry = 0, rz = 0) {
  const mesh = finishMesh(new THREE.Mesh(getVillageDecorAssets().geometries.box, material));
  mesh.scale.set(width, height, depth);
  mesh.position.set(x, y, z);
  mesh.rotation.set(rx, ry, rz);
  group.add(mesh);
  return mesh;
}

function addDecorCylinder(group, material, radius, height, x, y, z, rx = 0, ry = 0, rz = 0, geometry = "cylinder12", radiusZ = radius) {
  const mesh = finishMesh(new THREE.Mesh(getVillageDecorAssets().geometries[geometry], material));
  mesh.scale.set(radius, height, radiusZ);
  mesh.position.set(x, y, z);
  mesh.rotation.set(rx, ry, rz);
  group.add(mesh);
  return mesh;
}

function addDecorSphere(group, material, radius, x, y, z, sx = 1, sy = 1, sz = 1) {
  const mesh = finishMesh(new THREE.Mesh(getVillageDecorAssets().geometries.sphere, material));
  mesh.scale.set(radius * sx, radius * sy, radius * sz);
  mesh.position.set(x, y, z);
  group.add(mesh);
  return mesh;
}

function addDecorPlane(group, material, width, height, x, y, z, rx = 0, ry = 0, rz = 0) {
  const mesh = finishMesh(new THREE.Mesh(getVillageDecorAssets().geometries.plane, material));
  mesh.scale.set(width, height, 1);
  mesh.position.set(x, y, z);
  mesh.rotation.set(rx, ry, rz);
  group.add(mesh);
  return mesh;
}

function localScenePoint(sceneX, sceneZ, rotation, localX, localZ) {
  return {
    x: sceneX + Math.cos(rotation) * localX - Math.sin(rotation) * localZ,
    z: sceneZ + Math.sin(rotation) * localX + Math.cos(rotation) * localZ,
  };
}

function decorPointAllowed(sceneX, sceneZ, options = {}) {
  if (!scenePointInWorldBounds(sceneX, sceneZ, 0.4)) return false;
  if (distanceToRoadScene(sceneX, sceneZ) < (options.roadPadding ?? 0.54)) return false;
  const blockedKinds = new Set(["musician", "npc", "donationBox", "torii"]);
  for (const prop of STATIC_PROPS) {
    if (!blockedKinds.has(prop.kind)) continue;
    if (Math.hypot(sceneX - prop.sceneX, sceneZ - prop.sceneZ) < staticPropClearanceScene(prop) + 0.42) return false;
  }
  return true;
}

function addVillageDecorProp(list, kind, sceneX, sceneZ, options = {}) {
  if (!decorPointAllowed(sceneX, sceneZ, options)) return;
  list.push({ kind, sceneX, sceneZ, ...options });
}

function addVillageDecorLocal(list, kind, prop, localX, localZ, options = {}) {
  const rotation = prop.rotation || 0;
  const point = localScenePoint(prop.sceneX, prop.sceneZ, rotation, localX, localZ);
  addVillageDecorProp(list, kind, point.x, point.z, {
    rotation: rotation + (options.rotationOffset || 0),
    ...options,
  });
}

function addVillageEntranceCluster(list, building, index) {
  const scale = building.scale || 1;
  const doorSide = index % 2 === 0 ? -1 : 1;
  addVillageDecorLocal(list, "wornPath", building, 0, -1.18 * scale, {
    scale: 0.72 + scale * 0.08,
    rotationOffset: 0,
    seed: 0x3a00 + index,
    jitter: 0.02,
    roadPadding: 0.08,
  });
  const shouldAccentEntrance = building.kind !== "house" || index % 3 === 0;
  if (!shouldAccentEntrance) return;
  if (index % 3 !== 1) {
    addVillageDecorLocal(list, "paperLantern", building, doorSide * 0.62 * scale, -0.92 * scale, {
      scale: 0.3,
      rotationOffset: doorSide * 0.12,
      seed: 0x3b00 + index,
      roadPadding: 0.14,
    });
  } else {
    addVillageDecorLocal(list, "hangingCloths", building, doorSide * 0.48 * scale, -0.84 * scale, {
      scale: 0.34,
      rotationOffset: Math.PI / 2,
      seed: 0x3c00 + index,
      roadPadding: 0.14,
    });
  }
}

function addVillageStorageCluster(list, building, index) {
  const scale = building.scale || 1;
  const side = index % 2 === 0 ? -1 : 1;
  const back = index % 3 === 0 ? 0.54 : 0.42;
  const primary = ["stackedFirewood", "woodenCrate", "ceramicJar", "strawBundle", "woodenBucket"][index % 5];
  const secondary = ["woodenBucket", "ceramicJar", "stackedFirewood", "woodenCrate", "strawBundle"][(index + 2) % 5];
  addVillageDecorLocal(list, "yardPatch", building, side * 0.92 * scale, back * scale, {
    scale: 0.62,
    rotationOffset: side * 0.08,
    seed: 0x3d00 + index,
    jitter: 0.03,
    roadPadding: 0.2,
  });
  addVillageDecorLocal(list, primary, building, side * (0.78 + scale * 0.12), back * scale, {
    scale: 0.38 + (index % 3) * 0.035,
    rotationOffset: side * 0.2,
    seed: 0x4200 + index,
    roadPadding: 0.22,
  });
  addVillageDecorLocal(list, secondary, building, side * (1.08 + scale * 0.08), (back - 0.24) * scale, {
    scale: 0.32 + (index % 2) * 0.045,
    rotationOffset: side * -0.24,
    seed: 0x4300 + index,
    roadPadding: 0.24,
  });
}

function addVillageWorkPatch(list, patch, index) {
  const sideX = -Math.sin(patch.rotation);
  const sideZ = Math.cos(patch.rotation);
  const frontX = Math.cos(patch.rotation);
  const frontZ = Math.sin(patch.rotation);
  addVillageDecorProp(list, "yardPatch", patch.x - frontX * 0.18, patch.z - frontZ * 0.18, {
    scale: 0.86,
    rotation: patch.rotation,
    seed: 0x7c00 + index,
    jitter: 0.02,
    roadPadding: 0.38,
  });
  addVillageDecorProp(list, "vegetablePatch", patch.x, patch.z, {
    scale: index === 2 ? 0.54 : 0.64,
    rotation: patch.rotation,
    seed: 0x800 + index,
    roadPadding: 0.46,
  });
  addVillageDecorProp(list, "bambooFence", patch.x + frontX * 0.78, patch.z + frontZ * 0.78, {
    scale: 0.56,
    rotation: patch.rotation,
    seed: 0x820 + index,
    roadPadding: 0.42,
  });
  addVillageDecorProp(list, "farmingTools", patch.x + sideX * 0.76 - frontX * 0.22, patch.z + sideZ * 0.76 - frontZ * 0.22, {
    scale: 0.42,
    rotation: patch.rotation + 0.32,
    seed: 0x840 + index,
    roadPadding: 0.34,
  });
  addVillageDecorProp(list, index % 2 ? "woodenBucket" : "strawBundle", patch.x - sideX * 0.7 - frontX * 0.1, patch.z - sideZ * 0.7 - frontZ * 0.1, {
    scale: 0.34 + index * 0.02,
    rotation: patch.rotation - 0.24,
    seed: 0x850 + index,
    roadPadding: 0.34,
  });
  addVillageDecorProp(list, "woodenSign", patch.x - frontX * 0.9, patch.z - frontZ * 0.9, {
    scale: 0.4,
    rotation: patch.rotation + 0.2,
    label: patch.label,
    seed: 0x860 + index,
    roadPadding: 0.36,
  });
}

function buildVillageDecorLayout() {
  const decor = [];
  const buildings = STATIC_PROPS.filter((prop) => prop.kind === "house" || prop.kind === "blacksmithShop" || prop.kind === "villageShop");
  buildings.forEach((building, index) => {
    addVillageEntranceCluster(decor, building, index);
    addVillageStorageCluster(decor, building, index);
  });

  addVillageDecorLocal(decor, "norenCurtain", { ...STATIC_PROPS.find((prop) => prop.kind === "villageShop") }, 0, -0.72, { scale: 0.72, label: "商", seed: 0x501, roadPadding: 0.24 });
  addVillageDecorLocal(decor, "norenCurtain", { ...STATIC_PROPS.find((prop) => prop.kind === "blacksmithShop") }, 0, -0.76, { scale: 0.68, label: "鍛", seed: 0x502, roadPadding: 0.24 });
  addVillageDecorLocal(decor, "woodenSign", { ...STATIC_PROPS.find((prop) => prop.kind === "villageShop") }, -0.98, -0.72, { scale: 0.56, label: "店", seed: 0x503, roadPadding: 0.24 });
  addVillageDecorLocal(decor, "woodenSign", { ...STATIC_PROPS.find((prop) => prop.kind === "blacksmithShop") }, 0.94, -0.78, { scale: 0.58, label: "鍛冶", seed: 0x504, roadPadding: 0.24 });

  const cornerLanterns = [
    { x: VILLAGE_SCENE.x - 5.64, z: VILLAGE_SCENE.z + 0.88, rotation: 0.28 },
    { x: SHOP_SCENE.x - 0.76, z: SHOP_SCENE.z - 0.7, rotation: -0.18 },
    { x: BLACKSMITH_SCENE.x - 0.98, z: BLACKSMITH_SCENE.z - 0.88, rotation: 0.2 },
    { x: VILLAGE_SCENE.x - 6.98, z: VILLAGE_SCENE.z + 5.1, rotation: -0.18 },
  ];
  cornerLanterns.forEach((prop, index) => addVillageDecorProp(decor, "paperLantern", prop.x, prop.z, {
    scale: 0.34,
    rotation: prop.rotation,
    seed: 0x600 + index,
    roadPadding: 0.18,
  }));

  addVillageDecorProp(decor, "waterWell", VILLAGE_SCENE.x - 5.8, VILLAGE_SCENE.z + 0.95, { scale: 0.68, rotation: 0.18, label: "井", seed: 0x701, roadPadding: 0.42 });
  addVillageDecorProp(decor, "woodenSign", VILLAGE_SCENE.x - 5.24, VILLAGE_SCENE.z + 0.38, { scale: 0.5, rotation: 0.5, label: "井戸", seed: 0x702, roadPadding: 0.36 });

  const vegetablePatches = [
    { x: VILLAGE_SCENE.x + 4.08, z: VILLAGE_SCENE.z + 3.25, rotation: 1.46, label: "畑" },
    { x: VILLAGE_SCENE.x - 8.35, z: VILLAGE_SCENE.z + 6.88, rotation: -0.26, label: "菜" },
    { x: VILLAGE_SCENE.x - 0.46, z: VILLAGE_SCENE.z + 4.72, rotation: -0.62, label: "青菜" },
  ];
  vegetablePatches.forEach((patch, index) => addVillageWorkPatch(decor, patch, index));

  for (let i = 0; i < 5; i += 1) {
    addVillageDecorProp(decor, "bambooFence", VILLAGE_SCENE.x + 5.2 + (i % 2) * 0.12, VILLAGE_SCENE.z - 0.55 + i * 0.78, {
      scale: 0.52,
      rotation: 1.44 + Math.sin(i) * 0.12,
      seed: 0x900 + i,
      roadPadding: 0.38,
    });
  }

  [
    { kind: "stackedFirewood", x: BLACKSMITH_SCENE.x + 1.22, z: BLACKSMITH_SCENE.z + 0.68, rotation: -0.08, scale: 0.62 },
    { kind: "woodenCrate", x: SHOP_SCENE.x + 1.12, z: SHOP_SCENE.z - 0.12, rotation: 0.38, scale: 0.48 },
    { kind: "ceramicJar", x: SHOP_SCENE.x + 1.34, z: SHOP_SCENE.z + 0.28, rotation: -0.16, scale: 0.46 },
    { kind: "woodenBucket", x: MUSICIAN_SCENE.x - 0.8, z: MUSICIAN_SCENE.z + 0.52, rotation: 0.3, scale: 0.4 },
    { kind: "strawBundle", x: VILLAGE_SCENE.x - 8.62, z: VILLAGE_SCENE.z + 4.95, rotation: -0.22, scale: 0.54 },
    { kind: "hangingCloths", x: VILLAGE_SCENE.x - 7.92, z: VILLAGE_SCENE.z + 2.88, rotation: 0.04, scale: 0.46 },
  ].forEach((prop, index) => addVillageDecorProp(decor, prop.kind, prop.x, prop.z, {
    scale: prop.scale,
    rotation: prop.rotation,
    seed: 0xa00 + index,
    roadPadding: 0.24,
  }));

  return decor;
}

function makeVillageDecor3D() {
  getVillageDecorAssets();
  for (const prop of VILLAGE_DECOR_PROPS) makeVillageDecorProp3D(prop);
}

function makeVillageDecorProp3D(prop) {
  const rng = makeSeededRng(prop.seed || 0xdec0);
  const group = new THREE.Group();
  const jitter = prop.jitter ?? 0.08;
  const sceneX = prop.sceneX + (rng() - 0.5) * jitter;
  const sceneZ = prop.sceneZ + (rng() - 0.5) * jitter;
  const scale = (prop.scale || 1) * (0.92 + rng() * 0.16);
  const rotation = (prop.rotation || 0) + (rng() - 0.5) * (prop.rotationJitter ?? 0.22);
  group.position.set(sceneX, sceneHillHeight(sceneX, sceneZ) + 0.012, sceneZ);
  group.rotation.y = rotation;
  group.scale.setScalar(scale);
  group.name = `decor-${prop.kind}`;

  if (prop.kind === "bambooFence") makeDecorBambooFence(group, rng);
  if (prop.kind === "woodenBucket") makeDecorBucket(group);
  if (prop.kind === "waterWell") makeDecorWell(group, prop.label || "井");
  if (prop.kind === "stackedFirewood") makeDecorFirewood(group, rng);
  if (prop.kind === "strawBundle") makeDecorStrawBundle(group, rng);
  if (prop.kind === "ceramicJar") makeDecorJar(group, rng);
  if (prop.kind === "woodenCrate") makeDecorCrate(group);
  if (prop.kind === "hangingCloths") makeDecorHangingCloths(group, rng);
  if (prop.kind === "paperLantern") makeDecorPaperLantern(group);
  if (prop.kind === "norenCurtain") makeDecorNoren(group, prop.label || "");
  if (prop.kind === "woodenSign") makeDecorSign(group, prop.label || "札");
  if (prop.kind === "vegetablePatch") makeDecorVegetablePatch(group, rng);
  if (prop.kind === "farmingTools") makeDecorFarmingTools(group, rng);
  if (prop.kind === "wornPath") makeDecorWornPath(group, rng);
  if (prop.kind === "yardPatch") makeDecorYardPatch(group, rng);

  if (group.children.length) world3d.add(group);
}

function makeDailyChestProps3D() {
  getVillageDecorAssets();
  for (const chest of HIDDEN_CHEST_SPAWN_POINTS) {
    const group = new THREE.Group();
    group.name = `daily-chest-${chest.id}`;
    group.position.set(chest.sceneX, sceneHillHeight(chest.sceneX, chest.sceneZ) + 0.012, chest.sceneZ);
    group.rotation.y = chest.rotation || 0;
    group.scale.setScalar((chest.scale || 1) * 0.42);

    const { warmWood, darkWood, rope, moss, paper } = getVillageDecorAssets().materials;
    addDecorBox(group, darkWood, 0.74, 0.2, 0.48, 0, 0.1, 0);
    addDecorBox(group, warmWood, 0.64, 0.18, 0.38, 0, 0.17, 0);
    addDecorBox(group, darkWood, 0.7, 0.055, 0.08, 0, 0.22, 0);
    addDecorBox(group, rope, 0.08, 0.21, 0.46, -0.23, 0.12, 0);
    addDecorBox(group, rope, 0.08, 0.21, 0.46, 0.23, 0.12, 0);
    addDecorPlane(group, moss, 0.24, 0.11, -0.18, 0.225, -0.2, -Math.PI / 2, 0, 0.22);
    addDecorPlane(group, moss, 0.19, 0.08, 0.12, 0.225, 0.16, -Math.PI / 2, 0, -0.18);
    const lid = addDecorBox(group, warmWood, 0.7, 0.08, 0.46, 0, 0.27, -0.03, -0.12, 0, 0);
    lid.name = "chest-lid";
    addDecorBox(lid, darkWood, 0.72, 0.025, 0.06, 0, 0.03, -0.18);
    addDecorPlane(group, paper, 0.14, 0.18, 0, 0.22, -0.255, 0, Math.PI, 0);
    world3d.add(group);
    chestObjects3d.set(chest.id, { group, lid });
  }
}

function makeDecorWornPath(group, rng) {
  const { wornDirt, stoneDark, moss } = getVillageDecorAssets().materials;
  const path = addDecorPlane(group, wornDirt, 0.68, 1.18, 0, 0.018, 0, -Math.PI / 2, 0, 0);
  path.renderOrder = -2;
  for (let i = -2; i <= 2; i += 1) {
    const z = -0.46 + (i + 2) * 0.23 + (rng() - 0.5) * 0.04;
    addDecorSphere(group, i % 2 ? stoneDark : moss, 0.035 + rng() * 0.018, (rng() - 0.5) * 0.26, 0.028, z, 1.5, 0.32, 1);
  }
}

function makeDecorYardPatch(group, rng) {
  const { yardGrass, wornDirt, moss, stoneDark } = getVillageDecorAssets().materials;
  const base = addDecorPlane(group, rng() < 0.45 ? wornDirt : yardGrass, 1.05 + rng() * 0.18, 0.72 + rng() * 0.12, 0, 0.016, 0, -Math.PI / 2, 0, (rng() - 0.5) * 0.18);
  base.renderOrder = -3;
  for (let i = 0; i < 6; i += 1) {
    const x = (rng() - 0.5) * 0.84;
    const z = (rng() - 0.5) * 0.54;
    if (rng() < 0.6) {
      addDecorPlane(group, moss, 0.12 + rng() * 0.08, 0.06 + rng() * 0.05, x, 0.022, z, -Math.PI / 2, 0, rng() * TWO_PI);
    } else {
      addDecorSphere(group, stoneDark, 0.028 + rng() * 0.015, x, 0.028, z, 1.3, 0.36, 1);
    }
  }
}

function makeDecorBambooFence(group, rng) {
  const { bamboo, bambooDark, strawDark } = getVillageDecorAssets().materials;
  for (let i = -2; i <= 2; i += 1) {
    const height = 0.78 + rng() * 0.16;
    addDecorCylinder(group, i % 2 ? bamboo : bambooDark, 0.035, height, i * 0.24, height * 0.5, 0, 0, 0, 0, "cylinder8");
  }
  for (const y of [0.28, 0.55]) {
    addDecorCylinder(group, bamboo, 0.026, 1.08, 0, y, -0.02, 0, 0, Math.PI / 2, "cylinder8");
  }
  addDecorBox(group, strawDark, 1.08, 0.026, 0.026, 0, 0.42, -0.055, 0, 0, 0.08);
}

function makeDecorBucket(group) {
  const { warmWood, darkWood, stoneDark } = getVillageDecorAssets().materials;
  addDecorCylinder(group, warmWood, 0.18, 0.32, 0, 0.16, 0, 0, 0, 0, "cylinder16");
  addDecorCylinder(group, stoneDark, 0.145, 0.012, 0, 0.33, 0, 0, 0, 0, "cylinder16");
  for (const y of [0.08, 0.26]) addDecorCylinder(group, darkWood, 0.186, 0.024, 0, y, 0, 0, 0, 0, "cylinder16");
  addDecorCylinder(group, darkWood, 0.012, 0.44, -0.19, 0.31, 0, Math.PI / 2, 0, 0.18, "cylinder8");
  addDecorCylinder(group, darkWood, 0.012, 0.44, 0.19, 0.31, 0, Math.PI / 2, 0, -0.18, "cylinder8");
}

function makeDecorWell(group, label) {
  const { stone, stoneDark, warmWood, darkWood } = getVillageDecorAssets().materials;
  addDecorCylinder(group, stone, 0.43, 0.3, 0, 0.15, 0, 0, 0, 0, "cylinder16");
  addDecorCylinder(group, stoneDark, 0.32, 0.026, 0, 0.33, 0, 0, 0, 0, "cylinder16");
  addDecorCylinder(group, darkWood, 0.035, 0.86, -0.38, 0.66, 0, 0, 0, 0, "cylinder8");
  addDecorCylinder(group, darkWood, 0.035, 0.86, 0.38, 0.66, 0, 0, 0, 0, "cylinder8");
  addDecorCylinder(group, warmWood, 0.03, 0.92, 0, 0.93, 0, Math.PI / 2, 0, Math.PI / 2, "cylinder8");
  addDecorBox(group, darkWood, 1.02, 0.12, 0.64, 0, 1.1, 0, 0, 0, 0.08);
  addDecorBox(group, warmWood, 0.38, 0.18, 0.06, 0, 0.68, -0.42);
  addDecorPlane(group, decorLabelMaterial(label), 0.24, 0.18, 0, 0.69, -0.455, 0, Math.PI, 0);
}

function makeDecorFirewood(group, rng) {
  const { warmWood, darkWood } = getVillageDecorAssets().materials;
  addDecorBox(group, darkWood, 0.72, 0.06, 0.34, 0, 0.03, 0);
  for (let row = 0; row < 3; row += 1) {
    for (let i = 0; i < 4; i += 1) {
      addDecorCylinder(group, i % 2 ? warmWood : darkWood, 0.045, 0.58 + rng() * 0.08, -0.24 + i * 0.16, 0.12 + row * 0.085, (row % 2) * 0.06, Math.PI / 2, 0, Math.PI / 2, "cylinder8");
    }
  }
}

function makeDecorStrawBundle(group, rng) {
  const { straw, strawDark } = getVillageDecorAssets().materials;
  for (let i = 0; i < 4; i += 1) {
    addDecorCylinder(group, i % 2 ? strawDark : straw, 0.13, 0.56 + rng() * 0.08, -0.24 + i * 0.16, 0.16, 0, Math.PI / 2, 0, 0.12, "cylinder12", 0.1);
  }
  addDecorBox(group, strawDark, 0.72, 0.035, 0.04, 0, 0.16, 0.03);
}

function makeDecorJar(group, rng) {
  const { ceramic, ceramicDark } = getVillageDecorAssets().materials;
  const jar = addDecorSphere(group, ceramic, 0.22, 0, 0.23, 0, 0.82, 1.12, 0.82);
  jar.rotation.y = rng() * TWO_PI;
  addDecorCylinder(group, ceramicDark, 0.11, 0.08, 0, 0.43, 0, 0, 0, 0, "cylinder16");
  addDecorCylinder(group, ceramicDark, 0.075, 0.018, 0, 0.49, 0, 0, 0, 0, "cylinder16");
}

function makeDecorCrate(group) {
  const { warmWood, darkWood } = getVillageDecorAssets().materials;
  addDecorBox(group, warmWood, 0.42, 0.34, 0.38, 0, 0.17, 0);
  for (const x of [-0.17, 0.17]) addDecorBox(group, darkWood, 0.045, 0.36, 0.4, x, 0.18, 0);
  for (const z of [-0.16, 0.16]) addDecorBox(group, darkWood, 0.44, 0.045, 0.045, 0, 0.16, z);
  addDecorBox(group, darkWood, 0.52, 0.035, 0.035, 0, 0.19, -0.205, 0, 0, 0.72);
}

function makeDecorHangingCloths(group, rng) {
  const { bambooDark, strawDark, clothBlue, clothWhite, clothRed } = getVillageDecorAssets().materials;
  addDecorCylinder(group, bambooDark, 0.025, 1.08, -0.44, 0.54, 0, 0, 0, 0, "cylinder8");
  addDecorCylinder(group, bambooDark, 0.025, 1.08, 0.44, 0.54, 0, 0, 0, 0, "cylinder8");
  addDecorCylinder(group, strawDark, 0.015, 0.94, 0, 0.94, 0, Math.PI / 2, 0, Math.PI / 2, "cylinder8");
  const cloths = [clothWhite, clothRed, clothBlue];
  for (let i = 0; i < cloths.length; i += 1) {
    addDecorPlane(group, cloths[i], 0.2, 0.34 + rng() * 0.08, -0.24 + i * 0.24, 0.72, -0.012, 0, 0, (rng() - 0.5) * 0.08);
  }
}

function makeDecorPaperLantern(group) {
  const { darkWood, paper, fadedRed, strawDark } = getVillageDecorAssets().materials;
  addDecorCylinder(group, darkWood, 0.022, 0.72, 0, 0.36, 0, 0, 0, 0, "cylinder8");
  addDecorCylinder(group, darkWood, 0.014, 0.34, 0.15, 0.72, 0, Math.PI / 2, 0, 0.45, "cylinder8");
  addDecorCylinder(group, strawDark, 0.008, 0.2, 0.29, 0.58, 0, 0, 0, 0, "cylinder8");
  addDecorCylinder(group, paper, 0.14, 0.23, 0.29, 0.45, 0, 0, 0, 0, "cylinder16");
  addDecorCylinder(group, fadedRed, 0.145, 0.035, 0.29, 0.58, 0, 0, 0, 0, "cylinder16");
  addDecorCylinder(group, fadedRed, 0.145, 0.035, 0.29, 0.32, 0, 0, 0, 0, "cylinder16");
}

function makeDecorNoren(group, label) {
  const { warmWood, clothBlue, clothRed, ink } = getVillageDecorAssets().materials;
  const cloth = label === "鍛" ? clothRed : clothBlue;
  addDecorCylinder(group, warmWood, 0.018, 0.92, 0, 0.58, 0, Math.PI / 2, 0, Math.PI / 2, "cylinder8");
  for (let i = -1; i <= 1; i += 1) {
    addDecorPlane(group, cloth, 0.24, 0.36, i * 0.25, 0.38, -0.016, 0, 0, 0);
  }
  if (label) {
    addDecorPlane(group, decorLabelMaterial(label), 0.18, 0.18, 0, 0.42, -0.02, 0, 0, 0);
  } else {
    addDecorBox(group, ink, 0.5, 0.025, 0.012, 0, 0.44, -0.02);
  }
}

function makeDecorSign(group, label) {
  const { warmWood, darkWood } = getVillageDecorAssets().materials;
  addDecorCylinder(group, darkWood, 0.026, 0.72, 0, 0.36, 0, 0, 0, 0, "cylinder8");
  addDecorBox(group, warmWood, 0.5, 0.32, 0.04, 0, 0.58, -0.02);
  addDecorPlane(group, decorLabelMaterial(label), 0.42, 0.24, 0, 0.58, -0.046, 0, 0, 0);
}

function makeDecorVegetablePatch(group, rng) {
  const { soil, leaf, moss, bambooDark } = getVillageDecorAssets().materials;
  addDecorBox(group, soil, 1.2, 0.035, 0.78, 0, 0.018, 0);
  for (const z of [-0.22, 0, 0.22]) {
    addDecorBox(group, moss, 1.05, 0.025, 0.035, 0, 0.05, z);
    for (let i = -2; i <= 2; i += 1) {
      addDecorSphere(group, leaf, 0.045 + rng() * 0.012, i * 0.2 + (rng() - 0.5) * 0.03, 0.09, z + (rng() - 0.5) * 0.04, 1.2, 0.55, 1);
    }
  }
  for (const x of [-0.62, 0.62]) addDecorCylinder(group, bambooDark, 0.014, 0.82, x, 0.055, 0, Math.PI / 2, 0, Math.PI / 2, "cylinder8");
}

function makeDecorFarmingTools(group, rng) {
  const { warmWood, darkWood, straw, bambooDark } = getVillageDecorAssets().materials;
  for (let i = 0; i < 3; i += 1) {
    const x = -0.22 + i * 0.22;
    const lean = -0.36 + i * 0.22 + (rng() - 0.5) * 0.08;
    addDecorCylinder(group, i === 2 ? straw : warmWood, 0.018, 0.82, x, 0.42, 0, 0, 0, lean, "cylinder8");
    if (i === 0) {
      addDecorBox(group, darkWood, 0.18, 0.035, 0.05, x + 0.02, 0.82, 0, 0, 0, lean);
    } else if (i === 1) {
      addDecorBox(group, darkWood, 0.24, 0.03, 0.04, x, 0.82, 0, 0, 0, lean);
      for (let t = -2; t <= 2; t += 1) addDecorBox(group, darkWood, 0.012, 0.11, 0.018, x + t * 0.05, 0.76, 0, 0, 0, lean);
    } else {
      addDecorBox(group, bambooDark, 0.24, 0.16, 0.05, x, 0.18, 0, 0, 0, lean);
    }
  }
}

function shrineLocalPoint(localX, localZ) {
  return { x: SHRINE_SCENE.x + localX, z: SHRINE_SCENE.z + localZ };
}

function makeShrineDecorGroup(kind, localX, localZ, scale = 1, rotation = 0) {
  const point = shrineLocalPoint(localX, localZ);
  const group = new THREE.Group();
  group.name = `shrine-${kind}`;
  group.position.set(point.x, sceneHillHeight(point.x, point.z) + 0.014, point.z);
  group.rotation.y = rotation;
  group.scale.setScalar(scale);
  world3d.add(group);
  return group;
}

function makeShrineGroundPlane(name, localX, localZ, width, depth, material, rotation = 0, yOffset = 0.05) {
  const point = shrineLocalPoint(localX, localZ);
  const mesh = finishMesh(new THREE.Mesh(getVillageDecorAssets().geometries.plane, material), `shrine-ground-${name}`);
  mesh.scale.set(width, depth, 1);
  mesh.position.set(point.x, sceneHillHeight(point.x, point.z) + yOffset, point.z);
  mesh.rotation.set(-Math.PI / 2, 0, rotation);
  mesh.renderOrder = -2;
  world3d.add(mesh);
  return mesh;
}

function makeShrineGroundSlab(name, localX, localZ, width, height, depth, material, rotation = 0, yOffset = 0.06) {
  const point = shrineLocalPoint(localX, localZ);
  const mesh = finishMesh(new THREE.Mesh(getVillageDecorAssets().geometries.box, material), `shrine-slab-${name}`);
  mesh.scale.set(width, height, depth);
  mesh.position.set(point.x, sceneHillHeight(point.x, point.z) + yOffset, point.z);
  mesh.rotation.y = rotation;
  world3d.add(mesh);
  return mesh;
}

function makeShrineBorderStone(group) {
  const { stoneDark, stone, moss } = getVillageDecorAssets().materials;
  addDecorBox(group, stoneDark, 0.36, 0.09, 0.26, 0, 0.05, 0);
  addDecorSphere(group, stone, 0.12, -0.04, 0.12, 0.02, 1.18, 0.54, 1);
  addDecorSphere(group, stoneDark, 0.08, 0.1, 0.12, -0.02, 1.1, 0.52, 1);
  addDecorPlane(group, moss, 0.24, 0.12, 0.04, 0.1, 0.04, -Math.PI / 2, 0, 0.2);
}

function makeShrineBushCluster(group, variant = 0) {
  const { leaf, moss, grassSoft, stoneDark, fallenLeaf } = getVillageDecorAssets().materials;
  addDecorPlane(group, variant % 2 ? moss : grassSoft, 0.7, 0.4, 0, 0.024, 0, -Math.PI / 2, 0, 0.04 + variant * 0.08);
  addDecorSphere(group, leaf, 0.22, -0.14, 0.13, 0.08, 1.2, 0.72, 1);
  addDecorSphere(group, variant % 2 ? moss : leaf, 0.18, 0.1, 0.11, -0.1, 1.2, 0.7, 1);
  addDecorSphere(group, leaf, 0.14, 0.18, 0.15, 0.1, 1.1, 0.68, 1);
  addDecorSphere(group, stoneDark, 0.055, -0.24, 0.055, -0.08, 1.18, 0.5, 1);
  addDecorSphere(group, stoneDark, 0.045, 0.28, 0.05, 0.14, 1.12, 0.48, 1);
  addDecorPlane(group, fallenLeaf, 0.14, 0.06, 0.08, 0.034, 0.18, -Math.PI / 2, 0, 0.2);
}

function makeShrineSidePine(group) {
  const { darkWood, leaf, moss } = getVillageDecorAssets().materials;
  addDecorCylinder(group, darkWood, 0.08, 0.84, 0, 0.42, 0, 0, 0, 0, "cylinder12");
  addDecorSphere(group, leaf, 0.3, 0, 0.94, 0, 1.02, 0.76, 1);
  addDecorSphere(group, leaf, 0.22, -0.08, 1.22, 0.04, 1.1, 0.68, 1);
  addDecorSphere(group, moss, 0.11, -0.1, 0.16, 0.08, 1.1, 0.52, 1);
}

function makeShrineBellRope(group) {
  const { rope, gold, paper, darkWood } = getVillageDecorAssets().materials;
  addDecorCylinder(group, rope, 0.028, 0.88, 0, 0.52, 0, 0, 0, 0, "cylinder12");
  addDecorCylinder(group, gold, 0.055, 0.14, 0, 0.1, 0, 0, 0, 0, "cylinder12");
  addDecorSphere(group, gold, 0.08, 0, 0.98, 0, 1, 1.2, 1);
  addDecorBox(group, darkWood, 0.06, 0.12, 0.06, 0, 0.04, 0);
  addDecorPlane(group, paper, 0.1, 0.22, -0.08, 0.28, -0.04, 0, 0, -0.14);
  addDecorPlane(group, paper, 0.1, 0.22, 0.08, 0.28, -0.04, 0, 0, 0.14);
}

function makeShrineDecor3D() {
  getVillageDecorAssets();
  makeShrineAtmosphereGround();

  makeShrineTorii(makeShrineDecorGroup("front-torii", 0, 3.92, 0.76, 0), false);
  makeShrineTorii(makeShrineDecorGroup("weathered-torii-a", 0, 2.76, 0.5, 0), true);
  makeShrineTorii(makeShrineDecorGroup("weathered-torii-b", 0, 1.16, 0.42, 0), true);

  for (const z of [2.84, 1.92, 1.04, 0.18]) {
    for (const side of [-1, 1]) {
      makeShrineStoneLantern(makeShrineDecorGroup("stone-lantern", side * 1.14, z, z > 1.4 ? 0.36 : 0.32, side * 0.08), z > 1.2);
    }
  }

  for (const side of [-1, 1]) {
    makeShrineKomainu(makeShrineDecorGroup("komainu", side * 0.94, 0.66, 0.46, side * -0.24), side);
    makeShrineOfferingTable(makeShrineDecorGroup("offering-table", side * 1.06, -0.12, 0.36, side * 0.08));
  }

  makeShrineShimenawa(makeShrineDecorGroup("front-shimenawa", 0, 0.68, 1.12, 0));
  makeShrineBellRope(makeShrineDecorGroup("bell-rope", 0, 0.9, 0.62, 0));
  makeShrineChozuya(makeShrineDecorGroup("chozuya", -1.8, 1.42, 0.54, 0.18));
  makeShrineEmaStand(makeShrineDecorGroup("ema-stand", 1.76, 1.28, 0.5, -0.14));
  makeShrineOmikuji(makeShrineDecorGroup("omikuji", 2.1, 1.98, 0.46, 0.16));
  makeShrineSacredTree(makeShrineDecorGroup("sacred-tree", -2.16, 0.02, 0.58, -0.1));
  makeShrineSidePine(makeShrineDecorGroup("side-pine", 2.24, -0.22, 0.62, 0.06));
  makeShrineStoneSteps(makeShrineDecorGroup("mossy-steps", 0, 1.16, 1.08, 0));
  for (const marker of [
    { x: -1.72, z: 3.34, s: 0.44, r: -0.22 },
    { x: 1.72, z: 3.34, s: 0.44, r: 0.22 },
    { x: -1.88, z: 2.02, s: 0.42, r: -0.18 },
    { x: 1.88, z: 2.02, s: 0.42, r: 0.18 },
    { x: -1.64, z: 0.7, s: 0.38, r: -0.14 },
    { x: 1.64, z: 0.7, s: 0.38, r: 0.14 },
  ]) {
    makeShrineBorderStone(makeShrineDecorGroup("border-stone", marker.x, marker.z, marker.s, marker.r));
  }
  for (const bush of [
    { x: -2.56, z: 2.6, s: 0.62, r: -0.18, v: 0 },
    { x: 2.52, z: 2.56, s: 0.6, r: 0.18, v: 1 },
    { x: -2.3, z: 1.22, s: 0.54, r: -0.08, v: 2 },
    { x: 2.28, z: 1.18, s: 0.54, r: 0.08, v: 3 },
    { x: -1.76, z: -0.56, s: 0.48, r: -0.16, v: 4 },
    { x: 1.86, z: -0.62, s: 0.5, r: 0.14, v: 5 },
  ]) {
    makeShrineBushCluster(makeShrineDecorGroup("bush-cluster", bush.x, bush.z, bush.s, bush.r), bush.v);
  }
  makeShrineFallenLeaves();
}

function makeShrineAtmosphereGround() {
  const { moss, stoneDark, stone, wornDirt, yardGrass, soil, grassSoft } = getVillageDecorAssets().materials;
  const grove = makeGroundDisc(3.05, 0x1f2f1f, 0.18);
  grove.position.set(SHRINE_SCENE.x, sceneHillHeight(SHRINE_SCENE.x, SHRINE_SCENE.z + 0.7) + 0.046, SHRINE_SCENE.z + 0.7);
  grove.scale.set(1.26, 1.84, 1);
  world3d.add(grove);

  const rearSanctum = makeGroundDisc(1.92, 0x253322, 0.13);
  rearSanctum.position.set(SHRINE_SCENE.x, sceneHillHeight(SHRINE_SCENE.x, SHRINE_SCENE.z - 0.14) + 0.05, SHRINE_SCENE.z - 0.14);
  rearSanctum.scale.set(1.34, 1.06, 1);
  world3d.add(rearSanctum);

  const forecourt = makeGroundDisc(1.38, 0x5e503b, 0.16);
  forecourt.position.set(SHRINE_SCENE.x, sceneHillHeight(SHRINE_SCENE.x, SHRINE_SCENE.z + 3.26) + 0.048, SHRINE_SCENE.z + 3.26);
  forecourt.scale.set(0.96, 1.34, 1);
  world3d.add(forecourt);

  for (const patch of [
    { x: 0, z: 4.18, w: 1.72, d: 0.82, mat: wornDirt, rot: 0.02, y: 0.056 },
    { x: 0, z: 3.38, w: 1.54, d: 0.74, mat: wornDirt, rot: -0.03, y: 0.058 },
    { x: 0, z: 2.56, w: 1.38, d: 0.48, mat: yardGrass, rot: 0.02, y: 0.054 },
    { x: -0.92, z: 1.96, w: 0.42, d: 2.38, mat: moss, rot: 0.05, y: 0.05 },
    { x: 0.92, z: 1.96, w: 0.42, d: 2.38, mat: moss, rot: -0.05, y: 0.05 },
    { x: -1.7, z: 0.86, w: 0.84, d: 1.82, mat: grassSoft, rot: 0.12, y: 0.048 },
    { x: 1.7, z: 0.84, w: 0.84, d: 1.82, mat: grassSoft, rot: -0.12, y: 0.048 },
    { x: 0, z: -0.16, w: 2.42, d: 1.72, mat: soil, rot: 0, y: 0.046 },
  ]) {
    makeShrineGroundPlane("path", patch.x, patch.z, patch.w, patch.d, patch.mat, patch.rot, patch.y);
  }

  for (const slab of [
    { x: 0, z: -0.18, w: 2.34, h: 0.048, d: 1.78, mat: stoneDark, rot: 0.02, y: 0.082 },
    { x: 0, z: 0.08, w: 2.12, h: 0.042, d: 1.52, mat: moss, rot: -0.01, y: 0.112 },
    { x: 0, z: 0.98, w: 1.46, h: 0.04, d: 0.76, mat: stoneDark, rot: 0, y: 0.106 },
    { x: 0, z: 2.5, w: 1.24, h: 0.03, d: 0.42, mat: stoneDark, rot: 0.03, y: 0.072 },
    { x: 0, z: 1.78, w: 1.18, h: 0.032, d: 0.4, mat: stone, rot: -0.025, y: 0.09 },
    { x: 0, z: 1.1, w: 1.08, h: 0.034, d: 0.36, mat: moss, rot: 0.02, y: 0.11 },
    { x: 0, z: 0.44, w: 0.98, h: 0.036, d: 0.34, mat: stoneDark, rot: -0.02, y: 0.13 },
  ]) {
    makeShrineGroundSlab("step", slab.x, slab.z, slab.w, slab.h, slab.d, slab.mat, slab.rot, slab.y);
  }
}

function makeShrineTorii(group, weathered = false) {
  const { vermilion, weatheredVermilion, darkWood, rope, paper, stone } = getVillageDecorAssets().materials;
  const red = weathered ? weatheredVermilion : vermilion;
  addDecorBox(group, darkWood, 1.86, 0.13, 0.22, 0, 1.54, 0, 0, 0, weathered ? -0.02 : 0.02);
  addDecorBox(group, red, 1.58, 0.12, 0.18, 0, 1.32, 0);
  addDecorBox(group, red, 1.18, 0.08, 0.14, 0, 1.08, 0);
  for (const side of [-1, 1]) {
    addDecorBox(group, stone, 0.24, 0.08, 0.24, side * 0.58, 0.04, 0);
    addDecorCylinder(group, red, 0.07, 1.12, side * 0.58, 0.6, 0, 0, 0, 0, "cylinder12");
    addDecorBox(group, darkWood, 0.22, 0.06, 0.2, side * 0.58, 1.14, 0);
  }
  addDecorCylinder(group, rope, 0.018, 0.98, 0, 0.96, -0.02, 0, 0, Math.PI / 2, "cylinder8");
  for (const x of [-0.24, 0, 0.24]) {
    addDecorPlane(group, paper, 0.08, 0.18, x, 0.83, -0.04, 0, 0, x * 0.5);
  }
}

function makeShrineStoneLantern(group, lit = true) {
  const { stone, stoneDark, paper, candle } = getVillageDecorAssets().materials;
  addDecorCylinder(group, stoneDark, 0.18, 0.08, 0, 0.04, 0, 0, 0, 0, "cylinder8");
  addDecorCylinder(group, stone, 0.11, 0.34, 0, 0.25, 0, 0, 0, 0, "cylinder8");
  addDecorBox(group, stone, 0.38, 0.08, 0.38, 0, 0.47, 0);
  addDecorBox(group, paper, 0.24, 0.2, 0.012, 0, 0.61, -0.13);
  addDecorBox(group, paper, 0.24, 0.2, 0.012, 0, 0.61, 0.13);
  addDecorBox(group, paper, 0.012, 0.2, 0.24, -0.13, 0.61, 0);
  addDecorBox(group, paper, 0.012, 0.2, 0.24, 0.13, 0.61, 0);
  addDecorBox(group, stoneDark, 0.44, 0.08, 0.44, 0, 0.77, 0);
  addDecorCylinder(group, stone, 0.045, 0.1, 0, 0.86, 0, 0, 0, 0, "cylinder8");
  if (lit) {
    addDecorSphere(group, candle, 0.09, 0, 0.62, 0, 1, 0.72, 1);
    const light = new THREE.PointLight(0xe1b968, 0.22, 2.4);
    light.position.set(0, 0.66, 0);
    group.add(light);
  }
}

function makeShrineKomainu(group, side = 1) {
  const { stone, stoneDark } = getVillageDecorAssets().materials;
  addDecorBox(group, stoneDark, 0.44, 0.12, 0.34, 0, 0.06, 0);
  addDecorSphere(group, stone, 0.22, 0, 0.28, 0, 1.15, 0.78, 1.05);
  addDecorSphere(group, stone, 0.16, 0, 0.46, -0.2, 0.92, 1, 0.9);
  addDecorSphere(group, stoneDark, 0.045, -0.06, 0.5, -0.33, 1, 0.8, 1);
  addDecorSphere(group, stoneDark, 0.045, 0.06, 0.5, -0.33, 1, 0.8, 1);
  addDecorBox(group, stoneDark, 0.06, 0.18, 0.05, -0.08, 0.62, -0.22, 0, 0, -0.35 * side);
  addDecorBox(group, stoneDark, 0.06, 0.18, 0.05, 0.08, 0.62, -0.22, 0, 0, 0.35 * side);
  addDecorCylinder(group, stoneDark, 0.035, 0.3, side * 0.2, 0.38, 0.22, 0.7, 0, side * 0.55, "cylinder8");
}

function makeShrineShimenawa(group) {
  const { rope, paper } = getVillageDecorAssets().materials;
  addDecorCylinder(group, rope, 0.026, 1.08, 0, 0.96, 0, Math.PI / 2, 0, Math.PI / 2, "cylinder12");
  for (const x of [-0.36, -0.12, 0.12, 0.36]) {
    addDecorPlane(group, paper, 0.1, 0.22, x, 0.78, -0.02, 0, 0, x * 0.4);
  }
}

function makeShrineChozuya(group) {
  const { stone, stoneDark, bamboo, warmWood } = getVillageDecorAssets().materials;
  addDecorBox(group, stoneDark, 0.76, 0.12, 0.5, 0, 0.06, 0);
  addDecorBox(group, stone, 0.62, 0.18, 0.38, 0, 0.2, 0);
  addDecorBox(group, stoneDark, 0.5, 0.06, 0.26, 0, 0.33, 0);
  addDecorCylinder(group, bamboo, 0.025, 0.88, 0, 0.62, -0.2, Math.PI / 2, 0, Math.PI / 2, "cylinder8");
  for (const x of [-0.16, 0.1]) {
    addDecorCylinder(group, warmWood, 0.012, 0.34, x, 0.42, 0.14, Math.PI / 2, 0, 0.7, "cylinder8");
    addDecorBox(group, warmWood, 0.18, 0.025, 0.08, x + 0.08, 0.36, 0.22, 0, 0, 0.7);
  }
}

function makeShrineEmaStand(group) {
  const { warmWood, darkWood, rope } = getVillageDecorAssets().materials;
  addDecorCylinder(group, darkWood, 0.022, 0.74, -0.38, 0.37, 0, 0, 0, 0, "cylinder8");
  addDecorCylinder(group, darkWood, 0.022, 0.74, 0.38, 0.37, 0, 0, 0, 0, "cylinder8");
  addDecorCylinder(group, darkWood, 0.018, 0.82, 0, 0.72, 0, Math.PI / 2, 0, Math.PI / 2, "cylinder8");
  for (let i = 0; i < 7; i += 1) {
    const x = -0.28 + i * 0.095;
    const y = 0.45 + (i % 2) * 0.12;
    addDecorBox(group, warmWood, 0.1, 0.075, 0.018, x, y, -0.02, 0, 0, (i - 3) * 0.04);
    addDecorCylinder(group, rope, 0.004, 0.09, x, y + 0.055, -0.02, 0, 0, 0, "cylinder8");
  }
}

function makeShrineOmikuji(group) {
  const { darkWood, rope, paper } = getVillageDecorAssets().materials;
  addDecorCylinder(group, darkWood, 0.02, 0.72, -0.42, 0.36, 0, 0, 0, 0, "cylinder8");
  addDecorCylinder(group, darkWood, 0.02, 0.72, 0.42, 0.36, 0, 0, 0, 0, "cylinder8");
  addDecorCylinder(group, rope, 0.01, 0.9, 0, 0.56, 0, Math.PI / 2, 0, Math.PI / 2, "cylinder8");
  for (let i = 0; i < 10; i += 1) {
    addDecorPlane(group, paper, 0.045, 0.22, -0.34 + i * 0.075, 0.43 + (i % 3) * 0.035, -0.012, 0, 0, (i % 2 ? 0.15 : -0.12));
  }
}

function makeShrineSacredTree(group) {
  const { darkWood, leaf, rope, paper, moss } = getVillageDecorAssets().materials;
  addDecorCylinder(group, darkWood, 0.16, 1.08, 0, 0.54, 0, 0, 0, 0, "cylinder12");
  addDecorSphere(group, leaf, 0.58, 0, 1.26, 0, 1.15, 0.78, 1.05);
  addDecorSphere(group, moss, 0.34, -0.28, 1.04, 0.16, 1, 0.55, 1);
  addDecorCylinder(group, rope, 0.022, 0.46, 0, 0.62, -0.02, Math.PI / 2, 0, Math.PI / 2, "cylinder8");
  for (const x of [-0.13, 0.05, 0.2]) addDecorPlane(group, paper, 0.07, 0.17, x, 0.48, -0.05, 0, 0, x);
}

function makeShrineOfferingTable(group) {
  const { warmWood, darkWood, candle, paper } = getVillageDecorAssets().materials;
  addDecorBox(group, warmWood, 0.5, 0.08, 0.28, 0, 0.28, 0);
  for (const x of [-0.18, 0.18]) {
    addDecorCylinder(group, darkWood, 0.018, 0.28, x, 0.14, 0.1, 0, 0, 0, "cylinder8");
    addDecorCylinder(group, darkWood, 0.018, 0.28, x, 0.14, -0.1, 0, 0, 0, "cylinder8");
  }
  for (const x of [-0.12, 0.12]) {
    addDecorCylinder(group, paper, 0.035, 0.11, x, 0.37, -0.04, 0, 0, 0, "cylinder12");
    addDecorSphere(group, candle, 0.026, x, 0.44, -0.04, 0.8, 1.2, 0.8);
  }
}

function makeShrineStoneSteps(group) {
  const { stone, moss } = getVillageDecorAssets().materials;
  for (let i = 0; i < 5; i += 1) {
    addDecorBox(group, i % 2 ? stone : moss, 1.22 - i * 0.08, 0.045, 0.26, 0, 0.04 + i * 0.045, 0.62 - i * 0.26);
  }
}

function makeShrineFallenLeaves() {
  const { fallenLeaf } = getVillageDecorAssets().materials;
  const rng = makeSeededRng(0x5152494e);
  for (let i = 0; i < 58; i += 1) {
    const ring = i % 3;
    const x = SHRINE_SCENE.x + (rng() - 0.5) * (ring === 0 ? 5.2 : 4.1);
    const z = SHRINE_SCENE.z + 0.18 + (rng() - 0.5) * (ring === 2 ? 5.8 : 4.8);
    const localX = x - SHRINE_SCENE.x;
    const localZ = z - SHRINE_SCENE.z;
    if (Math.abs(localX) < 0.8 && localZ > 0.1 && localZ < 4.25) continue;
    if (distanceToRoadScene(x, z) < 0.26) continue;
    const leaf = new THREE.Mesh(getVillageDecorAssets().geometries.plane, fallenLeaf);
    leaf.scale.set(0.08 + rng() * 0.06, 0.035 + rng() * 0.025, 1);
    leaf.position.set(x, sceneHillHeight(x, z) + 0.072, z);
    leaf.rotation.set(-Math.PI / 2, 0, rng() * TWO_PI);
    leaf.receiveShadow = true;
    world3d.add(leaf);
  }
}

function arenaSceneRadius() {
  return BATTLE_ARENA_RADIUS / WORLD_SCALE;
}

function arenaLocalPoint(angle, radius, offset = 0) {
  const r = radius + offset;
  return {
    x: BATTLE_SCENE.x + Math.cos(angle) * r,
    z: BATTLE_SCENE.z + Math.sin(angle) * r,
  };
}

function makeArenaDecorGroup(kind, sceneX, sceneZ, scale = 1, rotation = 0) {
  const group = new THREE.Group();
  group.name = `ritual-arena-${kind}`;
  group.position.set(sceneX, sceneHillHeight(sceneX, sceneZ) + 0.016, sceneZ);
  group.rotation.y = rotation;
  group.scale.setScalar(scale);
  world3d.add(group);
  return group;
}

function makeRitualArena3D() {
  getVillageDecorAssets();
  const radius = arenaSceneRadius();
  makeRitualArenaGround(radius);

  const boundaryCount = 36;
  for (let i = 0; i < boundaryCount; i += 1) {
    const angle = (i / boundaryCount) * TWO_PI;
    const point = arenaLocalPoint(angle, radius, 0.06 + (i % 3) * 0.04);
    makeArenaBoundaryStone(makeArenaDecorGroup("boundary-stone", point.x, point.z, 0.42 + (i % 4) * 0.035, -angle + Math.PI / 2 + (i % 2 ? 0.08 : -0.08)), i);
  }

  const talismanAngles = [0.12, 0.42, 0.72, 1.18, 1.54, 1.9, 2.36, 2.82, 3.28, 3.68, 4.18, 4.66, 5.1, 5.58];
  talismanAngles.forEach((angle, index) => {
    const point = arenaLocalPoint(angle, radius, index % 2 ? -0.54 : -0.26);
    makeArenaTalismanStake(makeArenaDecorGroup("talisman-stake", point.x, point.z, 0.42 + (index % 3) * 0.035, -angle + Math.PI / 2), index);
  });

  const lanternAngles = [0.72, 1.32, 2.42, 3.12, 4.18, 5.3];
  lanternAngles.forEach((angle, index) => {
    const point = arenaLocalPoint(angle, radius, -1.14 + (index % 2) * 0.22);
    makeBrokenStoneLantern(makeArenaDecorGroup("broken-lantern", point.x, point.z, 0.58 + (index % 2) * 0.06, -angle + 0.4), index);
  });

  [
    { angle: 0.2, offset: -2.2, rotation: -0.36 },
    { angle: 2.05, offset: -1.9, rotation: 0.72 },
    { angle: 3.86, offset: -2.4, rotation: -0.9 },
    { angle: 5.34, offset: -2.0, rotation: 0.3 },
  ].forEach((item, index) => {
    const point = arenaLocalPoint(item.angle, radius, item.offset);
    makeCrackedToriiFragment(makeArenaDecorGroup("torii-fragment", point.x, point.z, 0.62 - index * 0.035, item.rotation));
  });

  for (let i = 0; i < 8; i += 1) {
    const angle = i / 8 * TWO_PI + 0.22;
    const point = arenaLocalPoint(angle, radius, -3.2 - (i % 3) * 0.8);
    makeBlackenedOfferingStone(makeArenaDecorGroup("offering-stone", point.x, point.z, 0.46 + (i % 2) * 0.04, angle));
  }

  for (let i = 0; i < 11; i += 1) {
    const angle = i / 11 * TWO_PI + 0.18;
    const point = arenaLocalPoint(angle, radius, -4.2 - (i % 4) * 0.9);
    makeOldPrayerPlaque(makeArenaDecorGroup("corrupt-plaque", point.x, point.z, 0.36 + (i % 3) * 0.03, -angle + Math.PI / 2), i);
  }

  [
    { angle: 0.98, offset: -5.1, scale: 0.42, rotation: 0.12 },
    { angle: 2.16, offset: -4.7, scale: 0.46, rotation: -0.18 },
    { angle: 3.52, offset: -5.4, scale: 0.44, rotation: 0.22 },
    { angle: 4.86, offset: -4.95, scale: 0.48, rotation: -0.14 },
    { angle: 5.82, offset: -5.3, scale: 0.4, rotation: 0.18 },
  ].forEach((item, index) => {
    const point = arenaLocalPoint(item.angle, radius, item.offset);
    makeArenaDamagedRitualMarker(
      makeArenaDecorGroup("ritual-marker", point.x, point.z, item.scale, -item.angle + Math.PI / 2 + item.rotation),
      index,
    );
  });

  makeDamagedShimenawa(arenaLocalPoint(1.54, radius, -1.4), 1.54);
  makeDamagedShimenawa(arenaLocalPoint(4.74, radius, -1.2), 4.74);
  makeArenaGlowingCracks(radius);
  makeArenaSealScars(radius);
  makeArenaScatteredCharms(radius);
  makeArenaFloatingShide(radius);
  makeArenaGroundMist(radius);
}

function makeRitualArenaGround(radius) {
  const centerY = sceneHillHeight(BATTLE_SCENE.x, BATTLE_SCENE.z);
  const curseWash = makeGroundDisc(radius, 0x2a1010, 0.12);
  curseWash.position.set(BATTLE_SCENE.x, centerY + 0.047, BATTLE_SCENE.z);
  world3d.add(curseWash);

  const outerRing = makeGroundRing(radius, 0xd13a32, 0.82);
  outerRing.position.set(BATTLE_SCENE.x, centerY + 0.071, BATTLE_SCENE.z);
  world3d.add(outerRing);

  const innerRing = makeGroundRing(radius - 0.38, 0xeee6d2, 0.18);
  innerRing.position.set(BATTLE_SCENE.x, centerY + 0.074, BATTLE_SCENE.z);
  world3d.add(innerRing);

  const brokenSeal = makeGroundRing(radius * 0.42, 0x9f2f2f, 0.28);
  brokenSeal.position.set(BATTLE_SCENE.x, centerY + 0.076, BATTLE_SCENE.z);
  world3d.add(brokenSeal);
}

function makeArenaBoundaryStone(group, index) {
  const { stoneDark, blackenedStone, moss } = getVillageDecorAssets().materials;
  const baseTilt = (index % 5 - 2) * 0.02;
  addDecorBox(group, blackenedStone, 0.4, 0.05, 0.3, 0, 0.026, 0, baseTilt, 0, (index % 3 - 1) * 0.03);
  addDecorBox(group, index % 2 ? stoneDark : blackenedStone, 0.32, 0.18 + (index % 3) * 0.04, 0.24, 0, 0.11, 0, 0.02 * (index % 3), 0, (index % 5 - 2) * 0.02);
  if (index % 6 === 0) addDecorBox(group, stoneDark, 0.14, 0.018, 0.04, 0.06, 0.07, 0.02, 0, 0, 0.28);
  if (index % 4 === 0) addDecorBox(group, moss, 0.2, 0.018, 0.18, 0.02, 0.2, -0.02);
}

function makeArenaTalismanStake(group, index) {
  const { darkWood, paper, talismanRed, blackenedStone } = getVillageDecorAssets().materials;
  const broken = index % 5 === 0;
  const leanX = broken ? -0.26 : (index % 3 - 1) * 0.09;
  const leanZ = index % 2 ? 0.05 : -0.04;
  const paperYaw = (index % 3 - 1) * 0.12;
  addDecorBox(group, blackenedStone, 0.24, 0.06, 0.2, 0, 0.03, 0, 0.06, 0, (index % 4 - 1.5) * 0.06);
  addDecorCylinder(group, darkWood, 0.018, broken ? 0.46 : 0.72, 0, broken ? 0.24 : 0.36, 0, leanX, 0, leanZ, "cylinder8");
  addDecorPlane(group, paper, broken ? 0.13 : 0.16, broken ? 0.24 : 0.34, 0, broken ? 0.45 : 0.61, -0.025, broken ? -0.16 : 0, 0, paperYaw);
  addDecorBox(group, talismanRed, broken ? 0.07 : 0.09, 0.018, 0.012, 0, broken ? 0.48 : 0.66, -0.032, 0, 0, (index % 2 ? 0.08 : -0.08));
  if (!broken) addDecorBox(group, talismanRed, 0.08, 0.014, 0.012, 0, 0.55, -0.033, 0, 0, (index % 2 ? -0.1 : 0.1));
  if (broken || index % 3 === 1) addDecorPlane(group, paper, 0.1, 0.15, 0.1, 0.045, 0.08, -Math.PI / 2, 0, index % 2 ? 0.34 : -0.24);
}

function makeBrokenStoneLantern(group, index) {
  const { stone, stoneDark, blackenedStone, curseGlow } = getVillageDecorAssets().materials;
  const collapseYaw = index % 2 ? 0.4 : -0.34;
  addDecorBox(group, blackenedStone, 0.38, 0.05, 0.34, 0, 0.026, 0, 0.06, 0, collapseYaw * 0.12);
  addDecorCylinder(group, stoneDark, 0.16, 0.08, 0, 0.06, 0, 0, 0, 0, "cylinder8");
  addDecorCylinder(group, stone, 0.09, index % 3 === 0 ? 0.18 : 0.28, -0.02, index % 3 === 0 ? 0.16 : 0.22, 0, index % 3 === 0 ? 0.24 : 0, 0, 0.2, "cylinder8");
  addDecorBox(group, blackenedStone, 0.32, 0.08, 0.32, 0, 0.39, -0.02, 0.1, 0.04, index % 2 ? 0.32 : -0.26);
  addDecorBox(group, stoneDark, 0.36, 0.06, 0.32, 0.15, 0.08, 0.24, 0.12, 0.04, 0.5 + collapseYaw * 0.35);
  if (index % 3 !== 1) addDecorBox(group, stoneDark, 0.18, 0.035, 0.14, -0.12, 0.045, -0.18, 0.04, 0, -0.54);
  if (index % 2 === 0) addDecorSphere(group, curseGlow, 0.045, 0, 0.43, -0.02, 1.2, 0.6, 1.2);
}

function makeCrackedToriiFragment(group) {
  const { weatheredVermilion, blackenedStone, darkWood } = getVillageDecorAssets().materials;
  addDecorBox(group, blackenedStone, 0.46, 0.08, 0.32, -0.28, 0.04, 0.08, 0, 0, 0.18);
  addDecorCylinder(group, weatheredVermilion, 0.055, 0.82, -0.16, 0.42, 0, 0.2, 0, 0.24, "cylinder12");
  addDecorBox(group, weatheredVermilion, 0.88, 0.12, 0.18, 0.2, 0.72, 0, 0, 0, -0.18);
  addDecorBox(group, darkWood, 0.44, 0.08, 0.16, 0.54, 0.84, 0, 0, 0, 0.32);
}

function makeBlackenedOfferingStone(group) {
  const { blackenedStone, curseRed, paper } = getVillageDecorAssets().materials;
  addDecorBox(group, blackenedStone, 0.48, 0.12, 0.36, 0, 0.06, 0, 0, 0, -0.04);
  addDecorBox(group, curseRed, 0.32, 0.012, 0.04, 0, 0.13, -0.02, 0, 0, 0.1);
  addDecorPlane(group, paper, 0.16, 0.09, -0.08, 0.145, 0.06, -Math.PI / 2, 0, 0.2);
}

function makeOldPrayerPlaque(group, index) {
  const { warmWood, darkWood, talismanRed } = getVillageDecorAssets().materials;
  addDecorCylinder(group, darkWood, 0.014, 0.44, 0, 0.22, 0, 0, 0, 0, "cylinder8");
  addDecorBox(group, warmWood, 0.24, 0.16, 0.025, 0, 0.43, -0.02, 0, 0, (index % 5 - 2) * 0.06);
  addDecorBox(group, talismanRed, 0.16, 0.014, 0.012, 0, 0.45, -0.04, 0, 0, index % 2 ? 0.12 : -0.12);
  addDecorBox(group, darkWood, 0.09, 0.01, 0.012, 0, 0.38, -0.041, 0, 0, -0.08);
}

function makeArenaDamagedRitualMarker(group, index) {
  const { blackenedStone, stoneDark, paper, talismanRed, moss } = getVillageDecorAssets().materials;
  addDecorBox(group, blackenedStone, 0.28, 0.07, 0.24, 0, 0.035, 0, 0.05, 0, (index % 2 ? 0.12 : -0.12));
  addDecorCylinder(group, stoneDark, 0.04, 0.42, 0, 0.24, 0, (index % 3 - 1) * 0.08, 0, 0.04, "cylinder8");
  addDecorPlane(group, paper, 0.16, 0.24, 0, 0.44, -0.03, -0.08, 0, index % 2 ? 0.24 : -0.18);
  addDecorBox(group, talismanRed, 0.08, 0.012, 0.01, 0, 0.45, -0.038, 0, 0, index % 2 ? 0.16 : -0.12);
  if (index % 2 === 0) addDecorBox(group, moss, 0.12, 0.016, 0.08, 0.04, 0.085, -0.03);
}

function makeDamagedShimenawa(point, angle) {
  const { rope, paper, blackenedStone } = getVillageDecorAssets().materials;
  const group = makeArenaDecorGroup("damaged-shimenawa", point.x, point.z, 0.78, -angle + Math.PI / 2);
  for (const x of [-0.58, 0.58]) {
    addDecorCylinder(group, blackenedStone, 0.026, 0.62, x, 0.31, 0, 0, 0, 0, "cylinder8");
  }
  addDecorCylinder(group, rope, 0.018, 1.1, 0, 0.52, 0, Math.PI / 2, 0, Math.PI / 2, "cylinder8");
  for (const x of [-0.26, 0.04, 0.34]) {
    addDecorPlane(group, paper, 0.07, 0.16, x, 0.37 - Math.abs(x) * 0.08, -0.02, 0, 0, x * 0.8);
  }
}

function makeArenaGlowingCracks(radius) {
  const { curseGlow, blackenedStone } = getVillageDecorAssets().materials;
  const rng = makeSeededRng(0x43555253);
  for (let i = 0; i < 18; i += 1) {
    const angle = rng() * TWO_PI;
    const distance = Math.sqrt(rng()) * (radius - 1.8);
    const x = BATTLE_SCENE.x + Math.cos(angle) * distance;
    const z = BATTLE_SCENE.z + Math.sin(angle) * distance;
    const length = 0.42 + rng() * 1.18;
    const width = 0.018 + rng() * 0.025;
    const crack = new THREE.Mesh(getVillageDecorAssets().geometries.box, i % 3 ? curseGlow : blackenedStone);
    crack.scale.set(length, 0.012, width);
    crack.position.set(x, sceneHillHeight(x, z) + 0.08, z);
    crack.rotation.y = angle + (rng() - 0.5) * 1.4;
    crack.receiveShadow = false;
    world3d.add(crack);
  }
}

function makeArenaSealScars(radius) {
  const scarRed = new THREE.MeshBasicMaterial({
    color: 0xd13a32,
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
  });
  const fadedSeal = new THREE.MeshBasicMaterial({
    color: 0xefe7d4,
    transparent: true,
    opacity: 0.12,
    depthWrite: false,
  });
  const rng = makeSeededRng(0x53434152);
  for (let i = 0; i < 12; i += 1) {
    const angle = rng() * TWO_PI;
    const distance = radius * (0.08 + rng() * 0.22);
    const x = BATTLE_SCENE.x + Math.cos(angle) * distance;
    const z = BATTLE_SCENE.z + Math.sin(angle) * distance;
    const mark = new THREE.Mesh(getVillageDecorAssets().geometries.box, scarRed);
    mark.scale.set(0.26 + rng() * 0.74, 0.006, 0.012 + rng() * 0.018);
    mark.position.set(x, sceneHillHeight(x, z) + 0.079, z);
    mark.rotation.y = angle + (rng() - 0.5) * 1.1;
    mark.receiveShadow = false;
    world3d.add(mark);
  }
  [
    { angle: 0.4, distance: radius * 0.27, length: 0.72 },
    { angle: 1.98, distance: radius * 0.31, length: 0.6 },
    { angle: 3.48, distance: radius * 0.24, length: 0.56 },
    { angle: 5.08, distance: radius * 0.29, length: 0.66 },
  ].forEach((segment, index) => {
    const x = BATTLE_SCENE.x + Math.cos(segment.angle) * segment.distance;
    const z = BATTLE_SCENE.z + Math.sin(segment.angle) * segment.distance;
    const arc = new THREE.Mesh(getVillageDecorAssets().geometries.box, fadedSeal);
    arc.scale.set(segment.length, 0.006, 0.018);
    arc.position.set(x, sceneHillHeight(x, z) + 0.078, z);
    arc.rotation.y = segment.angle + Math.PI / 2 + (index % 2 ? 0.12 : -0.1);
    arc.receiveShadow = false;
    world3d.add(arc);
  });
}

function makeArenaScatteredCharms(radius) {
  const { paper, talismanRed } = getVillageDecorAssets().materials;
  const rng = makeSeededRng(0x43484152);
  for (let i = 0; i < 10; i += 1) {
    const angle = rng() * TWO_PI;
    const distance = radius * (i < 4 ? 0.18 + rng() * 0.18 : 0.34 + rng() * 0.36);
    const x = BATTLE_SCENE.x + Math.cos(angle) * distance;
    const z = BATTLE_SCENE.z + Math.sin(angle) * distance;
    const group = makeArenaDecorGroup("scattered-charm", x, z, 0.24 + rng() * 0.12, rng() * TWO_PI);
    group.position.y = sceneHillHeight(x, z) + 0.07;
    const torn = i % 3 === 0;
    addDecorPlane(group, paper, torn ? 0.09 : 0.12, torn ? 0.14 : 0.2, 0, 0, 0, -Math.PI / 2, 0, (rng() - 0.5) * 0.8);
    addDecorBox(group, talismanRed, torn ? 0.05 : 0.07, 0.006, 0.01, 0, 0.004, torn ? -0.01 : -0.02, 0, 0, (rng() - 0.5) * 0.6);
    if (torn) addDecorPlane(group, paper, 0.045, 0.08, 0.05, 0.002, 0.03, -Math.PI / 2, 0, 0.42);
  }
}

function makeArenaFloatingShide(radius) {
  const { paper, talismanRed } = getVillageDecorAssets().materials;
  const rng = makeSeededRng(0x53484944);
  for (let i = 0; i < 22; i += 1) {
    const angle = rng() * TWO_PI;
    const distance = radius * (0.25 + rng() * 0.66);
    const x = BATTLE_SCENE.x + Math.cos(angle) * distance;
    const z = BATTLE_SCENE.z + Math.sin(angle) * distance;
    const group = makeArenaDecorGroup("floating-shide", x, z, 0.34 + rng() * 0.12, rng() * TWO_PI);
    group.position.y += 0.46 + rng() * 0.36;
    addDecorPlane(group, i % 4 === 0 ? talismanRed : paper, 0.12, 0.3, 0, 0, 0, 0, rng() * Math.PI, (rng() - 0.5) * 0.5);
    addDecorPlane(group, paper, 0.09, 0.13, -0.03, -0.14, 0.01, 0, rng() * Math.PI, -0.32);
  }
}

function makeArenaGroundMist(radius) {
  const mistMat = new THREE.MeshBasicMaterial({
    color: 0xded8c2,
    transparent: true,
    opacity: 0.075,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const rng = makeSeededRng(0x4d495354);
  for (let i = 0; i < 16; i += 1) {
    const angle = rng() * TWO_PI;
    const distance = radius * (0.18 + rng() * 0.72);
    const x = BATTLE_SCENE.x + Math.cos(angle) * distance;
    const z = BATTLE_SCENE.z + Math.sin(angle) * distance;
    const mist = new THREE.Mesh(new THREE.CircleGeometry(0.52 + rng() * 0.62, 18), mistMat);
    mist.rotation.x = -Math.PI / 2;
    mist.rotation.z = rng() * TWO_PI;
    mist.scale.set(1.8 + rng() * 1.2, 0.46 + rng() * 0.34, 1);
    mist.position.set(x, sceneHillHeight(x, z) + 0.09, z);
    mist.renderOrder = -1;
    world3d.add(mist);
  }
}

function buildOverworldLandmarkLayout() {
  return [
    { kind: "jizo", sceneX: VILLAGE_SCENE.x - 4.95, sceneZ: VILLAGE_SCENE.z + 5.62, scale: 0.5, rotation: 0.18, seed: 0x4a5a01 },
    { kind: "stoneMarker", sceneX: VILLAGE_SCENE.x - 5.92, sceneZ: VILLAGE_SCENE.z - 7.9, scale: 0.48, rotation: -0.32, seed: 0x4a5a02 },
    { kind: "bambooGrove", sceneX: VILLAGE_SCENE.x - 1.45, sceneZ: VILLAGE_SCENE.z - 7.15, scale: 0.62, rotation: 0.58, seed: 0x4a5a03 },
    { kind: "abandonedShrine", sceneX: -24.1, sceneZ: -10.4, scale: 0.62, rotation: 0.72, seed: 0x4a5a04 },
    { kind: "graveyard", sceneX: VILLAGE_SCENE.x - 10.75, sceneZ: VILLAGE_SCENE.z - 4.9, scale: 0.58, rotation: -0.18, seed: 0x4a5a05 },
    { kind: "brokenCart", sceneX: VILLAGE_SCENE.x + 4.15, sceneZ: VILLAGE_SCENE.z - 6.05, scale: 0.62, rotation: -0.56, seed: 0x4a5a06 },
    { kind: "farmerStorage", sceneX: VILLAGE_SCENE.x + 5.75, sceneZ: VILLAGE_SCENE.z + 5.35, scale: 0.6, rotation: 1.18, seed: 0x4a5a07 },
    { kind: "oldWell", sceneX: VILLAGE_SCENE.x + 9.4, sceneZ: VILLAGE_SCENE.z + 1.85, scale: 0.55, rotation: -0.08, seed: 0x4a5a08 },
    { kind: "riversideLantern", sceneX: -2.6, sceneZ: 24.4, scale: 0.68, rotation: -0.34, seed: 0x4a5a09 },
    { kind: "corruptedPrayer", sceneX: BATTLE_SCENE.x - arenaSceneRadius() - 0.85, sceneZ: BATTLE_SCENE.z + 0.42, scale: 0.58, rotation: 0.28, seed: 0x4a5a0a },
    { kind: "jizo", sceneX: -0.8, sceneZ: 14.8, scale: 0.46, rotation: -0.64, seed: 0x4a5a0b },
    { kind: "abandonedShrine", sceneX: 19.2, sceneZ: -18.2, scale: 0.54, rotation: -0.72, seed: 0x4a5a0c },
    { kind: "stoneMarker", sceneX: 3.0, sceneZ: 11.9, scale: 0.48, rotation: 0.44, seed: 0x4a5a0d },
    { kind: "bambooGrove", sceneX: -23.8, sceneZ: 13.6, scale: 0.58, rotation: -0.18, seed: 0x4a5a0e },
  ];
}

function makeOverworldLandmarks3D() {
  getVillageDecorAssets();
  for (const landmark of OVERWORLD_LANDMARKS) makeOverworldLandmark3D(landmark);
}

function makeOverworldLandmark3D(landmark) {
  const rng = makeSeededRng(landmark.seed || 0x4a5a);
  const group = new THREE.Group();
  const sceneX = landmark.sceneX + (rng() - 0.5) * 0.16;
  const sceneZ = landmark.sceneZ + (rng() - 0.5) * 0.16;
  group.name = `landmark-${landmark.kind}`;
  group.position.set(sceneX, sceneHillHeight(sceneX, sceneZ) + 0.014, sceneZ);
  group.rotation.y = (landmark.rotation || 0) + (rng() - 0.5) * 0.16;
  group.scale.setScalar((landmark.scale || 1) * (0.94 + rng() * 0.12));

  makeLandmarkGroundDetails(group, rng, landmark.kind);
  if (landmark.kind === "jizo") makeLandmarkJizo(group, rng);
  if (landmark.kind === "abandonedShrine") makeLandmarkAbandonedShrine(group, rng);
  if (landmark.kind === "bambooGrove") makeLandmarkBambooGrove(group, rng);
  if (landmark.kind === "oldWell") makeLandmarkOldWell(group, rng);
  if (landmark.kind === "stoneMarker") makeLandmarkStoneMarker(group, rng);
  if (landmark.kind === "graveyard") makeLandmarkGraveyard(group, rng);
  if (landmark.kind === "brokenCart") makeLandmarkBrokenCart(group, rng);
  if (landmark.kind === "riversideLantern") makeLandmarkRiversideLantern(group, rng);
  if (landmark.kind === "farmerStorage") makeLandmarkFarmerStorage(group, rng);
  if (landmark.kind === "corruptedPrayer") makeLandmarkCorruptedPrayer(group, rng);

  if (group.children.length) world3d.add(group);
}

function makeLandmarkPart(parent, x, z, scale = 1, rotation = 0) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.rotation.y = rotation;
  group.scale.setScalar(scale);
  parent.add(group);
  return group;
}

function makeLandmarkGroundDetails(group, rng, kind) {
  const { fallenLeaf, grassSoft, moss, stone, stoneDark, firefly } = getVillageDecorAssets().materials;
  const groundCount = kind === "bambooGrove" || kind === "abandonedShrine" ? 18 : 10;
  for (let i = 0; i < groundCount; i += 1) {
    const angle = rng() * TWO_PI;
    const distance = Math.sqrt(rng()) * (0.78 + rng() * 0.8);
    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;
    if (rng() < 0.42) {
      addDecorPlane(group, rng() < 0.5 ? grassSoft : moss, 0.16 + rng() * 0.14, 0.08 + rng() * 0.08, x, 0.028, z, -Math.PI / 2, 0, rng() * TWO_PI);
    } else if (rng() < 0.72) {
      addDecorPlane(group, fallenLeaf, 0.09 + rng() * 0.07, 0.035 + rng() * 0.035, x, 0.032, z, -Math.PI / 2, 0, rng() * TWO_PI);
    } else {
      addDecorSphere(group, rng() < 0.55 ? stone : stoneDark, 0.045 + rng() * 0.04, x, 0.045, z, 1.25, 0.55, 1);
    }
  }
  if (kind === "abandonedShrine" || kind === "bambooGrove") {
    for (let i = 0; i < 8; i += 1) {
      const x = (rng() - 0.5) * 2.2;
      const z = (rng() - 0.5) * 2.0;
      addDecorSphere(group, firefly, 0.018 + rng() * 0.01, x, 0.52 + rng() * 0.56, z, 1, 1, 1);
    }
  }
}

function makeLandmarkFlowers(group, rng, radius = 0.42) {
  const { leaf, flowerWhite, flowerPink } = getVillageDecorAssets().materials;
  for (let i = 0; i < 8; i += 1) {
    const angle = rng() * TWO_PI;
    const distance = radius * (0.35 + rng() * 0.65);
    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;
    addDecorSphere(group, leaf, 0.034, x, 0.055, z, 1.4, 0.42, 1);
    addDecorSphere(group, i % 2 ? flowerPink : flowerWhite, 0.022, x + (rng() - 0.5) * 0.04, 0.09, z + (rng() - 0.5) * 0.04, 1, 0.7, 1);
  }
}

function makeLandmarkJizo(group, rng) {
  const { stone, stoneDark, fadedRed, moss } = getVillageDecorAssets().materials;
  addDecorBox(group, stoneDark, 0.42, 0.12, 0.34, 0, 0.06, 0);
  addDecorCylinder(group, stone, 0.16, 0.42, 0, 0.32, 0, 0, 0, 0, "cylinder12");
  addDecorSphere(group, stone, 0.17, 0, 0.62, 0, 0.88, 1.05, 0.9);
  addDecorPlane(group, fadedRed, 0.22, 0.18, 0, 0.43, -0.16, 0, 0, 0);
  addDecorSphere(group, stoneDark, 0.018, -0.055, 0.65, -0.13, 1, 0.7, 1);
  addDecorSphere(group, stoneDark, 0.018, 0.055, 0.65, -0.13, 1, 0.7, 1);
  addDecorPlane(group, moss, 0.32, 0.18, 0.05, 0.13, 0.13, -Math.PI / 2, 0, rng() * TWO_PI);
  makeLandmarkFlowers(group, rng, 0.48);
}

function makeLandmarkAbandonedShrine(group, rng) {
  const { warmWood, darkWood, weatheredVermilion, roofEdge, plaster, moss } = getVillageDecorAssets().materials;
  addDecorBox(group, moss, 1.25, 0.035, 0.95, 0, 0.018, 0.04);
  addDecorBox(group, darkWood, 0.78, 0.12, 0.58, 0, 0.12, 0);
  addDecorBox(group, plaster, 0.58, 0.42, 0.42, 0, 0.38, 0);
  addDecorBox(group, warmWood, 0.72, 0.055, 0.5, 0, 0.62, 0);
  addDecorBox(group, roofEdge, 1.05, 0.16, 0.72, 0, 0.78, 0, 0, 0, rng() < 0.5 ? 0.04 : -0.04);
  for (const x of [-0.38, 0.38]) {
    addDecorCylinder(group, weatheredVermilion, 0.036, 0.72, x, 0.36, -0.52, 0, 0, 0, "cylinder8");
  }
  addDecorBox(group, weatheredVermilion, 0.92, 0.08, 0.1, 0, 0.7, -0.52);
  const lantern = makeLandmarkPart(group, 0.74, -0.18, 0.55, -0.12);
  makeShrineStoneLantern(lantern, true);
}

function makeLandmarkBambooGrove(group, rng) {
  const { bamboo, bambooDark, stone, moss } = getVillageDecorAssets().materials;
  for (let i = 0; i < 11; i += 1) {
    const angle = rng() * TWO_PI;
    const distance = 0.48 + rng() * 1.05;
    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;
    const height = 1.25 + rng() * 0.6;
    addDecorCylinder(group, i % 2 ? bamboo : bambooDark, 0.026 + rng() * 0.012, height, x, height * 0.5, z, 0, 0, (rng() - 0.5) * 0.16, "cylinder8");
    addDecorBox(group, bamboo, 0.22, 0.025, 0.055, x + (rng() - 0.5) * 0.16, height * 0.72, z, 0, rng() * TWO_PI, (rng() - 0.5) * 0.6);
    addDecorBox(group, bambooDark, 0.2, 0.022, 0.05, x, height * 0.5, z + (rng() - 0.5) * 0.16, 0, rng() * TWO_PI, (rng() - 0.5) * 0.5);
  }
  for (let i = -2; i <= 2; i += 1) {
    addDecorBox(group, i % 2 ? moss : stone, 0.34 + rng() * 0.08, 0.025, 0.22 + rng() * 0.08, i * 0.28 + (rng() - 0.5) * 0.04, 0.04, -0.12 + i * 0.1, 0, 0, (rng() - 0.5) * 0.16);
  }
}

function makeLandmarkOldWell(group, rng) {
  const well = makeLandmarkPart(group, 0, 0, 0.68, 0.08);
  makeDecorWell(well, "古井");
  const { rope, warmWood, darkWood } = getVillageDecorAssets().materials;
  addDecorCylinder(group, rope, 0.008, 0.68, 0.02, 0.58, -0.02, 0, 0, 0, "cylinder8");
  const bucket = makeLandmarkPart(group, 0.38, 0.32, 0.52, -0.26 + rng() * 0.2);
  makeDecorBucket(bucket);
  addDecorCylinder(group, warmWood, 0.018, 0.74, -0.58, 0.28, 0.28, 0.9, 0, -0.32, "cylinder8");
  addDecorBox(group, darkWood, 0.18, 0.03, 0.06, -0.72, 0.56, 0.2, 0, 0, -0.34);
}

function makeLandmarkStoneMarker(group, rng) {
  const { stone, stoneDark, moss, fadedRed } = getVillageDecorAssets().materials;
  addDecorBox(group, stoneDark, 0.48, 0.12, 0.34, 0, 0.06, 0);
  addDecorBox(group, stone, 0.32, 0.74, 0.22, 0, 0.46, 0, 0, 0, (rng() - 0.5) * 0.08);
  addDecorPlane(group, decorLabelMaterial("道祖神"), 0.24, 0.18, 0, 0.54, -0.115, 0, 0, 0);
  addDecorPlane(group, moss, 0.22, 0.11, -0.06, 0.23, -0.12, 0, 0, 0.24);
  addDecorBox(group, fadedRed, 0.1, 0.014, 0.012, 0, 0.65, -0.13, 0, 0, -0.12);
}

function makeLandmarkGraveyard(group, rng) {
  const { stone, stoneDark, moss, paper } = getVillageDecorAssets().materials;
  addDecorBox(group, moss, 1.55, 0.025, 1.18, 0, 0.016, 0);
  for (let i = 0; i < 7; i += 1) {
    const x = -0.54 + (i % 3) * 0.52 + (rng() - 0.5) * 0.08;
    const z = -0.32 + Math.floor(i / 3) * 0.42 + (rng() - 0.5) * 0.08;
    addDecorBox(group, stoneDark, 0.24, 0.07, 0.18, x, 0.035, z);
    addDecorBox(group, i % 2 ? stone : stoneDark, 0.18, 0.42 + rng() * 0.12, 0.12, x, 0.26, z, 0, 0, (rng() - 0.5) * 0.1);
  }
  addDecorCylinder(group, paper, 0.012, 1.0, 0.78, 0.45, -0.42, 0, 0, -0.28, "cylinder8");
  makeLandmarkFlowers(group, rng, 0.72);
}

function makeLandmarkBrokenCart(group, rng) {
  const { darkWood, warmWood, strawDark } = getVillageDecorAssets().materials;
  addDecorBox(group, darkWood, 1.08, 0.12, 0.52, 0, 0.2, 0, 0.12, 0, -0.18);
  addDecorBox(group, warmWood, 0.88, 0.08, 0.08, 0.14, 0.32, -0.32, 0, 0, 0.16);
  for (const x of [-0.42, 0.44]) {
    addDecorCylinder(group, darkWood, 0.17, 0.045, x, 0.18, -0.32, Math.PI / 2, 0, 0, "cylinder16");
    addDecorCylinder(group, warmWood, 0.095, 0.052, x, 0.18, -0.32, Math.PI / 2, 0, 0, "cylinder16");
  }
  const crate = makeLandmarkPart(group, -0.34, 0.2, 0.62, -0.28);
  makeDecorCrate(crate);
  const straw = makeLandmarkPart(group, 0.36, 0.16, 0.58, 0.3);
  makeDecorStrawBundle(straw, rng);
  addDecorCylinder(group, strawDark, 0.018, 0.92, 0.92, 0.18, 0.08, Math.PI / 2, 0, 1.1, "cylinder8");
}

function makeLandmarkRiversideLantern(group, rng) {
  const { water, stone, moss, bambooDark } = getVillageDecorAssets().materials;
  addDecorBox(group, water, 2.35, 0.018, 0.64, 0, 0.012, 0.22, 0, 0, -0.12);
  for (let i = -3; i <= 3; i += 1) {
    addDecorSphere(group, i % 2 ? stone : moss, 0.14 + rng() * 0.04, i * 0.28 + (rng() - 0.5) * 0.04, 0.06, -0.1 + Math.sin(i) * 0.06, 1.35, 0.32, 0.82);
  }
  const lantern = makeLandmarkPart(group, -0.94, -0.34, 0.6, 0.18);
  makeDecorPaperLantern(lantern);
  for (let i = 0; i < 7; i += 1) {
    addDecorCylinder(group, bambooDark, 0.012, 0.38 + rng() * 0.2, 0.72 + (rng() - 0.5) * 0.36, 0.18, 0.42 + (rng() - 0.5) * 0.36, (rng() - 0.5) * 0.22, 0, 0, "cylinder8");
  }
}

function makeLandmarkFarmerStorage(group, rng) {
  const { warmWood, darkWood, straw, stoneDark } = getVillageDecorAssets().materials;
  addDecorBox(group, stoneDark, 1.5, 0.03, 0.95, 0, 0.018, 0);
  for (const offset of [-0.42, 0.02]) {
    addDecorCylinder(group, warmWood, 0.18, 0.44, offset, 0.22, -0.2, 0, 0, 0, "cylinder16");
    addDecorCylinder(group, darkWood, 0.185, 0.025, offset, 0.34, -0.2, 0, 0, 0, "cylinder16");
  }
  const tools = makeLandmarkPart(group, 0.64, -0.08, 0.78, -0.42);
  makeDecorFarmingTools(tools, rng);
  const crate = makeLandmarkPart(group, -0.18, 0.38, 0.56, 0.2);
  makeDecorCrate(crate);
  addDecorCylinder(group, straw, 0.12, 0.76, 0.62, 0.2, 0.42, Math.PI / 2, 0, -0.2, "cylinder12", 0.09);
}

function makeLandmarkCorruptedPrayer(group, rng) {
  const { blackenedStone, curseGlow, talismanRed, darkWood, paper, ash } = getVillageDecorAssets().materials;
  const ashDisc = makeGroundDisc(1.26, 0x120f0f, 0.22);
  ashDisc.position.y = 0.026;
  group.add(ashDisc);
  for (let i = 0; i < 5; i += 1) {
    const angle = i / 5 * TWO_PI + rng() * 0.18;
    const x = Math.cos(angle) * (0.46 + rng() * 0.34);
    const z = Math.sin(angle) * (0.46 + rng() * 0.34);
    addDecorCylinder(group, darkWood, 0.016, 0.58 + rng() * 0.22, x, 0.3, z, 0, 0, (rng() - 0.5) * 0.28, "cylinder8");
    addDecorPlane(group, i % 2 ? talismanRed : paper, 0.12, 0.28, x, 0.52, z - 0.018, 0, 0, (rng() - 0.5) * 0.24);
  }
  for (let i = 0; i < 7; i += 1) {
    addDecorSphere(group, i % 2 ? curseGlow : ash, 0.026 + rng() * 0.018, (rng() - 0.5) * 1.3, 0.18 + rng() * 0.74, (rng() - 0.5) * 1.3, 1, 1, 1);
  }
  addDecorBox(group, blackenedStone, 0.5, 0.09, 0.34, 0, 0.06, 0.12, 0, 0, 0.18);
  addDecorPlane(group, decorLabelMaterial("怨"), 0.22, 0.2, 0, 0.14, -0.08, -Math.PI / 2, 0, 0.18);
}

function makeTerrainFeaturePatchMesh(feature, layerIndex, layers, color, lift) {
  const angularSegments = feature.kind === "mountain" ? 72 : 56;
  const radialSegments = 5;
  const layerRatio = layers <= 1 ? 0 : layerIndex / (layers - 1);
  const rx = feature.rx * (1 - layerRatio * 0.18);
  const rz = feature.rz * (1 - layerRatio * 0.2);
  const rotation = feature.rotation || 0;
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  const vertices = [];
  const indices = [];
  const pushVertex = (sceneX, sceneZ) => {
    const wrinkle = (terrainDetailNoise(sceneX * 1.4, sceneZ * 1.4, layerIndex + 31) - 0.5) * 0.006;
    vertices.push(sceneX, sceneSurfaceHeight(sceneX, sceneZ) + lift + wrinkle, sceneZ);
    return vertices.length / 3 - 1;
  };
  pushVertex(feature.sceneX, feature.sceneZ);
  for (let radialIndex = 1; radialIndex <= radialSegments; radialIndex += 1) {
    const radial = radialIndex / radialSegments;
    for (let angleIndex = 0; angleIndex < angularSegments; angleIndex += 1) {
      const angle = angleIndex / angularSegments * TWO_PI;
      const edgeNoise = (terrainDetailNoise(
        feature.sceneX + Math.cos(angle) * radial * 6,
        feature.sceneZ + Math.sin(angle) * radial * 6,
        layerIndex * 13 + radialIndex,
      ) - 0.5) * (radialIndex === radialSegments ? 0.055 : 0.026);
      const localX = Math.cos(angle) * rx * radial * (1 + edgeNoise);
      const localZ = Math.sin(angle) * rz * radial * (1 - edgeNoise * 0.45);
      const sceneX = feature.sceneX + cos * localX - sin * localZ;
      const sceneZ = feature.sceneZ + sin * localX + cos * localZ;
      pushVertex(sceneX, sceneZ);
    }
  }
  const ringStart = (ringIndex) => 1 + (ringIndex - 1) * angularSegments;
  for (let angleIndex = 0; angleIndex < angularSegments; angleIndex += 1) {
    const next = (angleIndex + 1) % angularSegments;
    indices.push(0, ringStart(1) + angleIndex, ringStart(1) + next);
  }
  for (let ringIndex = 1; ringIndex < radialSegments; ringIndex += 1) {
    const inner = ringStart(ringIndex);
    const outer = ringStart(ringIndex + 1);
    for (let angleIndex = 0; angleIndex < angularSegments; angleIndex += 1) {
      const next = (angleIndex + 1) % angularSegments;
      indices.push(
        inner + angleIndex,
        outer + angleIndex,
        inner + next,
        inner + next,
        outer + angleIndex,
        outer + next,
      );
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.98,
      metalness: 0.01,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: -1 - layerIndex * 0.08,
      polygonOffsetUnits: -1,
    }),
  );
  mesh.name = `Terrain Feature Patch ${feature.name || feature.kind}`;
  mesh.receiveShadow = true;
  return mesh;
}

function makeTerrainFeatures3D() {
  for (const feature of TERRAIN_FEATURES) {
    const layers = feature.layers || 4;
    for (let i = 0; i < layers; i += 1) {
      const lift = feature.kind === "lowland"
        ? 0.018 + i * 0.006
        : feature.kind === "mountain"
          ? 0.026 + i * 0.018
          : 0.02 + i * 0.014;
      const color = feature.kind === "lowland"
        ? (i % 2 ? 0x20391e : feature.color)
        : feature.kind === "mountain"
          ? (i % 2 ? feature.color : 0x58604f)
          : (i % 2 ? feature.color : 0x30472a);
      world3d.add(makeTerrainFeaturePatchMesh(feature, i, layers, color, lift));
    }
  }
}

function makeTerrainDetails3D() {
  terrainObjects3d = new Map();
  for (const detail of TERRAIN_DETAILS) {
    const group = detail.kind === "tree" ? makeTree3D(detail) : makeBush3D(detail);
    if (group) terrainObjects3d.set(detail.id, group);
  }
}

function groundSurfaceDetailAllowed(sceneX, sceneZ, roadPadding = 0.68) {
  if (!scenePointInWorldBounds(sceneX, sceneZ, 0.42)) return false;
  if (distanceToRoadScene(sceneX, sceneZ) < roadPadding) return false;
  for (const prop of STATIC_PROPS) {
    if (Math.hypot(sceneX - prop.sceneX, sceneZ - prop.sceneZ) < staticPropClearanceScene(prop) + 0.28) return false;
  }
  return true;
}

function makeGroundSurfaceDetails3D() {
  const rng = makeSeededRng(0x4d3a91);
  const dummy = new THREE.Object3D();
  const configs = [
    { name: "grass-wash", count: 420, color: 0x4b6a3d, opacity: 0.22, minW: 0.26, maxW: 0.62, minD: 0.08, maxD: 0.2, roadPadding: 0.82 },
    { name: "moss-wash", count: 220, color: 0x6b7f4d, opacity: 0.16, minW: 0.18, maxW: 0.44, minD: 0.08, maxD: 0.18, roadPadding: 0.72 },
    { name: "dirt-wear", count: 180, color: 0x5b4b36, opacity: 0.18, minW: 0.22, maxW: 0.58, minD: 0.09, maxD: 0.22, roadPadding: 0.52 },
  ];
  for (const config of configs) {
    const material = new THREE.MeshBasicMaterial({
      color: config.color,
      transparent: true,
      opacity: config.opacity,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const mesh = new THREE.InstancedMesh(getVillageDecorAssets().geometries.plane, material, config.count);
    mesh.name = `Ground Surface Detail ${config.name}`;
    mesh.renderOrder = -1;
    let placed = 0;
    for (let attempt = 0; placed < config.count && attempt < config.count * 12; attempt += 1) {
      const sceneX = WORLD_SCENE_MIN_X + rng() * WORLD_SCENE_WIDTH;
      const sceneZ = WORLD_SCENE_MIN_Z + rng() * WORLD_SCENE_DEPTH;
      if (!groundSurfaceDetailAllowed(sceneX, sceneZ, config.roadPadding)) continue;
      const width = config.minW + rng() * (config.maxW - config.minW);
      const depth = config.minD + rng() * (config.maxD - config.minD);
      dummy.position.set(sceneX, sceneSurfaceHeight(sceneX, sceneZ) + 0.032 + rng() * 0.012, sceneZ);
      dummy.rotation.set(-Math.PI / 2, 0, rng() * TWO_PI);
      dummy.scale.set(width, depth, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(placed, dummy.matrix);
      placed += 1;
    }
    mesh.count = placed;
    if (placed > 0) world3d.add(mesh);
  }
}

function makeTree3D(detail) {
  const trunk = new THREE.MeshStandardMaterial({ color: detail.type === "willow" ? 0x5e472c : 0x4f321f, roughness: 0.82 });
  const darkTrunk = new THREE.MeshStandardMaterial({ color: 0x2a1d15, roughness: 0.86 });
  const cedar = new THREE.MeshStandardMaterial({ color: detail.type === "cedar" ? 0x17361f : detail.type === "pine" ? 0x1f4328 : detail.type === "willow" ? 0x3f5c35 : 0x31512f, roughness: 0.92 });
  const leafLight = new THREE.MeshStandardMaterial({ color: detail.type === "willow" ? 0x5f7447 : 0x48683d, roughness: 0.95 });
  const group = new THREE.Group();
  const s = detail.scale;
  addCylinder3D(group, trunk, 0.055 * s, 0.075 * s, 0.9 * s, 10, 0, 0.45 * s, 0);
  addCylinder3D(group, darkTrunk, 0.064 * s, 0.08 * s, 0.08 * s, 10, 0, 0.04 * s, 0);
  if (detail.type === "cedar" || detail.type === "pine") {
    const tiers = detail.type === "cedar" ? 4 : 3;
    for (let i = 0; i < tiers; i += 1) {
      addCylinder3D(group, i % 2 ? leafLight : cedar, 0.04 * s, (0.42 - i * 0.06) * s, (0.5 - i * 0.04) * s, 14, 0, (0.86 + i * 0.28) * s, 0);
    }
  } else if (detail.type === "willow") {
    addSphere3D(group, cedar, 0.42 * s, 18, 10, 0, 1.15 * s, 0, 1.1, 0.78, 1.05);
    for (let i = 0; i < 5; i += 1) {
      const angle = detail.rotation + i * TWO_PI / 5;
      addCylinder3D(group, leafLight, 0.018 * s, 0.026 * s, 0.62 * s, 8, Math.cos(angle) * 0.24 * s, 0.82 * s, Math.sin(angle) * 0.24 * s, 0.4, 0, angle);
    }
  } else {
    addSphere3D(group, cedar, 0.42 * s, 18, 12, 0, 1.08 * s, 0, 1.08, 0.82, 1.04);
    addSphere3D(group, leafLight, 0.26 * s, 14, 10, 0.22 * s, 1.0 * s, 0.08 * s, 1, 0.82, 1);
    addSphere3D(group, cedar, 0.24 * s, 14, 10, -0.18 * s, 0.98 * s, -0.12 * s, 1, 0.78, 1);
  }
  const ground = sceneHillHeight(detail.sceneX, detail.sceneZ);
  group.position.set(detail.sceneX, ground, detail.sceneZ);
  group.rotation.y = detail.rotation || 0;
  group.userData.terrainId = detail.id;
  world3d.add(group);
  return group;
}

function makeBush3D(detail) {
  const mat = new THREE.MeshStandardMaterial({ color: detail.colorShift > 0.5 ? 0x3d5a33 : 0x2f4d2d, roughness: 0.96 });
  const flower = new THREE.MeshBasicMaterial({ color: detail.colorShift > 0.72 ? 0xd8c98a : 0x8ba172, transparent: true, opacity: 0.72 });
  const group = new THREE.Group();
  const s = detail.scale;
  addSphere3D(group, mat, 0.18 * s, 12, 8, 0, 0.16 * s, 0, 1.35, 0.66, 1.05);
  addSphere3D(group, mat, 0.13 * s, 10, 8, -0.16 * s, 0.13 * s, 0.03 * s, 1.1, 0.58, 0.9);
  addSphere3D(group, mat, 0.13 * s, 10, 8, 0.15 * s, 0.12 * s, -0.04 * s, 1.05, 0.55, 0.95);
  if (detail.colorShift > 0.62) {
    addSphere3D(group, flower, 0.026 * s, 8, 5, 0.02 * s, 0.28 * s, -0.05 * s);
  }
  group.position.set(detail.sceneX, sceneHillHeight(detail.sceneX, detail.sceneZ), detail.sceneZ);
  group.rotation.y = detail.rotation || 0;
  group.userData.terrainId = detail.id;
  world3d.add(group);
  return group;
}

function makeShrineHill() {
  for (let i = 0; i < 5; i += 1) {
    const t = i / 4;
    const mesh = new THREE.Mesh(
      new THREE.CircleGeometry(1, 72),
      new THREE.MeshStandardMaterial({
        color: i % 2 ? 0x38512f : 0x30472a,
        roughness: 0.98,
        metalness: 0.01,
      }),
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.scale.set(SHRINE_HILL_SCENE.rx * (1 - t * 0.16), SHRINE_HILL_SCENE.rz * (1 - t * 0.18), 1);
    mesh.position.set(SHRINE_HILL_SCENE.x, 0.012 + i * 0.035, SHRINE_HILL_SCENE.z);
    mesh.receiveShadow = true;
    world3d.add(mesh);
  }
}

function makeStoneRoad() {
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x77776f, roughness: 0.94, metalness: 0.02 });
  const edgeMat = new THREE.MeshBasicMaterial({ color: 0xb9b4a7, transparent: true, opacity: 0.24 });
  const seamMat = new THREE.MeshBasicMaterial({ color: 0x4f514c, transparent: true, opacity: 0.26 });
  const pebbleMat = new THREE.MeshStandardMaterial({ color: 0x5f625c, roughness: 0.96, metalness: 0.01 });
  for (let i = 0; i < ROAD_SCENE_POINTS.length - 1; i += 1) {
    const a = ROAD_SCENE_POINTS[i];
    const b = ROAD_SCENE_POINTS[i + 1];
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const length = Math.hypot(dx, dz);
    const angle = -Math.atan2(dz, dx);
    const road = new THREE.Mesh(new THREE.BoxGeometry(length, 0.028, worldLen(ROAD_WIDTH)), roadMat);
    const midX = (a.x + b.x) * 0.5;
    const midZ = (a.z + b.z) * 0.5;
    const y = sceneHillHeight(midX, midZ);
    road.position.set(midX, y + 0.034, midZ);
    road.rotation.y = angle;
    world3d.add(road);

    const edge = new THREE.Mesh(new THREE.BoxGeometry(length, 0.01, worldLen(ROAD_WIDTH) + 0.08), edgeMat);
    edge.position.set(midX, y + 0.038, midZ);
    edge.rotation.y = angle;
    world3d.add(edge);

    for (let step = 0.85; step < length; step += 0.86) {
      const t = step / length;
      const seam = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.008, worldLen(ROAD_WIDTH * 0.72)), seamMat);
      const seamX = a.x + dx * t;
      const seamZ = a.z + dz * t;
      seam.position.set(seamX, sceneHillHeight(seamX, seamZ) + 0.055, seamZ);
      seam.rotation.y = angle;
      world3d.add(seam);
    }
    const nx = -dz / length;
    const nz = dx / length;
    const shoulder = worldLen(ROAD_WIDTH) * 0.52;
    for (let step = 0.52; step < length; step += 1.32) {
      const t = step / length;
      const side = (Math.floor(step * 10) + i) % 2 === 0 ? -1 : 1;
      const pebbleX = a.x + dx * t + nx * shoulder * side;
      const pebbleZ = a.z + dz * t + nz * shoulder * side;
      const pebbleSize = 0.055 + ((i + step) % 3) * 0.012;
      addBox3D(
        world3d,
        pebbleMat,
        pebbleSize * 1.7,
        0.025,
        pebbleSize,
        pebbleX,
        sceneHillHeight(pebbleX, pebbleZ) + 0.05,
        pebbleZ,
        0,
        angle + ((i + step) % 1.8),
        0,
      );
    }
  }

  for (const point of ROAD_SCENE_POINTS) {
    const plaza = makeGroundDisc(worldLen(ROAD_WIDTH * 0.58), 0x77776f, 0.82);
    plaza.position.set(point.x, sceneHillHeight(point.x, point.z) + 0.036, point.z);
    world3d.add(plaza);
  }
}

function makeMainCity3D() {
  const assets = getVillageDecorAssets();
  const { cityStone, cityStoneDark, cityPaver, cityPaverLine, moss } = assets.materials;
  const group = new THREE.Group();
  const half = MAIN_CITY_SCENE.half;
  const size = MAIN_CITY_SCENE.size;
  group.position.set(MAIN_CITY_SCENE.x, MAIN_CITY_TERRAIN_HEIGHT + 0.012, MAIN_CITY_SCENE.z);
  group.rotation.y = MAIN_CITY_SCENE.rotation;
  group.name = "southwest-main-city";

  addBox3D(group, cityStoneDark, size, 0.035, size, 0, 0, 0, 0, 0, 0, "main-city-stone-base");
  addBox3D(group, cityPaver, size * 0.92, 0.018, size * 0.92, 0, 0.024, 0, 0, 0, 0, "main-city-paver-field");
  addBox3D(group, cityPaver, size * 0.96, 0.024, 3.0, 0, 0.034, 0, 0, 0, 0, "main-city-main-street-east-west");
  addBox3D(group, cityPaver, 3.0, 0.024, size * 0.96, 0, 0.036, 0, 0, 0, 0, "main-city-main-street-north-south");
  for (const offset of [-18.5, -11.5, 11.5, 18.5]) {
    addBox3D(group, cityPaver, size * 0.86, 0.02, 1.12, 0, 0.04, offset, 0, 0, 0, "main-city-secondary-street");
    addBox3D(group, cityPaver, 1.12, 0.02, size * 0.86, offset, 0.041, 0, 0, 0, 0, "main-city-secondary-street");
  }
  addBox3D(group, cityStone, 7.2, 0.032, 7.2, 0, 0.052, 0, 0, Math.PI / 4, 0, "main-city-central-plaza");

  for (let offset = -half + 2.6; offset <= half - 2.6; offset += 3.2) {
    addBox3D(group, cityPaverLine, size * 0.9, 0.006, 0.035, 0, 0.064, offset);
    addBox3D(group, cityPaverLine, 0.035, 0.006, size * 0.9, offset, 0.065, 0);
  }

  for (const side of [-1, 1]) {
    addBox3D(group, cityStoneDark, size * 0.38, 0.42, 0.42, -size * 0.28, 0.23, side * half, 0, 0, 0, "main-city-wall");
    addBox3D(group, cityStoneDark, size * 0.38, 0.42, 0.42, size * 0.28, 0.23, side * half, 0, 0, 0, "main-city-wall");
    addBox3D(group, cityStoneDark, 0.42, 0.42, size * 0.38, side * half, 0.23, -size * 0.28, 0, 0, 0, "main-city-wall");
    addBox3D(group, cityStoneDark, 0.42, 0.42, size * 0.38, side * half, 0.23, size * 0.28, 0, 0, 0, "main-city-wall");
    for (const local of [-half + 3.2, half - 3.2]) {
      addBox3D(group, cityStone, 1.08, 0.78, 1.08, local, 0.42, side * half, 0, Math.PI / 4, 0, "main-city-corner-watch");
      addBox3D(group, cityStone, 1.08, 0.78, 1.08, side * half, 0.42, local, 0, Math.PI / 4, 0, "main-city-corner-watch");
    }
  }
  for (const [x, z, w, d] of [[-half + 0.8, 0, 0.36, 5.6], [0, half - 0.8, 5.6, 0.36]]) {
    addBox3D(group, moss, w, 0.018, d, x, 0.07, z, 0, 0, 0, "main-city-moss-edge");
  }
  world3d.add(group);

  for (const building of MAIN_CITY_BUILDINGS) makeMainCityBuilding3D(building);
  for (const tree of MAIN_CITY_SAKURA_TREES) makeMainCitySakura3D(tree);
}

function makeMainCityBuilding3D(building) {
  const assets = getVillageDecorAssets();
  const {
    cityStone,
    cityBrick,
    cityBrickLight,
    cityTileRoof,
    cityRedTileRoof,
    darkWood,
    paper,
    rope,
    fadedRed,
  } = assets.materials;
  const rng = makeSeededRng(0x8800 + building.key.length * 13 + Math.round((building.sceneX + 200) * 17));
  const group = new THREE.Group();
  const w = building.width;
  const d = building.depth;
  const floors = building.floors || 1;
  const wallHeight = floors > 1 ? 1.34 : 0.82;
  const roof = building.roof === "redTile" ? cityRedTileRoof : cityTileRoof;
  const wall = building.accent % 2 ? cityBrickLight : cityBrick;

  addBox3D(group, cityStone, w + 0.24, 0.08, d + 0.22, 0, 0.04, 0);
  addBox3D(group, wall, w, wallHeight, d, 0, 0.08 + wallHeight * 0.5, 0);
  for (let y = 0.28; y < wallHeight; y += 0.22) {
    addBox3D(group, darkWood, w + 0.02, 0.018, 0.022, 0, y, -d * 0.51);
    addBox3D(group, darkWood, w + 0.02, 0.018, 0.022, 0, y, d * 0.51);
  }
  for (let x = -w * 0.38; x <= w * 0.39; x += Math.max(0.32, w * 0.24)) {
    addBox3D(group, darkWood, 0.018, wallHeight * 0.8, 0.025, x, 0.08 + wallHeight * 0.46, -d * 0.515);
    addBox3D(group, paper, 0.23, 0.28, 0.016, x, 0.42, -d * 0.528);
    if (floors > 1) addBox3D(group, paper, 0.22, 0.25, 0.016, x, 0.98, -d * 0.528);
  }
  addBox3D(group, darkWood, 0.4, 0.5, 0.03, 0, 0.33, -d * 0.535);
  addBox3D(group, rope, w * 0.64, 0.03, 0.03, 0, wallHeight + 0.08, -d * 0.545);
  if (building.type === "merchant" || building.type === "gatehouse") {
    addBox3D(group, fadedRed, w * 0.58, 0.22, 0.022, 0, 0.68, -d * 0.555);
  }
  const roofY = wallHeight + 0.22;
  addBox3D(group, roof, w + 0.62, 0.22, d + 0.5, 0, roofY, 0, 0, 0, building.type === "gatehouse" ? 0 : (rng() - 0.5) * 0.05);
  addBox3D(group, roof, w + 0.78, 0.055, d + 0.58, 0, roofY + 0.15, 0);
  addBox3D(group, roof, 0.12, 0.12, d + 0.72, 0, roofY + 0.24, 0);
  for (let x = -w * 0.46; x <= w * 0.47; x += 0.36) {
    addBox3D(group, cityStone, 0.028, 0.02, d + 0.64, x, roofY + 0.18, 0);
  }
  if (building.type === "gatehouse") {
    addBox3D(group, darkWood, w * 0.28, 0.7, 0.04, 0, 0.42, -d * 0.57);
    addBox3D(group, cityStone, 0.55, 1.22, 0.55, -w * 0.42, 0.64, 0);
    addBox3D(group, cityStone, 0.55, 1.22, 0.55, w * 0.42, 0.64, 0);
  }
  group.position.set(building.sceneX, sceneHillHeight(building.sceneX, building.sceneZ), building.sceneZ);
  group.rotation.y = building.rotation;
  group.name = building.key;
  world3d.add(group);
}

function makeMainCitySakura3D(tree) {
  const assets = getVillageDecorAssets();
  const { sakuraTrunk, sakuraBloom, sakuraBloomDeep, fallenLeaf } = assets.materials;
  const group = new THREE.Group();
  const s = tree.scale || 1;
  addCylinder3D(group, sakuraTrunk, 0.065 * s, 0.09 * s, 0.9 * s, 8, 0, 0.45 * s, 0, 0.06, 0, 0.08);
  addCylinder3D(group, sakuraTrunk, 0.03 * s, 0.04 * s, 0.52 * s, 8, -0.16 * s, 0.88 * s, 0.02 * s, 0.32, 0, -0.62);
  addCylinder3D(group, sakuraTrunk, 0.028 * s, 0.038 * s, 0.48 * s, 8, 0.16 * s, 0.86 * s, -0.02 * s, -0.22, 0, 0.58);
  const bloom = tree.colorShift > 0.55 ? sakuraBloomDeep : sakuraBloom;
  addSphere3D(group, bloom, 0.36 * s, 12, 8, 0, 1.12 * s, 0, 1.35, 0.72, 1.08);
  addSphere3D(group, sakuraBloom, 0.24 * s, 12, 8, -0.28 * s, 1.02 * s, 0.04 * s, 1.08, 0.58, 0.92);
  addSphere3D(group, sakuraBloomDeep, 0.22 * s, 12, 8, 0.28 * s, 1.0 * s, -0.05 * s, 1.02, 0.56, 0.9);
  addSphere3D(group, sakuraBloom, 0.18 * s, 10, 6, 0.04 * s, 1.26 * s, 0.24 * s, 1.18, 0.48, 0.78);
  for (let i = 0; i < 7; i += 1) {
    const angle = (i / 7) * TWO_PI + tree.rotation;
    addBox3D(group, fallenLeaf, 0.08 * s, 0.006 * s, 0.035 * s, Math.cos(angle) * (0.32 + i * 0.02) * s, 0.012 * s, Math.sin(angle) * (0.22 + i * 0.015) * s, 0, angle, 0);
  }
  group.position.set(tree.sceneX, sceneHillHeight(tree.sceneX, tree.sceneZ), tree.sceneZ);
  group.rotation.y = tree.rotation || 0;
  group.name = tree.key;
  world3d.add(group);
}

function makeTorii(x, z, scale, rotation = 0.08) {
  const mat = new THREE.MeshStandardMaterial({ color: 0x6a1f1a, roughness: 0.62, metalness: 0.04 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x21100d, roughness: 0.8 });
  const stone = new THREE.MeshStandardMaterial({ color: 0x46423d, roughness: 0.9 });
  const rope = new THREE.MeshStandardMaterial({ color: 0xb99247, roughness: 0.74 });
  const paper = new THREE.MeshBasicMaterial({ color: 0xf4efe2, transparent: true, opacity: 0.92 });
  const plaque = new THREE.MeshStandardMaterial({ color: 0xcaa65a, roughness: 0.42, metalness: 0.18 });
  const group = new THREE.Group();
  addBox3D(group, dark, 2.44 * scale, 0.16 * scale, 0.26 * scale, 0, 1.96 * scale, 0, 0, 0, 0.02);
  addBox3D(group, dark, 2.16 * scale, 0.08 * scale, 0.22 * scale, 0, 2.08 * scale, 0, 0, 0, -0.02);
  addBox3D(group, mat, 1.82 * scale, 0.16 * scale, 0.2 * scale, 0, 1.68 * scale, 0);
  addBox3D(group, mat, 1.48 * scale, 0.1 * scale, 0.16 * scale, 0, 1.42 * scale, 0);
  addBox3D(group, mat, 0.22 * scale, 0.34 * scale, 0.18 * scale, 0, 1.77 * scale, 0);
  addBox3D(group, plaque, 0.28 * scale, 0.18 * scale, 0.025 * scale, 0, 1.53 * scale, -0.105 * scale);

  for (const side of [-1, 1]) {
    addBox3D(group, stone, 0.42 * scale, 0.1 * scale, 0.38 * scale, side * 0.78 * scale, 0.05 * scale, 0);
    addCylinder3D(group, mat, 0.11 * scale, 0.13 * scale, 1.54 * scale, 16, side * 0.78 * scale, 0.82 * scale, 0);
    addCylinder3D(group, dark, 0.12 * scale, 0.12 * scale, 0.06 * scale, 16, side * 0.78 * scale, 1.61 * scale, 0);
    addBox3D(group, dark, 0.32 * scale, 0.08 * scale, 0.24 * scale, side * 0.78 * scale, 1.36 * scale, 0);
  }

  addCylinder3D(group, rope, 0.025 * scale, 0.025 * scale, 1.28 * scale, 12, 0, 1.33 * scale, -0.02 * scale, 0, 0, Math.PI / 2);
  for (let i = -1; i <= 1; i += 1) {
    addBox3D(group, paper, 0.075 * scale, 0.2 * scale, 0.012 * scale, i * 0.34 * scale, 1.19 * scale, -0.04 * scale, 0, 0, i * 0.18);
  }
  group.position.set(x, sceneHillHeight(x, z), z);
  group.rotation.y = rotation;
  world3d.add(group);
}

function makeLantern(x, z, scale = SMALL_ACTOR_SCALE) {
  const stone = new THREE.MeshStandardMaterial({ color: 0x4b4740, roughness: 0.86 });
  const darkStone = new THREE.MeshStandardMaterial({ color: 0x2f2c29, roughness: 0.9 });
  const glow = new THREE.MeshBasicMaterial({ color: 0xe1c887, transparent: true, opacity: 0.82, depthWrite: false });
  const paper = new THREE.MeshBasicMaterial({ color: 0xf0dfaa, transparent: true, opacity: 0.32, depthWrite: false });
  const groundY = sceneHillHeight(x, z);
  const clearing = makeGroundDisc(worldLen(LANTERN_CLEAR_RADIUS), 0x384e31, 0.14);
  clearing.position.set(x, groundY + 0.042, z);
  world3d.add(clearing);
  const group = new THREE.Group();
  addCylinder3D(group, stone, 0.22 * scale, 0.3 * scale, 0.12 * scale, 8, 0, 0.06 * scale, 0);
  addCylinder3D(group, stone, 0.16 * scale, 0.2 * scale, 0.12 * scale, 8, 0, 0.18 * scale, 0);
  addCylinder3D(group, darkStone, 0.08 * scale, 0.1 * scale, 0.58 * scale, 8, 0, 0.53 * scale, 0);
  addBox3D(group, stone, 0.42 * scale, 0.08 * scale, 0.42 * scale, 0, 0.86 * scale, 0);
  const light = addSphere3D(group, glow, 0.18 * scale, 18, 12, 0, 1.03 * scale, 0, 1.1, 0.82, 1.1);
  addBox3D(group, paper, 0.34 * scale, 0.28 * scale, 0.012 * scale, 0, 1.03 * scale, -0.18 * scale);
  addBox3D(group, paper, 0.34 * scale, 0.28 * scale, 0.012 * scale, 0, 1.03 * scale, 0.18 * scale);
  addBox3D(group, paper, 0.012 * scale, 0.28 * scale, 0.34 * scale, -0.18 * scale, 1.03 * scale, 0);
  addBox3D(group, paper, 0.012 * scale, 0.28 * scale, 0.34 * scale, 0.18 * scale, 1.03 * scale, 0);
  for (const side of [-1, 1]) {
    addBox3D(group, darkStone, 0.035 * scale, 0.34 * scale, 0.035 * scale, side * 0.18 * scale, 1.03 * scale, side * 0.18 * scale);
    addBox3D(group, darkStone, 0.035 * scale, 0.34 * scale, 0.035 * scale, side * 0.18 * scale, 1.03 * scale, -side * 0.18 * scale);
  }
  addBox3D(group, darkStone, 0.5 * scale, 0.08 * scale, 0.5 * scale, 0, 1.24 * scale, 0);
  addCylinder3D(group, stone, 0.04 * scale, 0.08 * scale, 0.12 * scale, 8, 0, 1.34 * scale, 0);
  lanternGlow3d.push(light);
  group.position.set(x, groundY, z);
  world3d.add(group);
}

function makeHouse(x, z, scale = 1, rotation = 0) {
  const assets = getVillageDecorAssets();
  const {
    bamboo,
    bambooDark,
    bambooPanel,
    warmWood,
    darkWood,
    stone,
    paper,
    clothBlue,
    clothRed,
    fadedRed,
    straw,
    strawDark,
    moss,
    soil,
    leaf,
  } = assets.materials;
  const seed = ((Math.round((x + 64) * 97) ^ Math.round((z + 64) * 193)) >>> 0) || 1;
  const rng = makeSeededRng(seed);
  const variant = seed % 6;
  const hasSideShed = variant === 1 || variant === 4;
  const hasLantern = variant !== 2;
  const hasFence = variant === 0 || variant === 2 || variant === 5;
  const hasGarden = variant === 1 || variant === 3 || variant === 5;
  const cloth = variant % 2 ? clothRed : clothBlue;
  const witheredBamboo = bamboo.clone();
  const witheredBambooDark = bambooDark.clone();
  const witheredBambooPanel = bambooPanel.clone();
  witheredBamboo.color.setHex(0xbaa25a);
  witheredBambooDark.color.setHex(0x7f6b3e);
  witheredBambooPanel.color.setHex(0xc0a970);
  const roofThatch = straw;
  const roofThatchDark = strawDark;
  const roofBamboo = witheredBamboo;
  const roofRidge = witheredBambooDark;
  const wallFrame = witheredBambooDark;
  const wallPanel = witheredBambooPanel;
  const group = new THREE.Group();

  addBox3D(group, stone, 1.5 * scale, 0.08 * scale, 1.12 * scale, 0, 0.04 * scale, 0);
  addBox3D(group, wallPanel, 1.34 * scale, 0.78 * scale, 1.0 * scale, 0, 0.43 * scale, 0);

  for (const y of [0.13, 0.46, 0.83]) {
    addBox3D(group, wallFrame, 1.42 * scale, 0.052 * scale, 0.064 * scale, 0, y * scale, -0.512 * scale);
    addBox3D(group, wallFrame, 1.42 * scale, 0.045 * scale, 0.052 * scale, 0, y * scale, 0.512 * scale);
  }
  for (let i = -5; i <= 5; i += 1) {
    const xOffset = i * 0.12 * scale;
    addCylinder3D(group, wallFrame, 0.01 * scale, 0.012 * scale, 0.72 * scale, 8, xOffset, 0.44 * scale, -0.5 * scale);
    addCylinder3D(group, wallFrame, 0.01 * scale, 0.012 * scale, 0.72 * scale, 8, xOffset, 0.44 * scale, 0.5 * scale);
  }
  for (const y of [0.25, 0.52, 0.74]) {
    addCylinder3D(group, wallFrame, 0.01 * scale, 0.01 * scale, 1.36 * scale, 8, 0, y * scale, -0.5 * scale, 0, 0, Math.PI / 2);
    addCylinder3D(group, wallFrame, 0.01 * scale, 0.01 * scale, 1.36 * scale, 8, 0, y * scale, 0.5 * scale, 0, 0, Math.PI / 2);
  }
  for (const side of [-1, 1]) {
    addBox3D(group, wallFrame, 0.075 * scale, 0.82 * scale, 0.075 * scale, side * 0.69 * scale, 0.46 * scale, -0.51 * scale);
    addBox3D(group, wallFrame, 0.075 * scale, 0.82 * scale, 0.075 * scale, side * 0.69 * scale, 0.46 * scale, 0.51 * scale);
    addBox3D(group, wallFrame, 0.055 * scale, 0.76 * scale, 0.055 * scale, side * 0.69 * scale, 0.46 * scale, 0);
    addBox3D(group, paper, 0.012 * scale, 0.25 * scale, 0.34 * scale, side * 0.676 * scale, 0.51 * scale, 0.18 * scale);
    addBox3D(group, wallFrame, 0.014 * scale, 0.28 * scale, 0.018 * scale, side * 0.684 * scale, 0.51 * scale, 0.18 * scale);
    for (const offset of [-0.09, 0.09]) {
      addBox3D(group, wallFrame, 0.014 * scale, 0.25 * scale, 0.012 * scale, side * 0.686 * scale, 0.51 * scale, (0.18 + offset) * scale);
    }
    for (const y of [0.43, 0.51, 0.59]) {
      addBox3D(group, wallFrame, 0.014 * scale, 0.014 * scale, 0.36 * scale, side * 0.688 * scale, y * scale, 0.18 * scale);
    }
  }

  const roofSteps = 11;
  for (const side of [-1, 1]) {
    for (let i = 0; i < roofSteps; i += 1) {
      const t = i / (roofSteps - 1);
      const xOffset = side * (0.08 + t * 0.9) * scale;
      const yOffset = (1.18 - t * 0.34 + (rng() - 0.5) * 0.008) * scale;
      const zOffset = (rng() - 0.5) * 0.02 * scale;
      const r = (0.019 - t * 0.006) * scale;
      const thatchRadius = (0.009 - t * 0.0012) * scale;
      const thatchLength = 1.2 * scale + t * 0.23 * scale;
      addCylinder3D(group, roofBamboo, r, r * 1.08, 1.5 * scale, 8, xOffset, yOffset, zOffset, Math.PI / 2, 0, 0);
      addCylinder3D(group, roofThatch, thatchRadius, thatchRadius * 1.05, thatchLength, 8, xOffset + (rng() - 0.5) * 0.006 * scale, yOffset + 0.006 * scale, zOffset + (rng() - 0.5) * 0.01 * scale, Math.PI / 2, 0, (rng() - 0.5) * 0.14);
      addCylinder3D(group, roofThatch, thatchRadius * 0.85, thatchRadius * 0.89, thatchLength * 0.66, 8, xOffset + (rng() - 0.5) * 0.01 * scale, yOffset + 0.015 * scale, zOffset + (rng() - 0.5) * 0.015 * scale, Math.PI / 2, 0, (rng() - 0.5) * 0.12);
      if (i % 4 === 0) {
        addCylinder3D(group, roofThatchDark, thatchRadius * 0.92, thatchRadius, thatchLength * 0.52, 8, xOffset + (rng() - 0.5) * 0.008 * scale, yOffset + 0.022 * scale, zOffset + (rng() - 0.5) * 0.018 * scale, Math.PI / 2, 0, (rng() - 0.5) * 0.16);
      }
    }
  }
  addCylinder3D(group, roofRidge, 0.027 * scale, 0.03 * scale, 1.56 * scale, 10, 0, 1.2 * scale, 0, Math.PI / 2);
  addCylinder3D(group, roofRidge, 0.02 * scale, 0.022 * scale, 1.56 * scale, 10, 0, 1.14 * scale, 0, Math.PI / 2);
  for (const side of [-1, 1]) {
    addCylinder3D(group, roofRidge, 0.02 * scale, 0.022 * scale, 1.52 * scale, 10, side * 0.98 * scale, 0.84 * scale, 0, Math.PI / 2);
  }
  for (const zTie of [-0.64, -0.38, -0.1, 0.18, 0.46, 0.68]) {
    addCylinder3D(group, roofRidge, 0.011 * scale, 0.012 * scale, 2.04 * scale, 8, 0, 0.98 * scale, zTie * scale, 0, 0, Math.PI / 2);
  }

  const door = addBox3D(group, warmWood, 0.3 * scale, 0.5 * scale, 0.02 * scale, 0, 0.35 * scale, -0.522 * scale);
  door.receiveShadow = false;
  for (const side of [-1, 1]) {
    addBox3D(group, paper, 0.25 * scale, 0.26 * scale, 0.014 * scale, side * 0.39 * scale, 0.51 * scale, -0.524 * scale);
    addBox3D(group, wallFrame, 0.28 * scale, 0.018 * scale, 0.016 * scale, side * 0.39 * scale, 0.51 * scale, -0.535 * scale);
    addBox3D(group, wallFrame, 0.018 * scale, 0.28 * scale, 0.016 * scale, side * 0.39 * scale, 0.51 * scale, -0.536 * scale);
    addBox3D(group, wallFrame, 0.018 * scale, 0.26 * scale, 0.012 * scale, side * 0.39 * scale, 0.51 * scale, -0.538 * scale);
    for (const y of [0.46, 0.56]) {
      addBox3D(group, wallFrame, 0.26 * scale, 0.012 * scale, 0.012 * scale, side * 0.39 * scale, y * scale, -0.54 * scale);
    }
  }

  addBox3D(group, warmWood, 1.12 * scale, 0.075 * scale, 0.32 * scale, 0, 0.13 * scale, -0.68 * scale);
  for (let i = -2; i <= 2; i += 1) {
    addBox3D(group, darkWood, 0.035 * scale, 0.055 * scale, 0.32 * scale, i * 0.22 * scale, 0.2 * scale, -0.68 * scale);
  }
  addBox3D(group, stone, 0.48 * scale, 0.06 * scale, 0.24 * scale, 0, 0.035 * scale, -0.98 * scale);
  addBox3D(group, stone, 0.36 * scale, 0.05 * scale, 0.2 * scale, 0, 0.088 * scale, -0.88 * scale);

  if (hasLantern) {
    const side = rng() < 0.5 ? -1 : 1;
    addCylinder3D(group, wallFrame, 0.012 * scale, 0.012 * scale, 0.3 * scale, 8, side * 0.22 * scale, 0.8 * scale, -0.62 * scale);
    addCylinder3D(group, paper, 0.062 * scale, 0.072 * scale, 0.14 * scale, 12, side * 0.22 * scale, 0.66 * scale, -0.62 * scale);
    addCylinder3D(group, fadedRed, 0.066 * scale, 0.066 * scale, 0.018 * scale, 12, side * 0.22 * scale, 0.75 * scale, -0.62 * scale);
    addCylinder3D(group, fadedRed, 0.066 * scale, 0.066 * scale, 0.018 * scale, 12, side * 0.22 * scale, 0.57 * scale, -0.62 * scale);
  } else {
    addDecorPlane(group, cloth, 0.44 * scale, 0.22 * scale, 0, 0.66 * scale, -0.548 * scale, 0, 0, 0);
    for (const side of [-1, 0, 1]) {
      addBox3D(group, wallFrame, 0.012 * scale, 0.22 * scale, 0.012 * scale, side * 0.14 * scale, 0.56 * scale, -0.556 * scale);
    }
  }

  if (hasSideShed) {
    const side = variant === 1 ? -1 : 1;
    addBox3D(group, wallPanel, 0.48 * scale, 0.42 * scale, 0.5 * scale, side * 0.94 * scale, 0.25 * scale, 0.22 * scale);
    for (let i = 0; i < 6; i += 1) {
      const t = i / 5;
      const xOffset = side * (0.77 + t * 0.33) * scale;
      const yOffset = (0.62 - t * 0.14) * scale;
      addCylinder3D(group, roofBamboo, 0.013 * scale, 0.015 * scale, 0.62 * scale, 8, xOffset, yOffset, 0.22 * scale, Math.PI / 2);
      addCylinder3D(group, roofThatch, 0.008 * scale, 0.0085 * scale, 0.6 * scale, 8, xOffset + (rng() - 0.5) * 0.01 * scale, yOffset + 0.006 * scale, 0.22 * scale + (rng() - 0.5) * 0.01 * scale, Math.PI / 2, 0, (rng() - 0.5) * 0.1);
      if (i % 2 === 0) {
        addCylinder3D(group, roofThatchDark, 0.007 * scale, 0.0074 * scale, 0.48 * scale, 8, xOffset + (rng() - 0.5) * 0.012 * scale, yOffset + 0.012 * scale, 0.22 * scale + (rng() - 0.5) * 0.01 * scale, Math.PI / 2, 0, (rng() - 0.5) * 0.11);
      }
    }
    addCylinder3D(group, roofRidge, 0.017 * scale, 0.019 * scale, 0.66 * scale, 8, side * 0.75 * scale, 0.62 * scale, 0.22 * scale, Math.PI / 2);
    addCylinder3D(group, roofRidge, 0.017 * scale, 0.019 * scale, 0.66 * scale, 8, side * 1.1 * scale, 0.48 * scale, 0.22 * scale, Math.PI / 2);
    addBox3D(group, wallFrame, 0.05 * scale, 0.46 * scale, 0.05 * scale, side * 0.68 * scale, 0.26 * scale, 0.47 * scale);
    addBox3D(group, wallFrame, 0.05 * scale, 0.46 * scale, 0.05 * scale, side * 1.2 * scale, 0.26 * scale, 0.47 * scale);
  }

  if (hasFence) {
    const fenceZ = 0.82;
    for (let i = -2; i <= 2; i += 1) {
      addCylinder3D(group, darkWood, 0.018 * scale, 0.018 * scale, 0.42 * scale, 8, i * 0.25 * scale, 0.21 * scale, fenceZ * scale);
    }
    addCylinder3D(group, warmWood, 0.014 * scale, 0.014 * scale, 1.02 * scale, 8, 0, 0.32 * scale, fenceZ * scale, 0, 0, Math.PI / 2);
    addCylinder3D(group, warmWood, 0.014 * scale, 0.014 * scale, 1.02 * scale, 8, 0, 0.18 * scale, fenceZ * scale, 0, 0, Math.PI / 2);
  }

  if (hasGarden) {
    const gardenX = variant === 3 ? -0.9 : 0.9;
    addBox3D(group, soil, 0.52 * scale, 0.028 * scale, 0.34 * scale, gardenX * scale, 0.025 * scale, -0.96 * scale);
    for (let row = -1; row <= 1; row += 1) {
      addBox3D(group, moss, 0.46 * scale, 0.016 * scale, 0.018 * scale, gardenX * scale, 0.055 * scale, (-0.96 + row * 0.09) * scale);
      for (let i = -1; i <= 1; i += 1) {
        addSphere3D(group, leaf, 0.025 * scale, 10, 6, (gardenX + i * 0.14 + (rng() - 0.5) * 0.02) * scale, 0.082 * scale, (-0.96 + row * 0.09 + (rng() - 0.5) * 0.02) * scale, 1.25, 0.55, 1);
      }
    }
  }

  group.position.set(x, sceneHillHeight(x, z), z);
  group.rotation.y = rotation;
  world3d.add(group);
}

function makeWorkshop(x, z, scale = 1, rotation = 0, type = "shop") {
  const isBlacksmith = type === "blacksmith";
  const wall = new THREE.MeshStandardMaterial({ color: isBlacksmith ? 0xd2c8b5 : 0xe2dccb, roughness: 0.88 });
  const roofMat = new THREE.MeshStandardMaterial({ color: isBlacksmith ? 0x17110f : 0x2b1712, roughness: 0.82 });
  const wood = new THREE.MeshStandardMaterial({ color: 0x6a3a20, roughness: 0.72 });
  const accent = new THREE.MeshBasicMaterial({ color: isBlacksmith ? 0xd86a2a : 0x355f4b, transparent: true, opacity: 0.86 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x2d2420, roughness: 0.78 });
  const stone = new THREE.MeshStandardMaterial({ color: 0x4a463e, roughness: 0.9 });
  const cloth = new THREE.MeshBasicMaterial({ color: isBlacksmith ? 0x6b1f1a : 0x244b3d, transparent: true, opacity: 0.88 });
  const group = new THREE.Group();
  addBox3D(group, stone, 1.58 * scale, 0.08 * scale, 1.18 * scale, 0, 0.04 * scale, 0);
  addBox3D(group, wall, 1.44 * scale, 0.82 * scale, 1.08 * scale, 0, 0.45 * scale, 0);
  addBox3D(group, roofMat, 1.88 * scale, 0.25 * scale, 1.34 * scale, 0, 0.99 * scale, 0, 0, 0, isBlacksmith ? -0.06 : 0.08);
  addBox3D(group, roofMat, 1.98 * scale, 0.055 * scale, 1.42 * scale, 0, 1.14 * scale, 0);
  addBox3D(group, roofMat, 0.13 * scale, 0.08 * scale, 1.44 * scale, 0, 1.2 * scale, 0);
  addBox3D(group, wood, 0.34 * scale, 0.48 * scale, 0.018 * scale, 0, 0.3 * scale, -0.55 * scale);
  addBox3D(group, accent, 0.5 * scale, 0.18 * scale, 0.025 * scale, 0, 0.76 * scale, -0.58 * scale);
  for (const side of [-1, 1]) {
    addBox3D(group, wood, 0.07 * scale, 0.86 * scale, 0.07 * scale, side * 0.74 * scale, 0.48 * scale, -0.56 * scale);
    addBox3D(group, wood, 0.28 * scale, 0.18 * scale, 0.025 * scale, side * 0.42 * scale, 0.5 * scale, -0.57 * scale);
    addBox3D(group, accent, 0.014 * scale, 0.2 * scale, 0.32 * scale, side * 0.728 * scale, 0.52 * scale, 0.12 * scale);
    addBox3D(group, wood, 0.016 * scale, 0.23 * scale, 0.018 * scale, side * 0.736 * scale, 0.52 * scale, 0.12 * scale);
    addBox3D(group, wood, 0.016 * scale, 0.018 * scale, 0.34 * scale, side * 0.736 * scale, 0.52 * scale, 0.12 * scale);
  }
  addBox3D(group, wood, 1.1 * scale, 0.06 * scale, 0.2 * scale, 0, 0.12 * scale, -0.68 * scale);

  if (isBlacksmith) {
    addBox3D(group, dark, 0.22 * scale, 0.58 * scale, 0.2 * scale, 0.46 * scale, 1.22 * scale, 0.24 * scale);
    addBox3D(group, dark, 0.28 * scale, 0.08 * scale, 0.26 * scale, 0.46 * scale, 1.55 * scale, 0.24 * scale);
    addBox3D(group, accent, 0.36 * scale, 0.2 * scale, 0.32 * scale, -0.42 * scale, 0.2 * scale, -0.44 * scale);
    addBox3D(group, stone, 0.42 * scale, 0.08 * scale, 0.38 * scale, -0.42 * scale, 0.08 * scale, -0.44 * scale);
    addBox3D(group, dark, 0.42 * scale, 0.12 * scale, 0.18 * scale, 0.56 * scale, 0.18 * scale, -0.36 * scale);
    addBox3D(group, dark, 0.2 * scale, 0.08 * scale, 0.28 * scale, 0.56 * scale, 0.28 * scale, -0.36 * scale);
    addCylinder3D(group, dark, 0.025 * scale, 0.025 * scale, 0.62 * scale, 8, 0.08 * scale, 0.44 * scale, -0.62 * scale, 0, 0, 0.65);
    addBox3D(group, accent, 0.09 * scale, 0.05 * scale, 0.05 * scale, 0.26 * scale, 0.58 * scale, -0.62 * scale, 0, 0, 0.65);
  } else {
    addBox3D(group, cloth, 0.76 * scale, 0.08 * scale, 0.018 * scale, 0, 0.6 * scale, -0.59 * scale);
    for (let i = -1; i <= 1; i += 1) {
      addBox3D(group, cloth, 0.18 * scale, 0.2 * scale, 0.016 * scale, i * 0.2 * scale, 0.49 * scale, -0.6 * scale);
    }
    for (const side of [-1, 1]) {
      addBox3D(group, wood, 0.26 * scale, 0.2 * scale, 0.24 * scale, side * 0.56 * scale, 0.14 * scale, -0.5 * scale);
      addBox3D(group, dark, 0.24 * scale, 0.025 * scale, 0.25 * scale, side * 0.56 * scale, 0.25 * scale, -0.5 * scale);
    }
    addBox3D(group, wood, 0.28 * scale, 0.52 * scale, 0.08 * scale, -0.66 * scale, 0.33 * scale, -0.18 * scale);
    addBox3D(group, wood, 0.08 * scale, 0.52 * scale, 0.28 * scale, 0.66 * scale, 0.33 * scale, -0.12 * scale);
  }

  group.position.set(x, sceneHillHeight(x, z), z);
  group.rotation.y = rotation;
  world3d.add(group);
}

function makeVillagerNpc(x, z, scale = SMALL_ACTOR_SCALE, prop = {}) {
  const robe = new THREE.MeshStandardMaterial({ color: prop.robe || 0x6b5a3a, roughness: 0.76 });
  const robeDark = new THREE.MeshStandardMaterial({ color: prop.robe ? 0x2c241c : 0x3a2d1c, roughness: 0.82 });
  const robeTrim = new THREE.MeshStandardMaterial({ color: 0x99764a, roughness: 0.72, metalness: 0.04 });
  const hair = new THREE.MeshStandardMaterial({ color: 0x120d0c, roughness: 0.84 });
  const skin = new THREE.MeshStandardMaterial({ color: 0xe4ceb0, roughness: 0.64 });
  const wood = new THREE.MeshStandardMaterial({ color: 0x6a3a20, roughness: 0.72 });
  const sandal = new THREE.MeshStandardMaterial({ color: 0x3d2f22, roughness: 0.82 });
  const white = new THREE.MeshBasicMaterial({ color: 0xeee6d2, transparent: true, opacity: 0.82 });
  const group = new THREE.Group();

  addCylinder3D(group, robe, 0.17 * scale, 0.24 * scale, 0.44 * scale, 16, 0, 0.26 * scale, 0);
  addCylinder3D(group, robe, 0.15 * scale, 0.2 * scale, 0.3 * scale, 14, 0, 0.61 * scale, -0.01 * scale);
  addCylinder3D(group, robeTrim, 0.19 * scale, 0.21 * scale, 0.08 * scale, 14, 0, 0.46 * scale, -0.005 * scale);
  addBox3D(group, robeDark, 0.42 * scale, 0.045 * scale, 0.08 * scale, 0, 0.45 * scale, -0.01 * scale);
  addBox3D(group, robeTrim, 0.14 * scale, 0.22 * scale, 0.02 * scale, -0.06 * scale, 0.6 * scale, -0.18 * scale, 0, 0, -0.12);
  addBox3D(group, robeTrim, 0.14 * scale, 0.22 * scale, 0.02 * scale, 0.06 * scale, 0.6 * scale, -0.18 * scale, 0, 0, 0.12);

  for (const side of [-1, 1]) {
    addBox3D(group, robe, 0.1 * scale, 0.28 * scale, 0.09 * scale, side * 0.2 * scale, 0.57 * scale, -0.02 * scale, 0.06, 0, side * 0.18);
    addBox3D(group, robeDark, 0.07 * scale, 0.11 * scale, 0.07 * scale, side * 0.24 * scale, 0.42 * scale, -0.08 * scale, 0.08, 0, side * 0.12);
    addSphere3D(group, skin, 0.044 * scale, 12, 8, side * 0.27 * scale, 0.31 * scale, -0.1 * scale);
    addCylinder3D(group, robeDark, 0.047 * scale, 0.05 * scale, 0.22 * scale, 10, side * 0.08 * scale, 0.08 * scale, 0.03 * scale);
    addBox3D(group, sandal, 0.08 * scale, 0.026 * scale, 0.13 * scale, side * 0.08 * scale, -0.045 * scale, 0.07 * scale);
  }

  addCylinder3D(group, skin, 0.042 * scale, 0.046 * scale, 0.07 * scale, 12, 0, 0.73 * scale, -0.01 * scale);
  addSphere3D(group, skin, 0.15 * scale, 20, 14, 0, 0.87 * scale, 0);
  addSphere3D(group, hair, 0.156 * scale, 18, 10, 0, 0.93 * scale, 0.01 * scale, 1, 0.7, 0.95);
  addSphere3D(group, hair, 0.062 * scale, 12, 10, 0.04 * scale, 1.03 * scale, 0.058 * scale, 1, 0.84, 1);
  addBox3D(group, hair, 0.07 * scale, 0.07 * scale, 0.038 * scale, -0.115 * scale, 0.86 * scale, -0.028 * scale, 0, 0, -0.28);
  addBox3D(group, hair, 0.07 * scale, 0.07 * scale, 0.038 * scale, 0.115 * scale, 0.86 * scale, -0.028 * scale, 0, 0, 0.28);
  addBox3D(group, white, 0.028 * scale, 0.012 * scale, 0.006 * scale, -0.05 * scale, 0.87 * scale, -0.14 * scale);
  addBox3D(group, white, 0.028 * scale, 0.012 * scale, 0.006 * scale, 0.05 * scale, 0.87 * scale, -0.14 * scale);
  addBox3D(group, robeDark, 0.09 * scale, 0.01 * scale, 0.006 * scale, -0.05 * scale, 0.89 * scale, -0.146 * scale);
  addBox3D(group, robeDark, 0.09 * scale, 0.01 * scale, 0.006 * scale, 0.05 * scale, 0.89 * scale, -0.146 * scale);

  if (prop.role === "blacksmith") {
    addBox3D(group, robeDark, 0.22 * scale, 0.24 * scale, 0.022 * scale, 0, 0.5 * scale, -0.19 * scale);
    addCylinder3D(group, wood, 0.02 * scale, 0.02 * scale, 0.36 * scale, 10, 0.24 * scale, 0.5 * scale, -0.1 * scale, 0, 0, -0.58);
    addBox3D(group, robeDark, 0.18 * scale, 0.08 * scale, 0.07 * scale, 0.33 * scale, 0.62 * scale, -0.09 * scale, 0, 0, -0.58);
    addBox3D(group, robeTrim, 0.06 * scale, 0.03 * scale, 0.02 * scale, -0.02 * scale, 0.61 * scale, -0.21 * scale);
  } else if (prop.role === "shopkeeper") {
    addBox3D(group, wood, 0.42 * scale, 0.042 * scale, 0.18 * scale, 0, 0.48 * scale, -0.18 * scale);
    for (const offset of [-0.12, 0, 0.12]) {
      addSphere3D(group, white, 0.03 * scale, 12, 8, offset * scale, 0.54 * scale, -0.18 * scale);
    }
    addBox3D(group, robeTrim, 0.28 * scale, 0.018 * scale, 0.016 * scale, 0, 0.98 * scale, -0.02 * scale);
  } else if (prop.role === "elder") {
    addCylinder3D(group, wood, 0.018 * scale, 0.018 * scale, 0.72 * scale, 10, 0.24 * scale, 0.38 * scale, 0, 0, 0, 0.15);
    addSphere3D(group, robeDark, 0.04 * scale, 12, 8, 0.29 * scale, 0.72 * scale, 0);
    addBox3D(group, white, 0.08 * scale, 0.08 * scale, 0.02 * scale, 0, 0.77 * scale, -0.14 * scale);
  }

  group.position.set(x, sceneHillHeight(x, z), z);
  group.rotation.y = prop.rotation || 0;
  world3d.add(group);
}

function makeFence(x, z, scale = 1, rotation = 0) {
  const wood = new THREE.MeshStandardMaterial({ color: 0xded8c8, roughness: 0.78 });
  const rope = new THREE.MeshStandardMaterial({ color: 0x8a6b36, roughness: 0.82 });
  const group = new THREE.Group();
  for (let i = -1; i <= 1; i += 1) {
    addBox3D(group, wood, 0.08 * scale, 0.58 * scale, 0.08 * scale, i * 0.34 * scale, 0.29 * scale, 0);
    addBox3D(group, wood, 0.12 * scale, 0.055 * scale, 0.12 * scale, i * 0.34 * scale, 0.61 * scale, 0);
  }
  addBox3D(group, wood, 0.82 * scale, 0.055 * scale, 0.06 * scale, 0, 0.48 * scale, 0);
  addBox3D(group, wood, 0.82 * scale, 0.05 * scale, 0.055 * scale, 0, 0.28 * scale, 0);
  addCylinder3D(group, rope, 0.014 * scale, 0.014 * scale, 0.78 * scale, 8, 0, 0.39 * scale, -0.045 * scale, 0, 0, Math.PI / 2);
  addBox3D(group, rope, 0.72 * scale, 0.028 * scale, 0.025 * scale, 0, 0.38 * scale, 0.045 * scale, 0, 0, 0.14);
  group.position.set(x, sceneHillHeight(x, z), z);
  group.rotation.y = rotation;
  world3d.add(group);
}

function makeShrine(x, z, scale = 1, rotation = 0) {
  const wall = new THREE.MeshStandardMaterial({ color: 0xded8c8, roughness: 0.84 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x2a1713, roughness: 0.82 });
  const wood = new THREE.MeshStandardMaterial({ color: 0x5b2a1c, roughness: 0.7 });
  const vermilion = new THREE.MeshStandardMaterial({ color: 0x6a1f1a, roughness: 0.64 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xcaa65a, roughness: 0.42, metalness: 0.18 });
  const paper = new THREE.MeshBasicMaterial({ color: 0xf0eadc, transparent: true, opacity: 0.75 });
  const group = new THREE.Group();
  addBox3D(group, wood, 1.9 * scale, 0.14 * scale, 1.42 * scale, 0, 0.07 * scale, 0);
  addBox3D(group, wall, 1.72 * scale, 0.9 * scale, 1.24 * scale, 0, 0.58 * scale, 0);
  for (const side of [-1, 1]) {
    addCylinder3D(group, vermilion, 0.055 * scale, 0.065 * scale, 0.96 * scale, 14, side * 0.74 * scale, 0.58 * scale, 0.63 * scale);
    addCylinder3D(group, vermilion, 0.055 * scale, 0.065 * scale, 0.96 * scale, 14, side * 0.74 * scale, 0.58 * scale, -0.63 * scale);
    addBox3D(group, vermilion, 0.08 * scale, 0.55 * scale, 0.06 * scale, side * 0.35 * scale, 0.5 * scale, 0.64 * scale);
  }
  addBox3D(group, roofMat, 2.14 * scale, 0.24 * scale, 1.58 * scale, 0, 1.12 * scale, 0);
  addBox3D(group, roofMat, 2.34 * scale, 0.08 * scale, 1.74 * scale, 0, 1.24 * scale, 0);
  addBox3D(group, roofMat, 0.16 * scale, 0.1 * scale, 1.76 * scale, 0, 1.32 * scale, 0);
  addBox3D(group, gold, 0.42 * scale, 0.18 * scale, 0.035 * scale, 0, 0.86 * scale, 0.66 * scale);
  addBox3D(group, paper, 0.56 * scale, 0.44 * scale, 0.016 * scale, 0, 0.58 * scale, 0.642 * scale);
  for (let i = 0; i < 3; i += 1) {
    addBox3D(group, wood, (1.16 - i * 0.16) * scale, 0.08 * scale, 0.34 * scale, 0, (0.06 + i * 0.08) * scale, (0.94 + i * 0.1) * scale);
  }
  addBox3D(group, wood, 1.18 * scale, 0.055 * scale, 0.05 * scale, 0, 0.42 * scale, 0.9 * scale);
  for (const side of [-1, 1]) {
    addCylinder3D(group, wood, 0.025 * scale, 0.025 * scale, 0.7 * scale, 8, side * 0.62 * scale, 0.38 * scale, 0.88 * scale);
    addBox3D(group, wood, 0.05 * scale, 0.05 * scale, 0.42 * scale, side * 0.62 * scale, 0.42 * scale, 1.04 * scale);
  }
  group.position.set(x, sceneHillHeight(x, z), z);
  group.rotation.y = rotation;
  world3d.add(group);
}

function makeDonationBox(x, z, scale = 1, rotation = 0) {
  const wood = new THREE.MeshStandardMaterial({ color: 0x7b4a25, roughness: 0.78 });
  const cord = new THREE.MeshBasicMaterial({ color: 0xe1c887, transparent: true, opacity: 0.82 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x2d241c, roughness: 0.82 });
  const group = new THREE.Group();
  addBox3D(group, wood, 0.68 * scale, 0.34 * scale, 0.42 * scale, 0, 0.17 * scale, 0);
  addBox3D(group, dark, 0.72 * scale, 0.08 * scale, 0.46 * scale, 0, 0.38 * scale, 0);
  addBox3D(group, cord, 0.5 * scale, 0.016 * scale, 0.05 * scale, 0, 0.43 * scale, 0);
  for (let i = -2; i <= 2; i += 1) {
    addBox3D(group, dark, 0.025 * scale, 0.3 * scale, 0.018 * scale, i * 0.12 * scale, 0.19 * scale, -0.215 * scale);
  }
  addCylinder3D(group, cord, 0.018 * scale, 0.018 * scale, 0.42 * scale, 8, 0, 0.58 * scale, -0.08 * scale);
  addSphere3D(group, cord, 0.055 * scale, 12, 8, 0, 0.34 * scale, -0.08 * scale);
  group.position.set(x, sceneHillHeight(x, z), z);
  group.rotation.y = rotation;
  world3d.add(group);
}

function makeMusician(x, z, scale = 1) {
  const robe = new THREE.MeshStandardMaterial({ color: 0x1f4d83, roughness: 0.76 });
  const robeDark = new THREE.MeshStandardMaterial({ color: 0x123257, roughness: 0.82 });
  const robeTrim = new THREE.MeshStandardMaterial({ color: 0x8f6f40, roughness: 0.72, metalness: 0.05 });
  const hair = new THREE.MeshStandardMaterial({ color: 0x130d0c, roughness: 0.86 });
  const skin = new THREE.MeshStandardMaterial({ color: 0xe6d0b5, roughness: 0.64 });
  const wood = new THREE.MeshStandardMaterial({ color: 0x6a3a20, roughness: 0.68 });
  const stringMat = new THREE.MeshBasicMaterial({ color: 0xe1c887, transparent: true, opacity: 0.84 });
  const white = new THREE.MeshBasicMaterial({ color: 0xf1eadc, transparent: true, opacity: 0.82 });
  const cushion = new THREE.MeshStandardMaterial({ color: 0x304051, roughness: 0.86 });
  const group = new THREE.Group();

  addCylinder3D(group, cushion, 0.3 * scale, 0.34 * scale, 0.08 * scale, 16, 0, 0.04 * scale, 0.02 * scale);
  addBox3D(group, robeDark, 0.34 * scale, 0.16 * scale, 0.2 * scale, 0, 0.14 * scale, 0.06 * scale, 0.08, 0, 0);
  addBox3D(group, robeDark, 0.34 * scale, 0.16 * scale, 0.2 * scale, 0, 0.14 * scale, -0.12 * scale, -0.08, 0, 0);

  addCylinder3D(group, robe, 0.26 * scale, 0.35 * scale, 0.34 * scale, 16, 0, 0.2 * scale, 0);
  addCylinder3D(group, robe, 0.18 * scale, 0.23 * scale, 0.52 * scale, 16, 0, 0.57 * scale, -0.01 * scale);
  addCylinder3D(group, robeTrim, 0.2 * scale, 0.24 * scale, 0.08 * scale, 14, 0, 0.54 * scale, -0.01 * scale);
  addBox3D(group, robeDark, 0.42 * scale, 0.05 * scale, 0.08 * scale, 0, 0.55 * scale, -0.02 * scale);
  addBox3D(group, robeTrim, 0.12 * scale, 0.22 * scale, 0.02 * scale, -0.06 * scale, 0.66 * scale, -0.19 * scale, 0, 0, -0.12);
  addBox3D(group, robeTrim, 0.12 * scale, 0.22 * scale, 0.02 * scale, 0.06 * scale, 0.66 * scale, -0.19 * scale, 0, 0, 0.12);

  addCylinder3D(group, skin, 0.044 * scale, 0.05 * scale, 0.08 * scale, 12, 0, 0.77 * scale, -0.015 * scale);
  addSphere3D(group, skin, 0.16 * scale, 20, 14, 0, 0.93 * scale, 0);
  addSphere3D(group, hair, 0.172 * scale, 20, 10, 0, 1.01 * scale, 0, 1, 0.74, 0.94);
  addSphere3D(group, hair, 0.066 * scale, 14, 10, 0, 1.11 * scale, 0.052 * scale, 1, 0.86, 1);
  addBox3D(group, hair, 0.08 * scale, 0.08 * scale, 0.038 * scale, -0.118 * scale, 0.93 * scale, -0.03 * scale, 0, 0, -0.3);
  addBox3D(group, hair, 0.08 * scale, 0.08 * scale, 0.038 * scale, 0.118 * scale, 0.93 * scale, -0.03 * scale, 0, 0, 0.3);
  addBox3D(group, white, 0.032 * scale, 0.012 * scale, 0.006 * scale, -0.05 * scale, 0.95 * scale, -0.145 * scale);
  addBox3D(group, white, 0.032 * scale, 0.012 * scale, 0.006 * scale, 0.05 * scale, 0.95 * scale, -0.145 * scale);

  for (const side of [-1, 1]) {
    addBox3D(group, robe, 0.1 * scale, 0.28 * scale, 0.08 * scale, side * 0.22 * scale, 0.58 * scale, -0.12 * scale, 0.2, 0, side * 0.24);
    addBox3D(group, robeDark, 0.08 * scale, 0.12 * scale, 0.07 * scale, side * 0.26 * scale, 0.44 * scale, -0.22 * scale, 0.18, 0, side * 0.2);
    addSphere3D(group, skin, 0.045 * scale, 12, 8, side * 0.29 * scale, 0.4 * scale, -0.35 * scale);
  }

  addBox3D(group, wood, 0.98 * scale, 0.1 * scale, 0.24 * scale, 0, 0.38 * scale, -0.42 * scale, -0.08);
  addBox3D(group, wood, 0.08 * scale, 0.12 * scale, 0.26 * scale, -0.52 * scale, 0.39 * scale, -0.42 * scale, -0.08);
  addBox3D(group, wood, 0.08 * scale, 0.12 * scale, 0.26 * scale, 0.52 * scale, 0.39 * scale, -0.42 * scale, -0.08);
  addBox3D(group, wood, 0.12 * scale, 0.08 * scale, 0.18 * scale, -0.18 * scale, 0.42 * scale, -0.42 * scale);
  addBox3D(group, wood, 0.12 * scale, 0.08 * scale, 0.18 * scale, 0.18 * scale, 0.42 * scale, -0.42 * scale);
  for (let i = 0; i < 7; i += 1) {
    addBox3D(group, stringMat, 0.84 * scale, 0.008 * scale, 0.008 * scale, 0, (0.44 + i * 0.005) * scale, (-0.51 + i * 0.032) * scale);
    if (i % 2 === 0) {
      addBox3D(group, robeTrim, 0.02 * scale, 0.018 * scale, 0.04 * scale, (-0.24 + i * 0.08) * scale, 0.43 * scale, (-0.49 + i * 0.032) * scale);
    }
  }

  group.position.set(x, sceneHillHeight(x, z), z);
  group.rotation.y = -0.35;
  world3d.add(group);
}

function makeMistTexture(size = 256) {
  const fogCanvas = document.createElement("canvas");
  fogCanvas.width = size;
  fogCanvas.height = size;
  const fogCtx = fogCanvas.getContext("2d");
  const gradient = fogCtx.createRadialGradient(size * 0.5, size * 0.5, size * 0.08, size * 0.5, size * 0.5, size * 0.5);
  gradient.addColorStop(0, "rgba(255, 255, 255, 0.85)");
  gradient.addColorStop(0.58, "rgba(255, 255, 255, 0.28)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
  fogCtx.fillStyle = gradient;
  fogCtx.fillRect(0, 0, size, size);

  for (let i = 0; i < 480; i += 1) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 6 + Math.random() * 24;
    fogCtx.fillStyle = `rgba(255, 255, 255, ${0.015 + Math.random() * 0.035})`;
    fogCtx.beginPath();
    fogCtx.arc(x, y, r, 0, TWO_PI);
    fogCtx.fill();
  }

  const texture = new THREE.CanvasTexture(fogCanvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2.6, 2.6);
  texture.needsUpdate = true;
  return texture;
}

function makeMistField() {
  const texture = makeMistTexture();
  const size = worldLen(VISUAL_WORLD_SIZE);
  texture.repeat.set(size * 0.18, size * 0.18);
  mistField3d = new THREE.Group();
  mistField3d.name = "Global Mist Field";

  for (let i = 0; i < 4; i += 1) {
    const mist = new THREE.Mesh(
      new THREE.PlaneGeometry(size * (1.02 + i * 0.08), size * (1.02 + i * 0.08)),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        map: texture,
        transparent: true,
        opacity: 0.048 - i * 0.006,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );
    mist.rotation.x = -Math.PI / 2;
    mist.rotation.z = i * 0.64;
    mist.position.y = 0.12 + i * 0.13;
    mist.renderOrder = -1;
    mistField3d.add(mist);
  }

  world3d.add(mistField3d);
}

function makePlayer3D() {
  const group = new THREE.Group();
  const s = SMALL_ACTOR_SCALE;
  const cloth = new THREE.MeshStandardMaterial({ color: 0x2d2420, roughness: 0.78 });
  const clothLight = new THREE.MeshStandardMaterial({ color: 0x4a4036, roughness: 0.8 });
  const clothDark = new THREE.MeshStandardMaterial({ color: 0x221b17, roughness: 0.84 });
  const trim = new THREE.MeshStandardMaterial({ color: 0xcaa65a, roughness: 0.42, metalness: 0.2 });
  const skin = new THREE.MeshStandardMaterial({ color: 0xe9dfc8, roughness: 0.64 });
  const steel = new THREE.MeshStandardMaterial({ color: 0xc6c7bd, roughness: 0.28, metalness: 0.72 });
  const hair = new THREE.MeshStandardMaterial({ color: 0x120d0c, roughness: 0.84 });
  const guardMat = new THREE.MeshStandardMaterial({ color: 0x7b4a25, roughness: 0.52, metalness: 0.1 });
  const sandal = new THREE.MeshStandardMaterial({ color: 0x352a22, roughness: 0.84 });

  const body = new THREE.Group();
  body.name = "body";
  body.position.y = 0.46 * s;
  addCylinder3D(body, cloth, 0.22 * s, 0.34 * s, 0.7 * s, 16, 0, 0, 0);
  addCylinder3D(body, clothLight, 0.15 * s, 0.21 * s, 0.34 * s, 14, 0, 0.15 * s, -0.02 * s);
  addCylinder3D(body, trim, 0.25 * s, 0.27 * s, 0.08 * s, 14, 0, 0.18 * s, 0.01 * s);
  addBox3D(body, clothLight, 0.17 * s, 0.5 * s, 0.03 * s, -0.082 * s, -0.03 * s, -0.22 * s, 0, 0, -0.1);
  addBox3D(body, clothLight, 0.17 * s, 0.5 * s, 0.03 * s, 0.082 * s, -0.03 * s, -0.22 * s, 0, 0, 0.1);
  addBox3D(body, trim, 0.13 * s, 0.2 * s, 0.02 * s, -0.062 * s, 0.2 * s, -0.23 * s, 0, 0, -0.1);
  addBox3D(body, trim, 0.13 * s, 0.2 * s, 0.02 * s, 0.062 * s, 0.2 * s, -0.23 * s, 0, 0, 0.1);
  for (const side of [-1, 1]) {
    addBox3D(body, cloth, 0.12 * s, 0.28 * s, 0.1 * s, side * 0.27 * s, 0.11 * s, -0.02 * s, 0.06, 0, side * 0.15);
    addBox3D(body, clothDark, 0.09 * s, 0.16 * s, 0.08 * s, side * 0.31 * s, -0.07 * s, -0.06 * s, 0.08, 0, side * 0.12);
    addSphere3D(body, skin, 0.047 * s, 12, 8, side * 0.335 * s, -0.21 * s, -0.08 * s);
    addCylinder3D(body, clothDark, 0.055 * s, 0.06 * s, 0.26 * s, 10, side * 0.085 * s, -0.36 * s, 0.05 * s);
    addBox3D(body, sandal, 0.085 * s, 0.028 * s, 0.14 * s, side * 0.085 * s, -0.51 * s, 0.11 * s);
  }

  const head = new THREE.Group();
  head.name = "head";
  head.position.y = 0.91 * s;
  addCylinder3D(head, skin, 0.048 * s, 0.056 * s, 0.07 * s, 12, 0, -0.16 * s, -0.005 * s);
  addSphere3D(head, skin, 0.17 * s, 20, 14, 0, 0, 0);
  addSphere3D(head, hair, 0.177 * s, 20, 10, 0, 0.08 * s, 0.02 * s, 1, 0.64, 0.95);
  addSphere3D(head, hair, 0.062 * s, 14, 10, 0.03 * s, 0.17 * s, 0.065 * s, 1, 0.84, 1);
  addBox3D(head, hair, 0.085 * s, 0.085 * s, 0.04 * s, -0.12 * s, -0.03 * s, -0.02 * s, 0, 0, -0.3);
  addBox3D(head, hair, 0.085 * s, 0.085 * s, 0.04 * s, 0.12 * s, -0.03 * s, -0.02 * s, 0, 0, 0.3);
  addBox3D(head, trim, 0.34 * s, 0.035 * s, 0.02 * s, 0, 0.03 * s, -0.15 * s);
  addBox3D(head, cloth, 0.04 * s, 0.12 * s, 0.035 * s, 0.18 * s, -0.06 * s, 0.04 * s, 0, 0, -0.24);
  addBox3D(head, cloth, 0.035 * s, 0.028 * s, 0.015 * s, -0.055 * s, -0.02 * s, -0.16 * s);
  addBox3D(head, cloth, 0.035 * s, 0.028 * s, 0.015 * s, 0.055 * s, -0.02 * s, -0.16 * s);

  const sash = addBox3D(group, trim, 0.56 * s, 0.08 * s, 0.1 * s, 0, 0.51 * s, 0, 0, 0, 0, "sash");
  sash.name = "sash";
  addBox3D(group, trim, 0.07 * s, 0.18 * s, 0.03 * s, 0.1 * s, 0.42 * s, -0.16 * s, 0, 0, 0.18);
  addBox3D(group, trim, 0.07 * s, 0.18 * s, 0.03 * s, -0.1 * s, 0.42 * s, -0.16 * s, 0, 0, -0.18);

  const sword = new THREE.Group();
  sword.name = "sword";
  sword.position.set(0.34 * s, 0.66 * s, -0.28 * s);
  sword.rotation.x = -0.32;
  addBox3D(sword, steel, 0.045 * s, 0.035 * s, 0.94 * s, 0, 0, 0);
  addBox3D(sword, steel, 0.022 * s, 0.02 * s, 0.36 * s, 0, 0, -0.48 * s);
  addBox3D(sword, guardMat, 0.19 * s, 0.035 * s, 0.05 * s, 0, 0, 0.42 * s);
  addCylinder3D(sword, guardMat, 0.025 * s, 0.025 * s, 0.28 * s, 10, 0, 0, 0.57 * s, Math.PI / 2);
  addSphere3D(sword, guardMat, 0.028 * s, 10, 8, 0, 0, 0.71 * s);
  addBox3D(sword, cloth, 0.06 * s, 0.04 * s, 0.72 * s, -0.18 * s, -0.08 * s, 0.04 * s, 0.24, 0.24, 0);
  group.add(body, head, sash, sword);

  slashRange3dValue = SLASH_RANGE;
  slashSector3d = new THREE.Mesh(
    makeSlashSectorGeometry(SLASH_RANGE),
    new THREE.MeshBasicMaterial({ color: 0xcaa65a, transparent: true, opacity: 0.0, side: THREE.DoubleSide, depthWrite: false }),
  );
  slashSector3d.rotation.x = Math.PI / 2;
  slashSector3d.position.y = 0.035;
  slashArc3d = new THREE.Mesh(
    makeSlashArcGeometry(SLASH_RANGE),
    new THREE.MeshBasicMaterial({ color: 0xf7f0da, transparent: true, opacity: 0.0, side: THREE.DoubleSide, depthWrite: false }),
  );
  slashArc3d.rotation.x = Math.PI / 2;
  slashArc3d.position.y = 0.04;
  group.add(slashSector3d, slashArc3d);

  observeRing3d = makeGroundRing(0.92, 0xc6c7bd, 0.0);
  purifyRing3d = makeGroundRing(1.18, 0xeee6d2, 0.0);
  scene3d.add(observeRing3d, purifyRing3d);
  return group;
}

function makeBoss3D() {
  const group = new THREE.Group();
  const shell = new THREE.MeshStandardMaterial({
    color: 0x140d0b,
    emissive: 0x3a1215,
    roughness: 0.56,
    metalness: 0.05,
  });
  const maskMat = new THREE.MeshStandardMaterial({ color: 0xd8cdb7, roughness: 0.48 });
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xe5b7aa, transparent: true, opacity: 0.9 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x080504, emissive: 0x180609, roughness: 0.72 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xcaa65a, emissive: 0x2a1a05, roughness: 0.34, metalness: 0.5 });
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.72, 32, 18), shell);
  body.scale.set(1, 1.35, 0.78);
  body.position.y = 0.96;
  body.castShadow = true;
  body.name = "body";
  group.add(body);

  for (let i = 0; i < 10; i += 1) {
    const angle = (i / 10) * TWO_PI;
    const length = 0.44 + (i % 3) * 0.1;
    const tendril = addCylinder3D(group, dark, 0.022, 0.05, length, 8, Math.cos(angle) * 0.48, 0.76 + (i % 2) * 0.12, Math.sin(angle) * 0.36, 0, angle, Math.PI / 2);
    tendril.scale.y = 1 + Math.sin(i) * 0.12;
  }

  const mask = addSphere3D(group, maskMat, 0.27, 18, 12, 0, 1.32, -0.52, 0.82, 1.15, 0.22);
  addBox3D(group, eyeMat, 0.09, 0.035, 0.012, -0.08, 1.36, -0.585, 0, 0, -0.16);
  addBox3D(group, eyeMat, 0.09, 0.035, 0.012, 0.08, 1.36, -0.585, 0, 0, 0.16);
  addBox3D(group, dark, 0.12, 0.018, 0.012, 0, 1.22, -0.59);
  addCylinder3D(group, maskMat, 0.025, 0.04, 0.22, 8, -0.18, 1.53, -0.51, 0.18, 0, -0.42);
  addCylinder3D(group, maskMat, 0.025, 0.04, 0.22, 8, 0.18, 1.53, -0.51, 0.18, 0, 0.42);
  const halo = finishMesh(new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.028, 8, 64), gold));
  halo.position.y = 0.96;
  halo.rotation.x = Math.PI / 2.5;
  group.add(halo);
  for (let i = 0; i < 6; i += 1) {
    const angle = (i / 6) * TWO_PI;
    addSphere3D(group, gold, 0.045, 12, 8, Math.cos(angle) * 0.7, 1.04 + Math.sin(angle * 1.7) * 0.08, Math.sin(angle) * 0.48);
  }
  wishCore3d = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 24, 14),
    new THREE.MeshBasicMaterial({ color: 0xe5b7aa, transparent: true, opacity: 0.0 }),
  );
  wishCore3d.position.set(0, 0.92, -0.64);
  group.add(wishCore3d);
  return group;
}

function initAudio() {
  if (audio) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  audio = new AudioContext();
}

function initSfx() {
  initAudio();
  if (!audio) return false;
  if (!sfxGain) {
    sfxGain = audio.createGain();
    sfxGain.connect(audio.destination);
  }
  updateSfxVolume();
  return true;
}

function initBgm() {
  initAudio();
  if (!audio) {
    document.body.dataset.bgm = "unsupported";
    updateBgmStatus("無聲");
    return false;
  }
  if (!bgmGain) {
    bgmGain = audio.createGain();
    bgmGain.connect(audio.destination);
  }
  document.body.dataset.bgmEngine = "web-audio";
  updateBgmVolume();
  return true;
}

function bgmFetchUrl(source) {
  if (location.protocol !== "file:") return source;
  return `${API_BASE}/${source.replace(/^\.\//, "")}`;
}

function sfxDatasetKey(kind) {
  return kind === "purify" ? "suzuPurify" : "suzuGate";
}

function updateSfxVolume() {
  const volume = clamp(audioSettings.sfxVolume, 0, 1);
  if (sfxGain && audio) sfxGain.gain.setTargetAtTime(volume, audio.currentTime, 0.02);
  document.body.dataset.sfxVolume = volume.toFixed(2);
}

function ensureSuzuBuffer(kind) {
  if (suzuBuffers[kind]) return Promise.resolve(suzuBuffers[kind]);
  if (!suzuBufferPromises[kind]) {
    suzuBufferPromises[kind] = loadSuzuBuffer(kind).catch((error) => {
      suzuBufferPromises[kind] = null;
      throw error;
    });
  }
  return suzuBufferPromises[kind];
}

function preloadSuzuBuffers() {
  if (!audio) return;
  for (const kind of Object.keys(SUZU_SFX_SOURCES)) {
    ensureSuzuBuffer(kind).catch(() => {});
  }
}

async function loadSuzuBuffer(kind) {
  const sources = SUZU_SFX_SOURCES[kind] || [];
  const key = sfxDatasetKey(kind);
  document.body.dataset[key] = "loading";
  let lastError;
  for (const source of sources) {
    const url = bgmFetchUrl(source);
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) throw new Error(`SFX ${response.status}`);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = await decodeAudioBuffer(audio, arrayBuffer);
      suzuBuffers[kind] = buffer;
      document.body.dataset[key] = "ready";
      document.body.dataset[`${key}Src`] = url;
      document.body.dataset[`${key}Duration`] = buffer.duration.toFixed(2);
      return buffer;
    } catch (error) {
      lastError = error;
    }
  }
  document.body.dataset[key] = "error";
  throw lastError || new Error(`SFX ${kind} load failed`);
}

function decodeAudioBuffer(context, arrayBuffer) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (buffer) => {
      if (settled) return;
      settled = true;
      resolve(buffer);
    };
    const fail = (error) => {
      if (settled) return;
      settled = true;
      reject(error);
    };
    const result = context.decodeAudioData(arrayBuffer, finish, fail);
    if (result?.then) result.then(finish, fail);
  });
}

async function loadBgmBuffer() {
  bgmLoadError = null;
  document.body.dataset.bgm = "loading";
  updateBgmStatus("戰取");

  let lastError;
  for (const source of BATTLE_BGM_SOURCES) {
    const url = bgmFetchUrl(source);
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) throw new Error(`BGM ${response.status}`);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = await decodeAudioBuffer(audio, arrayBuffer);
      bgmBuffer = buffer;
      bgmLoadError = null;
      document.body.dataset.bgmReady = "true";
      document.body.dataset.bgmSrc = url;
      document.body.dataset.bgmDuration = buffer.duration.toFixed(2);
      document.body.dataset.bgmTrack = "battle";
      updateBgmStatus(getBgmPlaybackStatus());
      return buffer;
    } catch (error) {
      lastError = error;
    }
  }

  bgmLoadError = lastError || new Error("BGM load failed");
  document.body.dataset.bgm = "error";
  document.body.dataset.bgmError = bgmLoadError?.name || "decode-failed";
  updateBgmStatus("讀取失敗");
  throw bgmLoadError;
}

function zoneBgmName(source) {
  return decodeURIComponent(String(source || ""))
    .split("/")
    .pop()
    ?.replace(/\.[^.]+$/, "") || "zone";
}

function normalizeZoneBgmSources(tracks) {
  const list = [...new Set((Array.isArray(tracks) ? tracks : [])
    .map((track) => String(track || "").trim())
    .filter(Boolean))];
  return list.length ? list : [...ZONE_BGM_SOURCES];
}

async function loadZoneBgmSources() {
  if (!zoneBgmSourcesPromise) {
    zoneBgmSourcesPromise = fetch(ZONE_BGM_PLAYLIST_ENDPOINT, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error(`Zone playlist ${response.status}`);
        return response.json();
      })
      .then((data) => {
        zoneBgmSources = normalizeZoneBgmSources(data?.tracks);
        document.body.dataset.zoneBgmCount = String(zoneBgmSources.length);
        return zoneBgmSources;
      })
      .catch((error) => {
        zoneBgmSources = normalizeZoneBgmSources(ZONE_BGM_SOURCES);
        document.body.dataset.zoneBgmCount = String(zoneBgmSources.length);
        throw error;
      });
  }
  try {
    return await zoneBgmSourcesPromise;
  } catch {
    return zoneBgmSources;
  }
}

function chooseZoneBgmSource(options = {}) {
  const sources = zoneBgmSources.length ? zoneBgmSources : ZONE_BGM_SOURCES;
  if (!sources.length) return "";
  const exclude = String(options.exclude || "");
  const pool = sources.length > 1 && exclude ? sources.filter((source) => source !== exclude) : sources;
  const candidates = pool.length ? pool : sources;
  return candidates[Math.floor(Math.random() * candidates.length)] || sources[0];
}

function ensureZoneBgmBuffer(source) {
  const key = String(source || "");
  if (!key) return Promise.reject(new Error("Zone BGM source missing"));
  if (zoneBgmBuffers.has(key)) return Promise.resolve(zoneBgmBuffers.get(key));
  if (!zoneBgmBufferPromises.has(key)) {
    const promise = loadZoneBgmBuffer(key)
      .then((buffer) => {
        zoneBgmBuffers.set(key, buffer);
        zoneBgmBufferPromises.delete(key);
        return buffer;
      })
      .catch((error) => {
        zoneBgmBufferPromises.delete(key);
        throw error;
      });
    zoneBgmBufferPromises.set(key, promise);
  }
  return zoneBgmBufferPromises.get(key);
}

async function loadZoneBgmBuffer(source) {
  zoneBgmLoadError = null;
  document.body.dataset.bgm = "loading";
  updateBgmStatus("境取");
  const url = bgmFetchUrl(source);
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`Zone BGM ${response.status}`);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = await decodeAudioBuffer(audio, arrayBuffer);
    zoneBgmLoadError = null;
    document.body.dataset.zoneBgmReady = "true";
    document.body.dataset.zoneBgmSrc = url;
    document.body.dataset.zoneBgmDuration = buffer.duration.toFixed(2);
    document.body.dataset.zoneBgmName = zoneBgmName(source);
    document.body.dataset.bgmTrack = "zone";
    updateBgmStatus(getBgmPlaybackStatus());
    return buffer;
  } catch (error) {
    zoneBgmLoadError = error || new Error("Zone BGM load failed");
    document.body.dataset.bgm = "error";
    document.body.dataset.zoneBgmError = zoneBgmLoadError?.name || "decode-failed";
    updateBgmStatus("境讀失敗");
    throw zoneBgmLoadError;
  }
}

async function ensureAudioRunning() {
  initAudio();
  if (!audio) return false;
  if (audio.state === "suspended") {
    try {
      await audio.resume();
    } catch {
      return false;
    }
  }
  return audio.state === "running";
}

function loadAudioSettings() {
  try {
    const stored = window.localStorage?.getItem(AUDIO_SETTINGS_KEY) || readAudioSettingsCookie();
    if (!stored) return { ...DEFAULT_AUDIO_SETTINGS };
    const parsed = JSON.parse(stored);
    return normalizeAudioSettings(parsed);
  } catch {
    return { ...DEFAULT_AUDIO_SETTINGS };
  }
}

function readAudioSettingsCookie() {
  const match = (document.cookie || "").match(new RegExp(`(?:^|; )${AUDIO_SETTINGS_KEY}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

function normalizeAudioSettings(settings) {
  return {
    sfxVolume: clamp(Number(settings?.sfxVolume ?? DEFAULT_AUDIO_SETTINGS.sfxVolume), 0, MAX_AUDIO_SETTING),
    bgmVolume: clamp(Number(settings?.bgmVolume ?? DEFAULT_AUDIO_SETTINGS.bgmVolume), 0, MAX_AUDIO_SETTING),
  };
}

function saveAudioSettings() {
  audioSettings = normalizeAudioSettings(audioSettings);
  const serialized = JSON.stringify(audioSettings);
  try {
    window.localStorage?.setItem(AUDIO_SETTINGS_KEY, serialized);
  } catch {
    // Local storage can be unavailable in private or embedded contexts.
  }
  try {
    document.cookie = `${AUDIO_SETTINGS_KEY}=${encodeURIComponent(serialized)}; max-age=31536000; path=/; SameSite=Lax`;
  } catch {
    // Cookie persistence is a best-effort fallback.
  }
}

function formatVolumeLevel(volume) {
  const value = clamp(volume, 0, MAX_AUDIO_SETTING);
  if (value <= 0.01) return "靜";
  if (value < 0.35) return "幽";
  if (value < 0.7) return "常";
  if (value < 0.9) return "響";
  return "滿";
}

function updateAudioSettingsUi() {
  const sfxPosition = Math.round((audioSettings.sfxVolume / MAX_AUDIO_SETTING) * 100);
  const bgmPosition = Math.round((audioSettings.bgmVolume / MAX_AUDIO_SETTING) * 100);
  ui.sfxVolumeSlider.value = String(sfxPosition);
  ui.bgmVolumeSlider.value = String(bgmPosition);
  ui.sfxVolumeValue.textContent = formatVolumeLevel(audioSettings.sfxVolume);
  ui.bgmVolumeValue.textContent = formatVolumeLevel(audioSettings.bgmVolume);
}

function updateBgmStatus(status) {
  if (!ui.bgmStatus) return;
  ui.bgmStatus.textContent = `BGM ${status}`;
}

function getBgmPlaybackStatus() {
  if (!audio) return "無聲";
  if (bgmRequested && bgmLoadError) return "戰讀失敗";
  if (zoneBgmRequested && zoneBgmLoadError) return "境讀失敗";
  if (bgmRequested && bgmBufferPromise && !bgmBuffer) return "戰取";
  if (zoneBgmRequested && zoneBgmSource == null && !zoneBgmCurrentBuffer) return "境取";
  if (audioSettings.bgmVolume <= 0.01) return "靜";
  if ((bgmRequested || zoneBgmRequested) && audio.state !== "running") return "受阻";
  if (bgmPlaying) return "戰";
  if (zoneBgmPlaying) return "境";
  return "待音";
}

function setSettingsPage(page = "menu") {
  const validPages = new Set(["menu", "account", "audio", "credits"]);
  const activePage = validPages.has(page) ? page : "menu";
  const showMenu = activePage === "menu";
  ui.settingsMenu.hidden = !showMenu;
  ui.settingsBackButton.hidden = showMenu;

  const pages = [
    [ui.settingsAccountPage, "account"],
    [ui.settingsAudioPage, "audio"],
    [ui.settingsCreditsPage, "credits"],
  ];
  for (const [node, key] of pages) {
    const active = activePage === key;
    node.hidden = !active;
    node.classList.toggle("active", active);
  }
}

function setSfxVolume(value) {
  audioSettings.sfxVolume = clamp((Number(value) / 100) * MAX_AUDIO_SETTING, 0, MAX_AUDIO_SETTING);
  saveAudioSettings();
  updateAudioSettingsUi();
  updateSfxVolume();
}

function setBgmVolume(value) {
  audioSettings.bgmVolume = clamp((Number(value) / 100) * MAX_AUDIO_SETTING, 0, MAX_AUDIO_SETTING);
  saveAudioSettings();
  updateAudioSettingsUi();
  updateBgmVolume();
}

function playSfxPreview() {
  if (!unlockAudio()) return;
  tone(392, 0.045, 0.014, "triangle");
  setTimeout(() => tone(588, 0.06, 0.012, "sine"), 45);
}

function playBgmPreview() {
  if (audioSettings.bgmVolume <= 0.01) setBgmVolume(50);
  if (getDisplayMode() === "playing") playBattleBgm(false);
  else playZoneBgm(false);
}

function updateBgmVolume() {
  const volume = clamp(audioSettings.bgmVolume, 0, 1);
  const gain = volume * BGM_GAIN_BOOST;
  if (bgmGain && audio) bgmGain.gain.setTargetAtTime(gain, audio.currentTime, 0.02);
  document.body.dataset.bgmVolume = volume.toFixed(2);
  document.body.dataset.bgmGain = gain.toFixed(2);
  updateBgmStatus(getBgmPlaybackStatus());
}

function stopBgmSource(rememberOffset = true) {
  if (bgmSource && rememberOffset && bgmBuffer?.duration) {
    bgmOffset = ((audio.currentTime - bgmStartedAt) % bgmBuffer.duration + bgmBuffer.duration) % bgmBuffer.duration;
  }
  if (bgmSource) {
    const source = bgmSource;
    bgmSource = null;
    source.onended = null;
    try {
      source.stop();
    } catch {
      // A source that has not fully started yet can already be stopped by the browser.
    }
    try {
      source.disconnect();
    } catch {
      // Disconnect is best-effort cleanup.
    }
  }
  bgmPlaying = false;
}

function startBgmSource(buffer) {
  stopBgmSource(false);
  const source = audio.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  source.connect(bgmGain);
  const offset = buffer.duration ? bgmOffset % buffer.duration : 0;
  bgmSource = source;
  bgmStartedAt = audio.currentTime - offset;
  source.onended = () => {
    if (bgmSource !== source) return;
    bgmSource = null;
    bgmPlaying = false;
    updateBgmStatus(getBgmPlaybackStatus());
  };
  source.start(0, offset);
  bgmPlaying = true;
  document.body.dataset.bgm = "playing";
  document.body.dataset.bgmTrack = "battle";
  updateBgmStatus(getBgmPlaybackStatus());
}

function stopZoneBgmSource(rememberOffset = true) {
  if (zoneBgmSource && rememberOffset && zoneBgmCurrentBuffer?.duration) {
    zoneBgmOffset = ((audio.currentTime - zoneBgmStartedAt) % zoneBgmCurrentBuffer.duration + zoneBgmCurrentBuffer.duration) % zoneBgmCurrentBuffer.duration;
  }
  if (zoneBgmSource) {
    const source = zoneBgmSource;
    zoneBgmSource = null;
    source.onended = null;
    try {
      source.stop();
    } catch {
      // A source that has not fully started yet can already be stopped by the browser.
    }
    try {
      source.disconnect();
    } catch {
      // Disconnect is best-effort cleanup.
    }
  }
  zoneBgmPlaying = false;
  if (!rememberOffset) zoneBgmOffset = 0;
}

function startZoneBgmSource(buffer, musicSource) {
  stopZoneBgmSource(false);
  const sourceNode = audio.createBufferSource();
  sourceNode.buffer = buffer;
  sourceNode.loop = false;
  sourceNode.connect(bgmGain);
  const offset = buffer.duration ? zoneBgmOffset % buffer.duration : 0;
  zoneBgmSource = sourceNode;
  zoneBgmCurrentBuffer = buffer;
  zoneBgmCurrentSource = musicSource;
  zoneBgmStartedAt = audio.currentTime - offset;
  sourceNode.onended = () => {
    if (zoneBgmSource !== sourceNode) return;
    zoneBgmSource = null;
    zoneBgmPlaying = false;
    zoneBgmOffset = 0;
    updateBgmStatus(getBgmPlaybackStatus());
    if (zoneBgmRequested) playZoneBgm(true, { exclude: musicSource }).catch(() => {});
  };
  sourceNode.start(0, offset);
  zoneBgmPlaying = true;
  document.body.dataset.bgm = "playing";
  document.body.dataset.bgmTrack = "zone";
  document.body.dataset.zoneBgmName = zoneBgmName(musicSource);
  updateBgmStatus(getBgmPlaybackStatus());
}

async function playBattleBgm(restart = true) {
  bgmRequested = true;
  zoneBgmRequested = false;
  zoneBgmPlayToken += 1;
  const token = ++bgmPlayToken;
  if (!initBgm()) return;
  const running = await ensureAudioRunning();
  if (token !== bgmPlayToken || !bgmRequested) return;
  if (!running) {
    document.body.dataset.bgm = "blocked";
    document.body.dataset.bgmError = "audio-context-suspended";
    updateBgmStatus("受阻");
    return;
  }
  updateBgmVolume();
  if (restart) {
    stopBgmSource(false);
    bgmOffset = 0;
  }
  stopZoneBgmSource(true);
  if (!bgmBufferPromise) bgmBufferPromise = loadBgmBuffer();
  if (!restart && bgmPlaying) {
    updateBgmStatus(getBgmPlaybackStatus());
    return;
  }
  updateBgmStatus(audioSettings.bgmVolume <= 0.01 ? "靜" : "戰取");
  try {
    const buffer = await bgmBufferPromise;
    if (token !== bgmPlayToken || !bgmRequested) return;
    startBgmSource(buffer);
  } catch (error) {
    bgmBufferPromise = null;
    document.body.dataset.bgm = "error";
    document.body.dataset.bgmError = error?.name || "decode-failed";
    updateBgmStatus("讀取失敗");
  }
}

function pauseBattleBgm() {
  bgmRequested = false;
  bgmPlayToken += 1;
  stopBgmSource(true);
  document.body.dataset.bgm = "paused";
  updateBgmStatus("止");
}

async function playZoneBgm(restart = false, options = {}) {
  zoneBgmRequested = true;
  bgmRequested = false;
  bgmPlayToken += 1;
  const token = ++zoneBgmPlayToken;
  if (!initBgm()) return;
  const running = await ensureAudioRunning();
  if (token !== zoneBgmPlayToken || !zoneBgmRequested) return;
  if (!running) {
    document.body.dataset.bgm = "blocked";
    document.body.dataset.bgmError = "audio-context-suspended";
    updateBgmStatus("受阻");
    return;
  }
  updateBgmVolume();
  if (restart) {
    stopZoneBgmSource(false);
    zoneBgmOffset = 0;
    zoneBgmCurrentBuffer = null;
  }
  stopBgmSource(true);
  if (!restart && zoneBgmPlaying) {
    updateBgmStatus(getBgmPlaybackStatus());
    return;
  }
  await loadZoneBgmSources();
  if (token !== zoneBgmPlayToken || !zoneBgmRequested) return;
  updateBgmStatus(audioSettings.bgmVolume <= 0.01 ? "靜" : "境取");
  try {
    const chosenSource = (!restart && zoneBgmCurrentSource)
      ? zoneBgmCurrentSource
      : chooseZoneBgmSource({ exclude: options.exclude || zoneBgmCurrentSource });
    if (!chosenSource) throw new Error("Zone BGM unavailable");
    const buffer = await ensureZoneBgmBuffer(chosenSource);
    if (token !== zoneBgmPlayToken || !zoneBgmRequested) return;
    startZoneBgmSource(buffer, chosenSource);
  } catch (error) {
    document.body.dataset.bgm = "error";
    document.body.dataset.zoneBgmError = error?.name || "decode-failed";
    updateBgmStatus("境讀失敗");
  }
}

function pauseZoneBgm() {
  zoneBgmRequested = false;
  zoneBgmPlayToken += 1;
  stopZoneBgmSource(true);
  document.body.dataset.bgm = "paused";
  updateBgmStatus("止");
}

function pauseAllBgm() {
  bgmRequested = false;
  zoneBgmRequested = false;
  bgmPlayToken += 1;
  zoneBgmPlayToken += 1;
  stopBgmSource(true);
  stopZoneBgmSource(true);
  document.body.dataset.bgm = "paused";
  updateBgmStatus("止");
}

function pauseBgmForInactivePage() {
  stopPurifySuzu(false);
  pauseAllBgm();
}

function unlockAudio() {
  initSfx();
  if (audio?.state === "suspended") audio.resume().catch(() => {});
  preloadSuzuBuffers();
  return Boolean(audio);
}

function tone(freq, duration = 0.08, gain = 0.025, type = "sine") {
  if (!audio) return;
  const finalGain = clamp(gain * SFX_GAIN_BOOST * audioSettings.sfxVolume, 0, MAX_TONE_GAIN);
  if (finalGain <= 0.0001) return;
  const osc = audio.createOscillator();
  const vol = audio.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  vol.gain.value = 0.0001;
  osc.connect(vol);
  vol.connect(audio.destination);
  const now = audio.currentTime;
  vol.gain.exponentialRampToValueAtTime(finalGain, now + 0.012);
  vol.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

function scheduledTone(freq, delay = 0, duration = 0.08, gain = 0.025, type = "sine") {
  if (!audio) return;
  const finalGain = clamp(gain * SFX_GAIN_BOOST * audioSettings.sfxVolume, 0, MAX_TONE_GAIN);
  if (finalGain <= 0.0001) return;
  const osc = audio.createOscillator();
  const vol = audio.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(vol);
  vol.connect(audio.destination);
  const start = audio.currentTime + Math.max(0, delay);
  vol.gain.setValueAtTime(0.0001, start);
  vol.gain.exponentialRampToValueAtTime(finalGain, start + 0.01);
  vol.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.start(start);
  osc.stop(start + duration + 0.03);
}

function playGeneratedSuzuBell(kind = "gate") {
  const purify = kind === "purify";
  const baseGain = purify ? 0.014 : 0.009;
  const baseDelay = purify ? 0 : 0.015;
  const notes = [
    [1046.5, 0, 0.22, baseGain, "sine"],
    [1318.5, 0.012, 0.18, baseGain * 0.78, "triangle"],
    [1568, 0.026, 0.2, baseGain * 0.64, "sine"],
    [2093, 0.044, 0.14, baseGain * 0.42, "sine"],
  ];
  if (purify) {
    notes.push(
      [1174.7, 0.12, 0.2, baseGain * 0.8, "sine"],
      [1760, 0.145, 0.17, baseGain * 0.5, "triangle"],
      [2349.3, 0.18, 0.13, baseGain * 0.34, "sine"],
    );
  }
  for (const [freq, delay, duration, gain, type] of notes) {
    scheduledTone(freq, baseDelay + delay, duration, gain, type);
  }
}

async function playSuzuBell(kind = "gate") {
  if (!unlockAudio()) return;
  const running = await ensureAudioRunning();
  if (!running) return;
  try {
    const buffer = await ensureSuzuBuffer(kind);
    const source = audio.createBufferSource();
    source.buffer = buffer;
    source.connect(sfxGain);
    source.start();
  } catch {
    playGeneratedSuzuBell(kind);
  }
}

async function startPurifySuzu() {
  if (purifySuzuSource) return;
  const token = ++purifySuzuToken;
  if (!unlockAudio()) return;
  const running = await ensureAudioRunning();
  if (token !== purifySuzuToken || !running) return;
  try {
    const buffer = await ensureSuzuBuffer("purify");
    if (token !== purifySuzuToken || purifySuzuSource) return;
    const source = audio.createBufferSource();
    const gain = audio.createGain();
    source.buffer = buffer;
    source.loop = true;
    source.connect(gain);
    gain.connect(sfxGain);
    const now = audio.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(1, now + 0.04);
    source.onended = () => {
      if (purifySuzuSource === source) {
        purifySuzuSource = null;
        purifySuzuGain = null;
      }
    };
    purifySuzuSource = source;
    purifySuzuGain = gain;
    source.start(now);
  } catch {
    playGeneratedSuzuBell("purify");
  }
}

function stopPurifySuzu(fade = true) {
  purifySuzuToken += 1;
  const source = purifySuzuSource;
  const gain = purifySuzuGain;
  purifySuzuSource = null;
  purifySuzuGain = null;
  if (!source) return;

  const cleanup = () => {
    try {
      source.stop();
    } catch {
      // Already stopped sources are harmless.
    }
    try {
      source.disconnect();
    } catch {
      // Disconnect is best-effort cleanup.
    }
    try {
      gain?.disconnect();
    } catch {
      // Disconnect is best-effort cleanup.
    }
  };

  if (!fade || !audio || !gain) {
    cleanup();
    return;
  }
  const now = audio.currentTime;
  gain.gain.cancelScheduledValues(now);
  gain.gain.setTargetAtTime(0.0001, now, 0.025);
  setTimeout(cleanup, 120);
}

function buttonTone(button, kind = "press") {
  if (kind === "hover") {
    if (!audio || audio.state !== "running") return;
    const now = performance.now();
    if (now - lastButtonHoverSound < 95) return;
    lastButtonHoverSound = now;
    tone(880, 0.024, 0.006, "sine");
    return;
  }

  if (!unlockAudio()) return;

  if (button.classList.contains("danger")) {
    tone(130, 0.07, 0.014, "sawtooth");
    setTimeout(() => tone(92, 0.08, 0.01, "triangle"), 38);
  } else if (button.classList.contains("primary")) {
    tone(460, 0.045, 0.016, "triangle");
    setTimeout(() => tone(690, 0.05, 0.012, "sine"), 42);
  } else {
    tone(320, 0.04, 0.011, "triangle");
    setTimeout(() => tone(430, 0.035, 0.007, "sine"), 36);
  }
}

function buttonFromEvent(event) {
  const target = event.target;
  if (!target?.closest) return null;
  const button = target.closest("button");
  if (!button || button.disabled) return null;
  return button;
}

function handleButtonPointerOver(event) {
  const button = buttonFromEvent(event);
  if (!button || button === hoveredButton) return;
  hoveredButton = button;
  buttonTone(button, "hover");
}

function handleButtonPointerOut(event) {
  const button = buttonFromEvent(event);
  if (button && button === hoveredButton) hoveredButton = null;
}

function handleButtonPointerDown(event) {
  const button = buttonFromEvent(event);
  if (button) buttonTone(button, "press");
}

function handleButtonKeySound(event) {
  if (event.code !== "Enter" && event.code !== "Space") return;
  const button = buttonFromEvent(event);
  if (button) buttonTone(button, "press");
}

function startBattle() {
  if (!activeAccount) {
    setAccountStatus("先選帳號");
    return;
  }
  const startPollution = clamp(Number(state.player?.pollution) || 0, 0, 100);
  const entryPoint = state.mode === "explore" && state.player
    ? clampPointToAirWall(state.player.x, state.player.y, PLAYER_COLLISION_RADIUS + 28)
    : null;
  syncActiveAccountHp();
  if (state.mode === "explore") saveCurrentLocation({ force: true }).catch(() => {});
  unlockAudio();
  clearInputState();
  resetGame({ battle: true, playerStart: entryPoint, startPollution });
  playBattleBgm();
  state.mode = "playing";
  document.body.dataset.mode = state.mode;
  running = true;
  setTopActionsVisible(true);
  ui.startScreen.classList.remove("show");
  ui.startScreen.hidden = true;
  flashMessage("祭の夜、守護願は縛となった。");
  tone(220, 0.18, 0.04, "triangle");
}

function endGame(victory) {
  if (state.mode === "victory" || state.mode === "defeat") return;
  stopPurifySuzu();
  state.mode = victory ? "victory" : "defeat";
  document.body.dataset.mode = state.mode;
  running = false;
  setTopActionsVisible(false);
  pauseAllBgm();
  state.result = scoreBattle(victory);
  state.result.exp = previewExperienceGain(victory, state.result.rank.name, state.result.score);
  state.result.path = state.result.exp.after.rank;
  const recordState = saveBattleRecord(victory);
  ui.resultRank.textContent = state.result.rank.name;
  ui.resultMeaning.textContent = state.result.rank.meaning;
  ui.resultPlaque.className = `plaque ${state.result.rank.tier}`;
  ui.resultPath.textContent = state.result.path;
  ui.resultMemory.textContent = `${state.metrics.memories} / ${memoryTexts.length}`;
  ui.resultTime.textContent = formatTime(state.time);
  renderExperienceResult(state.result.exp);
  renderRecords(recordState.records, recordState.saved);
  ui.resultScreen.hidden = false;
  ui.resultScreen.classList.add("show");
  tone(victory ? 440 : 98, 0.2, 0.04, victory ? "sine" : "sawtooth");
  setTimeout(() => tone(victory ? 660 : 74, 0.28, 0.03, "triangle"), 120);
}

function scoreBattle(victory) {
  if (!victory) {
    return {
      rank: ranks[0],
      score: 0,
      path: getAccountProgress().rank,
    };
  }

  const startHp = Math.max(0, Number(state.metrics.startHp) || 0);
  const startPollution = Math.max(0, Number(state.metrics.startPollution) || 0);
  const hpLost = Math.max(0, startHp - state.player.hp);
  const pollutionGained = Math.max(0, state.player.pollution - startPollution);
  const hpScore = Math.max(0, 1 - hpLost / Math.max(1, state.player.maxHp)) * 25;
  const pollutionScore = Math.max(0, 100 - pollutionGained) * 0.18;
  const timeScore = Math.max(0, 150 - state.time) * 0.13;
  const memoryScore = state.metrics.memories * 10;
  const dodgeScore = Math.min(12, state.metrics.cleanDodges * 2);
  const restraintScore = Math.max(0, 12 - state.metrics.wrongSlashes * 4);
  const flowScore = Math.min(10, state.player.force / 10);
  let score = hpScore + pollutionScore + timeScore + memoryScore + dodgeScore + restraintScore + flowScore;
  if (state.metrics.memories === 3 && pollutionGained < 14 && hpLost < 8 && state.time < 95) {
    score = Math.max(score, 100);
  }
  const idx = Math.min(ranks.length - 1, Math.max(0, Math.floor(score / 8.1)));
  const rank = ranks[idx];
  const path = getAccountProgress().rank;
  return { rank, score, path };
}

function getAccountProgress(account = activeAccount) {
  return progression.progressForAccount(account);
}

function getAccountCoins(account = activeAccount) {
  const coins = Number(account?.coins);
  return Number.isFinite(coins) ? Math.max(0, Math.floor(coins)) : 0;
}

function getAccountGold(account = activeAccount) {
  const gold = Number(account?.gold);
  return Number.isFinite(gold) ? Math.max(0, Math.floor(gold)) : 0;
}

function formatCoins(coins) {
  return `${getAccountCoins({ coins })} 円`;
}

function formatGold(gold) {
  return `金 ${getAccountGold({ gold })}`;
}

function itemDefinition(key) {
  return ITEM_DEFINITIONS[key] || null;
}

const itemImageCache2d = new Map();
const itemTextureCache3d = new Map();
let itemTextureLoader3d = null;

function itemReferenceDefinition(itemOrKey) {
  if (!itemOrKey) return null;
  if (typeof itemOrKey === "string") return itemDefinition(itemOrKey);
  if (itemOrKey.itemKey) return itemDefinition(itemOrKey.itemKey) || itemOrKey;
  if (itemOrKey.key) return itemDefinition(itemOrKey.key) || itemOrKey;
  return itemOrKey;
}

function itemImageSrc(itemOrKey) {
  const item = itemReferenceDefinition(itemOrKey);
  return item?.image || null;
}

function itemIconFallback(itemOrKey, fallbackText = "物") {
  const item = itemReferenceDefinition(itemOrKey);
  return fallbackText || item?.icon || item?.name?.slice(0, 1) || "物";
}

function setItemIconContent(element, itemOrKey, fallbackText = "物") {
  if (!element) return;
  const fallback = itemIconFallback(itemOrKey, fallbackText);
  const src = itemImageSrc(itemOrKey);
  element.replaceChildren();
  element.classList.remove("has-image");
  if (!src) {
    element.textContent = fallback;
    return;
  }
  const image = document.createElement("img");
  image.className = "item-icon-image";
  image.alt = "";
  image.decoding = "async";
  image.loading = "lazy";
  image.src = src;
  image.addEventListener("error", () => {
    element.classList.remove("has-image");
    element.replaceChildren(fallback);
  }, { once: true });
  element.classList.add("has-image");
  element.append(image);
}

function makeItemIcon(itemOrKey, className = "inventory-icon", fallbackText = "物") {
  const icon = document.createElement("span");
  icon.className = className;
  setItemIconContent(icon, itemOrKey, fallbackText);
  return icon;
}

function itemImageRecord2D(itemOrKey) {
  const src = itemImageSrc(itemOrKey);
  if (!src) return null;
  const cached = itemImageCache2d.get(src);
  if (cached) return cached;
  const image = new Image();
  const record = { image, loaded: false, failed: false };
  image.onload = () => {
    record.loaded = true;
  };
  image.onerror = () => {
    record.failed = true;
  };
  image.src = src;
  itemImageCache2d.set(src, record);
  return record;
}

function drawItemImage2D(context, itemOrKey, x, y, size) {
  const record = itemImageRecord2D(itemOrKey);
  if (!record || !record.loaded || record.failed) return false;
  context.drawImage(record.image, x - size / 2, y - size / 2, size, size);
  return true;
}

function itemTexture3D(itemOrKey) {
  if (!THREE) return null;
  const src = itemImageSrc(itemOrKey);
  if (!src) return null;
  if (itemTextureCache3d.has(src)) return itemTextureCache3d.get(src);
  if (!itemTextureLoader3d) itemTextureLoader3d = new THREE.TextureLoader();
  const texture = itemTextureLoader3d.load(src, (loadedTexture) => {
    loadedTexture.needsUpdate = true;
  }, undefined, () => {
    itemTextureCache3d.set(src, null);
  });
  texture.colorSpace = THREE.SRGBColorSpace;
  itemTextureCache3d.set(src, texture);
  return texture;
}

function itemQuality(item) {
  return item?.rarity || item?.quality || "white";
}

function itemIsStackable(keyOrItem) {
  const item = typeof keyOrItem === "string" ? itemDefinition(keyOrItem) : keyOrItem;
  return Boolean(item?.consumable || item?.stackable);
}

function itemMax(key) {
  return itemDefinition(key)?.max || 1;
}

function normalizeResonanceLevel(value) {
  return clamp(Math.floor(Number(value) || 0), 0, RESONANCE_MAX);
}

function normalizeInventoryCopy(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return {
      level: normalizeResonanceLevel(value.level ?? value.resonanceLevel ?? value.copyLevel ?? 0),
      locked: Boolean(value.locked),
    };
  }
  return { level: normalizeResonanceLevel(value), locked: false };
}

function copyLevel(copy) {
  return normalizeResonanceLevel(copy && typeof copy === "object" ? copy.level : copy);
}

function copyLocked(copy) {
  return Boolean(copy && typeof copy === "object" && copy.locked);
}

function sortInventoryCopies(copies) {
  return copies.sort((a, b) => copyLevel(b) - copyLevel(a) || Number(copyLocked(a)) - Number(copyLocked(b)));
}

function cloneInventoryEntry(entry, key) {
  if (itemIsStackable(key)) {
    return {
      quantity: clamp(Math.floor(Number(entry?.quantity) || 0), 0, itemMax(key)),
      locked: Boolean(entry?.locked),
    };
  }
  return {
    copies: Array.isArray(entry?.copies)
      ? sortInventoryCopies(entry.copies.map(normalizeInventoryCopy).slice(0, 200))
      : [],
  };
}

function normalizeInventoryEntry(raw, fallback, key) {
  if (itemIsStackable(key)) {
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      const quantity = Number(raw.quantity ?? raw.duplicateCount ?? 0);
      return {
        quantity: Number.isFinite(quantity) ? clamp(Math.floor(quantity), 0, itemMax(key)) : 0,
        locked: Boolean(raw.locked),
      };
    }
    const numeric = Number(raw);
    return {
      quantity: Number.isFinite(numeric)
        ? clamp(Math.floor(numeric), 0, itemMax(key))
        : cloneInventoryEntry(fallback, key).quantity,
      locked: false,
    };
  }

  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    if (Array.isArray(raw.copies)) return { copies: sortInventoryCopies(raw.copies.map(normalizeInventoryCopy).slice(0, 200)) };
    const duplicateCount = Math.max(0, Math.floor(Number(raw.duplicateCount) || 0));
    return {
      copies: Boolean(raw.owned) || duplicateCount > 0
        ? sortInventoryCopies([normalizeInventoryCopy({ level: raw.resonanceLevel, locked: raw.locked }), ...Array(duplicateCount).fill(0).map(normalizeInventoryCopy)])
        : [],
    };
  }

  const numeric = Number(raw);
  if (Number.isFinite(numeric)) return { copies: Array(Math.max(0, Math.floor(numeric))).fill(0).map(normalizeInventoryCopy) };
  return cloneInventoryEntry(fallback, key);
}

function normalizeInventory(inventory = {}) {
  return Object.fromEntries(
    Object.keys(INVENTORY_DEFAULT).map((key) => [key, normalizeInventoryEntry(inventory?.[key], INVENTORY_DEFAULT[key], key)]),
  );
}

function getAccountInventory(account = activeAccount) {
  return normalizeInventory(account?.inventory);
}

function inventoryEntry(key, account = activeAccount) {
  return getAccountInventory(account)[key] || cloneInventoryEntry(INVENTORY_DEFAULT[key], key);
}

function inventoryCopies(key, account = activeAccount) {
  return inventoryEntry(key, account).copies || [];
}

function inventoryQuantity(key, account = activeAccount) {
  const entry = inventoryEntry(key, account);
  return Array.isArray(entry.copies) ? entry.copies.length : Math.max(0, Math.floor(Number(entry.quantity) || 0));
}

function itemOwned(key, account = activeAccount) {
  return inventoryQuantity(key, account) > 0;
}

function bestResonanceLevel(key, account = activeAccount) {
  const copies = inventoryCopies(key, account);
  return copies.length ? Math.max(...copies.map(copyLevel)) : 0;
}

function resonanceTierKeyForLevel(level = 0) {
  return RESONANCE_LEVEL_TO_TIER_KEY[normalizeResonanceLevel(level)] || "none";
}

function resonanceLevelForTier(tier) {
  if (typeof tier === "number" && Number.isFinite(tier)) return normalizeResonanceLevel(tier);
  return normalizeResonanceLevel(RESONANCE_TIER_KEY_TO_LEVEL[String(tier || "").trim()] ?? 0);
}

function resonanceName(level = 0) {
  const tierKey = resonanceTierKeyForLevel(level);
  return RESONANCE_TIER_LABELS[tierKey] || (normalizeResonanceLevel(level) > 0 ? RESONANCE_NAMES[normalizeResonanceLevel(level) - 1] : RESONANCE_NONE_NAME);
}

function isTrueResonance(level = 0) {
  return normalizeResonanceLevel(level) >= RESONANCE_MAX;
}

function makeResonanceLabel(level = 0) {
  const label = document.createElement("span");
  label.className = "resonance-name";
  label.textContent = resonanceName(level);
  label.classList.toggle("true-resonance-name", isTrueResonance(level));
  return label;
}

function makeItemLabel(name, level = 0, copies = 0) {
  const fragment = document.createDocumentFragment();
  fragment.append(name);
  if (normalizeResonanceLevel(level) > 0) {
    fragment.append(" · ", makeResonanceLabel(level));
  }
  if (copies > 1) fragment.append(` (${copies}把)`);
  return fragment;
}

function itemLabelText(name, level = 0, copies = 0) {
  const numeric = normalizeResonanceLevel(level);
  return `${name}${numeric > 0 ? ` · ${resonanceName(numeric)}` : ""}${copies > 1 ? ` (${copies}把)` : ""}`;
}

function renderItemPopup(result, options = {}) {
  if (!ui.itemPopup || !result) return;
  const item = itemDefinition(result.itemKey) || result;
  const quality = popupResultQuality(result);
  const level = normalizeResonanceLevel(result.resonanceLevel);
  if (ui.itemPopupCard) ui.itemPopupCard.dataset.quality = quality;
  if (ui.itemPopupKicker) ui.itemPopupKicker.textContent = options.kicker || "授物";
  if (ui.itemPopupIcon) setItemIconContent(ui.itemPopupIcon, item || result, result.icon || item?.icon || item?.name?.slice(0, 1) || "物");
  if (ui.itemPopupName) ui.itemPopupName.replaceChildren(makeItemLabel(item?.name || result.itemName || "名なき持物", level));
  if (ui.itemPopupMeta) ui.itemPopupMeta.textContent = `${rarityLabel(quality)} · ${resonanceName(level)}`;
  ui.itemPopup.hidden = false;
  ui.itemPopup.classList.add("show");
  ui.itemPopupCloseButton?.focus({ preventScroll: true });
}

function closeItemPopup() {
  if (!ui.itemPopup) return;
  ui.itemPopup.classList.remove("show");
  ui.itemPopup.hidden = true;
  const nextPopup = itemPopupQueue.shift();
  if (nextPopup) {
    window.clearTimeout(itemPopupNextTimer);
    itemPopupNextTimer = window.setTimeout(() => {
      itemPopupNextTimer = 0;
      renderItemPopup(nextPopup.result, nextPopup.options);
    }, 140);
  }
}

function showItemPopup(result, options = {}) {
  if (!ui.itemPopup || !result) return;
  if (!ui.itemPopup.hidden) {
    itemPopupQueue.push({ result, options });
    return;
  }
  window.clearTimeout(itemPopupNextTimer);
  itemPopupNextTimer = 0;
  renderItemPopup(result, options);
}

function queueItemPopups(results = [], options = {}) {
  if (!results.length) return;
  for (const result of results) {
    showItemPopup(result, options);
  }
}

function queueItemPopupEntries(entries = []) {
  if (!entries.length) return;
  for (const entry of entries) {
    if (!entry?.result) continue;
    showItemPopup(entry.result, entry.options || {});
  }
}

function popupResultQuality(result) {
  const item = itemDefinition(result?.itemKey) || result;
  return result?.quality || item?.rarity || item?.quality || "white";
}

function isSakuraPopupResult(result) {
  return popupResultQuality(result) === "roseGold";
}

function popupOptionsForResult(result, fallbackKicker = "授物") {
  return { kicker: isSakuraPopupResult(result) ? "授物" : fallbackKicker };
}

function popupResultForItem(itemKey, options = {}) {
  const item = itemDefinition(itemKey);
  return {
    itemKey,
    itemName: options.itemName || item?.name || itemKey,
    icon: options.icon || item?.icon || item?.name?.slice(0, 1) || "物",
    quality: options.quality || item?.rarity || item?.quality || "white",
    resonanceLevel: normalizeResonanceLevel(options.resonanceLevel),
  };
}

function resonanceQualityMultiplier(item) {
  const quality = item?.rarity || item?.quality || "white";
  return RESONANCE_QUALITY_MULTIPLIERS[quality] || 1;
}

function resonanceCoinCostForLevel(level = 0, item = null) {
  const numeric = normalizeResonanceLevel(level);
  return numeric < RESONANCE_MAX ? Math.round((RESONANCE_COIN_BASE ** (numeric + 1)) * resonanceQualityMultiplier(item)) : Infinity;
}

function resonanceDamageMultiplier(level = 0) {
  return 1 + normalizeResonanceLevel(level) * 0.02;
}

function inventoryLevel(key, account = activeAccount) {
  if (itemIsStackable(key)) return inventoryQuantity(key, account);
  return inventoryQuantity(key, account);
}

function getAccountEquipment(account = activeAccount) {
  const inventory = getAccountInventory(account);
  const source = account?.equipment && typeof account.equipment === "object" ? account.equipment : null;
  return Object.fromEntries(
    EQUIPMENT_SLOTS.map((slot) => {
      const fallback = DONATION_REWARDS.find((item) => item.category === slot.key && itemOwned(item.key, { inventory }))?.key || null;
      const key = source && (source[slot.key] || slot.key !== "weapon") ? source[slot.key] : fallback;
      const item = itemDefinition(key);
      return [slot.key, item?.category === slot.key && itemOwned(key, { inventory }) ? key : null];
    }),
  );
}

function equippedInventoryLevel(key, account = activeAccount) {
  const item = itemDefinition(key);
  if (!item) return 0;
  return getAccountEquipment(account)[item.category] === key ? bestResonanceLevel(key, account) : 0;
}

function resonanceEffectText(item, level = 0) {
  const l = normalizeResonanceLevel(level);
  if (l <= 0) return "";
  if (item.category === "weapon") {
    if (item.attackSpeed) return `共鳴後出手更順，攻擊速度再提升${l * 2}%`;
    if (item.phaseDamage?.shape) return `共鳴後更易斬開「形」，形階段傷害再提升${l * 1.5}%`;
    if (item.forceOnHit) return `共鳴後鈴音更清，命中回勢增加至+${item.forceOnHit + l}`;
    if (item.dodgeStrike) return `共鳴後閃避後一擊提升至+${Math.round((item.dodgeStrike - 1 + l * 0.03) * 100)}%`;
    if (item.executeDamage) return `共鳴後斷願更利，低血量傷害提升至+${Math.round((item.executeDamage - 1 + l * 0.04) * 100)}%`;
    if (item.thirdHitEcho) return `共鳴後第三擊追斬提升至${Math.round((item.thirdHitEcho + l * 0.03) * 100)}%傷害`;
    if (item.aspectBreak) return `共鳴後破相速度提升至+${Math.round((item.aspectBreak - 1 + l * 0.04) * 100)}%`;
    if (item.wishDamage) return `共鳴後對「願」階段傷害再提升${Math.round(l * 1.8)}%`;
    if (item.battleShield) return `共鳴後開戰護盾提升至${Math.round((item.battleShield + l * 0.04) * 100)}%生命`;
    if (item.arenaFocus) return `共鳴後紅圈內蓄勢更快，每段傷害提升變為${Math.round((0.1 + l * 0.015) * 100)}%`;
    if (item.finalSkillRate) return `共鳴後更能壓制終局，Boss技能頻率額外降低${l * 3}%`;
    return `共鳴後刀身更穩，基礎傷害小幅提升${l * 2}%`;
  }
  if (item.category === "prayer") {
    if (item.maxHp) return `共鳴後護持更深，最大生命額外+${l * 4}`;
    if (item.moveSpeed) return `共鳴後行路更輕，移動速度額外+${l}%`;
    if (item.expBonus) return `共鳴後戰後感悟更清，經驗額外+${l * 2}%`;
    if (item.lifeSteal) return `共鳴後攻擊後恢復提升至${Math.round((item.lifeSteal + l * 0.02) * 100)}%傷害`;
    if (item.bossMoveSpeed) return `共鳴後鎮縛更強，執念速度降低至-${Math.round((1 - Math.max(0.45, item.bossMoveSpeed - l * 0.03)) * 100)}%`;
    if (item.lowHpRestore) return `共鳴後危急恢復提升至${Math.round((item.lowHpRestore + l * 0.04) * 100)}%`;
    if (item.phaseSpeedBoost) return `共鳴後換階加速提升至+${Math.round((item.phaseSpeedBoost + l * 0.03) * 100)}%`;
    if (item.bossDamage) return `共鳴後對執念傷害提升至+${Math.round((item.bossDamage - 1 + l * 0.03) * 100)}%`;
    if (item.autoWave) return `共鳴後自動祓力波動傷害提升至${45 + l * 4}%`;
    if (item.ritualRange) return `共鳴後相與願範圍擴至半徑${item.ritualRange + l * 20}`;
    return "共鳴後祈物的庇護更穩。";
  }
  return "共鳴後道具的靈性更清晰。";
}

function resolvedResonanceData(itemOrKey, resonanceLevel = 0) {
  const item = typeof itemOrKey === "string" ? itemDefinition(itemOrKey) : itemOrKey;
  if (!item?.key || !item.resonance) return null;
  return ITEM_RESONANCE_RESOLVER(item.key, resonanceTierKeyForLevel(resonanceLevel));
}

function effectiveItem(baseItem, resonanceLevel = 0) {
  if (!baseItem) return null;
  const level = normalizeResonanceLevel(resonanceLevel);
  const resolved = resolvedResonanceData(baseItem, level);
  if (resolved) {
    return {
      ...baseItem,
      name: resolved.displayName,
      displayName: resolved.displayName,
      damage: baseItem.category === "weapon" ? resolved.baseDamage : baseItem.damage,
      baseDamage: resolved.baseDamage,
      stats: resolved.stats || {},
      specialEffects: resolved.specialEffects || {},
      effect: resolved.playerDescription,
      playerDescription: resolved.playerDescription,
      resonanceTier: resolved.resonanceTier,
      resonanceLevel: level,
      resonanceName: resonanceName(level),
    };
  }

  const item = { ...baseItem, resonanceLevel: level, resonanceName: resonanceName(level) };
  if (!level) return item;
  item.effect = `${baseItem.effect || "無特殊效果"}。${resonanceEffectText(baseItem, level)}`;
  if (item.category === "weapon" && item.damage) item.damage = Math.max(1, Math.round(item.damage * resonanceDamageMultiplier(level)));
  if (item.attackSpeed) item.attackSpeed += level * 0.02;
  if (item.phaseDamage?.shape) item.phaseDamage = { ...item.phaseDamage, shape: item.phaseDamage.shape + level * 0.015 };
  if (item.forceOnHit) item.forceOnHit += level;
  if (item.dodgeStrike) item.dodgeStrike += level * 0.03;
  if (item.executeDamage) item.executeDamage += level * 0.04;
  if (item.thirdHitEcho) item.thirdHitEcho += level * 0.03;
  if (item.aspectBreak) item.aspectBreak += level * 0.04;
  if (item.wishDamage) item.wishDamage += level * 0.018;
  if (item.battleShield) item.battleShield += level * 0.04;
  if (item.finalSkillRate) item.finalSkillRate = Math.max(0.42, item.finalSkillRate - level * 0.03);
  if (item.arenaFocus) item.arenaFocusBonus = 0.1 + level * 0.015;
  if (item.maxHp) item.maxHp += level * 4;
  if (item.moveSpeed) item.moveSpeed += level * 0.01;
  if (item.expBonus) item.expBonus += level * 0.02;
  if (item.maxHpMultiplier) item.maxHpMultiplier += level * 0.005;
  if (item.lifeSteal) item.lifeSteal += level * 0.02;
  if (item.lifeStealCooldown) item.lifeStealCooldown = Math.max(4, item.lifeStealCooldown - level * 0.3);
  if (item.bossMoveSpeed) item.bossMoveSpeed = Math.max(0.45, item.bossMoveSpeed - level * 0.03);
  if (item.lowHpRestore) item.lowHpRestore += level * 0.04;
  if (item.phaseSpeedBoost) item.phaseSpeedBoost += level * 0.03;
  if (item.bossDamage) item.bossDamage += level * 0.03;
  if (item.autoWave) item.autoWaveDamage = 0.45 + level * 0.04;
  if (item.ritualRange) item.ritualRange += level * 20;
  return item;
}

function equippedItem(slot, account = activeAccount) {
  const key = getAccountEquipment(account)[slot];
  return effectiveItem(itemDefinition(key), bestResonanceLevel(key, account));
}

function equippedWeapon(account = activeAccount) {
  return equippedItem("weapon", account) || effectiveItem(itemDefinition("rottenUchigatana"), 0);
}

function isLongSlashWeapon(weapon = equippedWeapon()) {
  return LONG_SLASH_WEAPON_NAMES.has(weapon?.name);
}

function slashRange(weapon = equippedWeapon()) {
  return SLASH_RANGE * (isLongSlashWeapon(weapon) ? LONG_SLASH_RANGE_FACTOR : SHORT_SLASH_RANGE_FACTOR);
}

function slashDirectionAngle(face = state.player?.face ?? -Math.PI / 2) {
  return face + SLASH_DIRECTION_OFFSET;
}

function equippedPrayer(account = activeAccount) {
  return equippedItem("prayer", account);
}

function itemStats(item) {
  return item?.stats || {};
}

function itemSpecialEffects(item) {
  return item?.specialEffects || {};
}

function itemStatValue(item, key, fallback = 0) {
  const value = Number(itemStats(item)[key]);
  return Number.isFinite(value) ? value : fallback;
}

function itemSpecialEffect(item, key) {
  return itemSpecialEffects(item)[key] ?? null;
}

function playerInYuuState(player = state.player) {
  return Boolean(player?.forceYuuUntilBattleEnd || player?.glideActive || player?.dashTime > 0);
}

function totalCurseResistPct() {
  return itemStatValue(equippedWeapon(), "curseResistPct") + itemStatValue(equippedPrayer(), "curseResistPct");
}

function totalAttackBonusPct() {
  return itemStatValue(equippedWeapon(), "attackBonusPct") + itemStatValue(equippedPrayer(), "attackBonusPct");
}

function totalCritRatePct() {
  return clamp(BASE_CRIT_RATE_PCT + itemStatValue(equippedWeapon(), "critRateBonusPct") + itemStatValue(equippedPrayer(), "critRateBonusPct"), 0, 100);
}

function totalCritDamageBonusPct() {
  return BASE_CRIT_DAMAGE_BONUS_PCT + itemStatValue(equippedWeapon(), "critDamageBonusPct") + itemStatValue(equippedPrayer(), "critDamageBonusPct");
}

function playerImmuneAttackSpeedInterference() {
  return Boolean(weaponSpecialEffect("enemyActionSlow")?.immuneAttackSpeedInterference);
}

function weaponSpecialEffect(key) {
  return itemSpecialEffect(equippedWeapon(), key);
}

function prayerSpecialEffect(key) {
  return itemSpecialEffect(equippedPrayer(), key);
}

function playerMaxHp(account = activeAccount) {
  const prayer = equippedPrayer(account);
  const flat = itemStatValue(prayer, "maxHpFlat");
  const multiplier = 1 + itemStatValue(prayer, "maxHpBonusPct") / 100;
  return Math.round((PLAYER_MAX_HP + flat) * multiplier);
}

function currentAccountHp(account = activeAccount) {
  const maxHp = playerMaxHp(account);
  const stored = Number(account?.hp ?? account?.currentHp);
  return Number.isFinite(stored) ? clamp(stored, 0, maxHp) : maxHp;
}

function currentPlayerHp() {
  if (!state.player) return currentAccountHp(activeAccount);
  return clamp(state.player.hp, 0, state.player.maxHp);
}

function syncActiveAccountHp(value = currentPlayerHp()) {
  if (!activeAccount) return;
  activeAccount = {
    ...activeAccount,
    hp: Math.round(clamp(Number(value) || 0, 0, playerMaxHp(activeAccount)) * 100) / 100,
  };
}

function battleStartShield(maxHp = playerMaxHp()) {
  const battleShield = weaponSpecialEffect("battleStartShield");
  return Math.round(maxHp * ((battleShield?.shieldMaxHpPct || 0) / 100));
}

function moveSpeedMultiplier() {
  const prayer = equippedPrayer();
  const basePct = itemStatValue(prayer, "moveSpeedBonusPct");
  const yuuPct = playerInYuuState() ? (weaponSpecialEffect("yuuMoveSpeedBonusPct") || 0) : 0;
  const phaseBoost = state.player?.speedBoostTimer > 0 ? (prayerSpecialEffect("phaseTransitionMoveSpeedBonusPct") || 0) : 0;
  return 1 + (basePct + yuuPct + phaseBoost) / 100;
}

function bossMoveSpeedMultiplier() {
  const prayerSlow = prayerSpecialEffect("enemyMoveSpeedSlowPct") || 0;
  const actionSlow = weaponSpecialEffect("enemyActionSlow");
  const totalSlow = prayerSlow + (actionSlow?.moveSpeedSlowPct || 0);
  return Math.max(0.2, 1 - totalSlow / 100);
}

function attackSpeedMultiplier() {
  const base = Math.max(0.25, 1 + itemStatValue(equippedWeapon(), "attackSpeedBonusPct") / 100);
  const p = state.player;
  if (!p || playerImmuneAttackSpeedInterference() || p.attackInterferenceTimer <= 0) return base;
  return Math.max(0.25, base * Math.max(0.3, 1 - (p.attackInterferencePct || 0) / 100));
}

function pollutionGainMultiplier() {
  const legacy = inventoryLevel("amulet") * (itemDefinition("amulet")?.pollutionReductionPerLevel || 0);
  const curseMultiplier = Math.max(0.1, 1 - totalCurseResistPct() / 100);
  return Math.max(0.1, (1 - legacy) * curseMultiplier);
}

function armorDamageMultiplier() {
  const legacy = inventoryLevel("armor") * (itemDefinition("armor")?.armorReductionPerLevel || 0);
  return Math.max(0.58, 1 - legacy);
}

function bossDamageMultiplier(phase = state.boss?.phase) {
  const weapon = equippedWeapon();
  let bonusPct = totalAttackBonusPct();
  if (phase === "shape") bonusPct += weaponSpecialEffect("shapePhaseAttackBonusPct") || 0;
  if (phase === "wish") bonusPct += weaponSpecialEffect("wishPhaseAttackBonusPct") || 0;
  if (playerInYuuState()) bonusPct += itemStatValue(weapon, "yuuDamageBonusPct") + itemStatValue(equippedPrayer(), "yuuDamageBonusPct");
  const execute = weaponSpecialEffect("enemyHpThresholdAttackBonus");
  if (execute && phase === "shape" && state.boss?.maxForm > 0 && state.boss.form / state.boss.maxForm <= execute.thresholdPct / 100) {
    bonusPct += execute.attackBonusPct || 0;
  }
  const circleRamp = weaponSpecialEffect("circleStayAttackRamp");
  if (circleRamp && state.player?.arenaFocusTime >= (circleRamp.staySeconds || 10)) {
    const stacks = Math.floor((state.player.arenaFocusTime - (circleRamp.staySeconds || 10)) / (circleRamp.intervalSeconds || 3)) + 1;
    bonusPct += stacks * (circleRamp.attackBonusPct || 0);
  }
  let multiplier = 1 + bonusPct / 100;
  if (weapon?.key === "blade") multiplier *= 1 + (weapon.resonanceLevel || 0) * (weapon.damagePerLevel || 0);
  return multiplier;
}

function weaponBaseDamage() {
  return equippedWeapon()?.damage || 22;
}

function slashDamage(target = state.boss, options = {}) {
  const p = state.player;
  const againstBoss = options.againstBoss !== false;
  const phase = options.phase ?? (againstBoss ? target?.phase : null);
  let damage = weaponBaseDamage() + p.force * 0.08 + (p.dashTime > 0 ? 18 : 0);
  if (againstBoss) damage *= bossDamageMultiplier(phase);
  return damage;
}

function slashDamageResult(target = state.boss, options = {}) {
  const damage = slashDamage(target, options);
  const critRate = totalCritRatePct();
  const critical = Math.random() * 100 < critRate;
  const critMultiplier = critical ? 1 + totalCritDamageBonusPct() / 100 : 1;
  return {
    damage: damage * critMultiplier,
    critical,
    critRate,
    critDamageBonusPct: totalCritDamageBonusPct(),
  };
}

function observePowerMultiplier() {
  const phaseBreak = weaponSpecialEffect("phaseBreakSpeedBonus");
  return 1 + ((phaseBreak?.bonusPct || 0) / 100);
}

function observeRange() {
  return prayerSpecialEffect("phaseAreaRadiusModifier")?.radius || 58;
}

function ritualRange() {
  return prayerSpecialEffect("phaseAreaRadiusModifier")?.radius || PURIFY_DISTANCE;
}

function bossFinalSkillRate() {
  const weaponSlow = weaponSpecialEffect("enemyActionSlow");
  const totalSlow = weaponSlow?.skillRateSlowPct || 0;
  return Math.max(0.25, 1 - totalSlow / 100);
}

function expGainMultiplier() {
  return 1 + itemStatValue(equippedPrayer(), "expBonusPct") / 100;
}

function previewExperienceGain(victory, rankName, score = 0) {
  const before = getAccountProgress();
  const extremeBonus = victory && rankName === "極" ? Math.max(0, Math.floor(Number(score) - 100)) * 10 : 0;
  const gained = Math.round((progression.expForPlaque(rankName, victory) + extremeBonus) * expGainMultiplier());
  const after = progression.progressForExperience(before.totalExp + gained);
  return {
    gained,
    before,
    after,
    leveled: after.rankIndex > before.rankIndex,
  };
}

function renderExperienceResult(expState) {
  const after = expState.after;
  ui.resultExpRank.textContent = expState.leveled ? `${expState.before.rank} → ${after.rank}` : after.rank;
  ui.resultExpGain.textContent = `+${expState.gained} EXP`;
  const progress = clamp(after.progress, 0, 1);
  ui.resultExpBar.style.transform = "scaleX(0)";
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      ui.resultExpBar.style.transform = `scaleX(${progress})`;
    });
  });

  if (after.maxed) {
    ui.resultExpText.textContent = `${after.totalExp} EXP`;
    ui.resultExpNext.textContent = "祓道階 滿";
  } else {
    ui.resultExpText.textContent = `${after.levelExp} / ${after.levelRequired}`;
    ui.resultExpNext.textContent = `次段 ${after.nextRank}`;
  }
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

function apiDocumentsAvailable() {
  return true;
}

function getAccountLastPosition(account = activeAccount) {
  const point = account?.["最後座標"] || account?.lastPosition;
  if (!point || typeof point !== "object") return null;
  const x = Number(point.x);
  const y = Number(point.y);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  const margin = PLAYER_COLLISION_RADIUS;
  const face = Number(point.face);
  return {
    x: clamp(x, WORLD.minX + margin, WORLD.maxX - margin),
    y: clamp(y, WORLD.minY + margin, WORLD.maxY - margin),
    face: Number.isFinite(face) ? face : -Math.PI / 2,
    mode: point.mode === "landing" ? "landing" : "explore",
  };
}

function currentChestDayKey() {
  return CHEST_DATA?.currentDayKey?.() || new Date().toISOString().slice(0, 10);
}

function accountGraveState(account = activeAccount) {
  const unlocked = Array.isArray(account?.graveState?.unlocked)
    ? account.graveState.unlocked.map((id) => String(id))
    : [];
  return { unlocked: [...new Set(unlocked)] };
}

function graveUnlocked(graveId, account = activeAccount) {
  return accountGraveState(account).unlocked.includes(String(graveId || ""));
}

function accountChestState(account = activeAccount) {
  const today = currentChestDayKey();
  const raw = account?.chestState;
  const sameDay = raw && raw.dayKey === today;
  return {
    dayKey: today,
    opened: sameDay && Array.isArray(raw?.opened) ? raw.opened.map((id) => String(id)) : [],
    fieldLoot: sameDay && Array.isArray(raw?.fieldLoot)
      ? raw.fieldLoot
        .filter((entry) => entry && HIDDEN_CHEST_SPAWN_MAP[entry.chestId] && itemDefinition(entry.itemKey))
        .map((entry) => ({
          id: String(entry.id),
          chestId: String(entry.chestId),
          itemKey: String(entry.itemKey),
          slot: Math.max(0, Math.min(5, Math.floor(Number(entry.slot) || 0))),
        }))
      : [],
  };
}

function activeChestIdsForDay(dayKey = currentChestDayKey()) {
  return CHEST_DATA?.activeChestIdsForDay?.(dayKey) || HIDDEN_CHEST_SPAWN_POINTS.slice(0, DAILY_CHEST_COUNT).map((point) => point.id);
}

function activeDailyChests(account = activeAccount) {
  const activeIds = new Set(activeChestIdsForDay(accountChestState(account).dayKey));
  return HIDDEN_CHEST_SPAWN_POINTS.filter((point) => activeIds.has(point.id));
}

function chestOpenedSet(account = activeAccount) {
  return new Set(accountChestState(account).opened);
}

function activeFieldLoot(account = activeAccount) {
  return accountChestState(account).fieldLoot;
}

function chestWorldPoint(chest) {
  return scenePointToWorld(chest.sceneX, chest.sceneZ);
}

function chestLootWorldPoint(loot) {
  const chest = HIDDEN_CHEST_SPAWN_MAP[loot?.chestId];
  if (!chest) return { x: WORLD.cx, y: WORLD.cy };
  const origin = chestWorldPoint(chest);
  const slot = Math.max(0, Math.floor(Number(loot.slot) || 0));
  const offsets = [
    { x: -18, y: -12 },
    { x: 18, y: -10 },
    { x: -10, y: 18 },
    { x: 15, y: 16 },
    { x: 0, y: -22 },
    { x: 0, y: 22 },
  ];
  const offset = offsets[slot % offsets.length];
  const rotation = chest.rotation || 0;
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  return {
    x: origin.x + offset.x * cos - offset.y * sin,
    y: origin.y + offset.x * sin + offset.y * cos,
  };
}

function nearestActiveChest(p = state.player) {
  if (!p) return null;
  const opened = chestOpenedSet();
  let nearest = null;
  let nearestDistance = Infinity;
  for (const chest of activeDailyChests()) {
    if (opened.has(chest.id)) continue;
    const point = chestWorldPoint(chest);
    const distance = Math.hypot(p.x - point.x, p.y - point.y);
    if (distance <= CHEST_OPEN_RADIUS && distance < nearestDistance) {
      nearest = { ...chest, x: point.x, y: point.y, distance };
      nearestDistance = distance;
    }
  }
  return nearest;
}

function nearestGraveMarker(p = state.player) {
  if (!p) return null;
  let nearest = null;
  let nearestDistance = Infinity;
  for (const grave of GRAVE_MARKERS) {
    const distance = Math.hypot(p.x - grave.x, p.y - grave.y);
    if (distance <= GRAVE_INTERACT_RADIUS && distance < nearestDistance) {
      nearest = { ...grave, distance };
      nearestDistance = distance;
    }
  }
  return nearest;
}

function nearestFieldLoot(p = state.player) {
  if (!p) return null;
  let nearest = null;
  let nearestDistance = Infinity;
  for (const loot of activeFieldLoot()) {
    const point = chestLootWorldPoint(loot);
    const distance = Math.hypot(p.x - point.x, p.y - point.y);
    if (distance <= FIELD_LOOT_COLLECT_RADIUS && distance < nearestDistance) {
      nearest = { ...loot, x: point.x, y: point.y, distance };
      nearestDistance = distance;
    }
  }
  return nearest;
}

function currentExplorationLocation() {
  if (!activeAccount || !state.player || (state.mode !== "explore" && state.mode !== "landing")) return null;
  return {
    x: Math.round(state.player.x * 100) / 100,
    y: Math.round(state.player.y * 100) / 100,
    face: Math.round(state.player.face * 1000) / 1000,
    mode: state.mode === "landing" ? "landing" : "explore",
  };
}

function currentPlayerStateSnapshot() {
  if (!activeAccount || !state.player) return null;
  const location = currentExplorationLocation();
  return {
    ...(location ? { "最後座標": location } : {}),
    hp: Math.round(currentPlayerHp() * 100) / 100,
  };
}

function playerStateKey(snapshot) {
  if (!snapshot) return "";
  const location = snapshot["最後座標"] || snapshot.lastPosition || null;
  const hp = Number(snapshot.hp ?? snapshot.currentHp);
  const hpKey = Number.isFinite(hp) ? Math.round(hp * 10) : "hp";
  if (!location) return `hp:${hpKey}`;
  return `${Math.round(location.x)}:${Math.round(location.y)}:${Math.round(location.face * 100)}:${hpKey}`;
}

async function saveCurrentLocation({ force = false } = {}) {
  const snapshot = currentPlayerStateSnapshot();
  if (!snapshot || !apiDocumentsAvailable()) return;
  const key = playerStateKey(snapshot);
  if (!force && key === lastSavedLocationKey) return;
  if (locationSaveBusy) {
    locationSaveQueued = true;
    return;
  }

  const accountId = activeAccount.id;
  locationSaveBusy = true;
  let shouldSaveAgain = false;
  try {
    const data = await apiRequest(`/api/accounts/${accountId}/location`, {
      method: "POST",
      body: JSON.stringify(snapshot),
    });
    if (activeAccount?.id === accountId) {
      activeAccount = data.account;
      updateAccountUi();
    }
    lastSavedLocationKey = key;
    shouldSaveAgain = locationSaveQueued;
    locationSaveQueued = false;
  } catch {
    // Position saving should never interrupt movement.
  } finally {
    locationSaveBusy = false;
  }
  if (shouldSaveAgain) saveCurrentLocation({ force: true }).catch(() => {});
}

function updateLocationAutosave(dt) {
  if (!activeAccount || (state.mode !== "explore" && state.mode !== "landing")) {
    locationSaveTimer = 0;
    return;
  }
  locationSaveTimer += dt;
  if (locationSaveTimer < 2) return;
  locationSaveTimer = 0;
  saveCurrentLocation().catch(() => {});
}

function saveCurrentLocationBeacon() {
  const snapshot = currentPlayerStateSnapshot();
  if (!snapshot || !activeAccount || !apiDocumentsAvailable()) return;
  const key = playerStateKey(snapshot);
  if (key === lastSavedLocationKey) return;
  const body = JSON.stringify(snapshot);
  const url = `${API_BASE}/api/accounts/${activeAccount.id}/location`;
  const sent = navigator.sendBeacon?.(url, new Blob([body], { type: "application/json" }));
  if (sent) {
    lastSavedLocationKey = key;
    activeAccount = {
      ...activeAccount,
      hp: snapshot.hp,
      ...(snapshot["最後座標"] ? { "最後座標": { ...snapshot["最後座標"], savedAt: new Date().toISOString() } } : {}),
    };
    return;
  }
  saveCurrentLocation({ force: true }).catch(() => {});
}

function setAccountStatus(text) {
  ui.accountStatus.textContent = text;
}

function renderAccountList(message) {
  ui.accountList.replaceChildren();
  if (message) {
    const item = document.createElement("button");
    item.type = "button";
    item.disabled = true;
    item.textContent = message;
    ui.accountList.append(item);
    return;
  }

  if (accounts.length === 0) {
    const item = document.createElement("button");
    item.type = "button";
    item.disabled = true;
    item.textContent = "尚無帳號";
    ui.accountList.append(item);
    return;
  }

  for (const account of accounts) {
    const item = document.createElement("button");
    const copy = document.createElement("span");
    const name = document.createElement("strong");
    const stage = document.createElement("span");
    const exp = document.createElement("span");
    const mark = document.createElement("b");
    const progress = getAccountProgress(account);
    const realm = pathRealmName(progress.rank);
    item.type = "button";
    item.className = "account-nameplate";
    item.dataset.realm = pathRealmTheme(progress.rank);
    item.classList.toggle("active", account.id === activeAccount?.id);
    name.textContent = account.name;
    stage.textContent = `祓道階·${pathStageName(progress.rank)}`;
    exp.textContent = `EXP ${progress.totalExp}`;
    mark.className = "account-nameplate-mark";
    mark.setAttribute("aria-hidden", "true");
    mark.textContent = realm;
    copy.className = "account-nameplate-copy";
    copy.append(name, stage, exp);
    item.append(copy, mark);
    item.addEventListener("click", () => loginAccount(account.id));
    ui.accountList.append(item);
  }
}

function updateAccountUi(message) {
  const hasAccount = Boolean(activeAccount);
  const progress = getAccountProgress(activeAccount);
  const coins = getAccountCoins(activeAccount);
  updatePathRealmTheme(progress);
  ui.pathRank.textContent = `祓道階 ${progress.rank}`;
  ui.sideMenuName.textContent = activeAccount?.name || "未登入";
  ui.sideMenuRank.textContent = hasAccount ? formatSideMenuRank(progress) : "祓道階·初段 EXP 0";
  if (ui.sideMenuAccountMark) ui.sideMenuAccountMark.textContent = pathRealmName(progress.rank);
  ui.settingsAccountName.textContent = activeAccount?.name || "未登入";
  ui.settingsAccountRank.textContent = hasAccount ? `祓道階 ${progress.rank} · ${progress.totalExp} EXP · ${formatCoins(coins)}` : "祓道階 荒・初段";
  ui.renameNameInput.disabled = !hasAccount;
  ui.renameAccountButton.disabled = !hasAccount;
  if (!hasAccount) ui.renameNameInput.value = "";
  ui.clearRecordsButton.disabled = !hasAccount;
  ui.deleteAccountButton.disabled = !hasAccount;
  setAccountStatus(message || (hasAccount ? `${activeAccount.name} · 祓道階 ${progress.rank} · ${progress.totalExp} EXP` : "未登入"));
}

async function refreshAccounts() {
  if (!apiDocumentsAvailable()) {
    accounts = [];
    activeAccount = null;
    renderAccountList("請從本機伺服器開啟");
    updateAccountUi("文件儲存需要 http://127.0.0.1:4173/");
    renderRecords([], false);
    return;
  }

  try {
    const data = await apiRequest("/api/accounts");
    accounts = data.accounts || [];
    renderAccountList();
    if (activeAccount && !accounts.some((account) => account.id === activeAccount.id)) {
      activeAccount = null;
    }
    updateAccountUi();
  } catch {
    accounts = [];
    activeAccount = null;
    renderAccountList("帳號服務未啟動");
    updateAccountUi("請啟動 server.js");
    renderRecords([], false);
  }
}

async function loginAccount(id) {
  try {
    const data = await apiRequest(`/api/accounts/${id}`);
    activeAccount = data.account;
    renderRecords(activeAccount.records, true);
    renderAccountList();
    updateAccountUi();
    beginLandingToVillage();
  } catch {
    setAccountStatus("帳號讀取失敗");
  }
}

async function registerOrLogin(event) {
  event.preventDefault();
  const name = ui.accountNameInput.value.trim();
  if (!name) return;
  try {
    const data = await apiRequest("/api/accounts", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    activeAccount = data.account;
    ui.accountNameInput.value = "";
    await refreshAccounts();
    renderRecords(activeAccount.records, true);
    updateAccountUi(data.existing ? "已登入既有帳號" : "已建立帳號");
    beginLandingToVillage();
  } catch {
    setAccountStatus("帳號建立失敗");
  }
}

async function renameCurrentAccount(event) {
  event.preventDefault();
  if (!activeAccount) {
    setAccountStatus("先選帳號");
    return;
  }
  const name = ui.renameNameInput.value.trim();
  if (!name) {
    setAccountStatus("請輸入新名稱");
    return;
  }
  if (name.toLocaleLowerCase("ja-JP") === activeAccount.name.toLocaleLowerCase("ja-JP")) {
    setAccountStatus("名稱沒有改變");
    return;
  }
  if (getAccountCoins(activeAccount) < RENAME_COST) {
    const message = `改名需納 ${RENAME_COST} 銅円`;
    setAccountStatus(message);
    flashMessage(message, 2.2);
    return;
  }

  try {
    const previousId = activeAccount.id;
    const data = await apiRequest(`/api/accounts/${previousId}/rename`, {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    activeAccount = data.account;
    ui.renameNameInput.value = "";
    await refreshAccounts();
    renderRecords(activeAccount.records, true);
    updateAccountUi(`已改名，納 ${RENAME_COST} 銅円`);
  } catch (error) {
    const text = String(error.message || "");
    const message = text.includes("already")
      ? "名稱已被使用"
      : text.includes("unchanged")
        ? "名稱沒有改變"
        : text.includes("coins")
          ? `改名需納 ${RENAME_COST} 銅円`
          : "改名失敗";
    setAccountStatus(message);
    flashMessage(message, 2.4);
  }
}

function createBattleRecord(victory) {
  const exp = state.result.exp;
  const coinsGained = coinRewardForBattle(victory);
  const record = {
    id: `${Date.now()}-${Math.round(Math.random() * 100000)}`,
    finishedAt: new Date().toISOString(),
    victory,
    rank: state.result.rank.name,
    rankIndex: ranks.findIndex((rank) => rank.name === state.result.rank.name),
    score: Math.round(state.result.score),
    path: state.result.path,
    expGained: exp?.gained || 0,
    coinsGained,
    expBefore: exp?.before.totalExp || 0,
    expAfter: exp?.after.totalExp || 0,
    time: Math.round(state.time),
    memories: state.metrics.memories,
    hpPercent: Math.round((state.player.hp / state.player.maxHp) * 100),
    pollution: Math.round(state.player.pollution),
    cleanDodges: state.metrics.cleanDodges,
  };
  return record;
}

function coinRewardForBattle(victory) {
  if (!victory) return COIN_REWARD_DEFEAT;
  const rankIndex = Math.max(0, ranks.findIndex((rank) => rank.name === state.result.rank.name));
  return COIN_REWARD_BASE + rankIndex * COIN_REWARD_PER_RANK + state.metrics.memories * COIN_REWARD_PER_MEMORY;
}

function saveBattleRecord(victory) {
  const record = createBattleRecord(victory);
  if (!activeAccount) {
    document.body.dataset.recordsSaved = "false";
    return { records: [record], saved: false };
  }

  activeAccount = {
    ...activeAccount,
    coins: getAccountCoins(activeAccount) + record.coinsGained,
    hp: Math.round(currentPlayerHp() * 100) / 100,
    experience: state.result.exp.after.totalExp,
    pathRank: state.result.exp.after.rank,
    records: [record, ...(activeAccount.records || [])].slice(0, MAX_RECORDS),
  };
  document.body.dataset.recordsSaved = "pending";
  updateAccountUi();

  apiRequest(`/api/accounts/${activeAccount.id}/records`, {
    method: "POST",
    body: JSON.stringify({ record, hp: Math.round(currentPlayerHp() * 100) / 100 }),
  })
    .then((data) => {
      activeAccount = data.account;
      document.body.dataset.recordsSaved = "true";
      renderRecords(activeAccount.records, true);
      updateAccountUi();
      refreshAccounts();
    })
    .catch(() => {
      document.body.dataset.recordsSaved = "false";
      renderRecords(activeAccount.records, false);
    });

  return { records: activeAccount.records, saved: true };
}

function renderRecords(records = activeAccount?.records || [], storageAvailable = Boolean(activeAccount)) {
  const best = [...records].sort(
    (a, b) => b.rankIndex - a.rankIndex || b.score - a.score || a.time - b.time,
  )[0];
  ui.bestRecord.textContent = storageAvailable
    ? best
      ? `${best.rank} · ${best.score}點 · ${formatTime(best.time)}`
      : "尚無記錄"
    : "本機儲存不可用";

  ui.recordList.replaceChildren();
  if (records.length === 0) {
    const item = document.createElement("li");
    item.className = "empty";
    item.textContent = storageAvailable ? "尚無戰績" : "登入後記錄";
    ui.recordList.append(item);
    return;
  }

  for (const record of records.slice(0, 5)) {
    const item = document.createElement("li");
    const rank = document.createElement("span");
    const meta = document.createElement("span");
    const time = document.createElement("span");
    rank.className = "record-rank";
    meta.className = "record-meta";
    time.className = "record-time";
    rank.textContent = record.rank;
    meta.textContent = `${record.victory ? "淨化" : "潰散"} · +${record.expGained || 0} EXP · 相 ${record.memories}/3 · 心燈 ${record.hpPercent}% · 穢 ${record.pollution}%`;
    time.textContent = formatRecordDate(record.finishedAt);
    item.append(rank, meta, time);
    ui.recordList.append(item);
  }
}

function formatRecordDate(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${month}/${day} ${hours}:${minutes}`;
}

function clearInputState() {
  keys.clear();
  pressedSlash = false;
  pressedDash = false;
  pressedJump = false;
  pressedObserve = false;
  pressedCollect = false;
  pressedPurify = false;
  pressedTenDonation = false;
}

function setTopActionsVisible(visible) {
  ui.topActions.hidden = !visible;
}

function panelLayerIsOpen(layer) {
  const screen = layer.closest(".overlay");
  return Boolean(screen && !screen.hidden && screen.classList.contains("show"));
}

function createUltimateParticle(layer) {
  const dot = document.createElement("span");
  const size = 2.2 + Math.random() * 4.8;
  const x = 37 + Math.random() * 26;
  const drift = -42 + Math.random() * 84;
  const duration = 10 + Math.random() * 8;
  const opacity = 0.44 + Math.random() * 0.42;
  dot.style.setProperty("--particle-size", `${size.toFixed(1)}px`);
  dot.style.setProperty("--particle-x", `${x.toFixed(2)}%`);
  dot.style.setProperty("--particle-drift", `${drift.toFixed(1)}px`);
  dot.style.setProperty("--rise-duration", `${duration.toFixed(2)}s`);
  dot.style.setProperty("--particle-opacity", opacity.toFixed(2));
  dot.addEventListener("animationend", () => dot.remove(), { once: true });
  layer.append(dot);
}

function stopUltimateParticleLayer(layer) {
  const timer = ultimateParticleTimers.get(layer);
  if (timer) clearInterval(timer);
  ultimateParticleTimers.delete(layer);
  layer.replaceChildren();
}

function startUltimateParticleLayer(layer) {
  if (!layer || ultimateParticleTimers.has(layer)) return;
  for (let i = 0; i < 28; i += 1) {
    window.setTimeout(() => {
      if (ultimateParticleTimers.has(layer) && panelLayerIsOpen(layer)) createUltimateParticle(layer);
    }, i * 85);
  }
  const timer = window.setInterval(() => {
    if (document.body.dataset.pathRealm !== "ultimate" || !panelLayerIsOpen(layer)) {
      stopUltimateParticleLayer(layer);
      return;
    }
    const count = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i += 1) createUltimateParticle(layer);
  }, 420);
  ultimateParticleTimers.set(layer, timer);
}

function syncUltimatePanelParticles() {
  const shouldRun = document.body.dataset.pathRealm === "ultimate";
  for (const layer of ui.ultimateParticleLayers) {
    if (shouldRun && panelLayerIsOpen(layer)) startUltimateParticleLayer(layer);
    else stopUltimateParticleLayer(layer);
  }
}

function updateOverlayOpenFlag() {
  const overlayOpen =
    !ui.sideMenuScreen.hidden ||
    !ui.worldMapScreen.hidden ||
    !ui.shopScreen.hidden ||
    !ui.blacksmithScreen.hidden ||
    !ui.codexScreen.hidden ||
    !ui.characterScreen.hidden ||
    !ui.backpackScreen.hidden ||
    !ui.settingsScreen.hidden;
  document.body.dataset.overlayOpen = overlayOpen ? "true" : "false";
  syncUltimatePanelParticles();
}

function canPauseWorldMode(mode) {
  return mode === "playing" || mode === "explore" || mode === "landing";
}

function activeBgmIntent() {
  return bgmRequested || bgmPlaying || zoneBgmRequested || zoneBgmPlaying;
}

function pauseWorldForOverlay(mode, forced = {}) {
  const pausedMode = Object.prototype.hasOwnProperty.call(forced, "pausedMode")
    ? forced.pausedMode
    : canPauseWorldMode(state.mode)
      ? state.mode
      : null;
  const pausedBgm = Object.prototype.hasOwnProperty.call(forced, "pausedBgm")
    ? forced.pausedBgm
    : activeBgmIntent();
  if (pausedMode) {
    stopPurifySuzu();
    state.mode = mode;
    document.body.dataset.mode = pausedMode;
    running = false;
    clearInputState();
  }
  if (pausedBgm) pauseAllBgm();
  return { pausedMode, pausedBgm };
}

function restoreWorldFromOverlay(pausedMode, pausedBgm, expectedMode) {
  if (pausedMode && state.mode === expectedMode) {
    state.mode = pausedMode;
    document.body.dataset.mode = state.mode;
    running = true;
    lastTime = performance.now();
    clearInputState();
  }
  if (pausedBgm && pausedMode === "playing") {
    playBattleBgm(false);
  } else if (pausedBgm && (pausedMode === "landing" || pausedMode === "explore")) {
    playZoneBgm(false);
  }
  if (pausedMode === "playing" && state.player?.purifyCast > 0) startPurifySuzu();
}

function releaseSideMenuPause() {
  const pause = { pausedMode: sideMenuPausedMode, pausedBgm: sideMenuPausedBgm };
  ui.sideMenuScreen.classList.remove("show");
  ui.sideMenuScreen.hidden = true;
  updateOverlayOpenFlag();
  sideMenuPausedMode = null;
  sideMenuPausedBgm = false;
  return pause;
}

function returnToSideMenuFromPanel(pausedMode, pausedBgm) {
  sideMenuPausedMode = pausedMode;
  sideMenuPausedBgm = pausedBgm;
  if (pausedMode) {
    state.mode = "sideMenu";
    document.body.dataset.mode = pausedMode;
    running = false;
    clearInputState();
  }
  if (pausedBgm) pauseAllBgm();
  renderSideMenu();
  ui.sideMenuScreen.hidden = false;
  ui.sideMenuScreen.classList.add("show");
  updateOverlayOpenFlag();
}

function renderSideMenu() {
  const progress = getAccountProgress(activeAccount);
  updatePathRealmTheme(progress);
  ui.sideMenuName.textContent = activeAccount?.name || "未登入";
  ui.sideMenuRank.textContent = activeAccount ? formatSideMenuRank(progress) : "祓道階·初段 EXP 0";
  if (ui.sideMenuAccountMark) ui.sideMenuAccountMark.textContent = pathRealmName(progress.rank);
}

function openSideMenu() {
  if (!activeAccount) return;
  const pause = pauseWorldForOverlay("sideMenu");
  sideMenuPausedMode = pause.pausedMode;
  sideMenuPausedBgm = pause.pausedBgm;
  renderSideMenu();
  ui.sideMenuScreen.hidden = false;
  ui.sideMenuScreen.classList.add("show");
  updateOverlayOpenFlag();
}

function closeSideMenu({ restore = true } = {}) {
  ui.sideMenuScreen.classList.remove("show");
  ui.sideMenuScreen.hidden = true;
  const restoreMode = sideMenuPausedMode;
  const restoreBgm = sideMenuPausedBgm;
  if (restore) restoreWorldFromOverlay(restoreMode, restoreBgm, "sideMenu");
  sideMenuPausedMode = null;
  sideMenuPausedBgm = false;
  updateOverlayOpenFlag();
}

function colorHex(value, fallback = "#38512f") {
  if (!Number.isFinite(Number(value))) return fallback;
  return `#${Number(value).toString(16).padStart(6, "0").slice(-6)}`;
}

function clampWorldMapZoom(value) {
  return clamp(Number(value) || 1, WORLD_MAP_MIN_ZOOM, WORLD_MAP_MAX_ZOOM);
}

function worldMapBaseStageSize() {
  const mobile = window.innerWidth <= 760;
  const maxWidth = mobile ? Math.max(320, window.innerWidth - 42) : clamp(window.innerWidth - 84, 640, 1120);
  const maxHeight = mobile ? clamp(window.innerHeight - 170, 320, 520) : clamp(window.innerHeight - 210, 340, 620);
  const aspect = Math.max(0.1, WORLD.w / Math.max(1, WORLD.h));
  let width = maxWidth;
  let height = width / aspect;
  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspect;
  }
  return {
    width: Math.max(300, width),
    height: Math.max(300, height),
  };
}

function applyWorldMapZoomLayout() {
  if (!ui.worldMapStage) return;
  const base = worldMapBaseStageSize();
  const zoom = clampWorldMapZoom(worldMapZoom);
  const width = `${Math.round(base.width * zoom)}px`;
  const height = `${Math.round(base.height * zoom)}px`;
  ui.worldMapStage.style.width = width;
  ui.worldMapStage.style.minWidth = width;
  ui.worldMapStage.style.height = height;
  ui.worldMapStage.style.minHeight = height;
}

function formatWorldMapZoom() {
  const value = worldMapZoom.toFixed(2).replace(/\.00$/, "").replace(/0$/, "");
  return `${value}倍`;
}

function updateWorldMapZoomUi() {
  if (ui.worldMapZoomLabel) ui.worldMapZoomLabel.textContent = formatWorldMapZoom();
  if (ui.worldMapZoomOutButton) ui.worldMapZoomOutButton.disabled = worldMapZoom <= WORLD_MAP_MIN_ZOOM + 0.001;
  if (ui.worldMapZoomInButton) ui.worldMapZoomInButton.disabled = worldMapZoom >= WORLD_MAP_MAX_ZOOM - 0.001;
}

function worldMapMetrics() {
  const canvas = ui.worldMapCanvas;
  if (!canvas) return null;
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));
  const padding = Math.max(30, Math.min(width, height) * 0.045);
  const innerWidth = Math.max(1, width - padding * 2);
  const innerHeight = Math.max(1, height - padding * 2);
  const scale = Math.max(0.0001, Math.min(innerWidth / Math.max(1, WORLD.w), innerHeight / Math.max(1, WORLD.h)));
  const mapWidth = WORLD.w * scale;
  const mapHeight = WORLD.h * scale;
  const mapLeft = padding + (innerWidth - mapWidth) * 0.5;
  const mapTop = padding + (innerHeight - mapHeight) * 0.5;
  return {
    width,
    height,
    padding,
    innerWidth,
    innerHeight,
    mapLeft,
    mapTop,
    mapWidth,
    mapHeight,
    scale,
  };
}

function worldToMapPoint(worldX, worldY, metrics) {
  return {
    x: metrics.mapLeft + (clamp(worldX, WORLD.minX, WORLD.maxX) - WORLD.minX) * metrics.scale,
    y: metrics.mapTop + (clamp(worldY, WORLD.minY, WORLD.maxY) - WORLD.minY) * metrics.scale,
  };
}

function mapPointToWorldPoint(mapX, mapY, metrics) {
  return {
    x: clamp(WORLD.minX + (mapX - metrics.mapLeft) / metrics.scale, WORLD.minX, WORLD.maxX),
    y: clamp(WORLD.minY + (mapY - metrics.mapTop) / metrics.scale, WORLD.minY, WORLD.maxY),
  };
}

function setupWorldMapCanvas() {
  const canvas = ui.worldMapCanvas;
  if (!canvas) return null;
  applyWorldMapZoomLayout();
  const metrics = worldMapMetrics();
  if (!metrics) return null;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const pixelWidth = Math.floor(metrics.width * dpr);
  const pixelHeight = Math.floor(metrics.height * dpr);
  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }
  const ctxMap = canvas.getContext("2d");
  ctxMap.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ...metrics, ctx: ctxMap };
}

function drawWorldMapRoads(map) {
  const { ctx: ctxMap } = map;
  ctxMap.save();
  ctxMap.lineCap = "round";
  ctxMap.lineJoin = "round";
  ctxMap.strokeStyle = "rgba(185, 181, 170, 0.72)";
  ctxMap.lineWidth = Math.max(8, ROAD_WIDTH * map.scale);
  ctxMap.beginPath();
  for (let i = 0; i < ROAD_SCENE_POINTS.length; i += 1) {
    const world = scenePointToWorld(ROAD_SCENE_POINTS[i].x, ROAD_SCENE_POINTS[i].z);
    const point = worldToMapPoint(world.x, world.y, map);
    if (i === 0) ctxMap.moveTo(point.x, point.y);
    else ctxMap.lineTo(point.x, point.y);
  }
  ctxMap.stroke();
  ctxMap.restore();
}

function drawWorldMapTerrain(map) {
  const { ctx: ctxMap } = map;
  for (const feature of TERRAIN_FEATURES) {
    const world = scenePointToWorld(feature.sceneX, feature.sceneZ);
    const point = worldToMapPoint(world.x, world.y, map);
    ctxMap.save();
    ctxMap.translate(point.x, point.y);
    ctxMap.rotate(feature.rotation || 0);
    ctxMap.fillStyle = colorHex(feature.color, feature.kind === "lowland" ? "#172713" : feature.kind === "mountain" ? "#4c5548" : "#38512f");
    ctxMap.globalAlpha = feature.kind === "lowland" ? 0.74 : feature.kind === "mountain" ? 0.68 : 0.58;
    ctxMap.beginPath();
    ctxMap.ellipse(0, 0, feature.rx * WORLD_SCALE * map.scale, feature.rz * WORLD_SCALE * map.scale, 0, 0, TWO_PI);
    ctxMap.fill();
    ctxMap.restore();
  }

  ctxMap.save();
  for (const detail of TERRAIN_DETAILS) {
    if (terrainDetailIsCut(detail)) continue;
    const world = scenePointToWorld(detail.sceneX, detail.sceneZ);
    const point = worldToMapPoint(world.x, world.y, map);
    ctxMap.fillStyle = detail.kind === "tree" ? (detail.type === "cedar" ? "#173d22" : "#31512f") : "#3d5a33";
    ctxMap.beginPath();
    ctxMap.arc(point.x, point.y, Math.max(1.4, detail.scale * 4.2), 0, TWO_PI);
    ctxMap.fill();
  }
  ctxMap.restore();
}

function drawWorldMapMainCity(map) {
  const { ctx: ctxMap } = map;
  const rawWorldToMapPoint = (worldX, worldY) => ({
    x: map.mapLeft + (worldX - WORLD.minX) * map.scale,
    y: map.mapTop + (worldY - WORLD.minY) * map.scale,
  });
  const center = rawWorldToMapPoint(MAIN_CITY_CENTER.x, MAIN_CITY_CENTER.y);
  const size = MAIN_CITY_SCENE.size * WORLD_SCALE * map.scale;
  ctxMap.save();
  ctxMap.beginPath();
  ctxMap.rect(map.mapLeft, map.mapTop, map.mapWidth, map.mapHeight);
  ctxMap.clip();
  ctxMap.save();
  ctxMap.translate(center.x, center.y);
  ctxMap.rotate(MAIN_CITY_SCENE.rotation);
  ctxMap.fillStyle = "rgba(90, 90, 82, 0.84)";
  ctxMap.fillRect(-size / 2, -size / 2, size, size);
  ctxMap.strokeStyle = "rgba(210, 202, 185, 0.38)";
  ctxMap.lineWidth = 1.5;
  ctxMap.strokeRect(-size / 2, -size / 2, size, size);
  ctxMap.fillStyle = "rgba(119, 119, 111, 0.95)";
  ctxMap.fillRect(-size * 0.48, -Math.max(2, ROAD_WIDTH * map.scale * 0.52), size * 0.96, Math.max(4, ROAD_WIDTH * map.scale));
  ctxMap.fillRect(-Math.max(2, ROAD_WIDTH * map.scale * 0.52), -size * 0.48, Math.max(4, ROAD_WIDTH * map.scale), size * 0.96);
  ctxMap.restore();

  for (const building of MAIN_CITY_BUILDINGS) {
    const world = scenePointToWorld(building.sceneX, building.sceneZ);
    const point = rawWorldToMapPoint(world.x, world.y);
    const w = Math.max(2.5, building.width * WORLD_SCALE * map.scale);
    const d = Math.max(2, building.depth * WORLD_SCALE * map.scale);
    ctxMap.save();
    ctxMap.translate(point.x, point.y);
    ctxMap.rotate(building.rotation);
    ctxMap.fillStyle = building.roof === "redTile" ? "#60302a" : "#1d2024";
    ctxMap.fillRect(-w / 2, -d / 2, w, d);
    ctxMap.restore();
  }
  ctxMap.restore();
}

function drawWorldMapBuildings(map) {
  const { ctx: ctxMap } = map;
  drawWorldMapMainCity(map);
  for (const prop of STATIC_PROPS) {
    const world = scenePointToWorld(prop.sceneX, prop.sceneZ);
    const point = worldToMapPoint(world.x, world.y, map);
    let color = null;
    let size = 0;
    if (prop.kind === "house") {
      color = "#ded8c8";
      size = 16 * (prop.scale || 1);
    } else if (prop.kind === "blacksmithShop") {
      color = "#d86a2a";
      size = 18 * (prop.scale || 1);
    } else if (prop.kind === "villageShop") {
      color = "#5d9a78";
      size = 18 * (prop.scale || 1);
    } else if (prop.kind === "shrine") {
      color = "#caa65a";
      size = 22 * (prop.scale || 1);
    } else if (prop.kind === "torii") {
      color = "#9f2f2f";
      size = 9 * (prop.scale || 1);
    }
    if (!color) continue;
    ctxMap.save();
    ctxMap.translate(point.x, point.y);
    ctxMap.rotate(prop.rotation || 0);
    ctxMap.fillStyle = color;
    ctxMap.fillRect(-size / 2, -size / 2, size, size);
    ctxMap.restore();
  }
}

function drawWorldMapDanger(map) {
  const { ctx: ctxMap } = map;
  const point = worldToMapPoint(BATTLE_CENTER.x, BATTLE_CENTER.y, map);
  const radius = BATTLE_ARENA_RADIUS * map.scale;
  ctxMap.save();
  ctxMap.strokeStyle = "rgba(193, 35, 35, 0.92)";
  ctxMap.fillStyle = "rgba(159, 31, 36, 0.1)";
  ctxMap.lineWidth = 2.4;
  ctxMap.beginPath();
  ctxMap.arc(point.x, point.y, radius, 0, TWO_PI);
  ctxMap.fill();
  ctxMap.stroke();
  ctxMap.restore();
}

function drawWorldMapPlayer(map) {
  if (!state.player) return;
  const { ctx: ctxMap } = map;
  const point = worldToMapPoint(state.player.x, state.player.y, map);
  ctxMap.save();
  ctxMap.translate(point.x, point.y);
  ctxMap.rotate((state.player.face || 0) + Math.PI / 2);
  ctxMap.fillStyle = "#f7f0da";
  ctxMap.strokeStyle = "rgba(9, 8, 7, 0.72)";
  ctxMap.lineWidth = 1.5;
  ctxMap.beginPath();
  ctxMap.moveTo(0, -9);
  ctxMap.lineTo(7, 8);
  ctxMap.lineTo(0, 4);
  ctxMap.lineTo(-7, 8);
  ctxMap.closePath();
  ctxMap.fill();
  ctxMap.stroke();
  ctxMap.restore();
}

function positionWorldMapAnchors(map) {
  for (const anchor of MAP_ANCHORS) {
    const button = anchor.key === "village"
      ? ui.villageMapAnchor
      : anchor.key === "southwestCity"
        ? ui.southwestCityMapAnchor
        : null;
    if (!button) continue;
    const point = worldToMapPoint(anchor.x, anchor.y, map);
    button.style.left = `${point.x}px`;
    button.style.top = `${point.y}px`;
    button.dataset.anchor = anchor.key;
    button.querySelector("span").textContent = anchor.label || "";
    button.querySelector("b").textContent = anchor.name || "";
  }
}

function renderWorldMap() {
  if (!ui.worldMapScreen || ui.worldMapScreen.hidden) return;
  const map = setupWorldMapCanvas();
  if (!map) return;
  const { ctx: ctxMap, width, height, padding } = map;
  ctxMap.clearRect(0, 0, width, height);
  ctxMap.fillStyle = "#243820";
  ctxMap.fillRect(0, 0, width, height);
  ctxMap.fillStyle = "rgba(0, 0, 0, 0.24)";
  ctxMap.fillRect(padding, padding, map.innerWidth, map.innerHeight);
  ctxMap.fillStyle = "#314d2d";
  ctxMap.fillRect(map.mapLeft, map.mapTop, map.mapWidth, map.mapHeight);

  const currentAreaMin = worldToMapPoint(WORLD.currentMinX, WORLD.currentMinY, map);
  const currentAreaMax = worldToMapPoint(WORLD.currentMaxX, WORLD.currentMaxY, map);
  ctxMap.save();
  ctxMap.strokeStyle = "rgba(238, 230, 210, 0.16)";
  ctxMap.fillStyle = "rgba(238, 230, 210, 0.045)";
  ctxMap.lineWidth = 1.5;
  ctxMap.fillRect(currentAreaMin.x, currentAreaMin.y, currentAreaMax.x - currentAreaMin.x, currentAreaMax.y - currentAreaMin.y);
  ctxMap.strokeRect(currentAreaMin.x, currentAreaMin.y, currentAreaMax.x - currentAreaMin.x, currentAreaMax.y - currentAreaMin.y);
  ctxMap.restore();

  drawWorldMapTerrain(map);
  drawWorldMapRoads(map);
  drawWorldMapBuildings(map);
  drawWorldMapDanger(map);
  drawWorldMapPlayer(map);

  ctxMap.save();
  ctxMap.strokeStyle = "rgba(238, 230, 210, 0.24)";
  ctxMap.lineWidth = 2;
  ctxMap.strokeRect(map.mapLeft, map.mapTop, map.mapWidth, map.mapHeight);
  ctxMap.restore();

  positionWorldMapAnchors(map);
  if (ui.worldMapRegionLabel) ui.worldMapRegionLabel.textContent = `${WORLD.w}×${WORLD.h}`;
  updateWorldMapZoomUi();
}

function centerWorldMapOnPlayer() {
  if (!ui.worldMapScroll || !state.player) return;
  const map = worldMapMetrics();
  if (!map) return;
  const point = worldToMapPoint(state.player.x, state.player.y, map);
  const scroll = ui.worldMapScroll;
  scroll.scrollLeft = Math.max(0, point.x - scroll.clientWidth / 2);
  scroll.scrollTop = Math.max(0, point.y - scroll.clientHeight / 2);
}

function worldMapViewportFocus() {
  const scroll = ui.worldMapScroll;
  if (!scroll) return null;
  const map = worldMapMetrics();
  if (!map) return null;
  return mapPointToWorldPoint(
    scroll.scrollLeft + scroll.clientWidth / 2,
    scroll.scrollTop + scroll.clientHeight / 2,
    map,
  );
}

function scrollWorldMapToWorldPoint(worldPoint, align = { x: 0.5, y: 0.5 }) {
  const scroll = ui.worldMapScroll;
  if (!scroll || !worldPoint) return;
  const map = worldMapMetrics();
  if (!map) return;
  const point = worldToMapPoint(worldPoint.x, worldPoint.y, map);
  scroll.scrollLeft = clamp(point.x - scroll.clientWidth * align.x, 0, Math.max(0, scroll.scrollWidth - scroll.clientWidth));
  scroll.scrollTop = clamp(point.y - scroll.clientHeight * align.y, 0, Math.max(0, scroll.scrollHeight - scroll.clientHeight));
}

function setWorldMapZoom(nextZoom, options = {}) {
  if (!ui.worldMapScreen || ui.worldMapScreen.hidden) return;
  const next = clampWorldMapZoom(nextZoom);
  if (Math.abs(next - worldMapZoom) < 0.001) return;
  const focus = options.focus || worldMapViewportFocus() || state.player;
  worldMapZoom = next;
  renderWorldMap();
  scrollWorldMapToWorldPoint(focus, options.align || { x: 0.5, y: 0.5 });
}

function stepWorldMapZoom(direction) {
  const multiplier = direction > 0 ? WORLD_MAP_ZOOM_STEP : 1 / WORLD_MAP_ZOOM_STEP;
  setWorldMapZoom(worldMapZoom * multiplier);
}

function worldMapMouseFocus(event) {
  const map = worldMapMetrics();
  const canvas = ui.worldMapCanvas;
  if (!map || !canvas) return null;
  const rect = canvas.getBoundingClientRect();
  return mapPointToWorldPoint(event.clientX - rect.left, event.clientY - rect.top, map);
}

function handleWorldMapWheel(event) {
  if (ui.worldMapScreen.hidden) return;
  const pinchZooming = event.ctrlKey || event.metaKey;
  if (!pinchZooming) return;
  event.preventDefault();
  const focus = worldMapMouseFocus(event) || worldMapViewportFocus();
  const align = {
    x: ui.worldMapScroll ? clamp((event.clientX - ui.worldMapScroll.getBoundingClientRect().left) / Math.max(1, ui.worldMapScroll.clientWidth), 0, 1) : 0.5,
    y: ui.worldMapScroll ? clamp((event.clientY - ui.worldMapScroll.getBoundingClientRect().top) / Math.max(1, ui.worldMapScroll.clientHeight), 0, 1) : 0.5,
  };
  const multiplier = Math.exp(-event.deltaY * WORLD_MAP_PINCH_ZOOM_SENSITIVITY);
  setWorldMapZoom(worldMapZoom * multiplier, { focus, align });
}

function handleWorldMapKeydown(event) {
  if (ui.worldMapScreen.hidden) return false;
  if (event.code === "Equal" || event.code === "NumpadAdd") {
    setWorldMapZoom(worldMapZoom * WORLD_MAP_ZOOM_STEP);
  } else if (event.code === "Minus" || event.code === "NumpadSubtract") {
    setWorldMapZoom(worldMapZoom / WORLD_MAP_ZOOM_STEP);
  } else if (event.code === "Digit0" || event.code === "Numpad0") {
    setWorldMapZoom(1);
  } else {
    return false;
  }
  event.preventDefault();
  return true;
}

function openWorldMap() {
  if (!activeAccount || state.mode === "worldMap" || !canPauseWorldMode(state.mode)) return;
  const pause = pauseWorldForOverlay("worldMap");
  if (!pause.pausedMode) return;
  worldMapPausedMode = pause.pausedMode;
  worldMapPausedBgm = pause.pausedBgm;
  ui.worldMapScreen.hidden = false;
  ui.worldMapScreen.classList.add("show");
  updateOverlayOpenFlag();
  updateWorldMapZoomUi();
  renderWorldMap();
  centerWorldMapOnPlayer();
  requestAnimationFrame(() => {
    renderWorldMap();
    centerWorldMapOnPlayer();
  });
}

function closeWorldMap({ restore = true } = {}) {
  ui.worldMapScreen.classList.remove("show");
  ui.worldMapScreen.hidden = true;
  const restoreMode = worldMapPausedMode;
  const restoreBgm = worldMapPausedBgm;
  if (restore) restoreWorldFromOverlay(restoreMode, restoreBgm, "worldMap");
  worldMapPausedMode = null;
  worldMapPausedBgm = false;
  updateOverlayOpenFlag();
}

function teleportToMapAnchor(anchorKey) {
  const anchor = MAP_ANCHORS.find((item) => item.key === anchorKey);
  if (!anchor || !state.player) return;
  if (worldMapPausedMode === "playing") {
    flashMessage("戰鬥中，錨點沉默。", 2.2);
    tone(180, 0.04, 0.008, "triangle");
    return;
  }
  const resumeBgm = worldMapPausedBgm;
  state.player.x = anchor.x;
  state.player.y = anchor.y;
  state.player.vx = 0;
  state.player.vy = 0;
  state.player.face = -Math.PI / 2;
  state.player.glideActive = false;
  state.player.dashTime = 0;
  state.player.jumpTime = 0;
  state.player.height = 0;
  state.player.fallSpeed = 0;
  state.player.platform = null;
  clearClimbState(state.player);
  clearInputState();
  closeWorldMap({ restore: false });
  state.mode = "explore";
  document.body.dataset.mode = state.mode;
  running = true;
  lastTime = performance.now();
  if (resumeBgm) playZoneBgm(false);
  locationSaveTimer = 0;
  lastSavedLocationKey = "";
  saveCurrentLocation({ force: true }).catch(() => {});
  flashMessage(`${anchor.name}へ戻った。`, 2.8);
  tone(392, 0.08, 0.012, "sine");
  requestAnimationFrame(() => {
    syncCameraView();
    renderWorldMap();
  });
}

function inventoryAvailableSpaceClient(key) {
  if (!itemDefinition(key)) return 0;
  if (itemIsStackable(key)) return Math.max(0, itemMax(key) - inventoryQuantity(key));
  return Math.max(0, 200 - inventoryQuantity(key));
}

function shopErrorText(error) {
  const message = String(error?.message || "");
  if (message.includes("Not enough coins")) return "銅円が足りない。";
  if (message.includes("sold out")) return "今日はもう売り切れている。";
  if (message.includes("Inventory is full")) return "背包がいっぱいだ。";
  if (message.includes("not in today's shop")) return "今日の棚には並んでいない。";
  return message || "店の棚が応えない。";
}

function makeShopItemRow(entry) {
  const item = itemDefinition(entry.itemKey);
  const rarity = itemQuality(item || entry);
  const cell = document.createElement("button");
  const icon = document.createElement("span");
  const body = document.createElement("span");
  const name = document.createElement("strong");
  const meta = document.createElement("span");
  const qualityBadge = document.createElement("span");
  const heldBadge = document.createElement("span");
  const action = document.createElement("span");
  const soldOut = !entry.infinite && entry.remaining <= 0;
  const noSpace = inventoryAvailableSpaceClient(entry.itemKey) <= 0;
  const noCoins = getAccountCoins() < entry.price;
  const canAttemptBuy = !soldOut && !noSpace && !noCoins;
  const held = inventoryQuantity(entry.itemKey);
  const max = itemMax(entry.itemKey);
  const stockText = entry.infinite ? "常備" : `殘 ${entry.remaining}/${entry.stock}`;
  const stateText = soldOut ? "售罄" : noSpace ? "背包已滿" : noCoins ? "銅円不足" : `購買 ${formatCoins(entry.price)}`;
  const disabledReason = soldOut
    ? "売り切れ"
    : noSpace
      ? "背包已滿"
      : noCoins
        ? "銅円不足"
        : "";

  cell.className = "shop-item-cell";
  cell.type = "button";
  cell.dataset.quality = rarity;
  cell.dataset.soldOut = soldOut ? "true" : "false";
  cell.style.setProperty("--quality-color", rarityColor(rarity));
  cell.disabled = shopBusy || soldOut || noSpace || noCoins;
  cell.classList.toggle("shop-item-disabled", cell.disabled);
  cell.classList.toggle("sold-out", soldOut);
  cell.title = disabledReason || `${item?.name || entry.itemKey}を買う`;
  if (item) attachItemTooltip(cell, effectiveItem(item, 0), 0, { quantity: held });

  icon.className = "shop-item-icon";
  setItemIconContent(icon, item || entry, item?.icon || "品");
  body.className = "shop-item-body";
  name.className = "shop-item-name";
  name.textContent = item?.name || entry.itemName || entry.itemKey;
  meta.className = "shop-item-meta";
  qualityBadge.className = "inventory-quality";
  qualityBadge.textContent = rarityLabel(rarity);
  heldBadge.className = "inventory-level shop-stock-badge";
  heldBadge.textContent = `${stockText} · ${held}/${max}`;
  action.className = "shop-item-action";
  action.textContent = shopBusy && canAttemptBuy ? "處理中" : stateText;
  meta.append(qualityBadge, heldBadge);
  body.append(name, meta);
  cell.append(icon, body, action);
  cell.addEventListener("click", () => buyShopItem(entry.itemKey));
  return cell;
}

function shopEntryIsSoldOut(entry) {
  return Boolean(entry && !entry.infinite && entry.remaining <= 0);
}

function shopEntriesForDisplay(entries = []) {
  return [...entries]
    .map((entry, index) => ({ entry, index }))
    .sort((a, b) => Number(shopEntryIsSoldOut(a.entry)) - Number(shopEntryIsSoldOut(b.entry)) || a.index - b.index)
    .map(({ entry }) => entry);
}

function renderShopList(container, entries, emptyText) {
  if (!container) return;
  container.innerHTML = "";
  if (!entries?.length) {
    const empty = document.createElement("div");
    empty.className = "shop-empty";
    empty.textContent = emptyText;
    container.append(empty);
    return;
  }
  for (const entry of shopEntriesForDisplay(entries)) container.append(makeShopItemRow(entry));
}

function renderShop(shop = currentShop) {
  if (!ui.shopScreen) return;
  currentShop = shop || currentShop;
  if (ui.shopDayLabel) ui.shopDayLabel.textContent = currentShop?.dayKey || "讀取中";
  if (ui.shopCoinLabel) ui.shopCoinLabel.textContent = formatCoins(getAccountCoins());
  renderShopList(ui.shopInfiniteList, currentShop?.infinite || [], "常備棚を整えている。");
  renderShopList(ui.shopDailyList, currentShop?.daily || [], "今日の棚を整えている。");
}

async function openShop() {
  if (!activeAccount || state.mode === "shop" || !canPauseWorldMode(state.mode)) return;
  const pause = pauseWorldForOverlay("shop");
  if (!pause.pausedMode) return;
  shopPausedMode = pause.pausedMode;
  shopPausedBgm = pause.pausedBgm;
  currentShop = null;
  ui.shopScreen.hidden = false;
  ui.shopScreen.classList.add("show");
  updateOverlayOpenFlag();
  renderShop(null);
  try {
    const data = await apiRequest(`/api/accounts/${activeAccount.id}/shop`);
    activeAccount = data.account || activeAccount;
    currentShop = data.shop || null;
    updateAccountUi();
    renderShop(currentShop);
  } catch (error) {
    flashMessage(shopErrorText(error), 2.4);
    closeShop();
  }
}

function closeShop({ restore = true } = {}) {
  ui.shopScreen.classList.remove("show");
  ui.shopScreen.hidden = true;
  const restoreMode = shopPausedMode;
  const restoreBgm = shopPausedBgm;
  if (restore) restoreWorldFromOverlay(restoreMode, restoreBgm, "shop");
  shopPausedMode = null;
  shopPausedBgm = false;
  shopBusy = false;
  currentShop = null;
  updateOverlayOpenFlag();
}

async function buyShopItem(itemKey) {
  if (!activeAccount || shopBusy || !itemKey) return;
  shopBusy = true;
  renderShop();
  try {
    const data = await apiRequest(`/api/accounts/${activeAccount.id}/shop-buy`, {
      method: "POST",
      body: JSON.stringify({ itemKey }),
    });
    activeAccount = data.account;
    currentShop = data.shop || currentShop;
    renderOpenItemPanels();
    if (!ui.characterScreen.hidden) renderCharacterPanel();
    updateAccountUi();
    refreshAccounts();
    const item = itemDefinition(itemKey);
    flashMessage(`${item?.name || itemKey}を買った。`, 1.8);
    tone(520, 0.05, 0.012, "triangle");
  } catch (error) {
    flashMessage(shopErrorText(error), 2.4);
    tone(160, 0.05, 0.014, "triangle");
  } finally {
    shopBusy = false;
    renderShop();
  }
}

function blacksmithRewardForItem(item) {
  return BLACKSMITH_SMELT_REWARDS[itemQuality(item)] || { ore: 0, gold: 0 };
}

function blacksmithSelectionKey(entry) {
  return `${entry.key}:${entry.copyIndex}`;
}

function blacksmithWeaponEntries() {
  const inventory = getAccountInventory(activeAccount);
  const entries = inventoryEntriesForCategory({ key: "weapon" }, inventory).filter((entry) => !entry.stackable);
  return entries.sort((a, b) =>
    Number(Boolean(a.locked)) - Number(Boolean(b.locked)) ||
    itemQualityRank(b.rarity || "white") - itemQualityRank(a.rarity || "white") ||
    (b.resonanceLevel || 0) - (a.resonanceLevel || 0) ||
    a.name.localeCompare(b.name, "zh-Hant"));
}

function blacksmithSelectedEntries(entries = blacksmithWeaponEntries()) {
  const entryByKey = new Map(entries.map((entry) => [blacksmithSelectionKey(entry), entry]));
  for (const key of [...blacksmithSelections.keys()]) {
    const entry = entryByKey.get(key);
    if (!entry || entry.locked) blacksmithSelections.delete(key);
  }
  return [...blacksmithSelections.keys()].map((key) => entryByKey.get(key)).filter(Boolean);
}

function blacksmithTotals(entries = blacksmithSelectedEntries()) {
  return entries.reduce((totals, entry) => {
    const reward = blacksmithRewardForItem(entry);
    totals.ore += reward.ore;
    totals.gold += reward.gold;
    totals.coinCost += reward.ore;
    return totals;
  }, { coinCost: 0, ore: 0, gold: 0 });
}

function makeBlacksmithWeaponCell(entry) {
  const level = normalizeResonanceLevel(entry.resonanceLevel);
  const effective = effectiveItem(entry, level);
  const quality = inventoryQualityForLevel(entry, level);
  const reward = blacksmithRewardForItem(entry);
  const key = blacksmithSelectionKey(entry);
  const selected = blacksmithSelections.has(key);
  const cell = document.createElement("button");
  const icon = document.createElement("span");
  const name = document.createElement("strong");
  const qualityBadge = document.createElement("span");
  const rewardBadge = document.createElement("span");
  cell.className = "inventory-cell";
  cell.type = "button";
  cell.dataset.quality = quality;
  cell.classList.toggle("locked", Boolean(entry.locked));
  cell.classList.toggle("smelt-selected", selected);
  cell.disabled = blacksmithBusy || entry.locked;
  attachItemTooltip(cell, effective, level, { sameLevelCount: sameResonanceCopyCount(entry.key, level) });
  icon.className = "inventory-icon";
  setItemIconContent(icon, entry, entry.icon || entry.name.slice(0, 1));
  name.textContent = entry.name;
  qualityBadge.className = "inventory-quality";
  qualityBadge.textContent = rarityLabel(quality);
  rewardBadge.className = "inventory-level";
  rewardBadge.textContent = `+${reward.ore}礦${reward.gold ? ` +${reward.gold}金` : ""}`;
  cell.append(icon, name, qualityBadge, rewardBadge);
  if (entry.locked) {
    const lockBadge = document.createElement("span");
    lockBadge.className = "inventory-lock";
    lockBadge.textContent = "鎖";
    cell.append(lockBadge);
  } else {
    const resonanceBadge = document.createElement("span");
    resonanceBadge.className = "inventory-resonance";
    resonanceBadge.textContent = resonanceName(level);
    resonanceBadge.classList.toggle("true-resonance-name", isTrueResonance(level));
    cell.append(resonanceBadge);
  }
  cell.addEventListener("click", () => {
    if (blacksmithSelections.has(key)) blacksmithSelections.delete(key);
    else blacksmithSelections.set(key, {
      itemKey: entry.key,
      copyIndex: entry.copyIndex,
      resonanceLevel: level,
    });
    renderBlacksmith();
  });
  return cell;
}

function renderBlacksmith() {
  if (!ui.blacksmithScreen || ui.blacksmithScreen.hidden) return;
  const entries = blacksmithWeaponEntries();
  const selected = blacksmithSelectedEntries(entries);
  const totals = blacksmithTotals(selected);
  if (ui.blacksmithCoinAmount) ui.blacksmithCoinAmount.textContent = formatCoins(getAccountCoins(activeAccount));
  if (ui.blacksmithGoldAmount) ui.blacksmithGoldAmount.textContent = formatGold(getAccountGold(activeAccount));
  ui.blacksmithInventoryList.replaceChildren();
  for (const entry of entries) ui.blacksmithInventoryList.append(makeBlacksmithWeaponCell(entry));
  const slotCount = Math.max(12, Math.ceil(Math.max(entries.length, 1) / 4) * 4);
  for (let i = entries.length; i < slotCount; i += 1) ui.blacksmithInventoryList.append(makeEmptyInventoryCell());
  ui.blacksmithEmpty.hidden = entries.length > 0;
  ui.blacksmithSettlementItems.replaceChildren();
  if (!selected.length) {
    const empty = document.createElement("div");
    const label = document.createElement("span");
    const value = document.createElement("b");
    empty.className = "blacksmith-summary-row";
    label.textContent = "選擇不再需要的武器";
    value.textContent = "未選";
    empty.append(label, value);
    ui.blacksmithSettlementItems.append(empty);
  } else {
    for (const entry of selected) {
      const reward = blacksmithRewardForItem(entry);
      const row = document.createElement("div");
      const name = document.createElement("span");
      const gain = document.createElement("b");
      row.className = "blacksmith-summary-row";
      name.textContent = itemLabelText(entry.name, entry.resonanceLevel);
      gain.textContent = `+${reward.ore}礦${reward.gold ? ` +${reward.gold}金` : ""}`;
      row.append(name, gain);
      ui.blacksmithSettlementItems.append(row);
    }
  }
  ui.blacksmithCoinCost.textContent = formatCoins(totals.coinCost);
  ui.blacksmithOreGain.textContent = String(totals.ore);
  ui.blacksmithGoldGain.textContent = String(totals.gold);
  ui.blacksmithCoinCost.closest("small")?.classList.toggle("missing", getAccountCoins(activeAccount) < totals.coinCost);
  const canSmelt = selected.length > 0 && !blacksmithBusy && getAccountCoins(activeAccount) >= totals.coinCost;
  ui.blacksmithSmeltButton.disabled = !canSmelt;
  ui.blacksmithSmeltButton.textContent = selected.length
    ? `拆解 ${selected.length} 件 · ${formatCoins(totals.coinCost)}`
    : "拆解";
}

function openBlacksmith() {
  if (!activeAccount || state.mode === "blacksmith" || !canPauseWorldMode(state.mode)) return;
  const pause = pauseWorldForOverlay("blacksmith");
  if (!pause.pausedMode) return;
  blacksmithPausedMode = pause.pausedMode;
  blacksmithPausedBgm = pause.pausedBgm;
  blacksmithSelections.clear();
  ui.blacksmithScreen.hidden = false;
  ui.blacksmithScreen.classList.add("show");
  updateOverlayOpenFlag();
  renderBlacksmith();
}

function closeBlacksmith({ restore = true } = {}) {
  ui.blacksmithScreen.classList.remove("show");
  ui.blacksmithScreen.hidden = true;
  const restoreMode = blacksmithPausedMode;
  const restoreBgm = blacksmithPausedBgm;
  if (restore) restoreWorldFromOverlay(restoreMode, restoreBgm, "blacksmith");
  blacksmithPausedMode = null;
  blacksmithPausedBgm = false;
  blacksmithBusy = false;
  blacksmithSelections.clear();
  updateOverlayOpenFlag();
}

async function smeltBlacksmithSelection() {
  if (!activeAccount || blacksmithBusy) return;
  const entries = blacksmithSelectedEntries();
  const totals = blacksmithTotals(entries);
  if (!entries.length) return;
  if (getAccountCoins(activeAccount) < totals.coinCost) {
    flashMessage(`拆解には ${formatCoins(totals.coinCost)} が要る。`, 2.4);
    tone(160, 0.05, 0.014, "triangle");
    renderBlacksmith();
    return;
  }
  blacksmithBusy = true;
  renderBlacksmith();
  try {
    const data = await apiRequest(`/api/accounts/${activeAccount.id}/blacksmith-smelt`, {
      method: "POST",
      body: JSON.stringify({ selections: entries.map((entry) => ({
        itemKey: entry.key,
        copyIndex: entry.copyIndex,
        resonanceLevel: entry.resonanceLevel,
      })) }),
    });
    activeAccount = data.account || activeAccount;
    blacksmithSelections.clear();
    updateAccountUi();
    renderOpenItemPanels();
    renderBlacksmith();
    if (!ui.characterScreen.hidden) renderCharacterPanel();
    refreshAccounts();
    flashMessage(`${data.results?.length || entries.length}件を解き、礦石${data.ore || 0}${data.gold ? `・金${data.gold}` : ""}を得た。`, 3);
    tone(196, 0.07, 0.016, "triangle");
    setTimeout(() => tone(330, 0.08, 0.012, "sine"), 95);
  } catch (error) {
    const message = String(error?.message || "");
    flashMessage(message.includes("coins") ? "銅円が足りない。" : "鍛冶場の火がまだ整わない。", 2.4);
    tone(150, 0.05, 0.014, "triangle");
  } finally {
    blacksmithBusy = false;
    renderBlacksmith();
  }
}

function gravePromptText(grave) {
  if (!grave) return "";
  if (graveUnlocked(grave.id)) return "墓碑はすでに結縁している。Eで静かに触れる。";
  return inventoryQuantity(SHOP_INFINITE_ITEM_KEY) > 0
    ? "墓碑が冷たく沈黙している。Eで淨念香燭を供える。"
    : "墓碑が冷たく沈黙している。淨念香燭が必要。";
}

async function bondGraveMarker(grave) {
  if (!activeAccount || !grave || graveBondBusy) return;
  if (graveUnlocked(grave.id)) {
    flashMessage("墓碑はすでに結縁済み。まだ語られない秘密が眠っている。", 2.6);
    tone(294, 0.06, 0.012, "sine");
    return;
  }
  if (inventoryQuantity(SHOP_INFINITE_ITEM_KEY) <= 0) {
    flashMessage("淨念香燭がない。店で求められる。", 2.4);
    tone(150, 0.06, 0.014, "triangle");
    return;
  }

  graveBondBusy = true;
  try {
    const data = await apiRequest(`/api/accounts/${activeAccount.id}/grave-bond`, {
      method: "POST",
      body: JSON.stringify({ graveId: grave.id }),
    });
    activeAccount = data.account || activeAccount;
    renderOpenItemPanels();
    updateAccountUi();
    refreshAccounts();
    addParticle(grave.x, grave.y, "#eee6d2", 20, 96);
    tone(392, 0.08, 0.016, "sine");
    setTimeout(() => tone(523, 0.1, 0.012, "triangle"), 90);
    flashMessage(`第${grave.index}基の墓碑と結縁した。記録の器がひとつ目覚めた。`, 3.2);
  } catch (error) {
    flashMessage(String(error?.message || "").includes("Missing incense") ? "淨念香燭がない。" : "墓碑はまだ応えない。", 2.4);
    tone(150, 0.06, 0.014, "triangle");
  } finally {
    graveBondBusy = false;
  }
}

function openFromSideMenu(openPanel) {
  const pause = releaseSideMenuPause();
  openPanel({ ...pause, returnToMenu: true });
}

function inventoryCategory(categoryKey = activeInventoryCategory) {
  return INVENTORY_CATEGORIES.find((category) => category.key === categoryKey) || INVENTORY_CATEGORIES[0];
}

function inventoryQualityForLevel(item, level) {
  return item.rarity || item.quality || "white";
}

const ITEM_QUALITY_ORDER = ["white", "green", "blue", "purple", "gold", "roseGold"];

function itemQualityRank(quality) {
  const index = ITEM_QUALITY_ORDER.indexOf(quality || "white");
  return index >= 0 ? index : 0;
}

function nextItemQuality(quality) {
  const index = ITEM_QUALITY_ORDER.indexOf(quality || "white");
  return index >= 0 && index < ITEM_QUALITY_ORDER.length - 1 ? ITEM_QUALITY_ORDER[index + 1] : null;
}

function itemCategoryName(item) {
  return INVENTORY_CATEGORIES.find((category) => category.key === item.category)?.name || "道具";
}

function sameResonanceCopyCount(key, resonanceLevel, account = activeAccount) {
  return inventoryCopies(key, account).filter((copy) => copyLevel(copy) === normalizeResonanceLevel(resonanceLevel) && !copyLocked(copy)).length;
}

function inventoryEntriesForCategory(category, inventory) {
  const entries = [];
  for (const item of DONATION_REWARDS.filter((reward) => reward.category === category.key)) {
    const entry = inventory[item.key] || cloneInventoryEntry(INVENTORY_DEFAULT[item.key], item.key);
    if (itemIsStackable(item)) {
      const quantity = Math.max(0, Math.floor(Number(entry.quantity) || 0));
      if (quantity > 0) entries.push({ ...item, stackable: true, quantity, locked: Boolean(entry.locked), resonanceLevel: 0, viewId: `${item.key}:stack` });
      continue;
    }
    const seen = new Map();
    for (const [copyIndex, copy] of (entry.copies || []).entries()) {
      const resonanceLevel = copyLevel(copy);
      const ordinal = (seen.get(resonanceLevel) || 0) + 1;
      seen.set(resonanceLevel, ordinal);
      entries.push({
        ...item,
        stackable: false,
        resonanceLevel,
        copyIndex,
        locked: copyLocked(copy),
        copyOrdinal: ordinal,
        viewId: `${item.key}:${resonanceLevel}:${copyIndex}`,
      });
    }
  }
  return entries;
}

function itemListForView(items) {
  const filtered = activeItemQualityFilter === "all"
    ? [...items]
    : items.filter((item) => (item.rarity || "white") === activeItemQualityFilter);
  if (!itemQualitySort) return filtered;
  return filtered.sort((a, b) =>
    itemQualityRank(b.rarity || "white") - itemQualityRank(a.rarity || "white") ||
    (b.resonanceLevel || 0) - (a.resonanceLevel || 0) ||
    itemCategoryName(a).localeCompare(itemCategoryName(b), "zh-Hant") ||
    a.name.localeCompare(b.name, "zh-Hant"),
  );
}

function syncItemControls() {
  for (const button of ui.itemQualityFilterButtons) {
    const active = button.dataset.qualityFilter === activeItemQualityFilter;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  }
  for (const button of ui.itemQualitySortButtons) {
    button.classList.toggle("active", itemQualitySort);
    button.setAttribute("aria-pressed", itemQualitySort ? "true" : "false");
    button.textContent = itemQualitySort ? "品質排序 高→低" : "品質排序";
  }
}

function renderOpenItemPanels() {
  if (!ui.backpackScreen.hidden) renderBackpack();
  if (!ui.codexScreen.hidden) renderCodex();
  if (ui.blacksmithScreen && !ui.blacksmithScreen.hidden) renderBlacksmith();
  syncItemControls();
}

function formatItemPercent(value, base = 1) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "";
  const delta = base === 1 ? numeric - 1 : numeric;
  const sign = delta >= 0 ? "+" : "-";
  return `${sign}${Math.round(Math.abs(delta) * 100)}%`;
}

function itemDetailLines(item, level = 0, options = {}) {
  const quality = item.rarity || "white";
  const lines = [
    item.name,
    `${itemCategoryName(item)} · ${rarityLabel(quality)}`,
  ];
  if (!itemIsStackable(item)) lines.push(`共鳴階：${resonanceName(level)}`);
  if (item.category === "weapon" && item.damage) lines.push(`傷害：${item.damage}`);
  if (itemIsStackable(item) && options.quantity !== undefined) lines.push(`持有：${options.quantity || 0}/${item.max || 1}`);
  else if (options.sameLevelCount) lines.push(`同名同階：${options.sameLevelCount}把`);
  if (item.consumable) lines.push("類型：消耗品");
  if (item.legacy) lines.push("類型：舊道具");
  lines.push(`效果：${item.playerDescription || item.effect || "無特殊效果"}`);

  if (item.stats || item.specialEffects) return lines;

  const stats = [];
  if (item.attackSpeed) stats.push(`攻擊速度：${formatItemPercent(item.attackSpeed)}`);
  if (item.phaseDamage?.shape) stats.push(`形階段傷害：${formatItemPercent(item.phaseDamage.shape)}`);
  if (item.forceOnHit) stats.push(`命中回勢：+${item.forceOnHit}`);
  if (item.dodgeStrike) stats.push(`閃避後下一擊：${formatItemPercent(item.dodgeStrike)}`);
  if (item.executeDamage) stats.push(`低血量傷害：${formatItemPercent(item.executeDamage)}`);
  if (item.thirdHitEcho) stats.push(`第三擊追斬：${Math.round(item.thirdHitEcho * 100)}%傷害`);
  if (item.aspectBreak) stats.push(`破相速度：${formatItemPercent(item.aspectBreak)}`);
  if (item.wishDamage) stats.push(`願階段傷害：${formatItemPercent(item.wishDamage)}`);
  if (item.battleShield) stats.push(`開戰護盾：${Math.round(item.battleShield * 100)}%生命`);
  if (item.finalSkillRate) stats.push(`Boss技能頻率：-${Math.round((1 - item.finalSkillRate) * 100)}%`);
  if (item.maxHp) stats.push(`最大生命：+${item.maxHp}`);
  if (item.moveSpeed) stats.push(`移動速度：${formatItemPercent(item.moveSpeed)}`);
  if (item.expBonus) stats.push(`經驗獲得：+${Math.round(item.expBonus * 100)}%`);
  if (item.maxHpMultiplier) stats.push(`最大生命倍率：${formatItemPercent(item.maxHpMultiplier)}`);
  if (item.lifeSteal) stats.push(`攻擊後恢復：${Math.round(item.lifeSteal * 100)}%傷害`);
  if (item.lifeStealCooldown) stats.push(`恢復冷卻：${item.lifeStealCooldown}秒`);
  if (item.bossMoveSpeed) stats.push(`執念速度：-${Math.round((1 - item.bossMoveSpeed) * 100)}%`);
  if (item.lowHpRestore) stats.push(`低血量恢復：${Math.round(item.lowHpRestore * 100)}%`);
  if (item.phaseSpeedBoost) stats.push(`換階加速：+${Math.round(item.phaseSpeedBoost * 100)}%`);
  if (item.bossDamage) stats.push(`對執念傷害：${formatItemPercent(item.bossDamage)}`);
  if (item.autoWave) stats.push(`自動祓力波動：3秒/次，半徑80，${Math.round((item.autoWaveDamage || 0.45) * 100)}%傷害`);
  if (item.ritualRange) stats.push(`相與願範圍：半徑${item.ritualRange}`);
  if (item.damagePerLevel) stats.push(`每層傷害增幅：+${Math.round(item.damagePerLevel * 100)}%`);
  if (item.pollutionReductionPerLevel) stats.push(`每層祟累積抑制：-${Math.round(item.pollutionReductionPerLevel * 100)}%`);
  if (item.armorReductionPerLevel) stats.push(`每層受傷減免：-${Math.round(item.armorReductionPerLevel * 100)}%`);
  if (stats.length) lines.push(`數值：${stats.join("；")}`);
  return lines;
}

function attachItemTooltip(element, item, level = 0, options = {}) {
  const details = itemDetailLines(item, level, options);
  element.classList.add("item-has-tooltip");
  element.dataset.tooltip = details.join("\n");
  element.setAttribute("aria-label", details.join("，"));
}

function renderBackpackTabs() {
  const category = inventoryCategory();
  activeInventoryCategory = category.key;
  for (const tab of ui.inventoryTabs) {
    const active = tab.dataset.inventoryCategory === activeInventoryCategory;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-pressed", active ? "true" : "false");
  }
}

function backpackSelectionForEntry(entry, level = normalizeResonanceLevel(entry?.resonanceLevel)) {
  return {
    key: entry.key,
    resonanceLevel: level,
    viewId: entry.viewId,
    stackable: entry.stackable,
    copyIndex: entry.copyIndex,
  };
}

function makeInventoryCell(entry) {
  const level = normalizeResonanceLevel(entry.resonanceLevel);
  const effective = effectiveItem(entry, level);
  const quality = inventoryQualityForLevel(entry, level);
  const cell = document.createElement("button");
  const icon = document.createElement("span");
  const name = document.createElement("strong");
  const qualityBadge = document.createElement("span");
  const active = selectedInventoryEntry?.viewId === entry.viewId;
  const sameLevelCount = entry.stackable ? 0 : sameResonanceCopyCount(entry.key, level);
  cell.className = "inventory-cell";
  cell.type = "button";
  cell.dataset.quality = quality;
  cell.classList.toggle("active", active);
  cell.classList.toggle("locked", Boolean(entry.locked));
  cell.setAttribute("role", "gridcell");
  attachItemTooltip(cell, effective, level, { quantity: entry.quantity, sameLevelCount });
  icon.className = "inventory-icon";
  setItemIconContent(icon, entry, entry.icon || entry.name.slice(0, 1));
  name.textContent = entry.name;
  qualityBadge.className = "inventory-quality";
  qualityBadge.textContent = rarityLabel(quality);
  cell.append(icon, name, qualityBadge);
  if (entry.locked) {
    const lockBadge = document.createElement("span");
    lockBadge.className = "inventory-lock";
    lockBadge.textContent = "鎖";
    cell.append(lockBadge);
  }
  if (entry.stackable) {
    const levelBadge = document.createElement("span");
    levelBadge.className = "inventory-level";
    levelBadge.textContent = `x${entry.quantity}`;
    cell.append(levelBadge);
  } else {
    const resonanceBadge = document.createElement("span");
    resonanceBadge.className = "inventory-resonance";
    resonanceBadge.textContent = resonanceName(level);
    resonanceBadge.classList.toggle("true-resonance-name", isTrueResonance(level));
    cell.append(resonanceBadge);
  }
  cell.addEventListener("click", () => {
    const locksOnThisClick = selectedInventoryEntry?.viewId === entry.viewId
      && inventoryClickLockTargetViewId === entry.viewId;
    selectedInventoryEntry = backpackSelectionForEntry(entry, level);
    if (locksOnThisClick) {
      inventoryClickLockTargetViewId = null;
      toggleItemLock(entry);
      return;
    }
    inventoryClickLockTargetViewId = entry.viewId;
    renderBackpack();
    focusSelectedInventoryCell();
  });
  return cell;
}

function makeEmptyInventoryCell() {
  const cell = document.createElement("div");
  cell.className = "inventory-cell empty";
  cell.setAttribute("role", "gridcell");
  return cell;
}

function selectedBackpackEntry() {
  if (!selectedInventoryEntry) return null;
  return backpackVisibleEntries.find((entry) => entry.viewId === selectedInventoryEntry.viewId) || null;
}

function inventoryGridColumnCount() {
  const cells = [...ui.inventoryList.querySelectorAll(".inventory-cell:not(.empty)")];
  if (cells.length <= 1) return 1;
  const firstTop = cells[0].getBoundingClientRect().top;
  let count = 0;
  for (const cell of cells) {
    if (Math.abs(cell.getBoundingClientRect().top - firstTop) > 2) break;
    count += 1;
  }
  return Math.max(1, count);
}

function focusSelectedInventoryCell() {
  const active = ui.inventoryList.querySelector(".inventory-cell.active");
  if (!active) return;
  active.focus({ preventScroll: true });
}

function selectBackpackEntryAt(index) {
  if (!backpackVisibleEntries.length) return;
  const entry = backpackVisibleEntries[clamp(index, 0, backpackVisibleEntries.length - 1)];
  inventoryClickLockTargetViewId = null;
  selectedInventoryEntry = backpackSelectionForEntry(entry);
  renderBackpack();
  focusSelectedInventoryCell();
}

function moveBackpackSelection(delta) {
  if (!backpackVisibleEntries.length) return;
  const currentIndex = Math.max(0, backpackVisibleEntries.findIndex((entry) => entry.viewId === selectedInventoryEntry?.viewId));
  selectBackpackEntryAt(currentIndex + delta);
}

function selectedEntryCanResonate(entry = selectedBackpackEntry()) {
  if (!entry || entry.stackable || entry.locked || resonanceBusy || itemTransformBusy) return false;
  const level = normalizeResonanceLevel(entry.resonanceLevel);
  return level < RESONANCE_MAX
    && sameResonanceCopyCount(entry.key, level) >= RESONANCE_COPY_COST
    && getAccountCoins(activeAccount) >= resonanceCoinCostForLevel(level, entry);
}

function selectedEntryCanPromoteQuality(entry = selectedBackpackEntry()) {
  if (!entry || entry.stackable || entry.locked || resonanceBusy || itemTransformBusy) return false;
  const level = normalizeResonanceLevel(entry.resonanceLevel);
  const quality = inventoryQualityForLevel(entry, level);
  return isTrueResonance(level) && Boolean(nextItemQuality(quality));
}

function selectedEntryCanRerollLower(entry = selectedBackpackEntry()) {
  if (!entry || entry.stackable || entry.locked || resonanceBusy || itemTransformBusy) return false;
  return normalizeResonanceLevel(entry.resonanceLevel) > 0;
}

function countPromotableTrueNameItems(account = activeAccount) {
  const inventory = getAccountInventory(account);
  let count = 0;
  for (const item of ITEM_DATA.items) {
    if (itemIsStackable(item)) continue;
    if (!nextItemQuality(itemQuality(item))) continue;
    const entry = normalizeInventoryEntry(inventory[item.key], INVENTORY_DEFAULT[item.key], item.key);
    count += entry.copies.filter((copy) => isTrueResonance(copyLevel(copy)) && !copyLocked(copy)).length;
  }
  return count;
}

function ensureBackpackSelection(entries) {
  if (!entries.length) {
    selectedInventoryEntry = null;
    inventoryClickLockTargetViewId = null;
    return;
  }
  if (selectedEntryStillVisible(entries)) return;
  const first = entries[0];
  inventoryClickLockTargetViewId = null;
  selectedInventoryEntry = backpackSelectionForEntry(first);
}

function handleBackpackKeydown(event) {
  if (ui.backpackScreen.hidden) return false;
  const key = event.key?.toLowerCase();
  if (event.code === "ArrowLeft") {
    moveBackpackSelection(-1);
  } else if (event.code === "ArrowRight") {
    moveBackpackSelection(1);
  } else if (event.code === "ArrowUp") {
    moveBackpackSelection(-inventoryGridColumnCount());
  } else if (event.code === "ArrowDown") {
    moveBackpackSelection(inventoryGridColumnCount());
  } else if (event.code === "KeyS" || key === "s") {
    const entry = selectedBackpackEntry();
    if (selectedEntryCanResonate(entry)) resonateItem(entry.key, entry.resonanceLevel);
    else tone(180, 0.04, 0.008, "triangle");
  } else if (event.code === "KeyA" || key === "a") {
    resonateAllAvailableItems();
  } else if (event.code === "KeyJ" || key === "j") {
    promoteAllTrueNameItems();
  } else if (event.code === "KeyU" || key === "u") {
    transformSelectedItem("promote-quality");
  } else if (event.code === "KeyI" || key === "i") {
    transformSelectedItem("reroll-lower");
  } else {
    return false;
  }
  event.preventDefault();
  event.stopPropagation();
  return true;
}

function selectedEntryStillVisible(entries) {
  return selectedInventoryEntry && entries.some((entry) => entry.viewId === selectedInventoryEntry.viewId);
}

function renderInventoryDetail(entries) {
  if (!ui.inventoryDetail) return;
  if (!entries.length) {
    selectedInventoryEntry = null;
    ui.inventoryDetail.replaceChildren();
    const label = document.createElement("span");
    const title = document.createElement("strong");
    const text = document.createElement("p");
    label.textContent = "道具詳情";
    title.textContent = "此類尚空";
    text.textContent = "獲得道具後可以在這裡查看共鳴階。";
    ui.inventoryDetail.append(label, title, text);
    return;
  }
  ensureBackpackSelection(entries);

  const selected = entries.find((entry) => entry.viewId === selectedInventoryEntry?.viewId) || entries[0];
  const level = normalizeResonanceLevel(selected.resonanceLevel);
  const effective = effectiveItem(selected, level);
  const quality = inventoryQualityForLevel(selected, level);
  const sameLevelCount = selected.stackable ? 0 : sameResonanceCopyCount(selected.key, level);
  const coinCost = resonanceCoinCostForLevel(level, selected);
  const qualityMultiplier = resonanceQualityMultiplier(selected);
  const currentCoins = getAccountCoins(activeAccount);
  const hasCopies = sameLevelCount >= RESONANCE_COPY_COST;
  const hasCoins = currentCoins >= coinCost;
  const canResonate = !selected.stackable && !selected.locked && level < RESONANCE_MAX && hasCopies && hasCoins && !resonanceBusy && !itemTransformBusy;
  const canPromoteQuality = selectedEntryCanPromoteQuality(selected);
  const canRerollLower = selectedEntryCanRerollLower(selected);
  const promotableTrueNameCount = countPromotableTrueNameItems();
  const canBulkPromoteTrueName = promotableTrueNameCount > 0 && !resonanceBusy && !itemTransformBusy;
  const lines = itemDetailLines(effective, level, { quantity: selected.quantity, sameLevelCount });
  const nextLevel = level < RESONANCE_MAX ? level + 1 : level;
  const nextEffective = !selected.stackable && level < RESONANCE_MAX ? effectiveItem(selected, nextLevel) : null;

  ui.inventoryDetail.replaceChildren();
  ui.inventoryDetail.dataset.quality = quality;
  const meta = document.createElement("span");
  const title = document.createElement("strong");
  const effect = document.createElement("p");
  const list = document.createElement("div");
  const preview = document.createElement("div");
  const action = document.createElement("button");
  const transformActions = document.createElement("div");
  const bulkActions = document.createElement("div");
  meta.textContent = `${itemCategoryName(selected)} · ${rarityLabel(quality)}`;
  if (selected.stackable) title.textContent = selected.name;
  else title.replaceChildren(makeItemLabel(selected.name, level));
  effect.textContent = effective.effect || "無特殊效果";
  list.className = "inventory-detail-lines";
  for (const line of lines.slice(2).filter((line) => !line.startsWith("效果："))) {
    const row = document.createElement("small");
    if (!selected.stackable && line === `共鳴階：${resonanceName(level)}`) {
      row.classList.toggle("true-resonance-line", isTrueResonance(level));
      row.append("共鳴階：", makeResonanceLabel(level));
    } else {
      row.textContent = line;
    }
    list.append(row);
  }
  if (nextEffective) {
    preview.className = "inventory-detail-lines";
    const titleRow = document.createElement("small");
    const bodyRow = document.createElement("small");
    titleRow.textContent = `下一階：${resonanceName(nextLevel)}`;
    bodyRow.textContent = nextEffective.playerDescription || nextEffective.effect || "無特殊效果";
    preview.append(titleRow, bodyRow);
  }
  if (!selected.stackable && level < RESONANCE_MAX) {
    const fee = document.createElement("small");
    fee.classList.toggle("resonance-fee-missing", !hasCoins);
    fee.textContent = `共鳴費：${formatCoins(coinCost)} · 品質×${qualityMultiplier}`;
    list.append(fee);
  }
  if (selected.locked) {
    const locked = document.createElement("small");
    locked.textContent = "狀態：已鎖定";
    list.append(locked);
  }
  action.type = "button";
  action.className = "resonance-button";
  action.disabled = !canResonate;
  if (selected.stackable) {
    action.textContent = "消耗品暫無共鳴";
  } else if (selected.locked) {
    action.textContent = "已鎖定，不能共鳴";
  } else if (level >= RESONANCE_MAX) {
    action.classList.add("true-resonance-action");
    action.append("已達", makeResonanceLabel(level));
  } else {
    action.textContent = canResonate
      ? `共鳴：兩把${resonanceName(level)} · ${formatCoins(coinCost)}`
      : !hasCopies
        ? `需${RESONANCE_COPY_COST}把${resonanceName(level)} (${sameLevelCount}/${RESONANCE_COPY_COST})`
        : `銅円不足：需 ${formatCoins(coinCost)}`;
  }
  action.addEventListener("click", () => resonateItem(selected.key, level));
  transformActions.className = "inventory-transform-actions";
  bulkActions.className = "inventory-transform-actions";
  if (!selected.stackable) {
    const promote = document.createElement("button");
    const reroll = document.createElement("button");
    const bulkPromote = document.createElement("button");
    const lockToggle = document.createElement("button");
    promote.type = "button";
    reroll.type = "button";
    bulkPromote.type = "button";
    lockToggle.type = "button";
    promote.className = "resonance-button";
    reroll.className = "resonance-button";
    bulkPromote.className = "resonance-button";
    lockToggle.className = "resonance-button";
    promote.disabled = !canPromoteQuality;
    reroll.disabled = !canRerollLower;
    bulkPromote.disabled = !canBulkPromoteTrueName;
    lockToggle.disabled = resonanceBusy || itemTransformBusy;
    promote.textContent = canPromoteQuality
      ? `U 昇品質 → ${rarityLabel(nextItemQuality(quality))}`
      : isTrueResonance(level) && !nextItemQuality(quality)
        ? "U 最高品質"
        : "U 真銘で昇品質";
    reroll.textContent = canRerollLower ? `I 転銘 → ${resonanceName(level - 1)}` : "I 一銘以上";
    lockToggle.textContent = selected.locked ? "解鎖" : "鎖定";
    bulkPromote.textContent = canBulkPromoteTrueName
      ? `J 一括昇華 ×${promotableTrueNameCount}`
      : "J 昇華できる真銘なし";
    promote.addEventListener("click", () => transformSelectedItem("promote-quality"));
    reroll.addEventListener("click", () => transformSelectedItem("reroll-lower"));
    lockToggle.addEventListener("click", () => toggleItemLock(selected));
    bulkPromote.addEventListener("click", promoteAllTrueNameItems);
    transformActions.append(lockToggle, promote, reroll);
    bulkActions.append(bulkPromote);
  }
  ui.inventoryDetail.append(meta, title, effect, list);
  if (nextEffective) ui.inventoryDetail.append(preview);
  ui.inventoryDetail.append(action);
  if (transformActions.childElementCount) ui.inventoryDetail.append(transformActions);
  if (bulkActions.childElementCount) ui.inventoryDetail.append(bulkActions);
}

function renderBackpack() {
  ui.coinAmount.textContent = formatCoins(getAccountCoins(activeAccount));
  if (ui.goldAmount) ui.goldAmount.textContent = formatGold(getAccountGold(activeAccount));
  ui.inventoryList.replaceChildren();
  ui.inventoryList.setAttribute("role", "grid");
  renderBackpackTabs();

  const inventory = getAccountInventory(activeAccount);
  const category = inventoryCategory();
  const ownedItems = inventoryEntriesForCategory(category, inventory);
  const items = itemListForView(ownedItems);
  backpackVisibleEntries = items;
  ensureBackpackSelection(items);

  for (const item of items) {
    ui.inventoryList.append(makeInventoryCell(item));
  }

  const slotCount = Math.max(12, Math.ceil(Math.max(items.length, 1) / 4) * 4);
  for (let i = items.length; i < slotCount; i += 1) {
    ui.inventoryList.append(makeEmptyInventoryCell());
  }

  ui.backpackEmpty.hidden = items.length > 0;
  ui.backpackEmpty.textContent = ownedItems.length > 0
    ? `此分類沒有${rarityLabel(activeItemQualityFilter)}品質的道具。`
    : `${category.name}尚空。`;
  renderInventoryDetail(items);
  syncItemControls();
}

function openBackpack(options = {}) {
  if (!activeAccount) return;
  const pause = pauseWorldForOverlay("backpack", options);
  backpackPausedMode = pause.pausedMode;
  backpackPausedBgm = pause.pausedBgm;
  backpackReturnToMenu = Boolean(options.returnToMenu);
  inventoryClickLockTargetViewId = null;
  renderBackpack();
  ui.backpackScreen.hidden = false;
  ui.backpackScreen.classList.add("show");
  updateOverlayOpenFlag();
}

function closeBackpack() {
  ui.backpackScreen.classList.remove("show");
  ui.backpackScreen.hidden = true;
  const restoreMode = backpackPausedMode;
  const restoreBgm = backpackPausedBgm;
  const returnToMenu = backpackReturnToMenu;
  if (!returnToMenu) restoreWorldFromOverlay(restoreMode, restoreBgm, "backpack");
  backpackPausedMode = null;
  backpackPausedBgm = false;
  backpackReturnToMenu = false;
  inventoryClickLockTargetViewId = null;
  if (returnToMenu) returnToSideMenuFromPanel(restoreMode, restoreBgm);
  else updateOverlayOpenFlag();
}

async function toggleItemLock(entry) {
  if (!activeAccount || !entry || resonanceBusy || itemTransformBusy) return;
  const level = normalizeResonanceLevel(entry.resonanceLevel);
  const nextSelection = backpackSelectionForEntry(entry, level);
  resonanceBusy = true;
  try {
    const data = await apiRequest(`/api/accounts/${activeAccount.id}/inventory-lock`, {
      method: "POST",
      body: JSON.stringify({ itemKey: entry.key, copyIndex: entry.copyIndex, resonanceLevel: level }),
    });
    activeAccount = data.account || activeAccount;
    selectedInventoryEntry = nextSelection;
    inventoryClickLockTargetViewId = null;
    updateAccountUi();
    renderBackpack();
    if (!ui.characterScreen.hidden) renderCharacterPanel();
    refreshAccounts();
    flashMessage(data.result?.locked ? `${entry.name}に鎖を掛けた。` : `${entry.name}の鎖を解いた。`, 1.8);
    tone(data.result?.locked ? 247 : 330, 0.05, 0.01, "triangle");
  } catch {
    flashMessage("鎖がうまく掛からない。", 1.8);
    tone(150, 0.05, 0.012, "triangle");
    renderBackpack();
  } finally {
    resonanceBusy = false;
    renderBackpack();
  }
}

async function resonateItem(itemKey, resonanceLevel) {
  if (!activeAccount || resonanceBusy) return;
  const item = itemDefinition(itemKey);
  const level = normalizeResonanceLevel(resonanceLevel);
  const coinCost = resonanceCoinCostForLevel(level, item);
  if (!item || itemIsStackable(item) || level >= RESONANCE_MAX || sameResonanceCopyCount(itemKey, level) < RESONANCE_COPY_COST) return;
  if (getAccountCoins(activeAccount) < coinCost) {
    flashMessage(`共鳴には ${formatCoins(coinCost)} が要る。`, 2.4);
    tone(180, 0.04, 0.008, "triangle");
    renderBackpack();
    return;
  }
  resonanceBusy = true;
  renderBackpack();
  try {
    const data = await apiRequest(`/api/accounts/${activeAccount.id}/resonance`, {
      method: "POST",
      body: JSON.stringify({ itemKey, resonanceLevel: level }),
    });
    activeAccount = data.account;
    selectedInventoryEntry = { key: itemKey, resonanceLevel: level + 1, viewId: `${itemKey}:${level + 1}:1`, stackable: false };
    updateAccountUi();
    renderBackpack();
    if (!ui.characterScreen.hidden) renderCharacterPanel();
    refreshAccounts();
    flashMessage(`${item.name} は ${resonanceName(level + 1)} へ共鳴した。${formatCoins(data.coinCost ?? coinCost)}を納めた。`, 2.8);
    if (isTrueResonance(level + 1)) {
      const result = popupResultForItem(itemKey, { resonanceLevel: level + 1 });
      showItemPopup(result, popupOptionsForResult(result, "真銘"));
    }
    tone(523, 0.08, 0.014, "sine");
    setTimeout(() => tone(784, 0.12, 0.012, "triangle"), 95);
  } catch (error) {
    const message = String(error?.message || "");
    flashMessage(message.includes("coins") ? `銅円が足りない。${formatCoins(coinCost)}が必要。` : "共鳴はまだ整わない。", 2.2);
  } finally {
    resonanceBusy = false;
    renderBackpack();
  }
}

async function resonateAllAvailableItems() {
  if (!activeAccount || resonanceBusy) return;
  resonanceBusy = true;
  renderBackpack();
  try {
    const data = await apiRequest(`/api/accounts/${activeAccount.id}/resonance-all`, {
      method: "POST",
      body: JSON.stringify({}),
    });
    activeAccount = data.account;
    selectedInventoryEntry = null;
    updateAccountUi();
    renderBackpack();
    if (!ui.characterScreen.hidden) renderCharacterPanel();
    refreshAccounts();
    const count = data.count || data.operations?.length || 0;
    if (count > 0) {
      flashMessage(`${count}件の共鳴を整え、${formatCoins(data.coinCost || 0)}を納めた。`, 3);
      const trueNameOperations = (data.operations || []).filter((operation) => isTrueResonance(operation.resonanceLevel));
      if (trueNameOperations.length) {
        queueItemPopupEntries(trueNameOperations.map((result) => ({
          result,
          options: popupOptionsForResult(result, "真銘"),
        })));
      }
      tone(523, 0.08, 0.014, "sine");
      setTimeout(() => tone(784, 0.12, 0.012, "triangle"), 95);
    } else {
      flashMessage("今すぐ共鳴できる持物はない。", 2.2);
      tone(180, 0.04, 0.008, "triangle");
    }
  } catch {
    flashMessage("一括共鳴はまだ整わない。", 2.2);
  } finally {
    resonanceBusy = false;
    renderBackpack();
  }
}

async function promoteAllTrueNameItems() {
  if (!activeAccount || resonanceBusy || itemTransformBusy) return;
  if (countPromotableTrueNameItems() <= 0) {
    flashMessage("今は昇華できる真銘がない。", 2.2);
    tone(180, 0.04, 0.008, "triangle");
    return;
  }

  itemTransformBusy = true;
  renderBackpack();
  try {
    const data = await apiRequest(`/api/accounts/${activeAccount.id}/resonance-transform-all`, {
      method: "POST",
      body: JSON.stringify({ mode: "promote-quality" }),
    });
    activeAccount = data.account;
    selectedInventoryEntry = null;
    updateAccountUi();
    renderBackpack();
    if (!ui.characterScreen.hidden) renderCharacterPanel();
    refreshAccounts();
    const count = data.count || data.operations?.length || 0;
    if (count > 0) {
      flashMessage(`${count}件の真銘を昇華した。`, 3);
      queueItemPopupEntries((data.operations || []).map((result) => ({
        result,
        options: popupOptionsForResult(result, "昇華"),
      })));
      tone(523, 0.08, 0.014, "sine");
      setTimeout(() => tone(880, 0.12, 0.012, "triangle"), 95);
    } else {
      flashMessage("今は昇華できる真銘がない。", 2.2);
      tone(180, 0.04, 0.008, "triangle");
    }
  } catch {
    flashMessage("一括昇華はまだ整わない。", 2.2);
    tone(180, 0.04, 0.008, "triangle");
  } finally {
    itemTransformBusy = false;
    renderBackpack();
  }
}

async function transformSelectedItem(mode) {
  if (!activeAccount || resonanceBusy || itemTransformBusy) return;
  const entry = selectedBackpackEntry();
  if (!entry || entry.stackable) return;
  const level = normalizeResonanceLevel(entry.resonanceLevel);
  if (mode === "promote-quality" && !selectedEntryCanPromoteQuality(entry)) {
    flashMessage(isTrueResonance(level) ? "これ以上の品質は、まだ開かれていない。" : "真銘の持物だけが、上の品質へ移る。", 2.4);
    tone(180, 0.04, 0.008, "triangle");
    return;
  }
  if (mode === "reroll-lower" && !selectedEntryCanRerollLower(entry)) {
    flashMessage("一銘以上の持物だけが、名をほどける。", 2.4);
    tone(180, 0.04, 0.008, "triangle");
    return;
  }

  itemTransformBusy = true;
  renderBackpack();
  try {
    const data = await apiRequest(`/api/accounts/${activeAccount.id}/resonance-transform`, {
      method: "POST",
      body: JSON.stringify({ mode, itemKey: entry.key, resonanceLevel: level }),
    });
    activeAccount = data.account;
    const resultItem = itemDefinition(data.result?.itemKey);
    if (resultItem?.category) activeInventoryCategory = resultItem.category;
    selectedInventoryEntry = data.result
      ? { key: data.result.itemKey, resonanceLevel: data.result.resonanceLevel || 0, viewId: `${data.result.itemKey}:${data.result.resonanceLevel || 0}:1`, stackable: false }
      : null;
    updateAccountUi();
    renderBackpack();
    if (!ui.characterScreen.hidden) renderCharacterPanel();
    refreshAccounts();
    const resultName = resultItem?.name || data.result?.itemName || "持物";
    flashMessage(mode === "promote-quality"
      ? `${entry.name} は上の品質へ移り、${resultName} となった。`
      : `${entry.name} の銘をほどき、${resultName} となった。`, 3);
    showItemPopup(data.result, popupOptionsForResult(data.result, mode === "promote-quality" ? "昇華" : "転銘"));
    tone(523, 0.08, 0.014, "sine");
    setTimeout(() => tone(mode === "promote-quality" ? 880 : 660, 0.12, 0.012, "triangle"), 95);
  } catch (error) {
    const message = String(error?.message || "");
    flashMessage(message.includes("highest") ? "これ以上の品質は、まだ開かれていない。" : "転じる縁がまだ整わない。", 2.4);
    tone(180, 0.04, 0.008, "triangle");
  } finally {
    itemTransformBusy = false;
    renderBackpack();
  }
}

function formatPercent(value) {
  return `${Math.round(value * 100)}%`;
}

function statChip(label, value) {
  const item = document.createElement("div");
  const name = document.createElement("span");
  const amount = document.createElement("strong");
  item.className = "stat-chip";
  name.textContent = label;
  if (value instanceof Node) amount.append(value);
  else amount.textContent = value;
  item.append(name, amount);
  return item;
}

function renderCharacterStats() {
  const progress = getAccountProgress(activeAccount);
  const weapon = equippedWeapon();
  const prayer = equippedPrayer();
  const normalMin = weaponBaseDamage() * bossDamageMultiplier("shape");
  const normalMax = (weaponBaseDamage() + 100 * 0.08) * bossDamageMultiplier("shape");
  const glideMax = (weaponBaseDamage() + 100 * 0.08 + 18) * bossDamageMultiplier("shape");
  const armorReduction = 1 - armorDamageMultiplier();
  const pollutionReduction = 1 - pollutionGainMultiplier();
  const weaponLabel = weapon ? makeItemLabel(weapon.name, weapon.resonanceLevel) : "徒手";
  const prayerLabel = prayer ? makeItemLabel(prayer.name, prayer.resonanceLevel) : "未裝備";
  ui.characterName.textContent = activeAccount?.name || "月下行者";
  ui.characterRank.textContent = `祓道階 ${progress.rank} · ${progress.totalExp} EXP`;
  ui.characterStats.replaceChildren(
    statChip("心燈", String(playerMaxHp())),
    statChip("武器", weaponLabel),
    statChip("斬擊", `${normalMin.toFixed(1)}-${normalMax.toFixed(1)}`),
    statChip("遊中斬擊", glideMax.toFixed(1)),
    statChip("斬距", slashRange(weapon).toFixed(1)),
    statChip("攻擊間隔", `${(0.34 / attackSpeedMultiplier()).toFixed(2)}秒`),
    statChip("爆擊率", `${totalCritRatePct().toFixed(0)}%`),
    statChip("爆擊傷害", `${totalCritDamageBonusPct().toFixed(0)}%`),
    statChip("祈物", prayerLabel),
    statChip("受傷減免", formatPercent(armorReduction)),
    statChip("祟累積抑制", formatPercent(pollutionReduction)),
    statChip("勢恢復", `村 ${FORCE_RECOVER_EXPLORE}/秒 · 戰 ${FORCE_RECOVER_BATTLE}/秒`),
  );
}

function equippedItemLabel(slot, equipment, inventory) {
  const key = equipment[slot.key];
  const item = itemDefinition(key);
  if (!item) return "未裝備";
  const level = bestResonanceLevel(key, { inventory });
  const copies = inventoryQuantity(key, { inventory });
  return makeItemLabel(item.name, level, copies);
}

function makeEquipmentButton(slot, item, inventory, equipment) {
  const owned = itemOwned(item.key, { inventory });
  const level = bestResonanceLevel(item.key, { inventory });
  const copies = inventoryQuantity(item.key, { inventory });
  const effective = effectiveItem(item, level);
  const quality = inventoryQualityForLevel(item, level);
  const button = document.createElement("button");
  button.type = "button";
  button.className = "equipment-option";
  button.dataset.quality = quality;
  const icon = makeItemIcon(item, "equipment-option-icon", item.icon || item.name.slice(0, 1));
  const label = document.createElement("span");
  label.className = "equipment-option-label";
  if (owned) label.append(makeItemLabel(item.name, level, copies));
  else label.textContent = `${item.name} 未得`;
  button.replaceChildren(icon, label);
  attachItemTooltip(button, effective, level, { sameLevelCount: sameResonanceCopyCount(item.key, level, { inventory }) });
  button.disabled = equipmentBusy || !owned;
  button.classList.toggle("active", equipment[slot.key] === item.key);
  button.addEventListener("click", () => setEquipment(slot.key, item.key));
  return button;
}

function makeUnequipButton(slot, equipment) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "equipment-option";
  button.textContent = "卸下";
  button.disabled = equipmentBusy || !equipment[slot.key] || slot.key === "weapon";
  button.addEventListener("click", () => setEquipment(slot.key, null));
  return button;
}

function renderEquipmentSlots() {
  const inventory = getAccountInventory(activeAccount);
  const equipment = getAccountEquipment(activeAccount);
  ui.equipmentSlots.replaceChildren();
  for (const slot of EQUIPMENT_SLOTS) {
    const shell = document.createElement("div");
    const head = document.createElement("div");
    const slotName = document.createElement("span");
    const current = document.createElement("strong");
    const options = document.createElement("div");
    shell.className = "equipment-slot";
    head.className = "equipment-slot-head";
    options.className = "equipment-options";
    slotName.textContent = slot.name;
    const equippedLabel = equippedItemLabel(slot, equipment, inventory);
    if (equippedLabel instanceof Node) current.replaceChildren(equippedLabel);
    else current.textContent = equippedLabel;
    head.append(slotName, current);
    for (const item of DONATION_REWARDS.filter((reward) => reward.category === slot.key)) {
      options.append(makeEquipmentButton(slot, item, inventory, equipment));
    }
    options.append(makeUnequipButton(slot, equipment));
    shell.append(head, options);
    ui.equipmentSlots.append(shell);
  }
}

function renderCharacterPanel() {
  renderCharacterStats();
  renderEquipmentSlots();
}

function openCharacterPanel(options = {}) {
  if (!activeAccount) return;
  const pause = pauseWorldForOverlay("character", options);
  characterPausedMode = pause.pausedMode;
  characterPausedBgm = pause.pausedBgm;
  characterReturnToMenu = Boolean(options.returnToMenu);
  renderCharacterPanel();
  ui.characterScreen.hidden = false;
  ui.characterScreen.classList.add("show");
  updateOverlayOpenFlag();
}

function closeCharacterPanel() {
  ui.characterScreen.classList.remove("show");
  ui.characterScreen.hidden = true;
  const restoreMode = characterPausedMode;
  const restoreBgm = characterPausedBgm;
  const returnToMenu = characterReturnToMenu;
  if (!returnToMenu) restoreWorldFromOverlay(restoreMode, restoreBgm, "character");
  characterPausedMode = null;
  characterPausedBgm = false;
  characterReturnToMenu = false;
  if (returnToMenu) returnToSideMenuFromPanel(restoreMode, restoreBgm);
  else updateOverlayOpenFlag();
}

async function setEquipment(slot, itemKey) {
  if (!activeAccount || equipmentBusy) return;
  equipmentBusy = true;
  renderEquipmentSlots();
  try {
    const data = await apiRequest(`/api/accounts/${activeAccount.id}/equipment`, {
      method: "POST",
      body: JSON.stringify({ slot, itemKey }),
    });
    activeAccount = data.account;
    updateAccountUi();
    renderCharacterPanel();
    renderBackpack();
    refreshAccounts();
  } catch {
    flashMessage("装備を整えられない。", 2.2);
  } finally {
    equipmentBusy = false;
    renderCharacterPanel();
  }
}

function availableDonationRewards(inventory) {
  return DONATION_REWARDS.filter((reward) => reward.donation && (
    !itemIsStackable(reward) || inventoryQuantity(reward.key, { inventory }) < itemMax(reward.key)
  ));
}

function donationQualityWeights() {
  const override = prayerSpecialEffect("shrineWishRateModifier");
  return override ? { ...DONATION_QUALITY_WEIGHTS, ...override } : DONATION_QUALITY_WEIGHTS;
}

function chooseWeightedDonationReward(inventory) {
  const available = availableDonationRewards(inventory);
  if (available.length === 0) return null;
  const availableQualities = [...new Set(available.map((reward) => reward.rarity || "white"))];
  const weights = donationQualityWeights();
  const qualityWeights = availableQualities.map((quality) => ({
    quality,
    weight: Math.max(0, Number(weights[quality]) || 0),
  })).filter((entry) => entry.weight > 0);
  const totalWeight = qualityWeights.reduce((sum, entry) => sum + entry.weight, 0);
  let selectedQuality = availableQualities[0];
  if (totalWeight > 0) {
    let roll = Math.random() * totalWeight;
    for (const entry of qualityWeights) {
      roll -= entry.weight;
      if (roll <= 0) {
        selectedQuality = entry.quality;
        break;
      }
    }
  }
  const candidates = available.filter((reward) => (reward.rarity || "white") === selectedQuality);
  const pool = candidates.length ? candidates : available;
  return pool[Math.floor(Math.random() * pool.length)];
}

function chooseDonationReward() {
  const inventory = getAccountInventory(activeAccount);
  return chooseWeightedDonationReward(inventory);
}

function donationCopyMultiplier() {
  return 1;
}

function addInventoryCopiesPreview(inventory, key, copies = 1) {
  const entry = inventory[key] || cloneInventoryEntry(INVENTORY_DEFAULT[key], key);
  const count = Math.max(0, Math.floor(Number(copies) || 0));
  if (itemIsStackable(key)) {
    entry.quantity = clamp((entry.quantity || 0) + count, 0, itemMax(key));
  } else {
    entry.copies = Array.isArray(entry.copies) ? entry.copies : [];
    entry.copies.push(...Array(count).fill(0).map(normalizeInventoryCopy));
    sortInventoryCopies(entry.copies);
  }
  inventory[key] = entry;
}

function chooseDonationRewards(count = 1) {
  const inventory = getAccountInventory(activeAccount);
  const rewards = [];
  const copyMultiplier = donationCopyMultiplier();
  for (let i = 0; i < count; i += 1) {
    const reward = chooseWeightedDonationReward(inventory);
    if (!reward) break;
    rewards.push(reward);
    addInventoryCopiesPreview(inventory, reward.key, copyMultiplier);
  }
  return rewards;
}

function summarizeDonationRewards(rewardKeys) {
  const counts = new Map();
  for (const key of rewardKeys) counts.set(key, (counts.get(key) || 0) + 1);
  const parts = [...counts.entries()].map(([key, count]) => {
    const item = itemDefinition(key);
    return `${item?.name || key}${count > 1 ? `×${count}` : ""}`;
  });
  const shown = parts.slice(0, 4).join("、");
  return parts.length > 4 ? `${shown} ほか${parts.length - 4}種` : shown;
}

async function donateAtShrine(count = 1) {
  if (!activeAccount || donationBusy) return;
  const donationCount = Math.max(1, Math.min(DONATION_TEN_COUNT, Math.floor(Number(count) || 1)));
  const totalCost = DONATION_COST * donationCount;
  if (getAccountCoins(activeAccount) < totalCost) {
    flashMessage(`賽銭箱は静かだ。あと ${totalCost - getAccountCoins(activeAccount)} 円。`, 2.4);
    tone(180, 0.06, 0.012, "triangle");
    return;
  }
  const rewards = donationCount === 1 ? [chooseDonationReward()].filter(Boolean) : chooseDonationRewards(donationCount);
  if (!rewards.length) {
    flashMessage("賽銭箱の御利益は、すでに満ちている。", 2.6);
    return;
  }

  donationBusy = true;
  const previousAccount = activeAccount;
  flashMessage(`${totalCost} 円を納めた。鈴の音が返る。`, 2.4);
  tone(392, 0.08, 0.018, "sine");
  setTimeout(() => tone(660, 0.12, 0.014, "triangle"), 110);

  try {
    const data = await apiRequest(`/api/accounts/${activeAccount.id}/donation`, {
      method: "POST",
      body: JSON.stringify(rewards.length === 1
        ? { reward: rewards[0].key }
        : { rewards: rewards.map((reward) => reward.key) }),
    });
    activeAccount = data.account;
    renderBackpack();
    if (!ui.characterScreen.hidden) renderCharacterPanel();
    updateAccountUi();
    refreshAccounts();
    const rewardedKeys = data.rewards || [data.reward || rewards[0].key];
    flashMessage(rewardedKeys.length > 1
      ? `十連祈願：${summarizeDonationRewards(rewardedKeys)} を授かった。`
      : `賽銭箱より ${rewards[0].name} を授かった。${rewards[0].effect}。`, 3.8);
    const sakuraRewards = rewardedKeys
      .map((itemKey) => popupResultForItem(itemKey))
      .filter((result) => isSakuraPopupResult(result));
    if (sakuraRewards.length) {
      queueItemPopupEntries(sakuraRewards.map((result) => ({
        result,
        options: popupOptionsForResult(result, "授物"),
      })));
    }
  } catch {
    activeAccount = previousAccount;
    flashMessage("賽銭箱は応えない。少し後で試して。", 2.4);
  } finally {
    donationBusy = false;
  }
}

function summarizeChestDrops(drops = []) {
  if (!drops.length) return "何も落ちなかった。";
  const counts = new Map();
  for (const drop of drops) counts.set(drop.itemKey, (counts.get(drop.itemKey) || 0) + 1);
  const parts = [...counts.entries()].map(([itemKey, count]) => {
    const item = itemDefinition(itemKey);
    return `${item?.name || itemKey}${count > 1 ? `×${count}` : ""}`;
  });
  return parts.join("、");
}

async function openHiddenChest(chest) {
  if (!activeAccount || chestBusy || !chest) return;
  chestBusy = true;
  const previousAccount = activeAccount;
  try {
    const data = await apiRequest(`/api/accounts/${activeAccount.id}/chests-open`, {
      method: "POST",
      body: JSON.stringify({ chestId: chest.id }),
    });
    activeAccount = data.account;
    renderOpenItemPanels();
    updateAccountUi();
    refreshAccounts();
    const drops = data.drops || [];
    const coins = Number(data.coinsGained) || 0;
    const exp = Number(data.expGained) || 0;
    flashMessage(`葛籠を開けた。${formatCoins(coins)} と ${exp} EXP を得て、${summarizeChestDrops(drops)} が地へ落ちた。`, 3.6);
    addParticle(chest.x, chest.y, "#e1c887", 18, 120);
    tone(540, 0.08, 0.016, "triangle");
    setTimeout(() => tone(680, 0.08, 0.012, "sine"), 64);
  } catch (error) {
    activeAccount = previousAccount;
    flashMessage(error?.message || "葛籠はまだ沈黙している。", 2.2);
  } finally {
    chestBusy = false;
  }
}

async function collectFieldLoot(loot) {
  if (!activeAccount || fieldLootBusy || !loot) return;
  fieldLootBusy = true;
  const previousAccount = activeAccount;
  try {
    const data = await apiRequest(`/api/accounts/${activeAccount.id}/field-loot-collect`, {
      method: "POST",
      body: JSON.stringify({ lootId: loot.id }),
    });
    activeAccount = data.account;
    renderOpenItemPanels();
    if (!ui.characterScreen.hidden) renderCharacterPanel();
    updateAccountUi();
    refreshAccounts();
    const itemKey = data.collected?.itemKey;
    if (itemKey) {
      const result = popupResultForItem(itemKey);
      showItemPopup(result, { kicker: "拾得" });
      flashMessage(`${itemDefinition(itemKey)?.name || itemKey} を拾った。`, 1.8);
    }
    tone(660, 0.05, 0.012, "sine");
  } catch (error) {
    activeAccount = previousAccount;
    flashMessage(error?.message || "拾得に失敗した。", 2.2);
  } finally {
    fieldLootBusy = false;
  }
}

function rarityLabel(rarity) {
  return {
    white: "白",
    green: "綠",
    blue: "藍",
    purple: "紫",
    gold: "金",
    roseGold: "桜",
  }[rarity] || rarity || "白";
}

function rarityColor(rarity) {
  return {
    white: "#d9d0c2",
    green: "#6e9d66",
    blue: "#7487c4",
    purple: "#9b6ec8",
    gold: "#c8a85a",
    roseGold: "#c68e8a",
  }[rarity] || "#d9d0c2";
}

function codexMeta(item, level = 0) {
  const effective = effectiveItem(item, level);
  const parts = [rarityLabel(item.rarity)];
  if (item.resonance) parts.push(resonanceName(level));
  if (item.category === "weapon" && effective?.damage) parts.push(`傷害 ${effective.damage}`);
  if (item.consumable) parts.push("消耗品");
  if (item.legacy) parts.push("舊道具");
  return parts.join(" · ");
}

function makeCodexCard(item) {
  const card = document.createElement("article");
  const icon = document.createElement("span");
  const body = document.createElement("div");
  const head = document.createElement("div");
  const name = document.createElement("strong");
  const rarity = document.createElement("span");
  const meta = document.createElement("small");
  const effect = document.createElement("p");
  let level = 0;
  card.className = "codex-card";
  card.dataset.quality = item.rarity || "white";
  card.tabIndex = 0;
  icon.className = "inventory-icon";
  body.className = "codex-card-body";
  head.className = "codex-card-head";
  setItemIconContent(icon, item, item.icon || item.name.slice(0, 1));
  name.textContent = item.name;
  rarity.textContent = rarityLabel(item.rarity);

  function syncCodexTier() {
    const effective = effectiveItem(item, level);
    meta.textContent = codexMeta(item, level);
    effect.textContent = effective?.playerDescription || effective?.effect || item.effect || "無特殊效果";
    attachItemTooltip(card, effective || item, level);
  }

  card.addEventListener("click", () => {
    if (!item.resonance) return;
    level = (level + 1) % (RESONANCE_MAX + 1);
    syncCodexTier();
  });

  card.addEventListener("keydown", (event) => {
    if (!item.resonance) return;
    if (event.code !== "Enter" && event.code !== "Space") return;
    event.preventDefault();
    level = (level + 1) % (RESONANCE_MAX + 1);
    syncCodexTier();
  });

  syncCodexTier();
  head.append(name, rarity);
  body.append(head, meta, effect);
  card.append(icon, body);
  return card;
}

function renderCodex() {
  ui.codexList.replaceChildren();
  let rendered = 0;
  for (const category of INVENTORY_CATEGORIES) {
    const items = itemListForView(DONATION_REWARDS.filter((entry) => entry.category === category.key));
    if (items.length === 0) continue;
    const section = document.createElement("section");
    const title = document.createElement("h3");
    const grid = document.createElement("div");
    section.className = "codex-section";
    grid.className = "codex-grid";
    title.textContent = category.name;
    for (const item of items) {
      grid.append(makeCodexCard(item));
      rendered += 1;
    }
    section.append(title, grid);
    ui.codexList.append(section);
  }
  if (rendered === 0) {
    const empty = document.createElement("div");
    empty.className = "backpack-empty";
    empty.textContent = `圖鑑中沒有${rarityLabel(activeItemQualityFilter)}品質的道具。`;
    ui.codexList.append(empty);
  }
  syncItemControls();
}

function openCodex(options = {}) {
  if (!activeAccount) return;
  const pause = pauseWorldForOverlay("codex", options);
  codexPausedMode = pause.pausedMode;
  codexPausedBgm = pause.pausedBgm;
  codexReturnToMenu = Boolean(options.returnToMenu);
  renderCodex();
  ui.codexScreen.hidden = false;
  ui.codexScreen.classList.add("show");
  updateOverlayOpenFlag();
}

function closeCodex() {
  ui.codexScreen.classList.remove("show");
  ui.codexScreen.hidden = true;
  const restoreMode = codexPausedMode;
  const restoreBgm = codexPausedBgm;
  const returnToMenu = codexReturnToMenu;
  if (!returnToMenu) restoreWorldFromOverlay(restoreMode, restoreBgm, "codex");
  codexPausedMode = null;
  codexPausedBgm = false;
  codexReturnToMenu = false;
  if (returnToMenu) returnToSideMenuFromPanel(restoreMode, restoreBgm);
  else updateOverlayOpenFlag();
}

function openSettings(page = "menu", options = {}) {
  if (!activeAccount) return;
  if (!options.audioOnly && page === "account") page = "menu";
  const pause = pauseWorldForOverlay("settings", options);
  settingsPausedMode = pause.pausedMode;
  settingsPausedBgm = pause.pausedBgm;
  settingsReturnToMenu = Boolean(options.returnToMenu);
  updateAccountUi();
  updateAudioSettingsUi();
  setSettingsPage(page);
  ui.settingsScreen.hidden = false;
  ui.settingsScreen.classList.add("show");
  updateOverlayOpenFlag();
}

function closeSettings() {
  ui.settingsScreen.classList.remove("show");
  ui.settingsScreen.hidden = true;
  const restoreMode = settingsPausedMode;
  const restoreBgm = settingsPausedBgm;
  const returnToMenu = settingsReturnToMenu;
  if (!returnToMenu) restoreWorldFromOverlay(restoreMode, restoreBgm, "settings");
  settingsPausedMode = null;
  settingsPausedBgm = false;
  settingsReturnToMenu = false;
  setSettingsPage("menu");
  if (returnToMenu) returnToSideMenuFromPanel(restoreMode, restoreBgm);
  else updateOverlayOpenFlag();
}

function openGameAudioSettings() {
  openSettings("menu");
}

function beginLandingToVillage() {
  if (!activeAccount) {
    showAccountScreen();
    return;
  }
  stopPurifySuzu(false);
  pauseAllBgm();
  settingsPausedMode = null;
  clearInputState();
  const savedPosition = getAccountLastPosition(activeAccount);
  resetGame(savedPosition ? { playerStart: savedPosition } : {});
  if (savedPosition) {
    state.mode = "explore";
    state.player.face = savedPosition.face;
    lastSavedLocationKey = playerStateKey({ "最後座標": savedPosition, hp: currentAccountHp(activeAccount) });
    flashMessage("前回の場所へ戻った。", 2.8);
  } else {
    state.mode = "landing";
    state.landingTimer = 0;
    lastSavedLocationKey = "";
    flashMessage("雲間より村へ降りる。", LANDING_DURATION);
  }
  locationSaveTimer = 0;
  document.body.dataset.mode = state.mode;
  running = true;
  ui.startScreen.classList.remove("show");
  ui.startScreen.hidden = true;
  ui.resultScreen.hidden = true;
  ui.resultScreen.classList.remove("show");
  setTopActionsVisible(true);
  closeSettings();
  renderRecords(activeAccount.records, true);
  updateAccountUi();
  playZoneBgm(true);
}

function returnToVillage() {
  if (!activeAccount) {
    showAccountScreen();
    return;
  }
  stopPurifySuzu(false);
  pauseBattleBgm();
  settingsPausedMode = null;
  resetGame();
  state.mode = "explore";
  document.body.dataset.mode = state.mode;
  running = true;
  clearInputState();
  ui.startScreen.classList.remove("show");
  ui.startScreen.hidden = true;
  ui.resultScreen.hidden = true;
  ui.resultScreen.classList.remove("show");
  setTopActionsVisible(true);
  closeSettings();
  renderRecords(activeAccount.records, true);
  updateAccountUi();
  playZoneBgm(false);
  flashMessage("村へ戻った。紅き境はまだ開いている。", 3.2);
  lastSavedLocationKey = "";
  saveCurrentLocation({ force: true }).catch(() => {});
}

function showAccountScreen() {
  stopPurifySuzu(false);
  pauseAllBgm();
  settingsPausedMode = null;
  resetGame();
  state.mode = "account";
  locationSaveTimer = 0;
  lastSavedLocationKey = "";
  document.body.dataset.mode = state.mode;
  running = false;
  ui.resultScreen.hidden = true;
  ui.resultScreen.classList.remove("show");
  setTopActionsVisible(false);
  ui.startScreen.hidden = false;
  ui.startScreen.classList.add("show");
  closeSettings();
  renderRecords(activeAccount?.records || [], Boolean(activeAccount));
  renderAccountList();
  updateAccountUi();
}

async function clearCurrentRecords() {
  if (!activeAccount) return;
  try {
    const data = await apiRequest(`/api/accounts/${activeAccount.id}/clear-records`, { method: "POST" });
    activeAccount = data.account;
    document.body.dataset.recordsCleared = "true";
    renderRecords(activeAccount.records, true);
    updateAccountUi("戰績已清除");
    refreshAccounts();
  } catch {
    document.body.dataset.recordsCleared = "false";
    setAccountStatus("戰績清除失敗");
  }
}

async function deleteCurrentAccount() {
  if (!activeAccount) return;
  const name = activeAccount.name;
  if (!window.confirm(`刪除帳號「${name}」？`)) return;
  try {
    await apiRequest(`/api/accounts/${activeAccount.id}`, { method: "DELETE" });
    activeAccount = null;
    document.body.dataset.accountDeleted = "true";
    closeSettings();
    showAccountScreen();
    await refreshAccounts();
    renderRecords([], false);
    setAccountStatus("帳號已刪除");
  } catch {
    document.body.dataset.accountDeleted = "false";
    setAccountStatus("帳號刪除失敗");
  }
}

function flashMessage(text, timer = 3.2) {
  state.message = text;
  state.messageTimer = timer;
}

function setMemoryUi() {
  [...ui.memoryStrip.children].forEach((node, index) => {
    const found = state.fragments?.[index]?.found;
    node.textContent = found ? memoryTexts[index].short : "未聽";
    node.classList.toggle("found", Boolean(found));
  });
}

function updateUi() {
  document.body.dataset.mode = state.mode || "ready";
  const p = state.player;
  const b = state.boss;
  const pollution = clamp(p.pollution / 100, 0, 1);
  ui.hpBar.style.transform = `scaleX(${clamp(p.hp / p.maxHp, 0, 1)})`;
  ui.pollutionMeterRow.hidden = pollution <= 0;
  ui.pollutionBar.style.transform = `scaleX(${pollution})`;
  ui.forceBar.style.transform = `scaleX(${clamp(p.force / 100, 0, 1)})`;
  ui.formBar.style.transform = `scaleX(${clamp(b.form / b.maxForm, 0, 1)})`;
  ui.aspectBar.style.transform = `scaleX(${clamp(b.aspect / 100, 0, 1)})`;
  ui.wishBar.style.transform = `scaleX(${clamp(b.wish / 100, 0, 1)})`;
  ui.phaseSeal.textContent = state.mode === "explore" || state.mode === "landing" ? "村" : b.phase === "shape" ? "形" : b.phase === "aspect" ? "相" : "願";
  ui.messageLog.textContent = state.messageTimer > 0 ? state.message : "";
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function angleTo(a, b) {
  return Math.atan2(b.y - a.y, b.x - a.x);
}

function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= TWO_PI;
  while (d < -Math.PI) d += TWO_PI;
  return Math.abs(d);
}

function addParticle(x, y, color, count = 8, power = 120) {
  for (let i = 0; i < count; i += 1) {
    const a = Math.random() * TWO_PI;
    const s = power * (0.35 + Math.random() * 0.8);
    state.particles.push({
      x,
      y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      life: 0.45 + Math.random() * 0.45,
      max: 0.9,
      color,
      size: 2 + Math.random() * 3,
    });
  }
}

function clampPointToAirWall(x, y, margin = 0) {
  const dx = x - BATTLE_CENTER.x;
  const dy = y - BATTLE_CENTER.y;
  const maxDistance = Math.max(1, BATTLE_ARENA_RADIUS - margin);
  const distance = Math.hypot(dx, dy);
  if (distance <= maxDistance) return { x, y };
  const nx = dx / Math.max(0.0001, distance);
  const ny = dy / Math.max(0.0001, distance);
  return {
    x: BATTLE_CENTER.x + nx * maxDistance,
    y: BATTLE_CENTER.y + ny * maxDistance,
  };
}

function outsideAirWall(entity, margin = 0) {
  return Math.hypot(entity.x - BATTLE_CENTER.x, entity.y - BATTLE_CENTER.y) > BATTLE_ARENA_RADIUS + margin;
}

function dampVelocityFromNormal(entity, nx, ny) {
  if (!Number.isFinite(entity.vx)) entity.vx = 0;
  if (!Number.isFinite(entity.vy)) entity.vy = 0;
  const intoSurface = entity.vx * nx + entity.vy * ny;
  if (intoSurface < 0) {
    entity.vx -= intoSurface * nx;
    entity.vy -= intoSurface * ny;
  }
  entity.vx *= 0.82;
  entity.vy *= 0.82;
}

function resolveCircleObstacleCollision(entity, obstacle) {
  const minDistance = entity.r + obstacle.r;
  let dx = entity.x - obstacle.x;
  let dy = entity.y - obstacle.y;
  const distanceSq = dx * dx + dy * dy;
  if (distanceSq >= minDistance * minDistance) return false;

  let distance = Math.sqrt(distanceSq);
  if (distance < 0.0001) {
    const fallback = Math.atan2(entity.vy || 0, entity.vx || 1);
    dx = Math.cos(fallback);
    dy = Math.sin(fallback);
    distance = 1;
  }

  const nx = dx / distance;
  const ny = dy / distance;
  const push = minDistance - distance;
  entity.x += nx * push;
  entity.y += ny * push;
  dampVelocityFromNormal(entity, nx, ny);
  return true;
}

function resolveRectObstacleCollision(entity, obstacle) {
  if (obstacle.rotation) return resolveRotatedRectObstacleCollision(entity, obstacle);
  const minX = obstacle.x - obstacle.halfW;
  const maxX = obstacle.x + obstacle.halfW;
  const minY = obstacle.y - obstacle.halfH;
  const maxY = obstacle.y + obstacle.halfH;
  const closestX = clamp(entity.x, minX, maxX);
  const closestY = clamp(entity.y, minY, maxY);
  let dx = entity.x - closestX;
  let dy = entity.y - closestY;

  if (Math.abs(dx) < 0.0001 && Math.abs(dy) < 0.0001) {
    const left = entity.x - minX;
    const right = maxX - entity.x;
    const top = entity.y - minY;
    const bottom = maxY - entity.y;
    const edge = Math.min(left, right, top, bottom);
    let nx = 0;
    let ny = 0;
    if (edge === left) {
      entity.x = minX - entity.r;
      nx = -1;
    } else if (edge === right) {
      entity.x = maxX + entity.r;
      nx = 1;
    } else if (edge === top) {
      entity.y = minY - entity.r;
      ny = -1;
    } else {
      entity.y = maxY + entity.r;
      ny = 1;
    }
    dampVelocityFromNormal(entity, nx, ny);
    return true;
  }

  const distanceSq = dx * dx + dy * dy;
  if (distanceSq >= entity.r * entity.r) return false;

  const distance = Math.sqrt(distanceSq);
  const nx = dx / distance;
  const ny = dy / distance;
  const push = entity.r - distance;
  entity.x += nx * push;
  entity.y += ny * push;
  dampVelocityFromNormal(entity, nx, ny);
  return true;
}

function resolveRotatedRectObstacleCollision(entity, obstacle) {
  const cos = Math.cos(obstacle.rotation);
  const sin = Math.sin(obstacle.rotation);
  const dxWorld = entity.x - obstacle.x;
  const dyWorld = entity.y - obstacle.y;
  let localX = cos * dxWorld + sin * dyWorld;
  let localY = -sin * dxWorld + cos * dyWorld;
  const closestX = clamp(localX, -obstacle.halfW, obstacle.halfW);
  const closestY = clamp(localY, -obstacle.halfH, obstacle.halfH);
  let dx = localX - closestX;
  let dy = localY - closestY;

  if (Math.abs(dx) < 0.0001 && Math.abs(dy) < 0.0001) {
    const left = localX + obstacle.halfW;
    const right = obstacle.halfW - localX;
    const top = localY + obstacle.halfH;
    const bottom = obstacle.halfH - localY;
    const edge = Math.min(left, right, top, bottom);
    let nx = 0;
    let ny = 0;
    if (edge === left) {
      localX = -obstacle.halfW - entity.r;
      nx = -1;
    } else if (edge === right) {
      localX = obstacle.halfW + entity.r;
      nx = 1;
    } else if (edge === top) {
      localY = -obstacle.halfH - entity.r;
      ny = -1;
    } else {
      localY = obstacle.halfH + entity.r;
      ny = 1;
    }
    entity.x = obstacle.x + cos * localX - sin * localY;
    entity.y = obstacle.y + sin * localX + cos * localY;
    dampVelocityFromNormal(entity, cos * nx - sin * ny, sin * nx + cos * ny);
    return true;
  }

  const distanceSq = dx * dx + dy * dy;
  if (distanceSq >= entity.r * entity.r) return false;
  const distance = Math.sqrt(distanceSq);
  const nxLocal = dx / distance;
  const nyLocal = dy / distance;
  const push = entity.r - distance;
  const nx = cos * nxLocal - sin * nyLocal;
  const ny = sin * nxLocal + cos * nyLocal;
  entity.x += nx * push;
  entity.y += ny * push;
  dampVelocityFromNormal(entity, nx, ny);
  return true;
}

function obstacleAvailableForClimb(obstacle) {
  if (!obstacle?.climbable) return false;
  if (!STATIC_COLLIDER_SET.has(obstacle)) return false;
  if (obstacle.terrainId && terrainDetailIsCut(obstacle.terrainId)) return false;
  return true;
}

function obstacleTopHeight(obstacle) {
  if (!obstacleAvailableForClimb(obstacle)) return 0;
  return Math.max(CLIMB_MIN_HEIGHT, Number(obstacle.climbHeight) || CLIMB_MIN_HEIGHT);
}

function obstacleTopMargin(obstacle, fallback = 0) {
  return Math.max(fallback, Number(obstacle?.topMargin) || 0);
}

function pointWithinObstacleFootprint(obstacle, x, y, margin = 0) {
  if (!obstacle) return false;
  const topMargin = obstacleTopMargin(obstacle, margin);
  if (obstacle.type === "circle") {
    return Math.hypot(x - obstacle.x, y - obstacle.y) <= obstacle.r + topMargin;
  }
  const rotation = obstacle.rotation || 0;
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  const dx = x - obstacle.x;
  const dy = y - obstacle.y;
  const localX = cos * dx + sin * dy;
  const localY = -sin * dx + cos * dy;
  return Math.abs(localX) <= obstacle.halfW + topMargin
    && Math.abs(localY) <= obstacle.halfH + topMargin;
}

function clampPointToObstacleFootprint(obstacle, x, y, inset = 0, extraMargin = 0) {
  if (!obstacle) return { x, y };
  if (obstacle.type === "circle") {
    const dx = x - obstacle.x;
    const dy = y - obstacle.y;
    const distance = Math.hypot(dx, dy);
    const radius = Math.max(0, obstacle.r + extraMargin - inset);
    if (distance <= radius || distance < 0.0001) {
      return distance < 0.0001 ? { x: obstacle.x, y: obstacle.y } : { x, y };
    }
    return {
      x: obstacle.x + (dx / distance) * radius,
      y: obstacle.y + (dy / distance) * radius,
    };
  }
  const rotation = obstacle.rotation || 0;
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  const dx = x - obstacle.x;
  const dy = y - obstacle.y;
  const localX = cos * dx + sin * dy;
  const localY = -sin * dx + cos * dy;
  const maxX = Math.max(0, obstacle.halfW + extraMargin - inset);
  const maxY = Math.max(0, obstacle.halfH + extraMargin - inset);
  const clampedX = clamp(localX, -maxX, maxX);
  const clampedY = clamp(localY, -maxY, maxY);
  return {
    x: obstacle.x + cos * clampedX - sin * clampedY,
    y: obstacle.y + sin * clampedX + cos * clampedY,
  };
}

function topLandingPoint(entity, obstacle, surface) {
  const inset = Math.max(entity?.r || 0, PLATFORM_EDGE_MARGIN * 0.55);
  const candidateX = (surface?.surfaceX ?? entity.x) - (surface?.normalX || 0) * (inset + CLIMB_SURFACE_GAP);
  const candidateY = (surface?.surfaceY ?? entity.y) - (surface?.normalY || 0) * (inset + CLIMB_SURFACE_GAP);
  return clampPointToObstacleFootprint(obstacle, candidateX, candidateY, inset * 0.42, obstacleTopMargin(obstacle));
}

function findSupportingPlatform(entity, minHeight, maxHeight, margin = PLATFORM_EDGE_MARGIN) {
  let best = null;
  for (const obstacle of STATIC_COLLIDERS) {
    const height = obstacleTopHeight(obstacle);
    if (height <= 0 || height < minHeight || height > maxHeight) continue;
    if (!pointWithinObstacleFootprint(obstacle, entity.x, entity.y, margin)) continue;
    if (!best || height > best.height) best = { obstacle, height };
  }
  return best;
}

function canPassOverObstacle(entity, obstacle) {
  if (entity !== state.player) return false;
  const height = playerHeightOffset(entity);
  if (height <= 0) return false;
  const topHeight = obstacleTopHeight(obstacle);
  return topHeight > 0 && height >= topHeight - PLATFORM_COLLISION_CLEARANCE;
}

function mountClimbTop(player, obstacle, surface) {
  const height = obstacleTopHeight(obstacle);
  if (!height) return false;
  const landing = topLandingPoint(player, obstacle, surface);
  player.x = landing.x;
  player.y = landing.y;
  player.height = height;
  player.fallSpeed = 0;
  player.platform = { obstacle, height };
  player.glideActive = false;
  player.dashTime = 0;
  player.vx = 0;
  player.vy = 0;
  clearClimbState(player);
  addParticle(player.x, player.y, "#eee6d2", 8, 72);
  tone(440, 0.045, 0.01, "triangle");
  flashMessage("足場に立った。方向キーで移動。", 1.2);
  return true;
}

function climbCircleSurfaceInfo(entity, obstacle) {
  let dx = entity.x - obstacle.x;
  let dy = entity.y - obstacle.y;
  let distance = Math.hypot(dx, dy);
  if (distance < 0.0001) {
    const face = Number.isFinite(entity.face) ? entity.face : 0;
    dx = Math.cos(face);
    dy = Math.sin(face);
    distance = 1;
  }
  const normalX = dx / distance;
  const normalY = dy / distance;
  const surfaceX = obstacle.x + normalX * obstacle.r;
  const surfaceY = obstacle.y + normalY * obstacle.r;
  return {
    distance: Math.max(0, distance - (obstacle.r + entity.r)),
    normalX,
    normalY,
    surfaceX,
    surfaceY,
  };
}

function climbRectSurfaceInfo(entity, obstacle) {
  if (obstacle.rotation) return climbRotatedRectSurfaceInfo(entity, obstacle);
  const minX = obstacle.x - obstacle.halfW;
  const maxX = obstacle.x + obstacle.halfW;
  const minY = obstacle.y - obstacle.halfH;
  const maxY = obstacle.y + obstacle.halfH;
  const closestX = clamp(entity.x, minX, maxX);
  const closestY = clamp(entity.y, minY, maxY);
  let dx = entity.x - closestX;
  let dy = entity.y - closestY;
  if (Math.abs(dx) < 0.0001 && Math.abs(dy) < 0.0001) {
    const left = entity.x - minX;
    const right = maxX - entity.x;
    const top = entity.y - minY;
    const bottom = maxY - entity.y;
    const edge = Math.min(left, right, top, bottom);
    if (edge === left) return { distance: 0, normalX: -1, normalY: 0, surfaceX: minX, surfaceY: entity.y };
    if (edge === right) return { distance: 0, normalX: 1, normalY: 0, surfaceX: maxX, surfaceY: entity.y };
    if (edge === top) return { distance: 0, normalX: 0, normalY: -1, surfaceX: entity.x, surfaceY: minY };
    return { distance: 0, normalX: 0, normalY: 1, surfaceX: entity.x, surfaceY: maxY };
  }
  const distance = Math.max(0.0001, Math.hypot(dx, dy));
  return {
    distance: Math.max(0, distance - entity.r),
    normalX: dx / distance,
    normalY: dy / distance,
    surfaceX: closestX,
    surfaceY: closestY,
  };
}

function climbRotatedRectSurfaceInfo(entity, obstacle) {
  const cos = Math.cos(obstacle.rotation);
  const sin = Math.sin(obstacle.rotation);
  const dxWorld = entity.x - obstacle.x;
  const dyWorld = entity.y - obstacle.y;
  const localX = cos * dxWorld + sin * dyWorld;
  const localY = -sin * dxWorld + cos * dyWorld;
  const closestX = clamp(localX, -obstacle.halfW, obstacle.halfW);
  const closestY = clamp(localY, -obstacle.halfH, obstacle.halfH);
  let dx = localX - closestX;
  let dy = localY - closestY;
  let normalLocalX = 0;
  let normalLocalY = 0;
  let surfaceLocalX = closestX;
  let surfaceLocalY = closestY;
  let distanceFromSurface = 0;

  if (Math.abs(dx) < 0.0001 && Math.abs(dy) < 0.0001) {
    const left = localX + obstacle.halfW;
    const right = obstacle.halfW - localX;
    const top = localY + obstacle.halfH;
    const bottom = obstacle.halfH - localY;
    const edge = Math.min(left, right, top, bottom);
    if (edge === left) {
      normalLocalX = -1;
      surfaceLocalX = -obstacle.halfW;
      surfaceLocalY = localY;
    } else if (edge === right) {
      normalLocalX = 1;
      surfaceLocalX = obstacle.halfW;
      surfaceLocalY = localY;
    } else if (edge === top) {
      normalLocalY = -1;
      surfaceLocalX = localX;
      surfaceLocalY = -obstacle.halfH;
    } else {
      normalLocalY = 1;
      surfaceLocalX = localX;
      surfaceLocalY = obstacle.halfH;
    }
  } else {
    const distance = Math.max(0.0001, Math.hypot(dx, dy));
    normalLocalX = dx / distance;
    normalLocalY = dy / distance;
    distanceFromSurface = Math.max(0, distance - entity.r);
  }

  return {
    distance: distanceFromSurface,
    normalX: cos * normalLocalX - sin * normalLocalY,
    normalY: sin * normalLocalX + cos * normalLocalY,
    surfaceX: obstacle.x + cos * surfaceLocalX - sin * surfaceLocalY,
    surfaceY: obstacle.y + sin * surfaceLocalX + cos * surfaceLocalY,
  };
}

function climbSurfaceInfo(entity, obstacle) {
  if (!obstacleAvailableForClimb(obstacle)) return null;
  return obstacle.type === "circle"
    ? climbCircleSurfaceInfo(entity, obstacle)
    : climbRectSurfaceInfo(entity, obstacle);
}

function nearestClimbableSurface(entity, maxDistance = CLIMB_ATTACH_DISTANCE, preferredObstacle = null) {
  const tryObstacles = preferredObstacle ? [preferredObstacle, ...STATIC_COLLIDERS] : STATIC_COLLIDERS;
  let best = null;
  for (const obstacle of tryObstacles) {
    if (!obstacleAvailableForClimb(obstacle)) continue;
    const surface = climbSurfaceInfo(entity, obstacle);
    if (!surface || surface.distance > maxDistance) continue;
    if (!best || surface.distance < best.surface.distance) {
      best = { obstacle, surface };
    }
  }
  return best;
}

function resolveStaticCollisions(entity) {
  let collided = false;
  for (let pass = 0; pass < 2; pass += 1) {
    for (const obstacle of STATIC_COLLIDERS) {
      if (obstacle.terrainId && terrainDetailIsCut(obstacle.terrainId)) continue;
      if (canPassOverObstacle(entity, obstacle)) continue;
      const hit = obstacle.type === "circle"
        ? resolveCircleObstacleCollision(entity, obstacle)
        : resolveRectObstacleCollision(entity, obstacle);
      collided = hit || collided;
    }
  }
  return collided;
}

function resolveEntityCollision(a, b, moveA = 1, moveB = 1) {
  if (!a || !b) return false;
  const minDistance = a.r + b.r;
  let dx = a.x - b.x;
  let dy = a.y - b.y;
  const distanceSq = dx * dx + dy * dy;
  if (distanceSq >= minDistance * minDistance) return false;

  let distance = Math.sqrt(distanceSq);
  if (distance < 0.0001) {
    const fallback = Math.atan2((a.vy || 0) - (b.vy || 0), (a.vx || 1) - (b.vx || 0));
    dx = Math.cos(fallback);
    dy = Math.sin(fallback);
    distance = 1;
  }

  const nx = dx / distance;
  const ny = dy / distance;
  const push = minDistance - distance;
  const totalMove = Math.max(0.0001, moveA + moveB);
  if (moveA > 0) {
    a.x += nx * push * (moveA / totalMove);
    a.y += ny * push * (moveA / totalMove);
    dampVelocityFromNormal(a, nx, ny);
  }
  if (moveB > 0) {
    b.x -= nx * push * (moveB / totalMove);
    b.y -= ny * push * (moveB / totalMove);
    dampVelocityFromNormal(b, -nx, -ny);
  }
  return true;
}

function randomPointNearBoss(radius = 200, minRadius = 72, margin = 44, existing = []) {
  const b = state.boss;
  let best = null;
  for (let attempt = 0; attempt < 32; attempt += 1) {
    const angle = Math.random() * TWO_PI;
    const distance = minRadius + Math.sqrt(Math.random()) * (radius - minRadius);
    const candidate = clampPointToAirWall(
      b.x + Math.cos(angle) * distance,
      b.y + Math.sin(angle) * distance,
      margin,
    );
    best = candidate;
    if (existing.every((point) => Math.hypot(point.x - candidate.x, point.y - candidate.y) > 72)) {
      return candidate;
    }
  }
  return best || clampPointToAirWall(b.x, b.y, margin);
}

function spawnFragments() {
  const fragments = [];
  for (let i = 0; i < memoryTexts.length; i += 1) {
    const point = randomPointNearBoss(FRAGMENT_SPAWN_RADIUS, 72, 44, fragments);
    fragments.push({ x: point.x, y: point.y, progress: 0, found: false });
  }
  state.fragments = fragments;
  setMemoryUi();
}

function enterAspect() {
  const b = state.boss;
  b.phase = "aspect";
  b.aspect = 0;
  b.attackTimer = 1.4;
  b.agitation = 0;
  spawnFragments();
  if (prayerSpecialEffect("phaseTransitionMoveSpeedBonusPct")) state.player.speedBoostTimer = 6;
  if (prayerSpecialEffect("yuuUntilBattleEndOnPhaseShift")) {
    state.player.forceYuuUntilBattleEnd = true;
    state.player.yuuNoForceDrain = Boolean(prayerSpecialEffect("yuuNoForceDrain"));
    state.player.glideActive = true;
    state.player.dashTime = Math.max(state.player.dashTime, 0.16);
  }
  flashMessage("形已破。不要只揮刀，聽見它。", 4);
  addParticle(b.x, b.y, "#c6c7bd", 44, 190);
  tone(174, 0.18, 0.035, "triangle");
}

function enterWish() {
  const b = state.boss;
  b.phase = "wish";
  b.nameKnown = true;
  b.attackTimer = 0.85;
  if (prayerSpecialEffect("phaseTransitionMoveSpeedBonusPct")) state.player.speedBoostTimer = 6;
  if (prayerSpecialEffect("yuuUntilBattleEndOnPhaseShift")) {
    state.player.forceYuuUntilBattleEnd = true;
    state.player.yuuNoForceDrain = Boolean(prayerSpecialEffect("yuuNoForceDrain"));
    state.player.glideActive = true;
    state.player.dashTime = Math.max(state.player.dashTime, 0.16);
  }
  flashMessage("真名顯現：槻守。願核已露。", 4);
  addParticle(b.x, b.y, "#eee6d2", 70, 230);
  tone(330, 0.22, 0.04, "sine");
}

function bossDefenseValue(phase = state.boss?.phase) {
  if (phase === "aspect") return 72;
  if (phase === "wish") return 84;
  return 96;
}

function applyBossSpiritualDamage(rawDamage, options = {}) {
  if (state.mode !== "playing" || !state.boss) return 0;
  const damage = Math.max(0, Number(rawDamage) || 0);
  if (!damage) return 0;
  const b = state.boss;
  let applied = 0;
  if (b.phase === "shape") {
    const before = b.form;
    b.form = Math.max(0, b.form - damage);
    applied = before - b.form;
    if (applied > 0) {
      b.hurtFlash = Math.max(b.hurtFlash, 0.16);
      addParticle(b.x, b.y, options.color || "#d8c98a", 16, 140);
      state.shake = Math.max(state.shake, 3.4);
    }
    if (b.form <= 0) enterAspect();
    return applied;
  }
  if (b.phase === "aspect") {
    const progress = damage * 0.14 * observePowerMultiplier();
    const before = b.aspect;
    b.aspect = clamp(b.aspect + progress, 0, 100);
    applied = b.aspect - before;
    if (applied > 0) {
      b.hurtFlash = Math.max(b.hurtFlash, 0.14);
      addParticle(b.x, b.y, options.color || "#c6c7bd", 14, 130);
      state.shake = Math.max(state.shake, 2.8);
    }
    if (b.aspect >= 100) enterWish();
    return applied;
  }
  if (b.phase === "wish") {
    const progress = damage * 0.1 * bossDamageMultiplier("wish");
    const before = b.wish;
    b.wish = clamp(b.wish + progress, 0, 100);
    applied = b.wish - before;
    if (applied > 0) {
      b.hurtFlash = Math.max(b.hurtFlash, 0.14);
      addParticle(b.x, b.y, options.color || "#eee6d2", 18, 140);
      state.shake = Math.max(state.shake, 3.2);
    }
    if (b.wish >= 100) endGame(true);
  }
  return applied;
}

function triggerReviveShockwave(revive) {
  const p = state.player;
  const radius = Number(revive?.shockwaveRadius) || 0;
  const damagePct = Number(revive?.shockwaveDamagePct) || 0;
  if (radius <= 0 || damagePct <= 0) return 0;
  state.echoes.push({
    x: p.x,
    y: p.y,
    r: 28,
    speed: 260,
    life: 1.45,
    hit: true,
    wish: true,
  });
  addParticle(p.x, p.y, "#f1df9b", 34, 180);
  tone(780, 0.1, 0.016, "sine");
  const b = state.boss;
  if (!b || Math.hypot(b.x - p.x, b.y - p.y) > radius + b.r) return 0;
  return applyBossSpiritualDamage(weaponBaseDamage() * (damagePct / 100), { color: "#f1df9b" });
}

function hitPlayer(damage, pollution, x, y, options = {}) {
  const p = state.player;
  if (p.iFrame > 0) return false;
  const periodicImmunitySeconds = prayerSpecialEffect("periodicDamageImmunitySeconds") || 0;
  if (options.touch && prayerSpecialEffect("touchDamageImmunity")) {
    p.iFrame = 0.28;
    addParticle(x ?? p.x, y ?? p.y, "#c6c7bd", 8, 90);
    return false;
  }
  if (periodicImmunitySeconds > 0 && p.periodicDamageImmunityCd <= 0) {
    p.periodicDamageImmunityCd = periodicImmunitySeconds;
    p.iFrame = 0.28;
    addParticle(x ?? p.x, y ?? p.y, "#eee6d2", 10, 120);
    return false;
  }
  const curseDamageMultiplier = Math.max(0.1, 1 - totalCurseResistPct() / 100);
  const mitigatedDamage = damage * armorDamageMultiplier() * curseDamageMultiplier;
  const gainedPollution = pollution * POLLUTION_GAIN_RATE * pollutionGainMultiplier();
  let hpDamage = mitigatedDamage;
  const previousShield = p.shield;
  if (p.shield > 0) {
    const blocked = Math.min(p.shield, hpDamage);
    p.shield -= blocked;
    hpDamage -= blocked;
  }
  p.hp = clamp(p.hp - hpDamage, 0, p.maxHp);
  syncActiveAccountHp(p.hp);
  p.pollution = clamp(p.pollution + gainedPollution, 0, 100);
  p.iFrame = 0.72;
  p.force = Math.max(0, p.force - 12);
  if (!playerImmuneAttackSpeedInterference() && Number(options.attackInterferencePct) > 0) {
    p.attackInterferencePct = Math.max(p.attackInterferencePct || 0, Number(options.attackInterferencePct) || 0);
    p.attackInterferenceTimer = Math.max(p.attackInterferenceTimer || 0, Number(options.attackInterferenceSeconds) || 0);
  }
  state.metrics.damageTaken += mitigatedDamage;
  state.metrics.pollutionTaken += gainedPollution;
  state.shake = Math.max(state.shake, 8);
  addParticle(x ?? p.x, y ?? p.y, "#9f2f2f", 14, 170);
  tone(96, 0.09, 0.025, "sawtooth");
  if (p.purifyLock > 0) {
    stopPurifySuzu();
    state.metrics.purifyBreaks += 1;
    p.purifyLock = 0;
    p.purifyCast = 0;
    p.purifyCd = 0.35;
    state.boss.wish = Math.max(0, state.boss.wish - 14);
    flashMessage("心燈一亂，祓儀中斷。", 2.5);
  }
  const revive = prayerSpecialEffect("reviveOnDeath");
  if (p.hp <= 0 && revive && p.reviveCount < (revive.maxTriggers || 1)) {
    p.reviveCount += 1;
    p.hp = clamp(p.maxHp * ((revive.reviveHpPct || 100) / 100), 0, p.maxHp);
    syncActiveAccountHp(p.hp);
    p.pollution = Math.max(0, p.pollution - 25);
    p.iFrame = Math.max(p.iFrame, revive.invulnerabilitySeconds || 0);
    addParticle(p.x, p.y, "#eee6d2", 36, 180);
    triggerReviveShockwave(revive);
    flashMessage("御神鏡碎片映回了心燈。", 2.8);
  } else {
    const autoHeal = prayerSpecialEffect("autoHealOnLowHp");
    if (p.hp > 0 && autoHeal && p.hp / p.maxHp <= (autoHeal.thresholdPct || 25) / 100 && p.autoHealCount < (autoHeal.maxTriggers || 1)) {
      p.autoHealCount += 1;
      p.hp = clamp(p.hp + p.maxHp * ((autoHeal.healMaxHpPct || 0) / 100), 0, p.maxHp);
      syncActiveAccountHp(p.hp);
      addParticle(p.x, p.y, "#e1c887", 28, 150);
      flashMessage("返魂結自行收束，心燈復明。", 2.8);
    }
  }
  const battleShield = weaponSpecialEffect("battleStartShield");
  if (previousShield > 0 && p.shield <= 0 && battleShield?.shieldBreakDefenseDamagePct) {
    const breakDamage = bossDefenseValue() * ((battleShield.shieldBreakDefenseDamagePct || 0) / 100);
    applyBossSpiritualDamage(breakDamage, { color: "#d8c98a" });
    addParticle(p.x, p.y, "#d8c98a", 24, 160);
    tone(312, 0.07, 0.016, "triangle");
  }
  if (p.hp <= 0 || p.pollution >= 100) endGame(false);
  return true;
}

function update(dt) {
  document.body.dataset.mode = getDisplayMode() || state.mode || "ready";
  if (state.mode === "landing" || state.mode === "explore") {
    updateCameraControl(dt);
    state.time += dt;
    state.shake = Math.max(0, state.shake - dt * 26);
    state.messageTimer = Math.max(0, state.messageTimer - dt);
    updateExploration(dt);
    updateLocationAutosave(dt);
    updateParticles(dt);
    updateUi();
    return;
  }
  if (state.mode !== "playing") return;
  updateCameraControl(dt);
  state.time += dt;
  state.shake = Math.max(0, state.shake - dt * 26);
  state.messageTimer = Math.max(0, state.messageTimer - dt);
  updatePlayer(dt);
  updateBattleExit(dt);
  if (state.mode !== "playing") {
    updateUi();
    return;
  }
  updateBoss(dt);
  updateHazards(dt);
  updateParticles(dt);
  updateUi();
}

function updateCameraControl(dt) {
  const yawInput = (keys.has("KeyD") ? 1 : 0) - (keys.has("KeyA") ? 1 : 0);
  const pitchInput = (keys.has("KeyW") ? 1 : 0) - (keys.has("KeyS") ? 1 : 0);
  cameraYaw += yawInput * CAMERA_YAW_SPEED * dt;
  if (cameraYaw > Math.PI) cameraYaw -= TWO_PI;
  if (cameraYaw < -Math.PI) cameraYaw += TWO_PI;
  cameraPitch = clamp(cameraPitch + pitchInput * CAMERA_PITCH_SPEED * dt, CAMERA_PITCH_MIN, CAMERA_PITCH_MAX);
}

function getMoveInput() {
  const local = {
    x: (keys.has("ArrowRight") ? 1 : 0) - (keys.has("ArrowLeft") ? 1 : 0),
    y: (keys.has("ArrowDown") ? 1 : 0) - (keys.has("ArrowUp") ? 1 : 0),
  };
  const len = Math.hypot(local.x, local.y);
  if (!len) return { x: 0, y: 0 };
  local.x /= len;
  local.y /= len;
  return {
    x: local.x * Math.cos(cameraYaw) + local.y * Math.sin(cameraYaw),
    y: -local.x * Math.sin(cameraYaw) + local.y * Math.cos(cameraYaw),
  };
}

function wantsGlide(player = state.player) {
  return Boolean(player?.forceYuuUntilBattleEnd || pressedDash || keys.has("GlideKey"));
}

function updateJumpTimers(p, dt) {
  p.jumpCd = Math.max(0, (p.jumpCd || 0) - dt);
  p.jumpTime = Math.max(0, (p.jumpTime || 0) - dt);
}

function jumpProgress(p = state.player) {
  if (!p?.jumpTime) return 0;
  return 1 - clamp(p.jumpTime / JUMP_DURATION, 0, 1);
}

function jumpLift3D(p = state.player) {
  return Math.sin(jumpProgress(p) * Math.PI) * JUMP_3D_HEIGHT;
}

function jumpLift2D(p = state.player) {
  return Math.sin(jumpProgress(p) * Math.PI) * JUMP_2D_HEIGHT;
}

function startJump(options = {}) {
  const p = state.player;
  if (!p || options.disabled || p.jumpCd > 0 || p.jumpTime > 0) return false;
  p.jumpTime = JUMP_DURATION;
  p.jumpCd = JUMP_COOLDOWN;
  addParticle(p.x, p.y, "#eee6d2", options.particles || 9, options.power || 80);
  tone(392, 0.055, 0.012, "triangle");
  return true;
}

function getClimbInput() {
  const raw = {
    horizontal: (keys.has("ArrowRight") ? 1 : 0) - (keys.has("ArrowLeft") ? 1 : 0),
    vertical: (keys.has("ArrowUp") ? 1 : 0) - (keys.has("ArrowDown") ? 1 : 0),
  };
  const length = Math.hypot(raw.horizontal, raw.vertical);
  if (!length) return { horizontal: 0, vertical: 0 };
  return {
    horizontal: raw.horizontal / length,
    vertical: raw.vertical / length,
  };
}

function playerHeightOffset(p = state.player) {
  return Math.max(0, Number(p?.height) || 0);
}

function playerHeightLift2D(p = state.player) {
  return playerHeightOffset(p) * CLIMB_2D_HEIGHT_SCALE;
}

function clearClimbState(p = state.player) {
  if (!p) return;
  p.climb = null;
}

function stopClimb(options = {}) {
  const p = state.player;
  if (!p?.climb) return false;
  const pushOff = Boolean(options.pushOff);
  const keepHeight = options.keepHeight !== false;
  const normalX = p.climb.normalX || 0;
  const normalY = p.climb.normalY || 0;
  clearClimbState(p);
  p.platform = null;
  p.glideActive = false;
  p.dashTime = Math.max(0, p.dashTime || 0);
  if (!keepHeight) p.height = 0;
  p.fallSpeed = pushOff ? CLIMB_GRAVITY * 0.45 : Math.max(p.fallSpeed || 0, CLIMB_GRAVITY * 0.12);
  if (pushOff) {
    const pushSpeed = 210;
    p.vx += normalX * pushSpeed;
    p.vy += normalY * pushSpeed;
    p.jumpTime = JUMP_DURATION;
    p.jumpCd = Math.max(p.jumpCd || 0, JUMP_COOLDOWN * 0.7);
    addParticle(p.x, p.y, "#eee6d2", 10, 95);
    tone(330, 0.05, 0.012, "triangle");
  }
  if (options.message) flashMessage(options.message, options.messageDuration || 1.4);
  return true;
}

function startClimb(surface, options = {}) {
  const p = state.player;
  if (!p || !surface?.obstacle || !surface?.surface) return false;
  if ((p.force || 0) < CLIMB_MIN_START_FORCE) {
    if (options.fromJump || options.towardWall) flashMessage("勢不足，難以攀附。", 1.4);
    return false;
  }
  const climbHeight = Math.max(
    CLIMB_MIN_HEIGHT,
    Number(surface.obstacle.climbHeight) || CLIMB_MIN_HEIGHT,
  );
  const normalX = surface.surface.normalX;
  const normalY = surface.surface.normalY;
  const tangentX = -normalY;
  const tangentY = normalX;
  p.climb = {
    obstacle: surface.obstacle,
    normalX,
    normalY,
    tangentX,
    tangentY,
    maxHeight: climbHeight,
    kind: surface.obstacle.climbKind || "wall",
  };
  p.platform = null;
  p.height = clamp(playerHeightOffset(p), 0, climbHeight);
  p.fallSpeed = 0;
  p.glideActive = false;
  p.dashTime = 0;
  p.vx = 0;
  p.vy = 0;
  p.x = surface.surface.surfaceX + normalX * (p.r + CLIMB_SURFACE_GAP);
  p.y = surface.surface.surfaceY + normalY * (p.r + CLIMB_SURFACE_GAP);
  p.face = Math.atan2(-normalY, -normalX);
  if (!options.silent) flashMessage("攀附成功：上下移動會消耗勢。", 1.3);
  return true;
}

function playerStandingOnClimbTop(p = state.player) {
  if (!p?.platform?.obstacle) return false;
  const topHeight = obstacleTopHeight(p.platform.obstacle);
  return topHeight > 0
    && Math.abs(playerHeightOffset(p) - topHeight) <= PLATFORM_HEIGHT_SNAP
    && pointWithinObstacleFootprint(p.platform.obstacle, p.x, p.y, PLATFORM_EDGE_MARGIN);
}

function tryStartClimbFromInput(move, options = {}) {
  const p = state.player;
  if (!p || p.climb) return false;
  if (playerStandingOnClimbTop(p)) return false;
  if ((p.force || 0) < CLIMB_MIN_START_FORCE) return false;
  const jumpAttach = Boolean(options.fromJump);
  const surface = nearestClimbableSurface(p, CLIMB_ATTACH_DISTANCE, null);
  if (!surface) return false;
  const toward = (move?.x || 0) * -surface.surface.normalX + (move?.y || 0) * -surface.surface.normalY;
  if (!jumpAttach && toward < 0.4) return false;
  return startClimb(surface, { fromJump: jumpAttach, towardWall: toward > 0.4, silent: Boolean(options.silent) });
}

function updateFreeFallHeight(p, dt) {
  if (!p || p.climb) return;
  const currentHeight = playerHeightOffset(p);
  if (p.platform) {
    const platformHeight = obstacleTopHeight(p.platform.obstacle);
    if (
      platformHeight > 0
      && Math.abs(currentHeight - platformHeight) <= PLATFORM_HEIGHT_SNAP
      && pointWithinObstacleFootprint(p.platform.obstacle, p.x, p.y, PLATFORM_EDGE_MARGIN)
    ) {
      p.height = platformHeight;
      p.fallSpeed = 0;
      return;
    }
    p.platform = null;
    p.fallSpeed = Math.max(p.fallSpeed || 0, CLIMB_GRAVITY * 0.08);
  }

  const standingSupport = currentHeight > 0
    ? findSupportingPlatform(p, currentHeight - PLATFORM_HEIGHT_SNAP, currentHeight + PLATFORM_HEIGHT_SNAP)
    : null;
  if (standingSupport) {
    p.height = standingSupport.height;
    p.fallSpeed = 0;
    p.platform = standingSupport;
    return;
  }

  if (currentHeight <= 0) {
    p.height = 0;
    p.fallSpeed = 0;
    p.platform = null;
    return;
  }
  const previousHeight = currentHeight;
  p.fallSpeed += CLIMB_GRAVITY * dt;
  p.height = Math.max(0, currentHeight - p.fallSpeed * dt);
  const landingSupport = findSupportingPlatform(
    p,
    p.height - PLATFORM_HEIGHT_SNAP,
    previousHeight + PLATFORM_HEIGHT_SNAP,
  );
  if (landingSupport) {
    p.height = landingSupport.height;
    p.fallSpeed = 0;
    p.platform = landingSupport;
  }
}

function updateClimbMovement(p, dt) {
  if (!p?.climb) return false;
  if (!obstacleAvailableForClimb(p.climb.obstacle)) {
    stopClimb({ keepHeight: true });
    return false;
  }
  if (pressedJump) {
    pressedJump = false;
    stopClimb({ pushOff: true, keepHeight: true, message: "離壁而下。" });
    return false;
  }

  const climbInput = getClimbInput();
  let verticalIntent = climbInput.vertical;
  const horizontalIntent = climbInput.horizontal;
  const ascending = Math.max(0, verticalIntent);
  const forceDrain = (ascending * CLIMB_FORCE_DRAIN_ASCEND + Math.abs(horizontalIntent) * CLIMB_FORCE_DRAIN_LATERAL) * dt;
  if (forceDrain > 0) p.force = Math.max(0, p.force - forceDrain);
  if (p.force <= 0.01 && verticalIntent > 0) verticalIntent = 0;

  if (horizontalIntent) {
    const speed = CLIMB_LATERAL_SPEED * moveSpeedMultiplier();
    p.x += p.climb.tangentX * horizontalIntent * speed * dt;
    p.y += p.climb.tangentY * horizontalIntent * speed * dt;
  }

  const nearSurface = nearestClimbableSurface(p, CLIMB_DETACH_DISTANCE, p.climb.obstacle);
  if (!nearSurface) {
    stopClimb({ keepHeight: true });
    return false;
  }
  p.climb.obstacle = nearSurface.obstacle;
  p.climb.normalX = nearSurface.surface.normalX;
  p.climb.normalY = nearSurface.surface.normalY;
  p.climb.tangentX = -nearSurface.surface.normalY;
  p.climb.tangentY = nearSurface.surface.normalX;
  p.climb.maxHeight = Math.max(CLIMB_MIN_HEIGHT, Number(nearSurface.obstacle.climbHeight) || p.climb.maxHeight || CLIMB_MIN_HEIGHT);
  p.x = nearSurface.surface.surfaceX + p.climb.normalX * (p.r + CLIMB_SURFACE_GAP);
  p.y = nearSurface.surface.surfaceY + p.climb.normalY * (p.r + CLIMB_SURFACE_GAP);
  p.face = Math.atan2(-p.climb.normalY, -p.climb.normalX);
  p.vx = 0;
  p.vy = 0;
  p.glideActive = false;
  p.dashTime = 0;
  p.fallSpeed = 0;

  if (verticalIntent > 0) {
    p.height = Math.min(p.climb.maxHeight, p.height + CLIMB_ASCEND_SPEED * verticalIntent * dt);
  } else if (verticalIntent < 0) {
    p.height = Math.max(0, p.height - CLIMB_DESCEND_SPEED * Math.abs(verticalIntent) * dt);
  } else {
    p.height = Math.max(0, p.height - CLIMB_IDLE_SLIDE_SPEED * dt);
  }

  if (verticalIntent > 0 && p.height >= p.climb.maxHeight - CLIMB_TOP_SNAP) {
    mountClimbTop(p, p.climb.obstacle, nearSurface.surface);
    return false;
  }

  if (p.height <= 0.001 && verticalIntent <= 0) {
    p.height = 0;
    stopClimb({ keepHeight: false });
    return false;
  }
  return true;
}

function applyPlayerGlide(p, move, dt, options = {}) {
  const minForce = options.minForce || GLIDE_MIN_FORCE_BATTLE;
  const forced = Boolean(options.forced || p.forceYuuUntilBattleEnd);
  const noDrain = Boolean(options.noDrain || p.yuuNoForceDrain);
  if (options.disabled || !wantsGlide(p) || (!forced && p.force < minForce)) {
    p.glideActive = false;
    return false;
  }
  const entering = !p.glideActive;
  const dx = move.x || (!forced ? Math.cos(p.face) : 0);
  const dy = move.y || (!forced ? Math.sin(p.face) : 0);
  const blend = 1 - Math.exp(-(entering ? 48 : 34) * dt);
  p.vx += (dx * DASH_MOVE_SPEED - p.vx) * blend;
  p.vy += (dy * DASH_MOVE_SPEED - p.vy) * blend;
  if (!noDrain) p.force = Math.max(0, p.force - (options.drain || GLIDE_FORCE_DRAIN_BATTLE) * dt);
  p.glideActive = forced || p.force >= minForce;
  if (entering) {
    p.dashTime = Math.max(p.dashTime, 0.16);
    p.iFrame = Math.max(p.iFrame, options.iFrame || 0.12);
    state.metrics.dashes += 1;
    addParticle(p.x, p.y, "#caa65a", options.particles || 8, options.power || 100);
    tone(260, 0.045, 0.014, "triangle");
  }
  return true;
}

function updateExploration(dt) {
  const p = state.player;
  const landing = state.mode === "landing";

  p.dashCd = Math.max(0, p.dashCd - dt);
  p.dashTime = Math.max(0, p.dashTime - dt);
  p.slashCd = Math.max(0, p.slashCd - dt);
  p.slashTime = Math.max(0, p.slashTime - dt);
  updateJumpTimers(p, dt);
  p.iFrame = Math.max(0, p.iFrame - dt);
  updateFreeFallHeight(p, dt);
  if (!p.climb) p.force = clamp(p.force + dt * FORCE_RECOVER_EXPLORE, 0, 100);
  if (landing && p.climb) stopClimb({ keepHeight: false });

  if (landing) {
    state.landingTimer = Math.min(state.landingDuration, state.landingTimer + dt);
    if (state.landingTimer >= state.landingDuration) {
      state.mode = "explore";
      document.body.dataset.mode = state.mode;
      flashMessage("村に降りた。紅き境を探せ。", 3.2);
    }
  }

  const move = landing ? { x: 0, y: 0 } : getMoveInput();
  const wasClimbing = Boolean(p.climb);
  if (!landing && !p.climb && pressedJump) {
    tryStartClimbFromInput(move, { fromJump: true });
  }
  if (!landing && !p.climb && (move.x || move.y)) {
    tryStartClimbFromInput(move, { silent: true });
  }
  const climbing = !landing && p.climb ? updateClimbMovement(p, dt) : false;
  const justDetached = wasClimbing && !p.climb && !climbing;
  if (!p.climb && (move.x || move.y)) p.face = Math.atan2(move.y, move.x);
  const targetSpeed = landing ? 0 : EXPLORE_MOVE_SPEED * moveSpeedMultiplier();
  let gliding = false;
  if (!p.climb) {
    gliding = applyPlayerGlide(p, move, dt, {
      disabled: landing,
      drain: GLIDE_FORCE_DRAIN_EXPLORE,
      minForce: GLIDE_MIN_FORCE_EXPLORE,
      iFrame: 0.12,
      particles: 7,
      power: 90,
    });
    if (!landing && pressedJump && !p.climb) startJump({ particles: 7, power: 70 });
  } else {
    p.glideActive = false;
    p.dashTime = 0;
  }
  pressedDash = false;
  pressedJump = false;
  if (!p.climb && !gliding && !justDetached) {
    const targetVx = move.x * targetSpeed;
    const targetVy = move.y * targetSpeed;
    const blend = 1 - Math.exp(-(move.x || move.y ? 20 : 26) * dt);
    p.vx += (targetVx - p.vx) * blend;
    p.vy += (targetVy - p.vy) * blend;
  }
  const prevX = p.x;
  const prevY = p.y;
  p.x += p.vx * dt;
  p.y += p.vy * dt;
  resolveTerrainFloorCollision(p, prevX, prevY);
  keepInExploreMap(p);
  if (!p.climb) resolveStaticCollisions(p);
  keepInExploreMap(p);
  if (!landing) updateToriiPassage(prevX, prevY, p.x, p.y);
  if (!landing) applyShrineRestoration(dt);

  if (!landing && (keys.has("Space") || pressedSlash) && p.slashCd <= 0) {
    performExploreSlash();
  }
  pressedSlash = false;

  const nearbyChest = landing ? null : nearestActiveChest(p);
  if (nearbyChest && pressedObserve) {
    openHiddenChest(nearbyChest);
    pressedObserve = false;
    return;
  }
  if (nearbyChest && state.messageTimer <= 0) {
    flashMessage("古びた葛籠が息を潜めている。Eで開く。", 0.9);
  }

  const nearbyLoot = landing ? null : nearestFieldLoot(p);
  if (nearbyLoot && pressedCollect) {
    collectFieldLoot(nearbyLoot);
    pressedCollect = false;
    return;
  }
  if (nearbyLoot && state.messageTimer <= 0) {
    flashMessage(`${itemDefinition(nearbyLoot.itemKey)?.name || "品"} が落ちている。Fで拾う。`, 0.9);
  }
  pressedCollect = false;

  const nearbyGrave = landing ? null : nearestGraveMarker(p);
  document.body.dataset.nearGrave = nearbyGrave ? (graveUnlocked(nearbyGrave.id) ? "unlocked" : "locked") : "false";
  if (nearbyGrave && pressedObserve) {
    bondGraveMarker(nearbyGrave);
    pressedObserve = false;
    return;
  }
  if (nearbyGrave && state.messageTimer <= 0) {
    flashMessage(gravePromptText(nearbyGrave), 0.9);
  }

  const nearMusician = !landing && Math.hypot(p.x - MUSICIAN.x, p.y - MUSICIAN.y) <= MUSICIAN.talkRadius;
  document.body.dataset.nearMusician = nearMusician ? "true" : "false";
  if (nearMusician && (keys.has("KeyE") || pressedObserve)) {
    talkToMusician();
    pressedObserve = false;
    return;
  }
  if (nearMusician && state.messageTimer <= 0) {
    flashMessage("琴の少女が調べを奏でている。Eで音を整える。", 0.8);
  }

  const nearDonationBox = !landing && Math.hypot(p.x - DONATION_BOX.x, p.y - DONATION_BOX.y) <= DONATION_BOX.talkRadius;
  document.body.dataset.nearDonationBox = nearDonationBox ? "true" : "false";
  if (nearDonationBox && pressedTenDonation) {
    donateAtShrine(DONATION_TEN_COUNT);
    pressedTenDonation = false;
    pressedObserve = false;
    return;
  }
  pressedTenDonation = false;
  if (nearDonationBox && pressedObserve) {
    donateAtShrine();
    pressedObserve = false;
    return;
  }
  if (nearDonationBox && state.messageTimer <= 0) {
    flashMessage(`賽銭箱がある。Eで ${DONATION_COST} 円、Qで ${DONATION_COST * DONATION_TEN_COUNT} 円を納める。`, 0.9);
  }

  const nearbyNpc = landing ? null : nearestVillageNpc(p);
  document.body.dataset.nearVillageNpc = nearbyNpc ? nearbyNpc.role : "false";
  if (nearbyNpc && pressedObserve) {
    talkToVillageNpc(nearbyNpc);
    pressedObserve = false;
    return;
  }
  if (nearbyNpc && state.messageTimer <= 0) {
    flashMessage(`${nearbyNpc.name}がいる。Eで話す。`, 0.9);
  }

  if (!landing && Math.hypot(p.x - ENCOUNTER_RING.x, p.y - ENCOUNTER_RING.y) <= ENCOUNTER_RING.r) {
    startBattle();
  }
}

function nearestVillageNpc(p) {
  let nearest = null;
  let nearestDistance = Infinity;
  for (const npc of VILLAGE_NPCS) {
    const distance = Math.hypot(p.x - npc.x, p.y - npc.y);
    if (distance <= npc.talkRadius && distance < nearestDistance) {
      nearest = npc;
      nearestDistance = distance;
    }
  }
  return nearest;
}

function updateBattleExit(dt) {
  const p = state.player;
  const outside = outsideAirWall(p, 0);
  if (!outside) {
    if (state.battleExitOutside) flashMessage("紅き境へ戻った。祓行は続く。", 1.5);
    state.battleExitOutside = false;
    state.battleExitTimer = BATTLE_EXIT_GRACE;
    return;
  }

  state.battleExitOutside = true;
  state.battleExitTimer = Math.max(0, (state.battleExitTimer || BATTLE_EXIT_GRACE) - dt);
  state.message = `紅き境を離れた。${Math.ceil(state.battleExitTimer)}秒內に戻らねば祓行を退く。`;
  state.messageTimer = 0.25;
  if (state.battleExitTimer <= 0) abandonBattle();
}

function abandonBattle() {
  if (state.mode !== "playing") return;
  const p = state.player;
  const exitPoint = {
    x: clamp(p.x, WORLD.minX + p.r, WORLD.maxX - p.r),
    y: clamp(p.y, WORLD.minY + p.r, WORLD.maxY - p.r),
    face: p.face,
  };
  stopPurifySuzu();
  pauseBattleBgm();
  settingsPausedMode = null;
  resetGame();
  state.mode = "explore";
  state.player.x = exitPoint.x;
  state.player.y = exitPoint.y;
  state.player.face = exitPoint.face;
  state.player.vx = 0;
  state.player.vy = 0;
  document.body.dataset.mode = state.mode;
  running = true;
  clearInputState();
  ui.resultScreen.hidden = true;
  ui.resultScreen.classList.remove("show");
  setTopActionsVisible(true);
  renderRecords(activeAccount?.records || [], true);
  updateAccountUi();
  playZoneBgm(false);
  flashMessage("紅き境を離れ、祓行を退いた。", 3.4);
  tone(132, 0.16, 0.03, "triangle");
  lastSavedLocationKey = "";
  saveCurrentLocation({ force: true }).catch(() => {});
}

function talkToMusician() {
  unlockAudio();
  tone(392, 0.12, 0.016, "triangle");
  setTimeout(() => tone(523, 0.16, 0.012, "sine"), 95);
  flashMessage("琴の少女「音の調べを合わせましょう。」", 2.4);
  openSettings("audio", { audioOnly: true });
}

function talkToVillageNpc(npc) {
  unlockAudio();
  tone(npc.role === "blacksmith" ? 196 : npc.role === "shopkeeper" ? 440 : 294, 0.06, 0.01, "triangle");
  if (npc.role === "shopkeeper") {
    flashMessage(npc.message || "店員が棚を整えている。", 1.4);
    openShop();
    return;
  }
  if (npc.role === "blacksmith") {
    flashMessage("鐵匠「不要な刃なら、火に戻してやろう。」", 1.4);
    openBlacksmith();
    return;
  }
  flashMessage(npc.message, 3.8);
}

function updatePlayer(dt) {
  const p = state.player;
  const b = state.boss;

  p.slashCd = Math.max(0, p.slashCd - dt);
  p.slashTime = Math.max(0, p.slashTime - dt);
  p.dashCd = Math.max(0, p.dashCd - dt);
  p.dashTime = Math.max(0, p.dashTime - dt);
  updateJumpTimers(p, dt);
  p.iFrame = Math.max(0, p.iFrame - dt);
  p.observePulse = Math.max(0, p.observePulse - dt);
  p.purifyLock = Math.max(0, p.purifyLock - dt);
  p.purifyCd = Math.max(0, p.purifyCd - dt);
  p.lifeStealCd = Math.max(0, p.lifeStealCd - dt);
  p.periodicDamageImmunityCd = Math.max(0, p.periodicDamageImmunityCd - dt);
  updateFreeFallHeight(p, dt);
  p.attackInterferenceTimer = Math.max(0, p.attackInterferenceTimer - dt);
  if (p.attackInterferenceTimer <= 0) p.attackInterferencePct = 0;
  if (playerImmuneAttackSpeedInterference()) {
    p.attackInterferenceTimer = 0;
    p.attackInterferencePct = 0;
  }
  p.speedBoostTimer = Math.max(0, p.speedBoostTimer - dt);
  if (!p.climb) p.force = clamp(p.force + dt * FORCE_RECOVER_BATTLE, 0, 100);
  updateArenaFocus(dt);
  updateKaguraWave(dt);

  const move = getMoveInput();
  const purifying = b.phase === "wish" && p.purifyCast > 0;
  const wasClimbing = Boolean(p.climb);
  if (!purifying && !p.climb && pressedJump) {
    tryStartClimbFromInput(move, { fromJump: true });
  }
  if (!purifying && !p.climb && (move.x || move.y)) {
    tryStartClimbFromInput(move, { silent: true });
  }
  const climbing = p.climb ? updateClimbMovement(p, dt) : false;
  const justDetached = wasClimbing && !p.climb && !climbing;
  if (!p.climb && (move.x || move.y)) p.face = Math.atan2(move.y, move.x);

  let gliding = false;
  if (!p.climb) {
    if (pressedJump) startJump({ disabled: purifying, particles: 9, power: 82 });
    gliding = applyPlayerGlide(p, move, dt, {
      disabled: purifying,
      drain: GLIDE_FORCE_DRAIN_BATTLE,
      minForce: GLIDE_MIN_FORCE_BATTLE,
      iFrame: 0.16,
      particles: 9,
      power: 100,
      forced: p.forceYuuUntilBattleEnd,
      noDrain: p.yuuNoForceDrain,
    });
  } else {
    p.glideActive = false;
    p.dashTime = 0;
  }
  pressedJump = false;
  pressedDash = false;

  const speed = (purifying ? PURIFY_MOVE_SPEED : BATTLE_MOVE_SPEED) * moveSpeedMultiplier();
  if (!p.climb && !gliding && !justDetached) {
    const targetVx = move.x * speed;
    const targetVy = move.y * speed;
    const response = move.x || move.y ? 24 : 28;
    const blend = 1 - Math.exp(-response * dt);
    p.vx += (targetVx - p.vx) * blend;
    p.vy += (targetVy - p.vy) * blend;
  }

  const prevX = p.x;
  const prevY = p.y;
  p.x += p.vx * dt;
  p.y += p.vy * dt;
  resolveTerrainFloorCollision(p, prevX, prevY);
  keepInExploreMap(p);
  if (!p.climb) resolveStaticCollisions(p);
  const touchedBoss = resolveEntityCollision(p, b, 1, 0);
  keepInExploreMap(p);
  updateToriiPassage(prevX, prevY, p.x, p.y);
  if (b.phase === "shape" && touchedBoss) hitPlayer(9, 6, p.x, p.y, { touch: true, attackInterferencePct: 10, attackInterferenceSeconds: 1.4 });

  if ((keys.has("Space") || pressedSlash) && p.slashCd <= 0) {
    performSlash();
  }
  pressedSlash = false;

  if (keys.has("KeyE") || pressedObserve) {
    observe(dt);
  }
  pressedObserve = false;

  if (pressedPurify) {
    startPurify();
  }
  pressedPurify = false;

  if (purifying) {
    purify(dt);
  }
}

function keepInArena(entity) {
  if (state.mode === "playing") {
    keepInBattleArena(entity);
  } else {
    keepInExploreMap(entity);
  }
}

function keepInExploreMap(entity) {
  const minX = WORLD.minX + entity.r;
  const maxX = WORLD.maxX - entity.r;
  const minY = WORLD.minY + entity.r;
  const maxY = WORLD.maxY - entity.r;
  const nextX = clamp(entity.x, minX, maxX);
  const nextY = clamp(entity.y, minY, maxY);
  if (nextX !== entity.x || nextY !== entity.y) {
    entity.x = nextX;
    entity.y = nextY;
    entity.vx *= 0.25;
    entity.vy *= 0.25;
  }
}

function keepInBattleArena(entity) {
  const dx = entity.x - BATTLE_CENTER.x;
  const dy = entity.y - BATTLE_CENTER.y;
  const maxDistance = Math.max(1, BATTLE_ARENA_RADIUS - entity.r);
  const distance = Math.hypot(dx, dy);
  if (distance <= maxDistance) return;
  const nx = dx / Math.max(0.0001, distance);
  const ny = dy / Math.max(0.0001, distance);
  entity.x = BATTLE_CENTER.x + nx * maxDistance;
  entity.y = BATTLE_CENTER.y + ny * maxDistance;
  dampVelocityFromNormal(entity, nx, ny);
}

function performSlash() {
  if (state.mode !== "playing") {
    performExploreSlash();
    return;
  }
  const p = state.player;
  const b = state.boss;
  const weapon = equippedWeapon();
  p.slashCd = 0.34 / attackSpeedMultiplier();
  p.slashTime = 0.18;
  p.slashId += 1;
  p.slashHit = false;
  state.metrics.slashes += 1;
  tone(520, 0.045, 0.018, "triangle");

  const range = slashRange(weapon);
  const slashAngle = slashDirectionAngle(p.face);
  const distance = Math.hypot(b.x - p.x, b.y - p.y);
  const inArc = angleDiff(slashAngle, angleTo(p, b)) <= SLASH_HALF_ANGLE;
  if (distance <= range + b.r && inArc) {
    p.slashHit = true;
    state.metrics.hits += 1;
    const slash = b.phase === "shape" ? slashDamageResult(b) : null;
    const damageColor = slash?.critical ? "#f2d17a" : b.phase === "shape" ? "#caa65a" : "#c6c7bd";
    addParticle(b.x, b.y, damageColor, slash?.critical ? 26 : 18, 150);
    b.hurtFlash = 0.14;
    state.shake = Math.max(state.shake, 4);

    if (b.phase === "shape") {
      let damage = slash.damage;
      b.form = Math.max(0, b.form - damage);
      const echo = weaponSpecialEffect("everyNthAttackWave");
      if (echo?.nth && state.metrics.hits % echo.nth === 0) {
        const echoDamage = damage * ((echo.damagePct || 0) / 100);
        b.form = Math.max(0, b.form - echoDamage);
        damage += echoDamage;
        addParticle(b.x, b.y, "#d97b8a", 26, 190);
        tone(740, 0.05, 0.012, "sine");
      }
      p.force = clamp(p.force + 8, 0, 100);
      applyLifeSteal(damage);
      if (b.form <= 0) enterAspect();
    } else if (b.phase === "aspect") {
      state.metrics.wrongSlashes += 1;
      b.agitation += 18;
      p.pollution = clamp(p.pollution + 5 * POLLUTION_GAIN_RATE * pollutionGainMultiplier(), 0, 100);
      flashMessage("相は斬れない。先に照らせ。", 2.2);
    } else if (b.phase === "wish") {
      state.metrics.wrongSlashes += 1;
      b.wish = Math.max(0, b.wish - 4 * bossDamageMultiplier("wish"));
      flashMessage("願核は刃を拒む。祓へ。", 2.2);
    }
  }
}

function performExploreSlash() {
  const p = state.player;
  p.slashCd = 0.34 / attackSpeedMultiplier();
  p.slashTime = 0.18;
  p.slashId += 1;
  p.slashHit = false;
  tone(420, 0.045, 0.014, "triangle");
  const tree = findSlashTreeTarget();
  if (!tree) return;
  chopTree(tree);
}

function findSlashTreeTarget() {
  const p = state.player;
  const range = slashRange();
  const slashAngle = slashDirectionAngle(p.face);
  let best = null;
  let bestDistance = Infinity;
  for (const detail of TERRAIN_DETAILS) {
    if (detail.kind !== "tree" || terrainDetailIsCut(detail)) continue;
    const point = scenePointToWorld(detail.sceneX, detail.sceneZ);
    const distance = Math.hypot(point.x - p.x, point.y - p.y);
    if (distance > range + 28 * detail.scale) continue;
    if (angleDiff(slashAngle, Math.atan2(point.y - p.y, point.x - p.x)) > SLASH_HALF_ANGLE) continue;
    if (distance < bestDistance) {
      best = detail;
      bestDistance = distance;
    }
  }
  return best;
}

function chopTree(detail) {
  const p = state.player;
  const status = terrainDetailStatus(detail);
  if (!status || status.cut) return;
  const point = scenePointToWorld(detail.sceneX, detail.sceneZ);
  const slash = slashDamageResult(null, { againstBoss: false, phase: null });
  const damage = slash.damage;
  const slashAngle = slashDirectionAngle(p.face);
  status.hp = Math.max(0, status.hp - damage);
  p.slashHit = true;
  p.force = clamp(p.force + 4, 0, 100);
  addParticle(point.x, point.y, "#8a6b36", 16, 120);
  addParticle(point.x + Math.cos(slashAngle) * 18, point.y + Math.sin(slashAngle) * 18, "#d8c98a", 8, 70);
  state.shake = Math.max(state.shake, 2.5);
  tone(196, 0.055, 0.016, "triangle");
  if (status.hp > 0) return;
  status.cut = true;
  if (terrainObjects3d.get(detail.id)) terrainObjects3d.get(detail.id).visible = false;
  addParticle(point.x, point.y, "#4f321f", 28, 170);
  tone(116, 0.12, 0.028, "sawtooth");
  flashMessage("樹が倒れ、道が少し開けた。", 1.9);
}

function applyLifeSteal(damage) {
  const p = state.player;
  const healOnAttack = prayerSpecialEffect("healOnAttack");
  if (!healOnAttack || p.lifeStealCd > 0) return;
  p.hp = clamp(p.hp + damage * ((healOnAttack.healFromDamagePct || 0) / 100), 0, p.maxHp);
  syncActiveAccountHp(p.hp);
  p.lifeStealCd = healOnAttack.cooldownSeconds || 7;
  addParticle(p.x, p.y, "#e1c887", 10, 90);
}

function updateArenaFocus(dt) {
  const p = state.player;
  if (!weaponSpecialEffect("circleStayAttackRamp")) {
    p.arenaFocusTime = 0;
    return;
  }
  if (Math.hypot(p.x - ENCOUNTER_RING.x, p.y - ENCOUNTER_RING.y) <= ENCOUNTER_RING.r) {
    p.arenaFocusTime += dt;
  } else {
    p.arenaFocusTime = 0;
  }
}

function updateKaguraWave(dt) {
  const p = state.player;
  const b = state.boss;
  const pulse = prayerSpecialEffect("passivePulse");
  if (!pulse || state.mode !== "playing") {
    p.kaguraWaveTimer = 3;
    return;
  }
  p.kaguraWaveTimer -= dt;
  if (p.kaguraWaveTimer > 0) return;
  p.kaguraWaveTimer += pulse.intervalSeconds || 3;
  state.echoes.push({
    x: p.x,
    y: p.y,
    r: 10,
    speed: 80,
    life: 1,
    hit: true,
    wish: true,
  });
  addParticle(p.x, p.y, "#eee6d2", 16, 120);
  tone(660, 0.08, 0.012, "triangle");
  if (Math.hypot(b.x - p.x, b.y - p.y) > (pulse.radius || 80) + b.r) return;
  const wavePower = weaponBaseDamage() * ((pulse.damagePct || 45) / 100) * bossDamageMultiplier(b.phase);
  if (b.phase === "shape") {
    b.form = Math.max(0, b.form - wavePower);
    b.hurtFlash = 0.12;
    if (b.form <= 0) enterAspect();
  } else if (b.phase === "aspect") {
    b.aspect = clamp(b.aspect + 8 * observePowerMultiplier(), 0, 100);
  } else if (b.phase === "wish") {
    b.wish = clamp(b.wish + 7 * bossDamageMultiplier("wish"), 0, 100);
    if (b.wish >= 100) endGame(true);
  }
}

function observe(dt) {
  const p = state.player;
  const b = state.boss;
  p.observePulse = 0.25;
  if (b.phase !== "aspect") {
    if (state.messageTimer <= 0) flashMessage("照らすべき相は、形の奥にある。", 1.6);
    return;
  }

  let foundOne = false;
  for (let i = 0; i < state.fragments.length; i += 1) {
    const f = state.fragments[i];
    if (f.found) continue;
    const d = Math.hypot(f.x - p.x, f.y - p.y);
    if (d < observeRange()) {
      const focus = observePowerMultiplier();
      f.progress = clamp(f.progress + dt * 0.9 * focus, 0, 1);
      b.aspect = clamp(b.aspect + dt * 17 * focus, 0, 100);
      foundOne = true;
      if (f.progress >= 1) {
        f.found = true;
        state.metrics.memories += 1;
        flashMessage(memoryTexts[i].full, 4);
        addParticle(f.x, f.y, "#eee6d2", 24, 130);
        tone(392 + i * 80, 0.12, 0.025, "sine");
        setMemoryUi();
        if (state.metrics.memories === memoryTexts.length) enterWish();
      }
    }
  }

  if (!foundOne && state.messageTimer <= 0) {
    flashMessage("靠近白紙垂，讓相浮起。", 1.4);
  }
}

function startPurify() {
  const p = state.player;
  const b = state.boss;
  if (b.phase !== "wish") {
    if (state.messageTimer <= 0) flashMessage("願核尚未顯現。", 1.4);
    return;
  }
  if (p.purifyCast > 0 || p.purifyCd > 0) return;
  const d = Math.hypot(b.x - p.x, b.y - p.y);
  if (d > ritualRange()) {
    if (state.messageTimer <= 0) flashMessage("離願核太遠，祓鈴無聲。", 1.4);
    return;
  }
  const extraTime = clamp((state.time - 75) / 120, 0, 1) * 0.32;
  p.purifyDuration = Math.min(PURIFY_MAX_DURATION, PURIFY_BASE_DURATION + extraTime) / bossDamageMultiplier("wish");
  p.purifyCast = p.purifyDuration;
  p.purifyLock = p.purifyDuration;
  p.purifyStartWish = b.wish;
  flashMessage("祓儀起。守住這一息。", 1.6);
  startPurifySuzu();
}

function interruptPurify(message) {
  const p = state.player;
  if (p.purifyCast <= 0) return;
  stopPurifySuzu();
  p.purifyCast = 0;
  p.purifyLock = 0;
  p.purifyCd = 0.35;
  state.boss.wish = Math.max(0, state.boss.wish - 10);
  flashMessage(message, 1.8);
}

function purify(dt) {
  const p = state.player;
  const b = state.boss;
  if (b.phase !== "wish") {
    interruptPurify("願核尚未顯現。");
    return;
  }
  const d = Math.hypot(b.x - p.x, b.y - p.y);
  if (d > ritualRange() + 18) {
    interruptPurify("離願核太遠，祓儀散了。");
    return;
  }

  p.purifyCast = Math.max(0, p.purifyCast - dt);
  p.purifyLock = Math.max(p.purifyLock, 0.12);
  const progress = clamp(1 - p.purifyCast / Math.max(0.01, p.purifyDuration), 0, 1);
  b.wish = clamp(p.purifyStartWish + (100 - p.purifyStartWish) * progress, 0, 100);
  p.pollution = Math.max(0, p.pollution - dt * 9);
  p.force = clamp(p.force + dt * 14, 0, 100);
  if (Math.random() < dt * 26) {
    addParticle(b.x + (Math.random() - 0.5) * 80, b.y + (Math.random() - 0.5) * 80, "#eee6d2", 1, 70);
  }
  if (p.purifyCast <= 0) {
    stopPurifySuzu();
    b.wish = 100;
    flashMessage("願は無相へ還った。", 4);
    endGame(true);
  }
}

function updateBoss(dt) {
  const b = state.boss;
  const p = state.player;
  b.hurtFlash = Math.max(0, b.hurtFlash - dt);
  b.attackTimer -= dt;

  if (b.phase === "shape") {
    const targetAngle = angleTo(b, p);
    const desiredDistance = 196;
    const d = Math.hypot(p.x - b.x, p.y - b.y);
    const drift = Math.sin(state.time * 1.8) * 0.78;
    const speed = (d > desiredDistance ? 92 : -30) * bossMoveSpeedMultiplier();
    b.vx = Math.cos(targetAngle + drift) * speed;
    b.vy = Math.sin(targetAngle + drift) * speed;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    keepInArena(b);
    if (b.attackTimer <= 0) {
      b.pattern = (b.pattern + 1) % 3;
      b.attackTimer = (b.pattern === 2 ? 2.2 : 1.35) / bossFinalSkillRate();
      if (b.pattern === 0) fanProjectiles(5, 0.38, 198);
      if (b.pattern === 1) bindZone(p.x, p.y, 96, 0.72);
      if (b.pattern === 2) lineRend();
    }
  } else if (b.phase === "aspect") {
    const phaseAnchor = { x: BATTLE_CENTER.x, y: BATTLE_CENTER.y - 122 };
    b.x += (phaseAnchor.x - b.x) * dt * 0.8;
    b.y += (phaseAnchor.y - b.y) * dt * 0.8;
    b.agitation = Math.max(0, b.agitation - dt * 3);
    if (b.attackTimer <= 0) {
      b.attackTimer = (1.8 - Math.min(0.55, b.agitation / 120)) / bossFinalSkillRate();
      echoWave();
      if (Math.random() < 0.55) bindZone(p.x, p.y, 72 + b.agitation * 0.2, 0.9);
    }
  } else if (b.phase === "wish") {
    b.x += (BATTLE_CENTER.x - b.x) * dt * 1.2;
    b.y += (BATTLE_CENTER.y - 132 - b.y) * dt * 1.2;
    if (b.attackTimer <= 0) {
      b.attackTimer = 1.05 / bossFinalSkillRate();
      ringPulse();
      if (Math.random() < 0.34) fanProjectiles(7, 0.72, 158);
    }
  }

  keepInArena(b);
  resolveStaticCollisions(b);
  const touchedPlayer = resolveEntityCollision(b, p, 1, 0);
  keepInArena(b);
  if (b.phase === "shape" && touchedPlayer) hitPlayer(9, 6, p.x, p.y, { touch: true, attackInterferencePct: 10, attackInterferenceSeconds: 1.4 });
}

function fanProjectiles(count, spread, speed) {
  const b = state.boss;
  const p = state.player;
  const base = angleTo(b, p);
  const spawnOffset = 42 * BOSS_SKILL_SCALE;
  const projectileSpeed = speed * BOSS_SKILL_SPEED_SCALE;
  for (let i = 0; i < count; i += 1) {
    const t = count === 1 ? 0 : i / (count - 1) - 0.5;
    const a = base + t * spread * 2;
    state.projectiles.push({
      x: b.x + Math.cos(a) * spawnOffset,
      y: b.y + Math.sin(a) * spawnOffset,
      vx: Math.cos(a) * projectileSpeed,
      vy: Math.sin(a) * projectileSpeed,
      r: 8 * BOSS_SKILL_SCALE,
      life: 4.2,
      color: "#6f4c86",
    });
  }
}

function bindZone(x, y, r, delay) {
  state.zones.push({
    x,
    y,
    r: r * BOSS_SKILL_SCALE,
    delay,
    duration: 0.34,
    type: "circle",
    hit: false,
  });
}

function lineRend() {
  const b = state.boss;
  const p = state.player;
  state.zones.push({
    x: b.x,
    y: b.y,
    angle: angleTo(b, p),
    length: 680 * BOSS_SKILL_SCALE,
    width: 44 * BOSS_SKILL_SCALE,
    delay: 0.68,
    duration: 0.22,
    type: "line",
    hit: false,
  });
}

function echoWave() {
  const b = state.boss;
  state.echoes.push({
    x: b.x,
    y: b.y,
    r: 28 * BOSS_SKILL_SCALE,
    speed: 190 * BOSS_SKILL_SPEED_SCALE,
    life: 2.35,
    hit: false,
  });
}

function ringPulse() {
  const b = state.boss;
  state.echoes.push({
    x: b.x,
    y: b.y,
    r: 16 * BOSS_SKILL_SCALE,
    speed: 265 * BOSS_SKILL_SPEED_SCALE,
    life: 1.85,
    hit: false,
    wish: true,
  });
}

function updateHazards(dt) {
  const p = state.player;
  for (let i = state.projectiles.length - 1; i >= 0; i -= 1) {
    const q = state.projectiles[i];
    q.x += q.vx * dt;
    q.y += q.vy * dt;
    q.life -= dt;
    if (outsideAirWall(q, 100) || q.life <= 0) {
      state.projectiles.splice(i, 1);
      continue;
    }
    if (Math.hypot(q.x - p.x, q.y - p.y) < q.r + p.r) {
      if (p.iFrame > 0 && p.dashTime > 0) {
        state.metrics.cleanDodges += 1;
        p.dodgeStrikeReady = true;
        p.force = clamp(p.force + 7, 0, 100);
        addParticle(q.x, q.y, "#caa65a", 8, 120);
        state.projectiles.splice(i, 1);
      } else if (hitPlayer(7, 8, q.x, q.y, { attackInterferencePct: 18, attackInterferenceSeconds: 2.2 })) {
        state.projectiles.splice(i, 1);
      }
    }
  }

  for (let i = state.zones.length - 1; i >= 0; i -= 1) {
    const z = state.zones[i];
    z.delay -= dt;
    if (z.delay <= 0) z.duration -= dt;
    if (z.delay <= 0 && z.duration > 0 && !z.hit) {
      let inside = false;
      if (z.type === "circle") {
        inside = Math.hypot(z.x - p.x, z.y - p.y) < z.r + p.r * 0.4;
      } else {
        const dx = p.x - z.x;
        const dy = p.y - z.y;
        const along = Math.cos(z.angle) * dx + Math.sin(z.angle) * dy;
        const side = Math.abs(-Math.sin(z.angle) * dx + Math.cos(z.angle) * dy);
        inside = along > 0 && along < z.length && side < z.width;
      }
      if (inside) {
        if (p.iFrame > 0 && p.dashTime > 0) {
          z.hit = true;
          state.metrics.cleanDodges += 1;
          p.dodgeStrikeReady = true;
          p.force = clamp(p.force + 10, 0, 100);
          addParticle(p.x, p.y, "#caa65a", 12, 150);
        } else {
          z.hit = hitPlayer(12, 9, p.x, p.y, { attackInterferencePct: 26, attackInterferenceSeconds: 3.2 });
        }
      }
    }
    if (z.delay <= 0 && z.duration <= 0) state.zones.splice(i, 1);
  }

  for (let i = state.echoes.length - 1; i >= 0; i -= 1) {
    const e = state.echoes[i];
    e.r += e.speed * dt;
    e.life -= dt;
    if (e.life <= 0 || e.r > AIR_WALL_RADIUS * 1.35) state.echoes.splice(i, 1);
  }
}

function updateParticles(dt) {
  for (let i = state.particles.length - 1; i >= 0; i -= 1) {
    const p = state.particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= 1 - dt * 2.6;
    p.vy *= 1 - dt * 2.6;
    p.life -= dt;
    if (p.life <= 0) state.particles.splice(i, 1);
  }
}

function dispose3DObject(object) {
  object.traverse((node) => {
    if (node.geometry) node.geometry.dispose();
    if (node.material) {
      if (Array.isArray(node.material)) {
        node.material.forEach((material) => material.dispose());
      } else {
        node.material.dispose();
      }
    }
  });
}

function clearDynamic3D() {
  if (!dynamic3d) return;
  while (dynamic3d.children.length) {
    const child = dynamic3d.children.pop();
    dispose3DObject(child);
  }
}

function makeGroundDisc(radius, color, opacity) {
  const mesh = new THREE.Mesh(
    new THREE.CircleGeometry(radius, 48),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity, side: THREE.DoubleSide, depthWrite: false }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.035;
  return mesh;
}

function makeGroundRect(length, width, color, opacity) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(length, 0.03, width),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false }),
  );
  mesh.position.y = 0.045;
  return mesh;
}

function addFragment3D(fragment, index) {
  const group = new THREE.Group();
  const pos = worldTo3(fragment.x, fragment.y, 0);
  group.position.copy(pos);
  const ring = makeGroundRing(0.44 + fragment.progress * 0.16, 0xeee6d2, 0.38 + fragment.progress * 0.35);
  group.add(ring);

  const ready = fragment.progress >= 1;
  const paperMat = new THREE.MeshBasicMaterial({ color: ready ? 0xf7f0da : 0xc6c7bd, transparent: true, opacity: 0.85 });
  const sealMat = new THREE.MeshBasicMaterial({ color: ready ? 0xcaa65a : 0x6f4c86, transparent: true, opacity: ready ? 0.8 : 0.6 });
  const bob = 0.52 + Math.sin(state.time * 3 + index) * 0.05;
  const spin = state.time * 0.45 + index;
  addBox3D(group, paperMat, 0.14, 0.62, 0.02, 0, bob, 0, 0, spin, 0);
  addBox3D(group, paperMat, 0.1, 0.22, 0.018, -0.05, bob - 0.2, 0.012, 0, spin, 0.28);
  addBox3D(group, paperMat, 0.1, 0.22, 0.018, 0.05, bob - 0.2, 0.012, 0, spin, -0.28);
  addBox3D(group, sealMat, 0.09, 0.09, 0.024, 0, bob + 0.06, -0.014, 0, spin, 0);
  dynamic3d.add(group);
}

function updateDynamic3D() {
  clearDynamic3D();

  for (let i = 0; i < state.fragments.length; i += 1) {
    const fragment = state.fragments[i];
    if (!fragment.found) addFragment3D(fragment, i);
  }

  for (const zone of state.zones) {
    const armed = zone.delay <= 0;
    const color = armed ? 0xcaa65a : 0x9f2f2f;
    const opacity = armed ? 0.28 : 0.18;
    if (zone.type === "circle") {
      const mesh = makeGroundDisc(worldLen(zone.r), color, opacity);
      mesh.position.copy(worldTo3(zone.x, zone.y, 0.04));
      dynamic3d.add(mesh);
    } else {
      const mesh = makeGroundRect(worldLen(zone.length), worldLen(zone.width * 2), color, opacity);
      const start = worldTo3(zone.x, zone.y, 0.04);
      mesh.position.set(
        start.x + Math.cos(zone.angle) * worldLen(zone.length) * 0.5,
        0.045,
        start.z + Math.sin(zone.angle) * worldLen(zone.length) * 0.5,
      );
      mesh.rotation.y = -zone.angle;
      dynamic3d.add(mesh);
    }
  }

  for (const projectile of state.projectiles) {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(worldLen(projectile.r * 1.7), 12, 8),
      new THREE.MeshBasicMaterial({ color: projectile.color || 0x6f4c86 }),
    );
    mesh.position.copy(worldTo3(projectile.x, projectile.y, 0.34));
    dynamic3d.add(mesh);
  }

  for (const echo of state.echoes) {
    const ring = makeGroundRing(worldLen(echo.r), echo.wish ? 0xeee6d2 : 0xc6c7bd, clamp(echo.life / 1.5, 0.12, 0.56));
    ring.position.copy(worldTo3(echo.x, echo.y, 0.06));
    dynamic3d.add(ring);
  }

  const lootFloat = Math.sin(state.time * 3.2) * 0.04;
  for (const loot of activeFieldLoot()) {
    const point = chestLootWorldPoint(loot);
    const item = itemDefinition(loot.itemKey);
    const color = Number(`0x${rarityColor(item?.rarity || "white").slice(1)}`);
    const texture = itemTexture3D(item);
    if (texture) {
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: texture,
          color: 0xffffff,
          transparent: true,
          opacity: 0.96,
          depthWrite: false,
        }),
      );
      sprite.position.copy(worldTo3(point.x, point.y, 0.24 + lootFloat));
      sprite.scale.set(0.42, 0.42, 1);
      dynamic3d.add(sprite);
    } else {
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.11, 0.12, 0.11),
        new THREE.MeshStandardMaterial({ color, roughness: 0.72, metalness: 0.04, emissive: color, emissiveIntensity: 0.1 }),
      );
      body.position.copy(worldTo3(point.x, point.y, 0.18 + lootFloat));
      dynamic3d.add(body);
    }
    const halo = new THREE.Mesh(
      new THREE.RingGeometry(0.08, 0.13, 18),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.42, side: THREE.DoubleSide }),
    );
    halo.rotation.x = -Math.PI / 2;
    halo.position.copy(worldTo3(point.x, point.y, 0.04));
    dynamic3d.add(halo);
  }

  for (const particle of state.particles.slice(0, 90)) {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(worldLen(particle.size * 1.4), 8, 6),
      new THREE.MeshBasicMaterial({ color: particle.color, transparent: true, opacity: clamp(particle.life / particle.max, 0, 1) }),
    );
    mesh.position.copy(worldTo3(particle.x, particle.y, 0.22 + worldLen(particle.size * 1.6)));
    dynamic3d.add(mesh);
  }
}

function render3D() {
  if (!threeReady) return false;
  const p = state.player;
  const b = state.boss;
  const displayMode = getDisplayMode();
  const inBattle = displayMode === "playing" || displayMode === "victory" || displayMode === "defeat";
  const playerPos = worldTo3(p.x, p.y, playerHeightOffset(p));
  const bossPos = worldTo3(b.x, b.y, 0);
  const moving = Math.hypot(p.vx, p.vy) > 18;
  const stride = moving ? Math.sin(state.time * (p.glideActive || p.dashTime > 0 ? 24 : 14)) : 0;
  const bob = moving ? Math.abs(stride) * 0.035 * SMALL_ACTOR_SCALE : 0;
  const jumpLift = jumpLift3D(p);
  player3d.visible = displayMode !== "account";
  boss3d.visible = inBattle;
  syncTerrainObjects3D();
  syncChestObjects3D();
  player3d.position.copy(playerPos);
  player3d.position.y += bob + jumpLift;
  boss3d.position.copy(bossPos);
  player3d.rotation.y = -p.face + Math.PI / 2;
  boss3d.rotation.y = Math.sin(state.time * 0.55) * 0.08;

  const playerBody = player3d.getObjectByName("body");
  const playerHead = player3d.getObjectByName("head");
  const playerSash = player3d.getObjectByName("sash");
  const playerSword = player3d.getObjectByName("sword");
  if (playerBody) playerBody.rotation.z = stride * 0.035;
  if (playerHead) playerHead.position.y = 0.91 * SMALL_ACTOR_SCALE + bob * 0.45;
  if (playerSash) playerSash.rotation.z = -stride * 0.06;
  if (playerSword) {
    const slashProgress = p.slashTime > 0 ? 1 - clamp(p.slashTime / 0.18, 0, 1) : 0;
    const swing = Math.sin(slashProgress * Math.PI);
    playerSword.position.set((0.34 + swing * 0.06) * SMALL_ACTOR_SCALE, 0.66 * SMALL_ACTOR_SCALE, (-0.28 - swing * 0.08) * SMALL_ACTOR_SCALE);
    playerSword.rotation.x = -0.32 - swing * 0.42;
    playerSword.rotation.y = p.slashTime > 0 ? 0.72 - slashProgress * 1.44 : 0;
    playerSword.rotation.z = moving && p.slashTime <= 0 ? stride * 0.08 : 0;
  }

  const bossBody = boss3d.getObjectByName("body");
  if (bossBody?.material) {
    bossBody.material.color.set(b.hurtFlash > 0 ? 0xeee6d2 : b.phase === "wish" ? 0x15100e : 0x140d0b);
    bossBody.material.emissive.set(b.phase === "shape" ? 0x3a1215 : b.phase === "aspect" ? 0x1f3346 : 0x6f4c86);
  }
  boss3d.scale.setScalar(SMALL_ACTOR_SCALE * (b.phase === "aspect" ? 0.92 + Math.sin(state.time * 4) * 0.03 : 1));
  wishCore3d.material.opacity = b.phase === "wish" ? 0.75 + Math.sin(state.time * 8) * 0.18 : 0;
  wishCore3d.scale.setScalar(1 + b.wish / 120);

  const slashRangeValue = slashRange();
  const slashRangeOpacity = displayMode !== "account" && displayMode !== "ready" && p.slashTime > 0 ? clamp(p.slashTime / 0.18, 0, 0.9) : 0;
  updateSlashRangeGeometry3D(slashRangeValue);
  slashSector3d.material.opacity = slashRangeOpacity * 0.38;
  slashArc3d.material.opacity = slashRangeOpacity;
  observeRing3d.material.opacity = inBattle && p.observePulse > 0 ? p.observePulse / 0.25 : 0;
  observeRing3d.position.copy(worldTo3(p.x, p.y, playerHeightOffset(p) + 0.06));
  purifyRing3d.material.opacity = inBattle && p.purifyLock > 0 ? 0.65 : 0;
  purifyRing3d.position.copy(worldTo3(p.x, p.y, playerHeightOffset(p) + 0.07));
  if (mistField3d) {
    mistField3d.rotation.y = Math.sin(state.time * 0.035) * 0.08;
    for (let i = 0; i < mistField3d.children.length; i += 1) {
      const mist = mistField3d.children[i];
      mist.rotation.z += 0.00018 * (i + 1);
      if (mist.material?.map) {
        mist.material.map.offset.x = Math.sin(state.time * 0.018 + i) * 0.035;
        mist.material.map.offset.y = Math.cos(state.time * 0.014 + i) * 0.035;
      }
    }
  }
  for (let i = 0; i < lanternLights3d.length; i += 1) {
    const flicker = 0.64 + Math.sin(state.time * 4.2 + i * 1.7) * 0.08 + Math.sin(state.time * 9.1 + i) * 0.025;
    lanternLights3d[i].intensity = flicker;
    if (lanternGlow3d[i]) {
      lanternGlow3d[i].scale.setScalar(1 + (flicker - 0.64) * 0.35);
      lanternGlow3d[i].material.opacity = clamp(0.78 + (flicker - 0.64), 0.64, 0.92);
    }
  }

  updateDynamic3D();

  const villagePos = worldTo3(VILLAGE_CENTER.x, VILLAGE_CENTER.y, 0);
  const skyCamera = new THREE.Vector3(villagePos.x, 28, villagePos.z + 0.12);
  const skyTarget = new THREE.Vector3(villagePos.x, 0, villagePos.z);
  const cameraDistance = Math.max(2.35, CAMERA_3D_OFFSET.z - cameraPitch * 1.25);
  const cameraHeight = Math.max(2.15, CAMERA_3D_OFFSET.y + cameraPitch * 1.65);
  const lookDistance = Math.abs(CAMERA_3D_LOOK_AHEAD.z);
  const lookHeight = CAMERA_3D_LOOK_AHEAD.y + cameraPitch * 0.3;
  const offsetX = Math.sin(cameraYaw) * cameraDistance;
  const offsetZ = Math.cos(cameraYaw) * cameraDistance;
  const lookX = -Math.sin(cameraYaw) * lookDistance;
  const lookZ = -Math.cos(cameraYaw) * lookDistance;
  const groundCamera = new THREE.Vector3(playerPos.x + offsetX, playerPos.y + cameraHeight, playerPos.z + offsetZ);
  const groundTarget = new THREE.Vector3(playerPos.x + lookX, playerPos.y + lookHeight, playerPos.z + lookZ);
  let desiredCamera = groundCamera;
  let target = groundTarget;
  if (displayMode === "account") {
    desiredCamera = skyCamera;
    target = skyTarget;
  } else if (displayMode === "landing") {
    const t = clamp(state.landingTimer / Math.max(0.001, state.landingDuration), 0, 1);
    const eased = 1 - (1 - t) ** 3;
    desiredCamera = new THREE.Vector3().lerpVectors(skyCamera, groundCamera, eased);
    target = new THREE.Vector3().lerpVectors(skyTarget, groundTarget, eased);
  }
  if (state.shake > 0 && inBattle) {
    desiredCamera.x += (Math.random() - 0.5) * state.shake * 0.012;
    desiredCamera.y += (Math.random() - 0.5) * state.shake * 0.006;
  }
  camera3d.position.copy(desiredCamera);
  lastCameraTarget.copy(target);
  camera3d.lookAt(lastCameraTarget);
  renderer3d.render(scene3d, camera3d);
  if (selfTest && !selfTestLogged) {
    logCanvasSelfTest(renderer3d.domElement, "3d");
  }
  return true;
}

function syncTerrainObjects3D() {
  for (const [id, object] of terrainObjects3d) {
    object.visible = !terrainDetailIsCut(id);
  }
}

function syncChestObjects3D() {
  const activeIds = new Set(activeDailyChests().map((chest) => chest.id));
  const opened = chestOpenedSet();
  for (const [id, visual] of chestObjects3d) {
    visual.group.visible = activeIds.has(id);
    if (visual.lid) visual.lid.rotation.x = opened.has(id) ? -1.05 : -0.12;
  }
}

function draw() {
  if (render3D()) {
    drawMinimap();
    return;
  }
  syncCameraView();
  ctx.clearRect(0, 0, view.w, view.h);
  ctx.save();
  let sx = 0;
  let sy = 0;
  if (state.shake > 0) {
    sx = (Math.random() - 0.5) * state.shake;
    sy = (Math.random() - 0.5) * state.shake;
  }
  ctx.translate(view.ox + sx, view.oy + sy);
  ctx.scale(view.scale, view.scale);
  drawWorld();
  ctx.restore();
  if (selfTest && !selfTestLogged && (threeFailed || !sceneMount)) {
    logCanvasSelfTest(canvas, "2d");
  }
  drawMinimap();
}

function logCanvasSelfTest(sourceCanvas, mode) {
  selfTestLogged = true;
  let sourceCtx = ctx;
  let sampleCanvas = sourceCanvas;
  if (sourceCanvas !== canvas) {
    sampleCanvas = document.createElement("canvas");
    sampleCanvas.width = sourceCanvas.width;
    sampleCanvas.height = sourceCanvas.height;
    sourceCtx = sampleCanvas.getContext("2d");
    sourceCtx.drawImage(sourceCanvas, 0, 0);
  }
  const sample = sourceCtx.getImageData(0, 0, sampleCanvas.width, sampleCanvas.height).data;
  let nonBlank = 0;
  let lumaSum = 0;
  let checked = 0;
  const step = Math.max(4, Math.floor(sample.length / 4 / 420));
  for (let i = 0; i < sample.length; i += step * 4) {
    const r = sample[i];
    const g = sample[i + 1];
    const b = sample[i + 2];
    const a = sample[i + 3];
    if (a > 0 && (r > 3 || g > 3 || b > 3)) nonBlank += 1;
    lumaSum += (r + g + b) / 3;
    checked += 1;
  }
  console.log(
    "[月下祓行 selftest]",
    JSON.stringify({
      canvas: `${sampleCanvas.width}x${sampleCanvas.height}`,
      mode,
      checked,
      nonBlank,
      averageLuma: Math.round(lumaSum / Math.max(1, checked)),
    }),
  );
  document.body.dataset.canvasSelftest = JSON.stringify({
    canvas: `${sampleCanvas.width}x${sampleCanvas.height}`,
    mode,
    checked,
    nonBlank,
    averageLuma: Math.round(lumaSum / Math.max(1, checked)),
  });
}

function drawWorld() {
  drawBackdrop();
  drawDistantGround();
  drawArena();
  drawTerrainFeatures();
  drawStoneRoad();
  drawMainCity2D();
  drawLanternClearings();
  drawTerrainDetails();
  drawStaticProps();
  drawDailyChests();
  drawFieldLoot();
  drawFragments();
  drawZones();
  drawProjectiles();
  drawEchoes();
  drawBoss();
  drawPlayer();
  drawParticles();
  drawVignette();
}

function drawBackdrop() {
  const sky = ctx.createLinearGradient(0, 0, 0, WORLD.h);
  sky.addColorStop(0, "#10100f");
  sky.addColorStop(0.52, "#211915");
  sky.addColorStop(1, "#090807");
  const visualHalf = VISUAL_WORLD_SIZE / 2;
  const visualMinX = WORLD.cx - visualHalf;
  const visualMinY = WORLD.cy - visualHalf;
  ctx.fillStyle = sky;
  ctx.fillRect(visualMinX, visualMinY, VISUAL_WORLD_SIZE, VISUAL_WORLD_SIZE);

  ctx.save();
  ctx.globalAlpha = 0.94;
  ctx.fillStyle = "#f7f0da";
  ctx.beginPath();
  ctx.arc(WORLD.cx + WORLD.r * 1.1, WORLD.cy - WORLD.r * 0.88, 72, 0, TWO_PI);
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "rgba(9, 8, 7, 0.22)";
  ctx.beginPath();
  ctx.arc(WORLD.cx + WORLD.r * 1.06, WORLD.cy - WORLD.r * 0.91, 72, 0, TWO_PI);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = "#080706";
  for (let i = 0; i < 25; i += 1) {
    const x = i * 78 + ((i % 3) * 12);
    const h = 110 + (i % 5) * 18;
    ctx.beginPath();
    ctx.moveTo(x, WORLD.cy - WORLD.r * 0.38);
    ctx.lineTo(x + 38, WORLD.cy - WORLD.r * 0.38 - h);
    ctx.lineTo(x + 76, WORLD.cy - WORLD.r * 0.38);
    ctx.closePath();
    ctx.fill();
  }

  ctx.save();
  ctx.translate(WORLD.cx - WORLD.r * 1.42, WORLD.cy - WORLD.r * 0.34);
  ctx.fillStyle = "#1b0f0c";
  ctx.fillRect(-82, -12, 164, 18);
  ctx.fillRect(-62, 10, 22, 112);
  ctx.fillRect(40, 10, 22, 112);
  ctx.fillStyle = "#4d1f1d";
  ctx.fillRect(-94, -30, 188, 18);
  ctx.restore();
}

function drawDistantGround() {
  ctx.save();
  const far = Math.max(WORLD.w, WORLD.h);
  const visualHalf = VISUAL_WORLD_SIZE / 2;
  const visualMinX = WORLD.cx - visualHalf;
  const visualMinY = WORLD.cy - visualHalf;
  const ground = ctx.createLinearGradient(0, 0, WORLD.w, WORLD.h);
  ground.addColorStop(0, "rgba(36, 55, 30, 0.52)");
  ground.addColorStop(0.5, "rgba(26, 42, 24, 0.6)");
  ground.addColorStop(1, "rgba(73, 96, 64, 0.5)");
  ctx.fillStyle = ground;
  ctx.fillRect(visualMinX, visualMinY, VISUAL_WORLD_SIZE, VISUAL_WORLD_SIZE);

  ctx.globalAlpha = 0.16;
  ctx.strokeStyle = "#ded8c2";
  ctx.lineWidth = 2;
  for (let size = MAP_SIZE + 280; size < VISUAL_WORLD_SIZE; size += 360) {
    const half = size / 2;
    ctx.strokeRect(WORLD.cx - half, WORLD.cy - half, size, size);
  }

  ctx.globalAlpha = 0.14;
  const mist = ctx.createRadialGradient(WORLD.cx, WORLD.cy, AIR_WALL_RADIUS * 0.55, WORLD.cx, WORLD.cy, far * 0.7);
  mist.addColorStop(0, "rgba(222, 216, 194, 0)");
  mist.addColorStop(0.52, "rgba(222, 216, 194, 0.12)");
  mist.addColorStop(1, "rgba(222, 216, 194, 0.32)");
  ctx.fillStyle = mist;
  ctx.fillRect(visualMinX, visualMinY, VISUAL_WORLD_SIZE, VISUAL_WORLD_SIZE);
  ctx.restore();
}

function drawArena() {
  ctx.save();
  ctx.translate(WORLD.cx, WORLD.cy);
  const minX = WORLD.minX - WORLD.cx;
  const maxX = WORLD.maxX - WORLD.cx;
  const minY = WORLD.minY - WORLD.cy;
  const maxY = WORLD.maxY - WORLD.cy;
  const ground = ctx.createRadialGradient(0, 0, 80, 0, 0, Math.max(WORLD.w, WORLD.h) * 0.52);
  ground.addColorStop(0, "#31482a");
  ground.addColorStop(0.45, "#25381f");
  ground.addColorStop(0.72, "#1d2b1a");
  ground.addColorStop(1, "#11180f");
  ctx.fillStyle = ground;
  ctx.fillRect(minX, minY, WORLD.w, WORLD.h);

  ctx.strokeStyle = "rgba(202, 166, 90, 0.38)";
  ctx.lineWidth = 3;
  ctx.strokeRect(minX, minY, WORLD.w, WORLD.h);

  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(238, 230, 210, 0.08)";
  for (let offset = minX + 320; offset < maxX; offset += 320) {
    ctx.beginPath();
    ctx.moveTo(offset, minY);
    ctx.lineTo(offset, maxY);
    ctx.stroke();
  }
  for (let offset = minY + 320; offset < maxY; offset += 320) {
    ctx.beginPath();
    ctx.moveTo(minX, offset);
    ctx.lineTo(maxX, offset);
    ctx.stroke();
  }

  ctx.restore();
}

function drawShrineHill() {
  const center = scenePointToWorld(SHRINE_HILL_SCENE.x, SHRINE_HILL_SCENE.z);
  ctx.save();
  ctx.translate(center.x, center.y);
  ctx.fillStyle = "rgba(58, 81, 47, 0.78)";
  ctx.beginPath();
  ctx.ellipse(0, 0, SHRINE_HILL_SCENE.rx * WORLD_SCALE, SHRINE_HILL_SCENE.rz * WORLD_SCALE, -0.08, 0, TWO_PI);
  ctx.fill();
  ctx.strokeStyle = "rgba(210, 207, 186, 0.18)";
  ctx.lineWidth = 2;
  for (let i = 0.3; i <= 0.9; i += 0.2) {
    ctx.beginPath();
    ctx.ellipse(0, 0, SHRINE_HILL_SCENE.rx * WORLD_SCALE * i, SHRINE_HILL_SCENE.rz * WORLD_SCALE * i, -0.08, 0, TWO_PI);
    ctx.stroke();
  }
  ctx.restore();
}

function drawTerrainFeatures() {
  for (const feature of TERRAIN_FEATURES) {
    const center = scenePointToWorld(feature.sceneX, feature.sceneZ);
    const layers = feature.layers || 4;
    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.rotate(feature.rotation || 0);
    ctx.fillStyle = feature.kind === "lowland"
      ? "rgba(23, 39, 19, 0.78)"
      : feature.kind === "meadow"
        ? "rgba(58, 86, 48, 0.66)"
        : feature.kind === "mountain"
          ? "rgba(76, 85, 72, 0.74)"
          : "rgba(58, 81, 47, 0.72)";
    ctx.beginPath();
    ctx.ellipse(0, 0, feature.rx * WORLD_SCALE, feature.rz * WORLD_SCALE, 0, 0, TWO_PI);
    ctx.fill();
    ctx.strokeStyle = feature.kind === "lowland"
      ? "rgba(95, 123, 82, 0.2)"
      : feature.kind === "mountain"
        ? "rgba(238, 230, 210, 0.22)"
        : "rgba(210, 207, 186, 0.15)";
    ctx.lineWidth = 2;
    for (let i = 1; i < layers; i += 1) {
      const t = i / layers;
      ctx.beginPath();
      ctx.ellipse(0, 0, feature.rx * WORLD_SCALE * (1 - t * 0.18), feature.rz * WORLD_SCALE * (1 - t * 0.2), 0, 0, TWO_PI);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawTree2D(detail) {
  const s = detail.scale;
  ctx.rotate(detail.rotation || 0);
  ctx.fillStyle = "rgba(0, 0, 0, 0.24)";
  ctx.beginPath();
  ctx.ellipse(0, 17 * s, 24 * s, 9 * s, 0, 0, TWO_PI);
  ctx.fill();
  ctx.fillStyle = detail.type === "willow" ? "#5e472c" : "#4f321f";
  ctx.fillRect(-4 * s, -28 * s, 8 * s, 48 * s);
  if (detail.type === "cedar" || detail.type === "pine") {
    ctx.fillStyle = detail.type === "cedar" ? "#17361f" : "#1f4328";
    const tiers = detail.type === "cedar" ? 4 : 3;
    for (let i = 0; i < tiers; i += 1) {
      const y = -30 * s - i * 18 * s;
      const w = (42 - i * 6) * s;
      ctx.beginPath();
      ctx.moveTo(0, y - 28 * s);
      ctx.lineTo(w * 0.5, y + 12 * s);
      ctx.lineTo(-w * 0.5, y + 12 * s);
      ctx.closePath();
      ctx.fill();
    }
  } else {
    ctx.fillStyle = detail.type === "willow" ? "#3f5c35" : "#31512f";
    ctx.beginPath();
    ctx.ellipse(0, -46 * s, 34 * s, 28 * s, 0, 0, TWO_PI);
    ctx.fill();
    ctx.fillStyle = detail.type === "willow" ? "rgba(95, 116, 71, 0.78)" : "rgba(72, 104, 61, 0.76)";
    ctx.beginPath();
    ctx.ellipse(12 * s, -40 * s, 22 * s, 18 * s, 0.3, 0, TWO_PI);
    ctx.fill();
  }
}

function drawBush2D(detail) {
  const s = detail.scale;
  ctx.rotate(detail.rotation || 0);
  ctx.fillStyle = "rgba(0, 0, 0, 0.16)";
  ctx.beginPath();
  ctx.ellipse(0, 8 * s, 18 * s, 7 * s, 0, 0, TWO_PI);
  ctx.fill();
  ctx.fillStyle = detail.colorShift > 0.5 ? "#3d5a33" : "#2f4d2d";
  for (const [x, y, r] of [[0, 0, 16], [-12, 3, 12], [12, 4, 11]]) {
    ctx.beginPath();
    ctx.ellipse(x * s, y * s, r * s, r * 0.62 * s, 0, 0, TWO_PI);
    ctx.fill();
  }
  if (detail.colorShift > 0.62) {
    ctx.fillStyle = detail.colorShift > 0.72 ? "#d8c98a" : "#8ba172";
    ctx.beginPath();
    ctx.arc(3 * s, -5 * s, 2.3 * s, 0, TWO_PI);
    ctx.fill();
  }
}

function drawTerrainDetails() {
  for (const detail of TERRAIN_DETAILS) {
    if (terrainDetailIsCut(detail)) continue;
    const center = scenePointToWorld(detail.sceneX, detail.sceneZ);
    ctx.save();
    ctx.translate(center.x, center.y);
    if (detail.kind === "tree") drawTree2D(detail);
    else drawBush2D(detail);
    ctx.restore();
  }
}

function drawStoneRoad() {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "rgba(185, 181, 170, 0.24)";
  ctx.lineWidth = ROAD_WIDTH + 16;
  ctx.beginPath();
  for (let i = 0; i < ROAD_SCENE_POINTS.length; i += 1) {
    const point = scenePointToWorld(ROAD_SCENE_POINTS[i].x, ROAD_SCENE_POINTS[i].z);
    if (i === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  }
  ctx.stroke();

  ctx.strokeStyle = "#77776f";
  ctx.lineWidth = ROAD_WIDTH;
  ctx.beginPath();
  for (let i = 0; i < ROAD_SCENE_POINTS.length; i += 1) {
    const point = scenePointToWorld(ROAD_SCENE_POINTS[i].x, ROAD_SCENE_POINTS[i].z);
    if (i === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  }
  ctx.stroke();

  ctx.globalAlpha = 0.2;
  ctx.strokeStyle = "#d8d3c6";
  ctx.lineWidth = 2;
  for (let i = 0; i < ROAD_SCENE_POINTS.length - 1; i += 1) {
    const a = scenePointToWorld(ROAD_SCENE_POINTS[i].x, ROAD_SCENE_POINTS[i].z);
    const b = scenePointToWorld(ROAD_SCENE_POINTS[i + 1].x, ROAD_SCENE_POINTS[i + 1].z);
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const length = Math.hypot(dx, dy);
    const nx = -dy / Math.max(1, length);
    const ny = dx / Math.max(1, length);
    for (let t = 0.16; t < 0.94; t += 0.18) {
      const x = a.x + dx * t;
      const y = a.y + dy * t;
      ctx.beginPath();
      ctx.moveTo(x - nx * 22, y - ny * 22);
      ctx.lineTo(x + nx * 22, y + ny * 22);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawMainCityBuilding2D(building) {
  const center = scenePointToWorld(building.sceneX, building.sceneZ);
  const w = building.width * WORLD_SCALE;
  const d = building.depth * WORLD_SCALE;
  ctx.save();
  ctx.translate(center.x, center.y);
  ctx.rotate(building.rotation);
  ctx.fillStyle = "rgba(0, 0, 0, 0.34)";
  ctx.beginPath();
  ctx.ellipse(0, d * 0.22, w * 0.48, d * 0.24, 0, 0, TWO_PI);
  ctx.fill();
  ctx.fillStyle = building.accent % 2 ? "#b27a5d" : "#9a604a";
  ctx.fillRect(-w / 2, -d / 2, w, d);
  ctx.strokeStyle = "rgba(64, 39, 30, 0.42)";
  ctx.lineWidth = Math.max(1, 0.018 * WORLD_SCALE);
  for (let y = -d / 2 + 12; y < d / 2; y += 14) {
    ctx.beginPath();
    ctx.moveTo(-w / 2, y);
    ctx.lineTo(w / 2, y);
    ctx.stroke();
  }
  ctx.fillStyle = building.roof === "redTile" ? "#60302a" : "#1d2024";
  ctx.fillRect(-w * 0.58, -d * 0.62, w * 1.16, d * 0.3);
  ctx.fillStyle = "#221713";
  ctx.fillRect(-w * 0.12, d * 0.1, w * 0.24, d * 0.32);
  ctx.fillStyle = "rgba(239, 231, 212, 0.75)";
  for (const side of [-1, 1]) ctx.fillRect(side * w * 0.22 - w * 0.08, -d * 0.1, w * 0.16, d * 0.18);
  if (building.type === "merchant" || building.type === "gatehouse") {
    ctx.fillStyle = "rgba(140, 47, 36, 0.88)";
    ctx.fillRect(-w * 0.26, -d * 0.28, w * 0.52, d * 0.16);
  }
  ctx.restore();
}

function drawMainCitySakura2D(tree) {
  const center = scenePointToWorld(tree.sceneX, tree.sceneZ);
  const s = tree.scale * WORLD_SCALE;
  ctx.save();
  ctx.translate(center.x, center.y);
  ctx.rotate(tree.rotation || 0);
  ctx.fillStyle = "rgba(0, 0, 0, 0.24)";
  ctx.beginPath();
  ctx.ellipse(0, 13 * tree.scale, 24 * tree.scale, 8 * tree.scale, 0, 0, TWO_PI);
  ctx.fill();
  ctx.fillStyle = "#5b3828";
  ctx.fillRect(-0.045 * s, -0.36 * s, 0.09 * s, 0.56 * s);
  ctx.fillStyle = tree.colorShift > 0.55 ? "rgba(216, 137, 155, 0.88)" : "rgba(242, 198, 207, 0.9)";
  for (const [x, y, rx, ry] of [[0, -0.62, 0.38, 0.27], [-0.24, -0.5, 0.24, 0.18], [0.26, -0.49, 0.22, 0.17], [0.04, -0.78, 0.18, 0.13]]) {
    ctx.beginPath();
    ctx.ellipse(x * s, y * s, rx * s, ry * s, 0, 0, TWO_PI);
    ctx.fill();
  }
  ctx.restore();
}

function drawMainCity2D() {
  const center = scenePointToWorld(MAIN_CITY_SCENE.x, MAIN_CITY_SCENE.z);
  const size = MAIN_CITY_SCENE.size * WORLD_SCALE;
  const half = size / 2;
  ctx.save();
  ctx.translate(center.x, center.y);
  ctx.rotate(MAIN_CITY_SCENE.rotation);
  ctx.fillStyle = "rgba(52, 53, 49, 0.9)";
  ctx.fillRect(-half, -half, size, size);
  ctx.fillStyle = "rgba(107, 105, 96, 0.92)";
  ctx.fillRect(-half * 0.92, -half * 0.92, size * 0.92, size * 0.92);
  ctx.strokeStyle = "rgba(210, 202, 185, 0.12)";
  ctx.lineWidth = 2;
  for (let offset = -half + 170; offset <= half - 170; offset += 205) {
    ctx.beginPath();
    ctx.moveTo(-half * 0.9, offset);
    ctx.lineTo(half * 0.9, offset);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(offset, -half * 0.9);
    ctx.lineTo(offset, half * 0.9);
    ctx.stroke();
  }
  ctx.fillStyle = "#77776f";
  ctx.fillRect(-half * 0.96, -96, size * 0.96, 192);
  ctx.fillRect(-96, -half * 0.96, 192, size * 0.96);
  for (const offset of [-18.5, -11.5, 11.5, 18.5]) {
    const px = offset * WORLD_SCALE;
    ctx.fillRect(-half * 0.86, px - 36, size * 0.86, 72);
    ctx.fillRect(px - 36, -half * 0.86, 72, size * 0.86);
  }
  ctx.fillStyle = "#5a5a52";
  ctx.save();
  ctx.rotate(Math.PI / 4);
  ctx.fillRect(-230, -230, 460, 460);
  ctx.restore();
  ctx.strokeStyle = "rgba(20, 18, 16, 0.62)";
  ctx.lineWidth = 24;
  ctx.strokeRect(-half, -half, size, size);
  ctx.restore();

  for (const building of MAIN_CITY_BUILDINGS) drawMainCityBuilding2D(building);
  for (const tree of MAIN_CITY_SAKURA_TREES) drawMainCitySakura2D(tree);
}

function drawLanternClearings() {
  for (const prop of STATIC_PROPS) {
    if (prop.kind !== "lantern") continue;
    const center = scenePointToWorld(prop.sceneX, prop.sceneZ);
    const glow = ctx.createRadialGradient(center.x, center.y, 10, center.x, center.y, LANTERN_CLEAR_RADIUS);
    glow.addColorStop(0, "rgba(49, 72, 42, 0.26)");
    glow.addColorStop(0.55, "rgba(49, 72, 42, 0.12)");
    glow.addColorStop(1, "rgba(49, 72, 42, 0)");
    ctx.save();
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(center.x, center.y, LANTERN_CLEAR_RADIUS, 0, TWO_PI);
    ctx.fill();
    ctx.restore();
  }
}

function resizeMinimapCanvas() {
  if (!minimapCanvas) return null;
  const rect = minimapCanvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));
  if (!width || !height) return null;
  const pixelWidth = Math.floor(width * dpr);
  const pixelHeight = Math.floor(height * dpr);
  if (minimapCanvas.width !== pixelWidth || minimapCanvas.height !== pixelHeight) {
    minimapCanvas.width = pixelWidth;
    minimapCanvas.height = pixelHeight;
  }
  minimapCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { width, height, dpr };
}

function minimapPoint(worldX, worldY, center, scale, radius) {
  return {
    x: radius + (worldX - center.x) * scale,
    y: radius + (worldY - center.y) * scale,
  };
}

function drawMinimapCircle(worldX, worldY, worldRadius, center, scale, mapRadius, stroke, fill, lineWidth = 2) {
  const point = minimapPoint(worldX, worldY, center, scale, mapRadius);
  const radius = worldRadius * scale;
  if (
    point.x + radius < -4 ||
    point.x - radius > mapRadius * 2 + 4 ||
    point.y + radius < -4 ||
    point.y - radius > mapRadius * 2 + 4
  ) {
    return;
  }
  minimapCtx.save();
  minimapCtx.beginPath();
  minimapCtx.arc(point.x, point.y, Math.max(1, radius), 0, TWO_PI);
  if (fill) {
    minimapCtx.fillStyle = fill;
    minimapCtx.fill();
  }
  minimapCtx.strokeStyle = stroke;
  minimapCtx.lineWidth = lineWidth;
  minimapCtx.stroke();
  minimapCtx.restore();
}

function drawMinimapRect(worldX, worldY, size, center, scale, mapRadius, rotation = 0, color = "#eee6d2") {
  const point = minimapPoint(worldX, worldY, center, scale, mapRadius);
  const distance = Math.hypot(point.x - mapRadius, point.y - mapRadius);
  if (distance > mapRadius + 12) return;
  const visualSize = Math.max(4, size * scale);
  minimapCtx.save();
  minimapCtx.translate(point.x, point.y);
  minimapCtx.rotate(rotation);
  minimapCtx.fillStyle = color;
  minimapCtx.fillRect(-visualSize / 2, -visualSize / 2, visualSize, visualSize);
  minimapCtx.restore();
}

function drawMinimapRoads(center, scale, mapRadius) {
  minimapCtx.save();
  minimapCtx.lineCap = "round";
  minimapCtx.lineJoin = "round";
  minimapCtx.strokeStyle = "rgba(185, 181, 170, 0.5)";
  minimapCtx.lineWidth = Math.max(3, ROAD_WIDTH * scale);
  minimapCtx.beginPath();
  for (let i = 0; i < ROAD_SCENE_POINTS.length; i += 1) {
    const point = scenePointToWorld(ROAD_SCENE_POINTS[i].x, ROAD_SCENE_POINTS[i].z);
    const mapPoint = minimapPoint(point.x, point.y, center, scale, mapRadius);
    if (i === 0) minimapCtx.moveTo(mapPoint.x, mapPoint.y);
    else minimapCtx.lineTo(mapPoint.x, mapPoint.y);
  }
  minimapCtx.stroke();
  minimapCtx.restore();
}

function drawMinimapTerrain(center, scale, mapRadius) {
  minimapCtx.save();
  for (const feature of TERRAIN_FEATURES) {
    const point = scenePointToWorld(feature.sceneX, feature.sceneZ);
    const mapPoint = minimapPoint(point.x, point.y, center, scale, mapRadius);
    if (Math.hypot(mapPoint.x - mapRadius, mapPoint.y - mapRadius) > mapRadius + Math.max(feature.rx, feature.rz) * WORLD_SCALE * scale) continue;
    minimapCtx.save();
    minimapCtx.translate(mapPoint.x, mapPoint.y);
    minimapCtx.rotate(feature.rotation || 0);
    minimapCtx.fillStyle = feature.kind === "lowland"
      ? "rgba(20, 38, 20, 0.62)"
      : feature.kind === "mountain"
        ? "rgba(95, 99, 82, 0.44)"
        : "rgba(72, 104, 61, 0.34)";
    minimapCtx.beginPath();
    minimapCtx.ellipse(0, 0, feature.rx * WORLD_SCALE * scale, feature.rz * WORLD_SCALE * scale, 0, 0, TWO_PI);
    minimapCtx.fill();
    minimapCtx.restore();
  }
  for (const detail of TERRAIN_DETAILS) {
    if (detail.kind !== "tree" || terrainDetailIsCut(detail)) continue;
    const point = scenePointToWorld(detail.sceneX, detail.sceneZ);
    const mapPoint = minimapPoint(point.x, point.y, center, scale, mapRadius);
    if (Math.hypot(mapPoint.x - mapRadius, mapPoint.y - mapRadius) > mapRadius + 6) continue;
    minimapCtx.fillStyle = detail.type === "cedar" ? "#20452a" : "#31512f";
    minimapCtx.beginPath();
    minimapCtx.arc(mapPoint.x, mapPoint.y, Math.max(1.4, 5 * detail.scale * scale * WORLD_SCALE / 64), 0, TWO_PI);
    minimapCtx.fill();
  }
  minimapCtx.restore();
}

function drawMinimapMainCity(center, scale, mapRadius) {
  const citySize = MAIN_CITY_SCENE.size * WORLD_SCALE;
  drawMinimapRect(MAIN_CITY_CENTER.x, MAIN_CITY_CENTER.y, citySize, center, scale, mapRadius, MAIN_CITY_SCENE.rotation, "rgba(90, 90, 82, 0.72)");
  for (const building of MAIN_CITY_BUILDINGS) {
    const point = scenePointToWorld(building.sceneX, building.sceneZ);
    drawMinimapRect(point.x, point.y, Math.max(42, building.width * WORLD_SCALE), center, scale, mapRadius, building.rotation, building.roof === "redTile" ? "#60302a" : "#1d2024");
  }
}

function drawMinimapBuildings(center, scale, mapRadius) {
  for (const prop of STATIC_PROPS) {
    const point = scenePointToWorld(prop.sceneX, prop.sceneZ);
    if (prop.kind === "house") {
      drawMinimapRect(point.x, point.y, 80 * (prop.scale || 1), center, scale, mapRadius, prop.rotation || 0, "#ded8c8");
    } else if (prop.kind === "blacksmithShop") {
      drawMinimapRect(point.x, point.y, 92 * (prop.scale || 1), center, scale, mapRadius, prop.rotation || 0, "#d86a2a");
    } else if (prop.kind === "villageShop") {
      drawMinimapRect(point.x, point.y, 92 * (prop.scale || 1), center, scale, mapRadius, prop.rotation || 0, "#5d9a78");
    } else if (prop.kind === "shrine") {
      drawMinimapRect(point.x, point.y, 108 * (prop.scale || 1), center, scale, mapRadius, prop.rotation || 0, "#caa65a");
    } else if (prop.kind === "torii") {
      drawMinimapRect(point.x, point.y, 34, center, scale, mapRadius, prop.rotation || 0, "#9f2f2f");
    } else if (prop.kind === "lantern") {
      drawMinimapRect(point.x, point.y, 20, center, scale, mapRadius, 0, "#e1c887");
    } else if (prop.kind === "donationBox") {
      drawMinimapRect(point.x, point.y, 22, center, scale, mapRadius, 0, "#8b5a2d");
    } else if (prop.kind === "musician" || prop.kind === "npc") {
      const mapPoint = minimapPoint(point.x, point.y, center, scale, mapRadius);
      if (Math.hypot(mapPoint.x - mapRadius, mapPoint.y - mapRadius) <= mapRadius + 8) {
        minimapCtx.beginPath();
        minimapCtx.fillStyle = prop.kind === "musician" ? "#5d7fb5" : "#eee6d2";
        minimapCtx.arc(mapPoint.x, mapPoint.y, 2.8, 0, TWO_PI);
        minimapCtx.fill();
      }
    }
  }
}

function drawMinimapPlayer(mapRadius) {
  const face = state.player?.face ?? -Math.PI / 2;
  minimapCtx.save();
  minimapCtx.translate(mapRadius, mapRadius);
  minimapCtx.rotate(face + Math.PI / 2);
  minimapCtx.fillStyle = "#f7f0da";
  minimapCtx.strokeStyle = "rgba(9, 8, 7, 0.6)";
  minimapCtx.lineWidth = 1.2;
  minimapCtx.beginPath();
  minimapCtx.moveTo(0, -8);
  minimapCtx.lineTo(6, 7);
  minimapCtx.lineTo(0, 4);
  minimapCtx.lineTo(-6, 7);
  minimapCtx.closePath();
  minimapCtx.fill();
  minimapCtx.stroke();
  minimapCtx.restore();
}

function drawMinimapDanger(center, scale, mapRadius) {
  drawMinimapCircle(
    ENCOUNTER_RING.x,
    ENCOUNTER_RING.y,
    ENCOUNTER_RING.r,
    center,
    scale,
    mapRadius,
    "rgba(255, 72, 72, 0.92)",
    "rgba(159, 47, 47, 0.12)",
    2.5,
  );
  if (getDisplayMode() !== "playing") return;
  if (state.boss) {
    const bossPoint = minimapPoint(state.boss.x, state.boss.y, center, scale, mapRadius);
    minimapCtx.beginPath();
    minimapCtx.fillStyle = "#c84c4c";
    minimapCtx.arc(bossPoint.x, bossPoint.y, 4, 0, TWO_PI);
    minimapCtx.fill();
  }
  for (const zone of state.zones || []) {
    if (zone.type !== "circle") continue;
    drawMinimapCircle(zone.x, zone.y, zone.r, center, scale, mapRadius, "rgba(202, 166, 90, 0.72)", "rgba(202, 166, 90, 0.1)", 1);
  }
}

function drawMinimap() {
  const displayMode = getDisplayMode();
  if (!minimapCanvas || !minimapCtx || !state.player || displayMode === "account" || displayMode === "ready") return;
  const size = resizeMinimapCanvas();
  if (!size) return;
  const mapRadius = Math.min(size.width, size.height) / 2;
  const innerRadius = mapRadius - 6;
  const center = { x: state.player.x, y: state.player.y };
  const scale = innerRadius / MINIMAP_WORLD_RADIUS;

  minimapCtx.clearRect(0, 0, size.width, size.height);
  minimapCtx.save();
  minimapCtx.beginPath();
  minimapCtx.arc(mapRadius, mapRadius, innerRadius, 0, TWO_PI);
  minimapCtx.clip();

  const gradient = minimapCtx.createRadialGradient(mapRadius, mapRadius, 8, mapRadius, mapRadius, innerRadius);
  gradient.addColorStop(0, "rgba(49, 72, 42, 0.82)");
  gradient.addColorStop(1, "rgba(17, 24, 15, 0.92)");
  minimapCtx.fillStyle = gradient;
  minimapCtx.fillRect(0, 0, size.width, size.height);

  drawMinimapTerrain(center, scale, mapRadius);
  drawMinimapRoads(center, scale, mapRadius);
  drawMinimapMainCity(center, scale, mapRadius);
  drawMinimapBuildings(center, scale, mapRadius);
  drawMinimapDanger(center, scale, mapRadius);
  drawMinimapPlayer(mapRadius);
  minimapCtx.restore();

  minimapCtx.save();
  minimapCtx.strokeStyle = "rgba(238, 230, 210, 0.28)";
  minimapCtx.lineWidth = 1.2;
  minimapCtx.beginPath();
  minimapCtx.arc(mapRadius, mapRadius, innerRadius, 0, TWO_PI);
  minimapCtx.stroke();
  minimapCtx.restore();
}

function drawEncounterGate() {
  const displayMode = getDisplayMode();
  if (displayMode === "account" || displayMode === "ready") return;
  const pulse = 0.68 + Math.sin(state.time * 4.2) * 0.18;
  ctx.save();
  ctx.translate(ENCOUNTER_RING.x, ENCOUNTER_RING.y);
  ctx.globalAlpha = displayMode === "playing" ? 0.76 : 0.94;
  ctx.strokeStyle = `rgba(255, 72, 72, ${0.56 + pulse * 0.34})`;
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(0, 0, ENCOUNTER_RING.r, 0, TWO_PI);
  ctx.stroke();
  ctx.strokeStyle = "rgba(238, 230, 210, 0.28)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, ENCOUNTER_RING.r - 24, 0, TWO_PI);
  ctx.stroke();
  ctx.restore();
}

function cssHex(color) {
  return `#${Number(color || 0).toString(16).padStart(6, "0")}`;
}

function drawWorkshop2D(prop) {
  const scale = prop.scale || 1;
  const blacksmith = prop.kind === "blacksmithShop";
  ctx.rotate(prop.rotation || 0);
  ctx.fillStyle = "rgba(0, 0, 0, 0.32)";
  ctx.beginPath();
  ctx.ellipse(0, 26 * scale, 76 * scale, 24 * scale, 0, 0, TWO_PI);
  ctx.fill();
  ctx.fillStyle = blacksmith ? "#d2c8b5" : "#e2dccb";
  ctx.fillRect(-60 * scale, -36 * scale, 120 * scale, 72 * scale);
  ctx.fillStyle = blacksmith ? "#17110f" : "#2b1712";
  ctx.fillRect(-78 * scale, -58 * scale, 156 * scale, 24 * scale);
  ctx.fillStyle = "#6a3a20";
  ctx.fillRect(-14 * scale, 2 * scale, 28 * scale, 34 * scale);
  ctx.fillStyle = blacksmith ? "#d86a2a" : "#355f4b";
  ctx.fillRect(-26 * scale, -24 * scale, 52 * scale, 16 * scale);
  ctx.fillStyle = "#f2e8ca";
  ctx.font = `${20 * scale}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(blacksmith ? "鍛" : "店", 0, -16 * scale);
  if (blacksmith) {
    ctx.fillStyle = "#2d2420";
    ctx.fillRect(38 * scale, -82 * scale, 18 * scale, 36 * scale);
    ctx.fillRect(42 * scale, 14 * scale, 34 * scale, 12 * scale);
    ctx.fillStyle = "rgba(216, 106, 42, 0.72)";
    ctx.beginPath();
    ctx.arc(-42 * scale, 18 * scale, 14 * scale, 0, TWO_PI);
    ctx.fill();
  } else {
    ctx.fillStyle = "rgba(53, 95, 75, 0.85)";
    ctx.fillRect(-36 * scale, -2 * scale, 72 * scale, 14 * scale);
    ctx.fillStyle = "#6a3a20";
    ctx.fillRect(-72 * scale, 16 * scale, 22 * scale, 20 * scale);
    ctx.fillRect(52 * scale, 18 * scale, 24 * scale, 18 * scale);
  }
}

function drawVillagerNpc2D(prop) {
  const scale = prop.scale || SMALL_ACTOR_SCALE;
  ctx.rotate(prop.rotation || 0);
  ctx.fillStyle = "rgba(0, 0, 0, 0.32)";
  ctx.beginPath();
  ctx.ellipse(0, 18 * scale, 34 * scale, 12 * scale, 0, 0, TWO_PI);
  ctx.fill();
  ctx.fillStyle = cssHex(prop.robe || 0x6b5a3a);
  ctx.beginPath();
  ctx.moveTo(0, -32 * scale);
  ctx.lineTo(22 * scale, 20 * scale);
  ctx.lineTo(-22 * scale, 20 * scale);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#e4ceb0";
  ctx.beginPath();
  ctx.arc(0, -32 * scale, 10 * scale, 0, TWO_PI);
  ctx.fill();
  ctx.fillStyle = "#120d0c";
  ctx.beginPath();
  ctx.arc(0, -38 * scale, 10 * scale, Math.PI, TWO_PI);
  ctx.fill();
  ctx.strokeStyle = "#6a3a20";
  ctx.lineWidth = Math.max(1, 2 * scale);
  if (prop.role === "blacksmith") {
    ctx.beginPath();
    ctx.moveTo(18 * scale, -12 * scale);
    ctx.lineTo(30 * scale, 10 * scale);
    ctx.stroke();
    ctx.fillStyle = "#2d2420";
    ctx.fillRect(24 * scale, -16 * scale, 14 * scale, 8 * scale);
  } else if (prop.role === "shopkeeper") {
    ctx.fillStyle = "#6a3a20";
    ctx.fillRect(-20 * scale, -2 * scale, 40 * scale, 8 * scale);
  } else if (prop.role === "elder") {
    ctx.beginPath();
    ctx.moveTo(24 * scale, -22 * scale);
    ctx.lineTo(26 * scale, 24 * scale);
    ctx.stroke();
  }
}

function drawStaticProps() {
  for (const prop of STATIC_PROPS) {
    const center = scenePointToWorld(prop.sceneX, prop.sceneZ);
    ctx.save();
    ctx.translate(center.x, center.y);
    if (prop.kind === "torii") {
      const scale = prop.scale || 1;
      ctx.rotate(prop.rotation ?? 0.08);
      ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
      ctx.fillRect(-76 * scale, 12 * scale, 152 * scale, 24 * scale);
      ctx.fillStyle = "#541b18";
      ctx.fillRect(-72 * scale, -13 * scale, 144 * scale, 26 * scale);
      ctx.fillStyle = "#23100d";
      ctx.fillRect(-88 * scale, -29 * scale, 176 * scale, 17 * scale);
      ctx.fillStyle = "#4d1f1d";
      ctx.fillRect(-56 * scale, -30 * scale, 18 * scale, 58 * scale);
      ctx.fillRect(38 * scale, -30 * scale, 18 * scale, 58 * scale);
    } else if (prop.kind === "blacksmithShop" || prop.kind === "villageShop") {
      drawWorkshop2D(prop);
    } else if (prop.kind === "house") {
      const scale = prop.scale || 1;
      ctx.rotate(prop.rotation || 0);
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.beginPath();
      ctx.ellipse(0, 24 * scale, 70 * scale, 22 * scale, 0, 0, TWO_PI);
      ctx.fill();
      ctx.fillStyle = "#ded8c8";
      ctx.fillRect(-54 * scale, -34 * scale, 108 * scale, 68 * scale);
      ctx.fillStyle = "#21100f";
      ctx.beginPath();
      ctx.moveTo(-70 * scale, -34 * scale);
      ctx.lineTo(0, -76 * scale);
      ctx.lineTo(70 * scale, -34 * scale);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "rgba(225, 200, 135, 0.5)";
      ctx.fillRect(-32 * scale, -10 * scale, 18 * scale, 22 * scale);
      ctx.fillRect(16 * scale, -10 * scale, 18 * scale, 22 * scale);
    } else if (prop.kind === "shrine") {
      const scale = prop.scale || 1;
      ctx.rotate(prop.rotation || 0);
      ctx.fillStyle = "rgba(0, 0, 0, 0.32)";
      ctx.beginPath();
      ctx.ellipse(0, 28 * scale, 92 * scale, 28 * scale, 0, 0, TWO_PI);
      ctx.fill();
      ctx.fillStyle = "#ded8c8";
      ctx.fillRect(-68 * scale, -38 * scale, 136 * scale, 76 * scale);
      ctx.fillStyle = "#2a1713";
      ctx.fillRect(-86 * scale, -58 * scale, 172 * scale, 22 * scale);
      ctx.fillStyle = "#5b2a1c";
      ctx.fillRect(-42 * scale, 40 * scale, 84 * scale, 16 * scale);
      ctx.fillRect(-16 * scale, -6 * scale, 32 * scale, 42 * scale);
    } else if (prop.kind === "donationBox") {
      const scale = prop.scale || 1;
      ctx.rotate(prop.rotation || 0);
      ctx.fillStyle = "rgba(0, 0, 0, 0.24)";
      ctx.fillRect(-30 * scale, 10 * scale, 60 * scale, 14 * scale);
      ctx.fillStyle = "#7b4a25";
      ctx.fillRect(-30 * scale, -18 * scale, 60 * scale, 36 * scale);
      ctx.strokeStyle = "#e1c887";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-22 * scale, -2 * scale);
      ctx.lineTo(22 * scale, -2 * scale);
      ctx.stroke();
    } else if (prop.kind === "fence") {
      const scale = prop.scale || 1;
      ctx.rotate(prop.rotation || 0);
      ctx.fillStyle = "#ded8c8";
      for (let i = -1; i <= 1; i += 1) {
        ctx.fillRect((i * 28 - 5) * scale, -26 * scale, 10 * scale, 52 * scale);
      }
      ctx.fillRect(-38 * scale, -14 * scale, 76 * scale, 8 * scale);
      ctx.fillRect(-38 * scale, 8 * scale, 76 * scale, 8 * scale);
    } else if (prop.kind === "musician") {
      const scale = prop.scale || 1;
      ctx.rotate(-0.2);
      ctx.fillStyle = "rgba(0, 0, 0, 0.34)";
      ctx.beginPath();
      ctx.ellipse(0, 22 * scale, 42 * scale, 14 * scale, 0, 0, TWO_PI);
      ctx.fill();
      ctx.fillStyle = "#6a3a20";
      ctx.fillRect(-42 * scale, 4 * scale, 84 * scale, 13 * scale);
      ctx.strokeStyle = "rgba(225, 200, 135, 0.86)";
      ctx.lineWidth = 1.2;
      for (let i = -2; i <= 2; i += 1) {
        ctx.beginPath();
        ctx.moveTo(-35 * scale, (9 + i * 2) * scale);
        ctx.lineTo(35 * scale, (8 + i * 2) * scale);
        ctx.stroke();
      }
      ctx.fillStyle = "#1f4d83";
      ctx.beginPath();
      ctx.moveTo(0, -34 * scale);
      ctx.lineTo(22 * scale, 18 * scale);
      ctx.lineTo(-22 * scale, 18 * scale);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#e6d0b5";
      ctx.beginPath();
      ctx.arc(0, -32 * scale, 10 * scale, 0, TWO_PI);
      ctx.fill();
      ctx.fillStyle = "#130d0c";
      ctx.beginPath();
      ctx.arc(0, -37 * scale, 11 * scale, Math.PI, TWO_PI);
      ctx.fill();
    } else if (prop.kind === "npc") {
      drawVillagerNpc2D(prop);
    } else {
      const scale = prop.scale || SMALL_ACTOR_SCALE;
      const glowPulse = 0.72 + Math.sin(state.time * 4.4 + prop.sceneX) * 0.12;
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.beginPath();
      ctx.ellipse(0, 15 * scale, 28 * scale, 12 * scale, 0, 0, TWO_PI);
      ctx.fill();
      ctx.globalAlpha = clamp(glowPulse * 0.14, 0.08, 0.16);
      ctx.fillStyle = "#e1c887";
      ctx.beginPath();
      ctx.arc(0, -6 * scale, 34 * scale, 0, TWO_PI);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#4b4740";
      ctx.beginPath();
      ctx.arc(0, 0, 19 * scale, 0, TWO_PI);
      ctx.fill();
      ctx.fillStyle = "#e1c887";
      ctx.globalAlpha = clamp(glowPulse, 0.56, 0.9);
      ctx.beginPath();
      ctx.arc(0, -7 * scale, 13 * scale, 0, TWO_PI);
      ctx.fill();
    }
    ctx.restore();
  }
}

function drawDailyChests() {
  const opened = chestOpenedSet();
  for (const chest of activeDailyChests()) {
    const center = chestWorldPoint(chest);
    const open = opened.has(chest.id);
    const scale = (chest.scale || 1) * 0.58;
    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.rotate(chest.rotation || 0);
    ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
    ctx.beginPath();
    ctx.ellipse(0, 18 * scale, 26 * scale, 11 * scale, 0, 0, TWO_PI);
    ctx.fill();
    ctx.fillStyle = "#5f3c22";
    ctx.fillRect(-22 * scale, -4 * scale, 44 * scale, 24 * scale);
    ctx.fillStyle = "#2d2016";
    ctx.fillRect(-24 * scale, 4 * scale, 48 * scale, 6 * scale);
    ctx.fillRect(-16 * scale, -4 * scale, 6 * scale, 24 * scale);
    ctx.fillRect(10 * scale, -4 * scale, 6 * scale, 24 * scale);
    ctx.save();
    ctx.translate(0, 0);
    ctx.rotate(open ? -1.12 : -0.12);
    ctx.fillStyle = "#7a522f";
    ctx.fillRect(-24 * scale, -18 * scale, 48 * scale, 16 * scale);
    ctx.fillStyle = "#2d2016";
    ctx.fillRect(-18 * scale, -10 * scale, 36 * scale, 4 * scale);
    ctx.restore();
    ctx.restore();
  }
}

function drawFieldLoot() {
  const bob = Math.sin(state.time * 3.2) * 3;
  for (const loot of activeFieldLoot()) {
    const point = chestLootWorldPoint(loot);
    const item = itemDefinition(loot.itemKey);
    const color = rarityColor(item?.rarity || "white");
    ctx.save();
    ctx.translate(point.x, point.y + bob);
    ctx.fillStyle = "rgba(0, 0, 0, 0.24)";
    ctx.beginPath();
    ctx.ellipse(0, 10, 11, 5, 0, 0, TWO_PI);
    ctx.fill();
    if (!drawItemImage2D(ctx, item, 0, -2, 38)) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(9, 0);
      ctx.lineTo(0, 10);
      ctx.lineTo(-9, 0);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#eee6d2";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawFragments() {
  if (getDisplayMode() !== "playing") return;
  for (let i = 0; i < state.fragments.length; i += 1) {
    const f = state.fragments[i];
    if (f.found) continue;
    ctx.save();
    ctx.translate(f.x, f.y);
    const pulse = 1 + Math.sin(state.time * 5 + i) * 0.05;
    ctx.scale(pulse, pulse);
    ctx.globalAlpha = 0.65 + f.progress * 0.35;
    ctx.strokeStyle = "#eee6d2";
    ctx.fillStyle = "rgba(238, 230, 210, 0.12)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 30 + f.progress * 10, 0, TWO_PI);
    ctx.stroke();
    drawShide(0, -8, 1.15, f.progress);
    ctx.restore();
  }
}

function drawShide(x, y, scale, progress = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = progress >= 1 ? "#f7f0da" : "#c6c7bd";
  ctx.strokeStyle = "rgba(9, 8, 7, 0.32)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-11, -18);
  ctx.lineTo(10, -18);
  ctx.lineTo(2, -2);
  ctx.lineTo(14, -2);
  ctx.lineTo(3, 18);
  ctx.lineTo(-7, 18);
  ctx.lineTo(0, 2);
  ctx.lineTo(-13, 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawZones() {
  if (getDisplayMode() !== "playing") return;
  for (const z of state.zones) {
    ctx.save();
    const armed = z.delay <= 0;
    ctx.globalAlpha = armed ? 0.54 : 0.28;
    ctx.strokeStyle = armed ? "#caa65a" : "#9f2f2f";
    ctx.fillStyle = armed ? "rgba(202, 166, 90, 0.13)" : "rgba(159, 47, 47, 0.14)";
    ctx.lineWidth = Math.max(1.2, (armed ? 3 : 2) * BOSS_SKILL_SCALE);
    if (z.type === "circle") {
      ctx.beginPath();
      ctx.arc(z.x, z.y, z.r, 0, TWO_PI);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.translate(z.x, z.y);
      ctx.rotate(z.angle);
      ctx.fillRect(0, -z.width, z.length, z.width * 2);
      ctx.strokeRect(0, -z.width, z.length, z.width * 2);
    }
    ctx.restore();
  }
}

function drawProjectiles() {
  if (getDisplayMode() !== "playing") return;
  for (const q of state.projectiles) {
    ctx.save();
    ctx.translate(q.x, q.y);
    ctx.rotate(Math.atan2(q.vy, q.vx));
    const visualScale = Math.max(0.2, q.r / 8);
    ctx.scale(visualScale, visualScale);
    ctx.fillStyle = q.color;
    ctx.strokeStyle = "rgba(238, 230, 210, 0.28)";
    ctx.lineWidth = 1 / visualScale;
    ctx.beginPath();
    ctx.moveTo(13, 0);
    ctx.quadraticCurveTo(-4, -10, -12, 0);
    ctx.quadraticCurveTo(-4, 10, 13, 0);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

function drawEchoes() {
  if (getDisplayMode() !== "playing") return;
  for (const e of state.echoes) {
    ctx.save();
    ctx.globalAlpha = clamp(e.life / 1.2, 0.08, 0.54);
    ctx.strokeStyle = e.wish ? "#eee6d2" : "#c6c7bd";
    ctx.lineWidth = Math.max(1.2, (e.wish ? 4 : 3) * BOSS_SKILL_SCALE);
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.r, 0, TWO_PI);
    ctx.stroke();
    ctx.restore();
  }
}

function drawBoss() {
  const displayMode = getDisplayMode();
  if (displayMode !== "playing" && displayMode !== "victory" && displayMode !== "defeat") return;
  const b = state.boss;
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.scale(SMALL_ACTOR_SCALE, SMALL_ACTOR_SCALE);
  const hurt = b.hurtFlash > 0;
  const phasePulse = b.phase === "wish" ? Math.sin(state.time * 6) * 3 : 0;

  ctx.fillStyle = "rgba(0, 0, 0, 0.36)";
  ctx.beginPath();
  ctx.ellipse(0, 58, 76, 24, 0, 0, TWO_PI);
  ctx.fill();

  ctx.strokeStyle = b.phase === "shape" ? "#6d2724" : b.phase === "aspect" ? "#9aa6a8" : "#eee6d2";
  ctx.lineWidth = 3;
  ctx.globalAlpha = b.phase === "aspect" ? 0.68 : 1;
  ctx.fillStyle = hurt ? "#eee6d2" : b.phase === "wish" ? "#15100e" : "#120c0b";
  ctx.beginPath();
  ctx.moveTo(0, -66 - phasePulse);
  ctx.bezierCurveTo(74, -50, 92, 36, 44, 82);
  ctx.bezierCurveTo(20, 102, -24, 102, -48, 82);
  ctx.bezierCurveTo(-92, 36, -76, -52, 0, -66 - phasePulse);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "rgba(202, 166, 90, 0.48)";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(0, -16, 48 + phasePulse, Math.PI * 0.12, Math.PI * 1.88);
  ctx.stroke();

  ctx.fillStyle = b.phase === "wish" ? "#f7f0da" : "#d8cdb7";
  ctx.beginPath();
  ctx.ellipse(0, -34, 25, 34, 0, 0, TWO_PI);
  ctx.fill();
  ctx.fillStyle = "#090807";
  ctx.beginPath();
  ctx.ellipse(-9, -38, 4, 8, -0.1, 0, TWO_PI);
  ctx.ellipse(9, -38, 4, 8, 0.1, 0, TWO_PI);
  ctx.fill();
  ctx.strokeStyle = "#9f2f2f";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-14, -20);
  ctx.quadraticCurveTo(0, -13, 14, -20);
  ctx.stroke();

  if (b.phase === "wish") {
    ctx.save();
    ctx.globalAlpha = 0.92;
    ctx.strokeStyle = "#eee6d2";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 10, 34 + Math.sin(state.time * 8) * 3, 0.25, TWO_PI - 0.55);
    ctx.stroke();
    ctx.fillStyle = "rgba(229, 183, 170, 0.34)";
    ctx.beginPath();
    ctx.arc(0, 10, 13, 0, TWO_PI);
    ctx.fill();
    ctx.restore();
  }

  ctx.globalAlpha = 0.88;
  ctx.strokeStyle = "#21100f";
  ctx.lineWidth = 16;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-45, -8);
  ctx.quadraticCurveTo(-92, 22, -88, 70);
  ctx.moveTo(45, -8);
  ctx.quadraticCurveTo(92, 22, 88, 70);
  ctx.stroke();

  ctx.restore();
}

function drawPlayer() {
  const p = state.player;
  const moving = Math.hypot(p.vx, p.vy) > 18;
  const stride = moving ? Math.sin(state.time * (p.glideActive || p.dashTime > 0 ? 24 : 14)) : 0;
  const bob = moving ? Math.abs(stride) * 2.2 : 0;
  const jumpLift = jumpLift2D(p);
  const climbLift = playerHeightLift2D(p);
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(SMALL_ACTOR_SCALE, SMALL_ACTOR_SCALE);
  ctx.fillStyle = "rgba(0, 0, 0, 0.34)";
  ctx.beginPath();
  ctx.ellipse(0, 18, 28, 10, 0, 0, TWO_PI);
  ctx.fill();

  ctx.translate(0, -bob - jumpLift - climbLift);
  if (p.iFrame > 0) ctx.globalAlpha = 0.62 + Math.sin(state.time * 38) * 0.28;

  ctx.rotate(p.face + Math.PI / 2);
  ctx.fillStyle = "#e9dfc8";
  ctx.beginPath();
  ctx.arc(0, -18, 9, 0, TWO_PI);
  ctx.fill();

  ctx.fillStyle = "#2d2420";
  ctx.strokeStyle = "#caa65a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -8);
  ctx.lineTo(18, 28);
  ctx.lineTo(0, 20);
  ctx.lineTo(-18, 28);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "#c6c7bd";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  const slashProgress = p.slashTime > 0 ? 1 - clamp(p.slashTime / 0.18, 0, 1) : 0;
  const swordSwing = Math.sin(slashProgress * Math.PI);
  ctx.beginPath();
  ctx.moveTo(12, -2);
  ctx.lineTo(46 - swordSwing * 10 + stride * 2, -42 - swordSwing * 8);
  ctx.stroke();

  if (p.slashTime > 0) {
    const alpha = p.slashTime / 0.18;
    const arcCenter = SLASH_DIRECTION_OFFSET - Math.PI / 2;
    const startAngle = arcCenter - SLASH_HALF_ANGLE;
    const endAngle = arcCenter + SLASH_HALF_ANGLE;
    const range = slashRange();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = p.slashHit ? "#f7f0da" : "#caa65a";
    ctx.lineWidth = 12 / SMALL_ACTOR_SCALE;
    ctx.beginPath();
    ctx.arc(0, 0, (range * 0.82) / SMALL_ACTOR_SCALE, startAngle, endAngle);
    ctx.stroke();
    ctx.lineWidth = 2 / SMALL_ACTOR_SCALE;
    ctx.strokeStyle = "#eee6d2";
    ctx.beginPath();
    ctx.arc(0, 0, range / SMALL_ACTOR_SCALE, startAngle, endAngle);
    ctx.stroke();
  }
  ctx.restore();

  if (p.observePulse > 0) {
    ctx.save();
    ctx.globalAlpha = p.observePulse / 0.25;
    ctx.strokeStyle = "#c6c7bd";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 58, 0, TWO_PI);
    ctx.stroke();
    ctx.restore();
  }

  if (p.purifyLock > 0) {
    ctx.save();
    ctx.globalAlpha = 0.75;
    ctx.strokeStyle = "#eee6d2";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 74 + Math.sin(state.time * 9) * 4, -0.3, TWO_PI - 0.7);
    ctx.stroke();
    drawShide(p.x - 34, p.y - 38, 0.7, 1);
    drawShide(p.x + 38, p.y + 24, 0.7, 1);
    ctx.restore();
  }
}

function drawParticles() {
  for (const p of state.particles) {
    ctx.save();
    ctx.globalAlpha = clamp(p.life / p.max, 0, 1);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, TWO_PI);
    ctx.fill();
    ctx.restore();
  }
}

function drawVignette() {
  const g = ctx.createRadialGradient(WORLD.cx, WORLD.cy, 120, WORLD.cx, WORLD.cy, 620);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(0,0,0,0.58)");
  ctx.fillStyle = g;
  ctx.fillRect(WORLD.minX, WORLD.minY, WORLD.w, WORLD.h);
}

function loop(now) {
  const dt = Math.min(0.033, (now - lastTime) / 1000);
  lastTime = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

function handlePageExit() {
  saveCurrentLocationBeacon();
  pauseBgmForInactivePage();
}

function handleOverlayKeydownCapture(event) {
  if (ui.itemPopup && !ui.itemPopup.hidden) {
    if (["Escape", "Enter", "Space"].includes(event.code)) closeItemPopup();
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  handleBackpackKeydown(event);
}

window.addEventListener("resize", resize);
window.addEventListener("pagehide", handlePageExit);
window.addEventListener("beforeunload", handlePageExit);
window.addEventListener("keydown", (event) => {
  if (ui.itemPopup && !ui.itemPopup.hidden) {
    if (["Escape", "Enter", "Space"].includes(event.code)) closeItemPopup();
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  if (!ui.worldMapScreen.hidden && handleWorldMapKeydown(event)) return;
  if (event.code === "Escape" && !ui.codexScreen.hidden) {
    closeCodex();
    event.preventDefault();
    return;
  }
  if (event.code === "Escape" && !ui.sideMenuScreen.hidden) {
    closeSideMenu();
    event.preventDefault();
    return;
  }
  if (event.code === "Escape" && !ui.worldMapScreen.hidden) {
    closeWorldMap();
    event.preventDefault();
    return;
  }
  if (event.code === "Escape" && !ui.shopScreen.hidden) {
    closeShop();
    event.preventDefault();
    return;
  }
  if (event.code === "Escape" && !ui.blacksmithScreen.hidden) {
    closeBlacksmith();
    event.preventDefault();
    return;
  }
  if (event.code === "Escape" && !ui.characterScreen.hidden) {
    closeCharacterPanel();
    event.preventDefault();
    return;
  }
  if (event.code === "Escape" && !ui.backpackScreen.hidden) {
    closeBackpack();
    event.preventDefault();
    return;
  }
  if (event.code === "Escape" && !ui.settingsScreen.hidden) {
    closeSettings();
    event.preventDefault();
    return;
  }
  if (handleBackpackKeydown(event)) return;
  if (!ui.settingsScreen.hidden || !ui.backpackScreen.hidden || !ui.characterScreen.hidden || !ui.sideMenuScreen.hidden || !ui.worldMapScreen.hidden || !ui.shopScreen.hidden || !ui.blacksmithScreen.hidden || !ui.codexScreen.hidden) return;
  const letterKey = event.key?.toLowerCase();
  const glideKey = event.code === "KeyX" || letterKey === "x";
  const jumpKey = event.code === "KeyY" || letterKey === "y";
  const slashKey = event.code === "Space";
  keys.add(event.code);
  if (glideKey) keys.add("GlideKey");
  if (slashKey) pressedSlash = true;
  if (glideKey) pressedDash = true;
  if (jumpKey) pressedJump = true;
  if (event.code === "KeyE") pressedObserve = true;
  if (event.code === "KeyF") pressedCollect = true;
  if (event.code === "KeyQ") pressedTenDonation = true;
  if (event.code === "KeyK") pressedPurify = true;
  if (event.code === "Enter" && (state.mode === "victory" || state.mode === "defeat")) startBattle();
  const gameplayKey = slashKey || glideKey || jumpKey || ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code);
  const cameraKey = ["KeyW", "KeyA", "KeyS", "KeyD"].includes(event.code) && canPauseWorldMode(state.mode);
  const ritualKey = ["KeyE", "KeyF", "KeyK", "KeyQ"].includes(event.code) && canPauseWorldMode(state.mode);
  if (gameplayKey || cameraKey || ritualKey) unlockAudio();
  if (gameplayKey || cameraKey) event.preventDefault();
});

window.addEventListener("keyup", (event) => {
  const letterKey = event.key?.toLowerCase();
  if (event.code === "KeyX" || letterKey === "x") keys.delete("GlideKey");
  keys.delete(event.code);
});

function handlePointerMove(event) {
  pointerWorld = screenToWorld(event.clientX, event.clientY);
}

function handlePointerDown(event) {
  pointerWorld = screenToWorld(event.clientX, event.clientY);
  pressedSlash = true;
}

canvas.addEventListener("pointermove", handlePointerMove);
canvas.addEventListener("pointerdown", handlePointerDown);
sceneMount.addEventListener("pointermove", handlePointerMove);
sceneMount.addEventListener("pointerdown", handlePointerDown);
document.addEventListener("pointerover", handleButtonPointerOver);
document.addEventListener("pointerout", handleButtonPointerOut);
document.addEventListener("pointerdown", handleButtonPointerDown, true);
document.addEventListener("keydown", handleOverlayKeydownCapture, true);
document.addEventListener("keydown", handleButtonKeySound, true);

if (minimapCanvas) {
  minimapCanvas.tabIndex = 0;
  minimapCanvas.title = "地圖";
  minimapCanvas.addEventListener("click", openWorldMap);
  minimapCanvas.addEventListener("keydown", (event) => {
    if (event.code !== "Enter" && event.code !== "Space") return;
    event.preventDefault();
    openWorldMap();
  });
}
ui.menuButton.addEventListener("click", openSideMenu);
ui.sideMenuScrim.addEventListener("click", () => closeSideMenu());
ui.sideMenuCloseButton.addEventListener("click", () => closeSideMenu());
ui.worldMapCloseButton.addEventListener("click", () => closeWorldMap());
ui.shopCloseButton.addEventListener("click", () => closeShop());
ui.blacksmithCloseButton.addEventListener("click", () => closeBlacksmith());
ui.blacksmithSmeltButton.addEventListener("click", smeltBlacksmithSelection);
ui.villageMapAnchor.addEventListener("click", () => teleportToMapAnchor("village"));
if (ui.southwestCityMapAnchor) ui.southwestCityMapAnchor.addEventListener("click", () => teleportToMapAnchor("southwestCity"));
if (ui.worldMapZoomInButton) ui.worldMapZoomInButton.addEventListener("click", () => stepWorldMapZoom(1));
if (ui.worldMapZoomOutButton) ui.worldMapZoomOutButton.addEventListener("click", () => stepWorldMapZoom(-1));
if (ui.worldMapZoomResetButton) ui.worldMapZoomResetButton.addEventListener("click", () => setWorldMapZoom(1));
if (ui.worldMapScroll) ui.worldMapScroll.addEventListener("wheel", handleWorldMapWheel, { passive: false });
ui.sideMenuCharacterButton.addEventListener("click", () => openFromSideMenu(openCharacterPanel));
ui.sideMenuInventoryButton.addEventListener("click", () => openFromSideMenu(openBackpack));
ui.sideMenuCodexButton.addEventListener("click", () => openFromSideMenu(openCodex));
ui.sideMenuSettingsButton.addEventListener("click", () => openFromSideMenu((pause) => openSettings("menu", pause)));
ui.characterCloseButton.addEventListener("click", closeCharacterPanel);
ui.backpackCloseButton.addEventListener("click", closeBackpack);
ui.codexCloseButton.addEventListener("click", closeCodex);
ui.inventoryTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    activeInventoryCategory = tab.dataset.inventoryCategory || "special";
    inventoryClickLockTargetViewId = null;
    renderBackpack();
  });
});
ui.itemQualityFilterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeItemQualityFilter = button.dataset.qualityFilter || "all";
    inventoryClickLockTargetViewId = null;
    renderOpenItemPanels();
  });
});
ui.itemQualitySortButtons.forEach((button) => {
  button.addEventListener("click", () => {
    itemQualitySort = !itemQualitySort;
    inventoryClickLockTargetViewId = null;
    renderOpenItemPanels();
  });
});
ui.restartButton.addEventListener("click", startBattle);
ui.returnButton.addEventListener("click", returnToVillage);
ui.registerForm.addEventListener("submit", registerOrLogin);
ui.renameForm.addEventListener("submit", renameCurrentAccount);
ui.settingsCloseButton.addEventListener("click", closeSettings);
ui.settingsBackButton.addEventListener("click", () => setSettingsPage("menu"));
ui.settingsMenuAccount.addEventListener("click", () => setSettingsPage("account"));
ui.settingsMenuAudio.addEventListener("click", () => setSettingsPage("audio"));
ui.settingsMenuCredits.addEventListener("click", () => setSettingsPage("credits"));
ui.sfxVolumeSlider.addEventListener("input", () => setSfxVolume(ui.sfxVolumeSlider.value));
ui.bgmVolumeSlider.addEventListener("input", () => setBgmVolume(ui.bgmVolumeSlider.value));
ui.testSfxButton.addEventListener("click", playSfxPreview);
ui.testBgmButton.addEventListener("click", playBgmPreview);
ui.clearRecordsButton.addEventListener("click", clearCurrentRecords);
ui.deleteAccountButton.addEventListener("click", deleteCurrentAccount);
ui.itemPopupCloseButton?.addEventListener("click", closeItemPopup);

resize();
resetGame();
state.mode = "account";
document.body.dataset.mode = state.mode;
renderRecords();
updateAccountUi();
updateAudioSettingsUi();
refreshAccounts();
initThreeScene();
requestAnimationFrame((now) => {
  lastTime = now;
  requestAnimationFrame(loop);
});
