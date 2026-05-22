const http = require("http");
const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const progression = require("./progression-data.js");
const itemData = require("./items-data.js");
const chestData = require("./chest-data.js");

const ROOT = process.cwd();
const ACCOUNTS_DIR = path.join(ROOT, "accounts");
const ZONE_BGM_DIR = path.join(ROOT, "BGM Zone 1");
const PORT = Number(process.env.PORT || 4173);
const MAX_RECORDS = 20;
const DONATION_COST = 50;
const RENAME_COST = 5;
const MAP_SIZE = 4000;
const WEST_REGION_SIZE = 4000;
const SOUTH_REGION_SIZE = 4000;
const WORLD_MIN_X = -WEST_REGION_SIZE;
const WORLD_MAX_X = MAP_SIZE;
const WORLD_MIN_Y = 0;
const WORLD_MAX_Y = MAP_SIZE + SOUTH_REGION_SIZE;
const PLAYER_MAX_HP = 180;
const INVENTORY_DEFAULT = itemData.inventoryDefault;
const EQUIPMENT_SLOTS = Object.fromEntries(itemData.equipmentSlots.map((slot) => [slot.key, slot.name]));
const ITEM_DEFINITIONS = itemData.itemMap;
const ITEM_RESONANCE_RESOLVER = itemData.getItemResonanceData || (() => null);
const RESONANCE_LEVEL_TO_TIER_KEY = itemData.resonanceLevelToTierKey || { 0: "none", 1: "first", 2: "second", 3: "third", 4: "fourth", 5: "true" };
const DONATION_REWARD_KEYS = new Set(itemData.items.filter((item) => item.donation).map((item) => item.key));
const RESONANCE_MAX = itemData.resonance?.max || 5;
const RESONANCE_COPY_COST = itemData.resonance?.copyCost || 2;
const RESONANCE_COIN_BASE = itemData.resonance?.coinBase || 5;
const RESONANCE_QUALITY_MULTIPLIERS = itemData.resonance?.qualityMultipliers || {
  white: 1,
  green: 2,
  blue: 3,
  purple: 5,
  gold: 7,
  roseGold: 10,
};
const ITEM_QUALITY_ORDER = ["white", "green", "blue", "purple", "gold", "roseGold"];
const CHEST_SPAWN_POINTS = chestData.spawnPoints || [];
const CHEST_SPAWN_IDS = new Set(CHEST_SPAWN_POINTS.map((point) => point.id));
const CHEST_REWARD_QUALITY_WEIGHTS = { white: 60, green: 25, blue: 15 };
const SHOP_DAILY_ITEM_COUNT = 10;
const SHOP_INFINITE_ITEM_KEY = "pureIncenseCandle";
const SHOP_INFINITE_ITEM_PRICE = 25;
const SHOP_QUALITY_WEIGHTS = { white: 70, green: 20, blue: 8, purple: 2 };
const SHOP_PRICE_BY_QUALITY = { white: 40, green: 100, blue: 300, purple: 1000 };
const BLACKSMITH_ORE_ITEM_KEY = "ore";
const BLACKSMITH_SMELT_REWARDS = {
  white: { ore: 5, gold: 0 },
  green: { ore: 20, gold: 0 },
  blue: { ore: 100, gold: 0 },
  purple: { ore: 500, gold: 0 },
  gold: { ore: 1500, gold: 1 },
  roseGold: { ore: 2000, gold: 10 },
};
const KNOWN_GRAVE_IDS = new Set(Array.from({ length: 7 }, (_, index) => `grave-4a5a05-${index + 1}`));
const CHEST_REWARD_POOLS = {
  white: itemData.items.filter((item) => item.donation && itemQuality(item) === "white"),
  green: itemData.items.filter((item) => item.donation && itemQuality(item) === "green"),
  blue: itemData.items.filter((item) => item.donation && itemQuality(item) === "blue"),
};
const AUDIO_FILE_EXTENSIONS = new Set([".flac", ".mp3", ".ogg", ".wav", ".aif", ".aiff", ".aifc", ".m4a"]);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".flac": "audio/flac",
  ".mp3": "audio/mpeg",
  ".ogg": "audio/ogg",
  ".wav": "audio/wav",
  ".aif": "audio/aiff",
  ".aiff": "audio/aiff",
  ".aifc": "audio/aiff",
  ".m4a": "audio/mp4",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function accountIdFor(name) {
  const key = name.trim().toLocaleLowerCase("ja-JP");
  return `account-${crypto.createHash("sha256").update(key).digest("hex").slice(0, 16)}`;
}

function cleanName(name) {
  return String(name || "").trim().replace(/\s+/g, " ").slice(0, 24);
}

function sameName(a, b) {
  return cleanName(a).toLocaleLowerCase("ja-JP") === cleanName(b).toLocaleLowerCase("ja-JP");
}

function accountFile(id) {
  if (!/^account-[a-f0-9]{16}$/.test(id)) return null;
  return path.join(ACCOUNTS_DIR, `${id}.json`);
}

async function ensureAccountsDir() {
  await fs.mkdir(ACCOUNTS_DIR, { recursive: true });
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

async function readAccount(id) {
  const file = accountFile(id);
  if (!file) return null;
  try {
    const account = JSON.parse(await fs.readFile(file, "utf8"));
    return normalizeAccount(account);
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

function normalizeAccount(account) {
  const experience = Number.isFinite(Number(account.experience))
    ? progression.normalizeExperience(account.experience)
    : progression.requiredForPathRank(account.pathRank);
  const progress = progression.progressForExperience(experience);
  const coins = Number.isFinite(Number(account.coins)) ? Math.max(0, Math.floor(Number(account.coins))) : 0;
  const gold = Number.isFinite(Number(account.gold)) ? Math.max(0, Math.floor(Number(account.gold))) : 0;
  const legacyOre = Number.isFinite(Number(account.ore)) ? Math.max(0, Math.floor(Number(account.ore))) : 0;
  const inventory = normalizeInventory(account.inventory);
  if (legacyOre > 0 && ITEM_DEFINITIONS[BLACKSMITH_ORE_ITEM_KEY]) {
    addInventoryCopies(inventory, BLACKSMITH_ORE_ITEM_KEY, legacyOre);
  }
  const equipment = normalizeEquipment(account.equipment, inventory);
  const hp = normalizeAccountHp(account.hp ?? account.currentHp, playerMaxHpForAccount(inventory, equipment));
  const chestState = normalizeChestState(account.chestState);
  const shopState = normalizeShopState(account.shopState);
  const graveState = normalizeGraveState(account.graveState);
  const lastPosition = normalizeLastPosition(account["最後座標"] || account.lastPosition);
  return {
    id: account.id,
    name: cleanName(account.name),
    pathRank: progress.rank,
    experience,
    coins,
    gold,
    hp,
    chestState,
    shopState,
    graveState,
    inventory,
    equipment,
    "最後座標": lastPosition,
    createdAt: account.createdAt || new Date().toISOString(),
    updatedAt: account.updatedAt || new Date().toISOString(),
    records: Array.isArray(account.records) ? account.records.slice(0, MAX_RECORDS) : [],
  };
}

function normalizeEquipment(equipment, inventory = {}) {
  const explicit = equipment && typeof equipment === "object";
  return Object.fromEntries(
    Object.keys(EQUIPMENT_SLOTS).map((slot) => {
      const fallback = Object.entries(ITEM_DEFINITIONS).find(([key, item]) => item.category === slot && inventoryEntryOwned(inventory[key]))?.[0];
      const requested = explicit && (equipment[slot] || slot !== "weapon") ? equipment[slot] : fallback;
      const item = ITEM_DEFINITIONS[requested];
      return [slot, item?.category === slot && inventoryEntryOwned(inventory[requested]) ? requested : null];
    }),
  );
}

function normalizeAccountHp(value, fallback = PLAYER_MAX_HP) {
  const numeric = Number(value);
  const clampedFallback = Number.isFinite(Number(fallback)) ? Math.max(0, Number(fallback)) : PLAYER_MAX_HP;
  if (!Number.isFinite(numeric)) return Math.round(clampedFallback * 100) / 100;
  return Math.round(Math.max(0, Math.min(numeric, clampedFallback)) * 100) / 100;
}

function currentChestDayKey() {
  return chestData.currentDayKey();
}

function normalizeChestState(raw) {
  const today = currentChestDayKey();
  const sameDay = raw && raw.dayKey === today;
  const opened = sameDay && Array.isArray(raw?.opened)
    ? [...new Set(raw.opened.filter((id) => CHEST_SPAWN_IDS.has(id)).map((id) => String(id)))]
    : [];
  const fieldLoot = sameDay && Array.isArray(raw?.fieldLoot)
    ? raw.fieldLoot
      .filter((entry) => entry && typeof entry === "object" && CHEST_SPAWN_IDS.has(String(entry.chestId)) && ITEM_DEFINITIONS[String(entry.itemKey)])
      .map((entry) => ({
        id: String(entry.id || `loot-${crypto.randomUUID()}`),
        chestId: String(entry.chestId),
        itemKey: String(entry.itemKey),
        slot: Math.max(0, Math.min(5, Math.floor(Number(entry.slot) || 0))),
      }))
    : [];
  return { dayKey: today, opened, fieldLoot };
}

function normalizeShopState(raw) {
  const today = currentChestDayKey();
  const sameDay = raw && raw.dayKey === today;
  const purchases = {};
  if (sameDay && raw?.purchases && typeof raw.purchases === "object") {
    for (const [key, count] of Object.entries(raw.purchases)) {
      if (!ITEM_DEFINITIONS[key]) continue;
      purchases[key] = Math.max(0, Math.floor(Number(count) || 0));
    }
  }
  return { dayKey: today, purchases };
}

function normalizeGraveState(raw) {
  const unlocked = Array.isArray(raw?.unlocked)
    ? [...new Set(raw.unlocked.map((id) => String(id)).filter((id) => KNOWN_GRAVE_IDS.has(id)))]
    : [];
  return { unlocked };
}

function itemIsStackable(key) {
  return Boolean(ITEM_DEFINITIONS[key]?.consumable || ITEM_DEFINITIONS[key]?.stackable);
}

function bestResonanceLevelForKey(inventory, key) {
  if (!key) return 0;
  const entry = normalizeInventoryEntry(inventory[key], INVENTORY_DEFAULT[key], key);
  return Array.isArray(entry.copies) && entry.copies.length ? Math.max(...entry.copies.map(copyLevel)) : 0;
}

function resonanceTierKeyForLevel(level = 0) {
  const numeric = normalizeResonanceLevel(level);
  return RESONANCE_LEVEL_TO_TIER_KEY[numeric] || "none";
}

function effectivePrayerItem(item, level = 0) {
  if (!item) return null;
  const resolved = item.resonance
    ? ITEM_RESONANCE_RESOLVER(item.key, resonanceTierKeyForLevel(level))
    : null;
  if (!resolved) return { ...item, stats: {}, specialEffects: {} };
  return {
    ...item,
    stats: resolved.stats || {},
    specialEffects: resolved.specialEffects || {},
    effect: resolved.playerDescription || item.effect,
  };
}

function playerMaxHpForAccount(inventory, equipment) {
  const prayerKey = equipment?.prayer || null;
  const prayer = effectivePrayerItem(ITEM_DEFINITIONS[prayerKey], bestResonanceLevelForKey(inventory, prayerKey));
  const flat = Number(prayer?.stats?.maxHpFlat) || 0;
  const multiplier = 1 + (Number(prayer?.stats?.maxHpBonusPct) || 0) / 100;
  return Math.round((PLAYER_MAX_HP + flat) * multiplier);
}

function normalizeResonanceLevel(value) {
  return Math.max(0, Math.min(RESONANCE_MAX, Math.floor(Number(value) || 0)));
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
    const max = ITEM_DEFINITIONS[key]?.max || 99;
    return {
      quantity: Math.max(0, Math.min(max, Math.floor(Number(entry?.quantity) || 0))),
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
    const max = ITEM_DEFINITIONS[key]?.max || 99;
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      const quantity = Number(raw.quantity ?? raw.duplicateCount ?? 0);
      return {
        quantity: Number.isFinite(quantity) ? Math.max(0, Math.min(max, Math.floor(quantity))) : 0,
        locked: Boolean(raw.locked),
      };
    }
    const numeric = Number(raw);
    return {
      quantity: Number.isFinite(numeric) ? Math.max(0, Math.min(max, Math.floor(numeric))) : cloneInventoryEntry(fallback, key).quantity,
      locked: false,
    };
  }

  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    if (Array.isArray(raw.copies)) {
      return { copies: sortInventoryCopies(raw.copies.map(normalizeInventoryCopy).slice(0, 200)) };
    }
    const duplicateCount = Math.max(0, Math.floor(Number(raw.duplicateCount) || 0));
    const copies = Boolean(raw.owned) || duplicateCount > 0
      ? [normalizeInventoryCopy({ level: raw.resonanceLevel, locked: raw.locked }), ...Array(duplicateCount).fill(0).map(normalizeInventoryCopy)]
      : [];
    return { copies: sortInventoryCopies(copies) };
  }

  const numeric = Number(raw);
  if (Number.isFinite(numeric)) {
    const count = Math.max(0, Math.floor(numeric));
    return { copies: Array(count).fill(0).map(normalizeInventoryCopy) };
  }

  return cloneInventoryEntry(fallback, key);
}

function normalizeInventory(inventory = {}) {
  return Object.fromEntries(
    Object.keys(INVENTORY_DEFAULT).map((key) => {
      return [key, normalizeInventoryEntry(inventory?.[key], INVENTORY_DEFAULT[key], key)];
    }),
  );
}

function inventoryEntryOwned(entry) {
  if (!entry) return false;
  if (Array.isArray(entry.copies)) return entry.copies.length > 0;
  return Math.max(0, Math.floor(Number(entry.quantity) || 0)) > 0;
}

function addInventoryCopies(inventory, key, copies = 1) {
  const entry = normalizeInventoryEntry(inventory[key], INVENTORY_DEFAULT[key], key);
  const count = Math.max(0, Math.floor(Number(copies) || 0));
  if (count <= 0) {
    inventory[key] = entry;
    return;
  }
  if (itemIsStackable(key)) {
    const max = ITEM_DEFINITIONS[key]?.max || 99;
    entry.quantity = Math.max(0, Math.min(max, (entry.quantity || 0) + count));
  } else {
    entry.copies.push(...Array(count).fill(0).map(normalizeInventoryCopy));
    sortInventoryCopies(entry.copies);
  }
  inventory[key] = entry;
}

function removeInventoryCopies(inventory, key, copies = 1) {
  const entry = normalizeInventoryEntry(inventory[key], INVENTORY_DEFAULT[key], key);
  const count = Math.max(0, Math.floor(Number(copies) || 0));
  if (count <= 0) {
    inventory[key] = entry;
    return true;
  }
  if (itemIsStackable(key)) {
    if (entry.locked || (entry.quantity || 0) < count) {
      inventory[key] = entry;
      return false;
    }
    entry.quantity = Math.max(0, (entry.quantity || 0) - count);
    inventory[key] = entry;
    return true;
  }
  const removable = entry.copies
    .map((copy, index) => ({ copy, index }))
    .filter(({ copy }) => !copyLocked(copy))
    .map(({ index }) => index);
  if (!Array.isArray(entry.copies) || removable.length < count) {
    inventory[key] = entry;
    return false;
  }
  for (const index of removable.slice(0, count).sort((a, b) => b - a)) entry.copies.splice(index, 1);
  inventory[key] = entry;
  return true;
}

function inventoryAvailableSpace(inventory, key) {
  const item = ITEM_DEFINITIONS[key];
  if (!item) return 0;
  const entry = normalizeInventoryEntry(inventory[key], INVENTORY_DEFAULT[key], key);
  if (itemIsStackable(key)) return Math.max(0, (item.max || 99) - (entry.quantity || 0));
  return Math.max(0, 200 - (entry.copies?.length || 0));
}

function itemQuality(item) {
  return item?.rarity || item?.quality || "white";
}

function nextItemQuality(quality) {
  const index = ITEM_QUALITY_ORDER.indexOf(quality || "white");
  return index >= 0 && index < ITEM_QUALITY_ORDER.length - 1 ? ITEM_QUALITY_ORDER[index + 1] : null;
}

function randomChoice(items) {
  if (!items.length) return null;
  return items[Math.floor(Math.random() * items.length)];
}

function hashString(value) {
  let hash = 2166136261;
  const text = String(value || "");
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function makeSeededRng(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function seededChoice(items, rng) {
  if (!items.length) return null;
  return items[Math.floor(rng() * items.length)];
}

function weightedQualityChoice(weights) {
  const entries = Object.entries(weights).filter(([, weight]) => Number(weight) > 0);
  const total = entries.reduce((sum, [, weight]) => sum + Number(weight), 0);
  if (total <= 0) return entries[0]?.[0] || "white";
  let roll = Math.random() * total;
  for (const [key, weight] of entries) {
    roll -= Number(weight);
    if (roll <= 0) return key;
  }
  return entries[entries.length - 1]?.[0] || "white";
}

function weightedQualityChoiceWithRng(weights, rng) {
  const entries = Object.entries(weights).filter(([, weight]) => Number(weight) > 0);
  const total = entries.reduce((sum, [, weight]) => sum + Number(weight), 0);
  if (total <= 0) return entries[0]?.[0] || "white";
  let roll = rng() * total;
  for (const [key, weight] of entries) {
    roll -= Number(weight);
    if (roll <= 0) return key;
  }
  return entries[entries.length - 1]?.[0] || "white";
}

function shopRandomCandidatesForQuality(quality) {
  return itemData.items.filter((item) =>
    item.consumable &&
    item.category === "special" &&
    !item.shopInfinite &&
    itemQuality(item) === quality &&
    Object.prototype.hasOwnProperty.call(SHOP_PRICE_BY_QUALITY, quality));
}

function dailyShopBaseStock(dayKey = currentChestDayKey()) {
  const rng = makeSeededRng(hashString(`shop:${dayKey}`));
  const stock = new Map();
  for (let index = 0; index < SHOP_DAILY_ITEM_COUNT; index += 1) {
    const quality = weightedQualityChoiceWithRng(SHOP_QUALITY_WEIGHTS, rng);
    const candidates = shopRandomCandidatesForQuality(quality);
    const fallback = Object.keys(SHOP_PRICE_BY_QUALITY).flatMap((entryQuality) => shopRandomCandidatesForQuality(entryQuality));
    const item = seededChoice(candidates.length ? candidates : fallback, rng);
    if (!item) continue;
    stock.set(item.key, (stock.get(item.key) || 0) + 1);
  }
  return [...stock.entries()].map(([itemKey, stockCount]) => {
    const item = ITEM_DEFINITIONS[itemKey];
    return {
      itemKey,
      itemName: item.name,
      rarity: itemQuality(item),
      price: SHOP_PRICE_BY_QUALITY[itemQuality(item)] || 0,
      stock: stockCount,
    };
  });
}

function shopViewForAccount(account) {
  const shopState = normalizeShopState(account.shopState);
  const daily = dailyShopBaseStock(shopState.dayKey).map((entry) => ({
    ...entry,
    bought: Math.max(0, Math.floor(Number(shopState.purchases[entry.itemKey]) || 0)),
    remaining: Math.max(0, entry.stock - Math.max(0, Math.floor(Number(shopState.purchases[entry.itemKey]) || 0))),
    infinite: false,
  }));
  const infiniteItem = ITEM_DEFINITIONS[SHOP_INFINITE_ITEM_KEY];
  const infinite = infiniteItem ? [{
    itemKey: SHOP_INFINITE_ITEM_KEY,
    itemName: infiniteItem.name,
    rarity: itemQuality(infiniteItem),
    price: SHOP_INFINITE_ITEM_PRICE,
    stock: null,
    bought: 0,
    remaining: null,
    infinite: true,
  }] : [];
  return {
    dayKey: shopState.dayKey,
    daily,
    infinite,
  };
}

function normalizeChestAccountState(account) {
  const chestState = normalizeChestState(account.chestState);
  account.chestState = chestState;
  return chestState;
}

function chooseChestRewardItem() {
  const preferredQuality = weightedQualityChoice(CHEST_REWARD_QUALITY_WEIGHTS);
  const candidates = CHEST_REWARD_POOLS[preferredQuality] || [];
  const fallback = Object.values(CHEST_REWARD_POOLS).flat();
  const item = randomChoice(candidates.length ? candidates : fallback);
  return item || null;
}

function transformCandidateItems(quality, excludeKey = null) {
  const candidates = itemData.items.filter((item) =>
    item.donation &&
    !itemIsStackable(item.key) &&
    itemQuality(item) === quality);
  const filtered = candidates.filter((item) => item.key !== excludeKey);
  return filtered.length ? filtered : candidates;
}

function removeOneResonanceCopy(inventory, key, level) {
  if (itemIsStackable(key)) return false;
  const numeric = normalizeResonanceLevel(level);
  const entry = normalizeInventoryEntry(inventory[key], INVENTORY_DEFAULT[key], key);
  const index = entry.copies.findIndex((copy) => copyLevel(copy) === numeric && !copyLocked(copy));
  if (index < 0) {
    inventory[key] = entry;
    return false;
  }
  entry.copies.splice(index, 1);
  inventory[key] = entry;
  return true;
}

function addResonanceCopy(inventory, key, level = 0) {
  if (itemIsStackable(key)) return false;
  const entry = normalizeInventoryEntry(inventory[key], INVENTORY_DEFAULT[key], key);
  entry.copies.push(normalizeInventoryCopy({ level, locked: false }));
  sortInventoryCopies(entry.copies);
  inventory[key] = entry;
  return true;
}

function resonanceCopyCostForLevel(level) {
  return Number(level) < RESONANCE_MAX ? RESONANCE_COPY_COST : Infinity;
}

function resonanceQualityMultiplier(item) {
  return RESONANCE_QUALITY_MULTIPLIERS[item?.rarity || item?.quality || "white"] || 1;
}

function resonanceCoinCostForLevel(level, item) {
  const numeric = normalizeResonanceLevel(level);
  return numeric < RESONANCE_MAX ? Math.round((RESONANCE_COIN_BASE ** (numeric + 1)) * resonanceQualityMultiplier(item)) : Infinity;
}

function resonateInventoryEntry(inventory, itemKey, level) {
  const item = ITEM_DEFINITIONS[itemKey];
  if (!item || itemIsStackable(itemKey)) return null;
  const numeric = normalizeResonanceLevel(level);
  if (numeric >= RESONANCE_MAX) return null;
  const entry = normalizeInventoryEntry(inventory[itemKey], INVENTORY_DEFAULT[itemKey], itemKey);
  const copyCost = resonanceCopyCostForLevel(numeric);
  const matching = entry.copies
    .map((copy, index) => ({ copy, index }))
    .filter(({ copy }) => copyLevel(copy) === numeric && !copyLocked(copy))
    .map((copy) => copy.index);
  if (matching.length < copyCost) return null;
  for (const index of matching.slice(0, copyCost).sort((a, b) => b - a)) entry.copies.splice(index, 1);
  entry.copies.push(normalizeInventoryCopy({ level: numeric + 1, locked: false }));
  sortInventoryCopies(entry.copies);
  inventory[itemKey] = entry;
  return {
    itemKey,
    itemName: item.name,
    fromLevel: numeric,
    resonanceLevel: numeric + 1,
    copyCost,
    coinCost: resonanceCoinCostForLevel(numeric, item),
    qualityMultiplier: resonanceQualityMultiplier(item),
  };
}

function transformInventoryEntry(inventory, itemKey, mode, level) {
  const item = ITEM_DEFINITIONS[itemKey];
  if (!item || itemIsStackable(itemKey)) return null;
  const numeric = normalizeResonanceLevel(level);
  const entry = normalizeInventoryEntry(inventory[itemKey], INVENTORY_DEFAULT[itemKey], itemKey);
  if (!entry.copies.some((copy) => copyLevel(copy) === numeric && !copyLocked(copy))) return null;

  let targetQuality = null;
  let targetLevel = 0;
  if (mode === "promote-quality") {
    if (numeric < RESONANCE_MAX) return null;
    targetQuality = nextItemQuality(itemQuality(item));
    if (!targetQuality) return null;
  } else if (mode === "reroll-lower") {
    if (numeric <= 0) return null;
    targetQuality = itemQuality(item);
    targetLevel = numeric - 1;
  } else {
    return null;
  }

  const resultItem = randomChoice(transformCandidateItems(targetQuality, itemKey));
  if (!resultItem) return null;
  if (!removeOneResonanceCopy(inventory, itemKey, numeric)) return null;
  addResonanceCopy(inventory, resultItem.key, targetLevel);
  return {
    mode,
    sourceItemKey: itemKey,
    sourceItemName: item.name,
    sourceQuality: itemQuality(item),
    sourceResonanceLevel: numeric,
    itemKey: resultItem.key,
    itemName: resultItem.name,
    icon: resultItem.icon,
    quality: itemQuality(resultItem),
    resonanceLevel: targetLevel,
  };
}

function promoteAllTrueNameInventoryEntries(inventory) {
  const operations = [];
  for (const item of itemData.items) {
    if (itemIsStackable(item.key)) continue;
    if (!nextItemQuality(itemQuality(item))) continue;
    while (true) {
      const result = transformInventoryEntry(inventory, item.key, "promote-quality", RESONANCE_MAX);
      if (!result) break;
      operations.push(result);
    }
  }
  return operations;
}

function resonateAllAvailable(account, inventory) {
  const operations = [];
  for (const item of itemData.items) {
    if (itemIsStackable(item.key)) continue;
    for (let level = 0; level < RESONANCE_MAX; level += 1) {
      while (true) {
        const coinCost = resonanceCoinCostForLevel(level, item);
        const entry = normalizeInventoryEntry(inventory[item.key], INVENTORY_DEFAULT[item.key], item.key);
        const matchingCount = entry.copies.filter((copy) => copyLevel(copy) === level && !copyLocked(copy)).length;
        if (matchingCount < resonanceCopyCostForLevel(level) || account.coins < coinCost) break;
        const operation = resonateInventoryEntry(inventory, item.key, level);
        if (!operation) break;
        account.coins -= coinCost;
        operations.push(operation);
      }
    }
  }
  return operations;
}

function toggleInventoryCopyLock(inventory, itemKey, copyIndex, expectedLevel = null) {
  const item = ITEM_DEFINITIONS[itemKey];
  if (!item) return null;
  const entry = normalizeInventoryEntry(inventory[itemKey], INVENTORY_DEFAULT[itemKey], itemKey);
  if (itemIsStackable(itemKey)) {
    if (Math.max(0, Math.floor(Number(entry.quantity) || 0)) <= 0) {
      inventory[itemKey] = entry;
      return null;
    }
    entry.locked = !entry.locked;
    inventory[itemKey] = entry;
    return { itemKey, copyIndex: null, resonanceLevel: 0, locked: entry.locked };
  }
  const index = Math.max(0, Math.floor(Number(copyIndex)));
  const copy = entry.copies[index];
  if (!copy) {
    inventory[itemKey] = entry;
    return null;
  }
  if (expectedLevel !== null && copyLevel(copy) !== normalizeResonanceLevel(expectedLevel)) {
    inventory[itemKey] = entry;
    return null;
  }
  entry.copies[index] = { level: copyLevel(copy), locked: !copyLocked(copy) };
  inventory[itemKey] = entry;
  return { itemKey, copyIndex: index, resonanceLevel: copyLevel(entry.copies[index]), locked: copyLocked(entry.copies[index]) };
}

function smeltRewardForItem(item) {
  return BLACKSMITH_SMELT_REWARDS[itemQuality(item)] || { ore: 0, gold: 0 };
}

function smeltWeaponCopies(account, inventory, selections = []) {
  const removalsByKey = new Map();
  const results = [];
  let ore = 0;
  let gold = 0;
  for (const selection of selections.slice(0, 120)) {
    const itemKey = String(selection?.itemKey || "");
    const item = ITEM_DEFINITIONS[itemKey];
    if (!item || item.category !== "weapon" || itemIsStackable(itemKey)) continue;
    const entry = normalizeInventoryEntry(inventory[itemKey], INVENTORY_DEFAULT[itemKey], itemKey);
    const index = Math.max(0, Math.floor(Number(selection.copyIndex)));
    const copy = entry.copies[index];
    const expectedLevel = selection.resonanceLevel ?? selection.level ?? null;
    if (!copy || copyLocked(copy)) continue;
    if (expectedLevel !== null && copyLevel(copy) !== normalizeResonanceLevel(expectedLevel)) continue;
    const already = removalsByKey.get(itemKey) || new Set();
    if (already.has(index)) continue;
    already.add(index);
    removalsByKey.set(itemKey, already);
    const reward = smeltRewardForItem(item);
    ore += reward.ore;
    gold += reward.gold;
    results.push({
      itemKey,
      itemName: item.name,
      quality: itemQuality(item),
      resonanceLevel: copyLevel(copy),
      copyIndex: index,
      ore: reward.ore,
      gold: reward.gold,
    });
  }
  if (!results.length) return null;
  const coinCost = ore;
  if (account.coins < coinCost) return { error: "Not enough coins", coinCost, ore, gold, results };
  for (const [itemKey, indices] of removalsByKey.entries()) {
    const entry = normalizeInventoryEntry(inventory[itemKey], INVENTORY_DEFAULT[itemKey], itemKey);
    for (const index of [...indices].sort((a, b) => b - a)) entry.copies.splice(index, 1);
    inventory[itemKey] = entry;
  }
  account.coins -= coinCost;
  addInventoryCopies(inventory, BLACKSMITH_ORE_ITEM_KEY, ore);
  account.gold = Math.max(0, Math.floor(Number(account.gold) || 0)) + gold;
  return { coinCost, ore, gold, results };
}

function normalizeLastPosition(value) {
  if (!value || typeof value !== "object") return null;
  const x = Number(value.x);
  const y = Number(value.y);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  const face = Number(value.face);
  return {
    x: Math.max(WORLD_MIN_X, Math.min(WORLD_MAX_X, x)),
    y: Math.max(WORLD_MIN_Y, Math.min(WORLD_MAX_Y, y)),
    face: Number.isFinite(face) ? face : -Math.PI / 2,
    mode: value.mode === "landing" ? "landing" : "explore",
    savedAt: typeof value.savedAt === "string" ? value.savedAt : new Date().toISOString(),
  };
}

async function writeAccount(account) {
  await ensureAccountsDir();
  const normalized = normalizeAccount(account);
  normalized.updatedAt = new Date().toISOString();
  await fs.writeFile(accountFile(normalized.id), `${JSON.stringify(normalized, null, 2)}\n`);
  return normalized;
}

async function listAccounts() {
  await ensureAccountsDir();
  const files = await fs.readdir(ACCOUNTS_DIR);
  const accounts = [];
  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    try {
      const account = JSON.parse(await fs.readFile(path.join(ACCOUNTS_DIR, file), "utf8"));
      accounts.push(normalizeAccount(account));
    } catch {
      // Ignore malformed account files so one bad document does not block the game.
    }
  }
  accounts.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return accounts;
}

function accountSummary(account) {
  return {
    id: account.id,
    name: account.name,
    pathRank: account.pathRank,
    experience: account.experience,
    coins: account.coins,
    "最後座標": account["最後座標"],
    updatedAt: account.updatedAt,
    recordsCount: account.records.length,
    bestRank: bestRecord(account.records)?.rank || null,
  };
}

function bestRecord(records) {
  return [...records].sort((a, b) => (b.rankIndex ?? 0) - (a.rankIndex ?? 0) || (b.score ?? 0) - (a.score ?? 0) || (a.time ?? 9999) - (b.time ?? 9999))[0];
}

function sendJson(res, status, data) {
  res.writeHead(status, {
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json; charset=utf-8",
  });
  res.end(JSON.stringify(data));
  return true;
}

function sendError(res, status, message) {
  return sendJson(res, status, { error: message });
}

async function listZoneBgmTracks() {
  try {
    const entries = await fs.readdir(ZONE_BGM_DIR, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && AUDIO_FILE_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
      .map((entry) => `./BGM Zone 1/${entry.name}`)
      .sort((a, b) => a.localeCompare(b, "zh-Hant"));
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function handleApi(req, res, url) {
  await ensureAccountsDir();

  if (req.method === "GET" && url.pathname === "/api/audio/zone-bgm") {
    const tracks = await listZoneBgmTracks();
    sendJson(res, 200, { tracks });
    return true;
  }

  if (req.method === "GET" && url.pathname === "/api/accounts") {
    const accounts = await listAccounts();
    sendJson(res, 200, { accounts: accounts.map(accountSummary) });
    return true;
  }

  if (req.method === "POST" && url.pathname === "/api/accounts") {
    const body = await readJson(req);
    const name = cleanName(body.name);
    if (!name) return sendError(res, 400, "Name is required");
    const existing = (await listAccounts()).find((account) => account.name.toLocaleLowerCase("ja-JP") === name.toLocaleLowerCase("ja-JP"));
    if (existing) {
      sendJson(res, 200, { account: existing, existing: true });
      return true;
    }
    const now = new Date().toISOString();
    const account = await writeAccount({
      id: accountIdFor(name),
      name,
      pathRank: "荒・初段",
      experience: 0,
      coins: 0,
      gold: 0,
      hp: PLAYER_MAX_HP,
      chestState: { dayKey: currentChestDayKey(), opened: [], fieldLoot: [] },
      shopState: { dayKey: currentChestDayKey(), purchases: {} },
      graveState: { unlocked: [] },
      inventory: normalizeInventory(INVENTORY_DEFAULT),
      equipment: normalizeEquipment(null, normalizeInventory(INVENTORY_DEFAULT)),
      "最後座標": null,
      createdAt: now,
      updatedAt: now,
      records: [],
    });
    sendJson(res, 201, { account, existing: false });
    return true;
  }

  const match = url.pathname.match(/^\/api\/accounts\/(account-[a-f0-9]{16})(?:\/([^/]+))?$/);
  if (!match) return false;
  const [, id, action] = match;
  const account = await readAccount(id);
  if (!account) return sendError(res, 404, "Account not found");

  if (req.method === "GET" && !action) {
    sendJson(res, 200, { account });
    return true;
  }

  if (req.method === "POST" && action === "location") {
    const body = await readJson(req);
    const lastPosition = normalizeLastPosition(body["最後座標"] || body.lastPosition || body);
    const maxHp = playerMaxHpForAccount(account.inventory, account.equipment);
    const hpValue = body.hp ?? body.currentHp ?? body.playerHp;
    const hasHp = Number.isFinite(Number(hpValue));
    if (!lastPosition && !hasHp) return sendError(res, 400, "Invalid location");
    if (lastPosition) account["最後座標"] = { ...lastPosition, savedAt: new Date().toISOString() };
    if (hasHp) account.hp = normalizeAccountHp(hpValue, maxHp);
    const saved = await writeAccount(account);
    sendJson(res, 200, { account: saved });
    return true;
  }

  if (req.method === "POST" && action === "rename") {
    const body = await readJson(req);
    const name = cleanName(body.name);
    if (!name) return sendError(res, 400, "Name is required");
    if (sameName(name, account.name)) return sendError(res, 400, "Name is unchanged");
    if (account.coins < RENAME_COST) return sendError(res, 400, "Not enough coins");
    const allAccounts = await listAccounts();
    const existing = allAccounts.find((candidate) => candidate.id !== account.id && sameName(candidate.name, name));
    if (existing) return sendError(res, 409, "Name already in use");
    const previousFile = accountFile(account.id);
    const nextId = accountIdFor(name);
    const nextFile = accountFile(nextId);
    if (nextId !== account.id) {
      try {
        await fs.access(nextFile);
        return sendError(res, 409, "Name already in use");
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
    }
    account.id = nextId;
    account.name = name;
    account.coins -= RENAME_COST;
    const saved = await writeAccount(account);
    if (previousFile !== nextFile) await fs.unlink(previousFile).catch(() => {});
    sendJson(res, 200, { account: saved, cost: RENAME_COST });
    return true;
  }

  if (req.method === "POST" && action === "equipment") {
    const body = await readJson(req);
    const slot = String(body.slot || "");
    const itemKey = body.itemKey === null || body.itemKey === "" ? null : String(body.itemKey || "");
    if (!Object.prototype.hasOwnProperty.call(EQUIPMENT_SLOTS, slot)) return sendError(res, 400, "Unknown equipment slot");
    const inventory = normalizeInventory(account.inventory);
    const equipment = normalizeEquipment(account.equipment, inventory);
    if (itemKey) {
      const item = ITEM_DEFINITIONS[itemKey];
      if (!item || item.category !== slot) return sendError(res, 400, "Item cannot be equipped there");
      if (!inventoryEntryOwned(inventory[itemKey])) return sendError(res, 400, "Item is not owned");
      equipment[slot] = itemKey;
    } else {
      equipment[slot] = null;
    }
    account.equipment = equipment;
    account.hp = normalizeAccountHp(account.hp, playerMaxHpForAccount(inventory, equipment));
    const saved = await writeAccount(account);
    sendJson(res, 200, { account: saved });
    return true;
  }

  if (req.method === "POST" && action === "records") {
    const body = await readJson(req);
    const record = body.record;
    if (!record || typeof record !== "object") return sendError(res, 400, "Record is required");
    const expGained = progression.normalizeExperience(record.expGained);
    const coinsGained = Number.isFinite(Number(record.coinsGained)) ? Math.max(0, Math.floor(Number(record.coinsGained))) : 0;
    const expBefore = progression.normalizeExperience(account.experience);
    const expAfter = expBefore + expGained;
    const progress = progression.progressForExperience(expAfter);
    const maxHp = playerMaxHpForAccount(account.inventory, account.equipment);
    const hpValue = body.hp ?? body.currentHp ?? body.playerHp;
    const savedRecord = {
      ...record,
      expGained,
      coinsGained,
      expBefore,
      expAfter,
      path: progress.rank,
    };
    account.experience = expAfter;
    account.coins = Math.max(0, Math.floor(Number(account.coins) || 0)) + coinsGained;
    account.pathRank = progress.rank;
    if (Number.isFinite(Number(hpValue))) account.hp = normalizeAccountHp(hpValue, maxHp);
    account.records = [savedRecord, ...account.records].slice(0, MAX_RECORDS);
    const saved = await writeAccount(account);
    sendJson(res, 200, { account: saved });
    return true;
  }

  if (req.method === "POST" && action === "donation") {
    const body = await readJson(req);
    const rewards = (Array.isArray(body.rewards) ? body.rewards : [body.reward])
      .map((reward) => String(reward || ""))
      .filter(Boolean)
      .slice(0, 10);
    if (rewards.length === 0) return sendError(res, 400, "Donation reward is required");
    if (rewards.some((reward) => !DONATION_REWARD_KEYS.has(reward))) return sendError(res, 400, "Unknown donation reward");
    const inventory = normalizeInventory(account.inventory);
    const totalCost = DONATION_COST * rewards.length;
    if (account.coins < totalCost) return sendError(res, 400, "Not enough coins");
    account.coins -= totalCost;
    const copyMultiplier = 1;
    const equipment = normalizeEquipment(account.equipment, inventory);
    for (const reward of rewards) {
      addInventoryCopies(inventory, reward, copyMultiplier);
      const slot = ITEM_DEFINITIONS[reward]?.category;
      if (slot && Object.prototype.hasOwnProperty.call(EQUIPMENT_SLOTS, slot) && !equipment[slot]) equipment[slot] = reward;
    }
    account.inventory = inventory;
    account.equipment = equipment;
    account.hp = normalizeAccountHp(account.hp, playerMaxHpForAccount(inventory, equipment));
    const saved = await writeAccount(account);
    sendJson(res, 200, { account: saved, reward: rewards[0], rewards, count: rewards.length, cost: totalCost, copyMultiplier });
    return true;
  }

  if (req.method === "GET" && action === "shop") {
    account.shopState = normalizeShopState(account.shopState);
    sendJson(res, 200, { shop: shopViewForAccount(account), account });
    return true;
  }

  if (req.method === "POST" && action === "shop-buy") {
    const body = await readJson(req);
    const itemKey = String(body.itemKey || "");
    const item = ITEM_DEFINITIONS[itemKey];
    if (!item || !item.consumable) return sendError(res, 400, "Unknown shop item");
    const shopState = normalizeShopState(account.shopState);
    const stock = dailyShopBaseStock(shopState.dayKey).find((entry) => entry.itemKey === itemKey);
    const infinite = itemKey === SHOP_INFINITE_ITEM_KEY;
    if (!infinite && !stock) return sendError(res, 400, "Item is not in today's shop");
    const price = infinite ? SHOP_INFINITE_ITEM_PRICE : SHOP_PRICE_BY_QUALITY[itemQuality(item)];
    if (!Number.isFinite(price) || price <= 0) return sendError(res, 400, "Item cannot be purchased");
    if (!infinite) {
      const bought = Math.max(0, Math.floor(Number(shopState.purchases[itemKey]) || 0));
      if (bought >= stock.stock) return sendError(res, 409, "Item is sold out today");
    }
    const inventory = normalizeInventory(account.inventory);
    if (inventoryAvailableSpace(inventory, itemKey) < 1) return sendError(res, 400, "Inventory is full");
    if (account.coins < price) return sendError(res, 400, "Not enough coins");
    account.coins -= price;
    addInventoryCopies(inventory, itemKey, 1);
    if (!infinite) shopState.purchases[itemKey] = Math.max(0, Math.floor(Number(shopState.purchases[itemKey]) || 0)) + 1;
    account.shopState = shopState;
    account.inventory = inventory;
    account.equipment = normalizeEquipment(account.equipment, inventory);
    account.hp = normalizeAccountHp(account.hp, playerMaxHpForAccount(account.inventory, account.equipment));
    const saved = await writeAccount(account);
    sendJson(res, 200, { account: saved, itemKey, price, shop: shopViewForAccount(saved) });
    return true;
  }

  if (req.method === "POST" && action === "grave-bond") {
    const body = await readJson(req);
    const graveId = String(body.graveId || "");
    if (!KNOWN_GRAVE_IDS.has(graveId)) return sendError(res, 400, "Unknown grave marker");
    const graveState = normalizeGraveState(account.graveState);
    if (graveState.unlocked.includes(graveId)) {
      sendJson(res, 200, { account, graveId, unlocked: true, alreadyUnlocked: true });
      return true;
    }
    const inventory = normalizeInventory(account.inventory);
    if (!removeInventoryCopies(inventory, SHOP_INFINITE_ITEM_KEY, 1)) return sendError(res, 400, "Missing incense candle");
    graveState.unlocked.push(graveId);
    account.graveState = graveState;
    account.inventory = inventory;
    account.equipment = normalizeEquipment(account.equipment, inventory);
    account.hp = normalizeAccountHp(account.hp, playerMaxHpForAccount(account.inventory, account.equipment));
    const saved = await writeAccount(account);
    sendJson(res, 200, { account: saved, graveId, unlocked: true, consumed: SHOP_INFINITE_ITEM_KEY });
    return true;
  }

  if (req.method === "POST" && action === "chests-open") {
    const body = await readJson(req);
    const chestId = String(body.chestId || "");
    if (!CHEST_SPAWN_IDS.has(chestId)) return sendError(res, 400, "Unknown chest");
    const chestState = normalizeChestAccountState(account);
    const activeChestIds = new Set(chestData.activeChestIdsForDay(chestState.dayKey));
    if (!activeChestIds.has(chestId)) return sendError(res, 400, "Chest is not active today");
    if (chestState.opened.includes(chestId)) return sendError(res, 409, "Chest already opened");

    const coinsGained = 8 + Math.floor(Math.random() * 15);
    const expGained = 1 + Math.floor(Math.random() * 20);
    const dropCount = 1 + (Math.random() < 0.35 ? 1 : 0);
    const drops = [];
    for (let slot = 0; slot < dropCount; slot += 1) {
      const reward = chooseChestRewardItem();
      if (!reward) continue;
      const loot = {
        id: `loot-${crypto.randomUUID()}`,
        chestId,
        itemKey: reward.key,
        slot,
      };
      chestState.fieldLoot.push(loot);
      drops.push(loot);
    }
    chestState.opened.push(chestId);
    account.chestState = chestState;
    const nextExperience = progression.normalizeExperience(account.experience) + expGained;
    const progress = progression.progressForExperience(nextExperience);
    account.experience = nextExperience;
    account.pathRank = progress.rank;
    account.coins = Math.max(0, Math.floor(Number(account.coins) || 0)) + coinsGained;
    const saved = await writeAccount(account);
    sendJson(res, 200, { account: saved, chestId, coinsGained, expGained, drops });
    return true;
  }

  if (req.method === "POST" && action === "field-loot-collect") {
    const body = await readJson(req);
    const lootId = String(body.lootId || "");
    if (!lootId) return sendError(res, 400, "Loot id is required");
    const chestState = normalizeChestAccountState(account);
    const index = chestState.fieldLoot.findIndex((entry) => entry.id === lootId);
    if (index < 0) return sendError(res, 404, "Loot not found");
    const [loot] = chestState.fieldLoot.splice(index, 1);
    const inventory = normalizeInventory(account.inventory);
    addInventoryCopies(inventory, loot.itemKey, 1);
    account.inventory = inventory;
    account.equipment = normalizeEquipment(account.equipment, inventory);
    account.hp = normalizeAccountHp(account.hp, playerMaxHpForAccount(account.inventory, account.equipment));
    account.chestState = chestState;
    const saved = await writeAccount(account);
    sendJson(res, 200, { account: saved, collected: loot });
    return true;
  }

  if (req.method === "POST" && action === "resonance") {
    const body = await readJson(req);
    const itemKey = String(body.itemKey || "");
    const item = ITEM_DEFINITIONS[itemKey];
    if (!item) return sendError(res, 400, "Unknown item");
    if (itemIsStackable(itemKey)) return sendError(res, 400, "Stacked items cannot resonate yet");
    const inventory = normalizeInventory(account.inventory);
    const entry = normalizeInventoryEntry(inventory[itemKey], INVENTORY_DEFAULT[itemKey], itemKey);
    const level = normalizeResonanceLevel(body.resonanceLevel);
    if (level >= RESONANCE_MAX) return sendError(res, 400, "Resonance is already maxed");
    const copyCost = resonanceCopyCostForLevel(level);
    const coinCost = resonanceCoinCostForLevel(level, item);
    const matchingCount = entry.copies.filter((copy) => copyLevel(copy) === level && !copyLocked(copy)).length;
    if (matchingCount < copyCost) return sendError(res, 400, "Not enough matching copies");
    if (account.coins < coinCost) return sendError(res, 400, "Not enough coins");
    account.coins -= coinCost;
    resonateInventoryEntry(inventory, itemKey, level);
    account.inventory = inventory;
    account.equipment = normalizeEquipment(account.equipment, inventory);
    account.hp = normalizeAccountHp(account.hp, playerMaxHpForAccount(account.inventory, account.equipment));
    const saved = await writeAccount(account);
    sendJson(res, 200, { account: saved, itemKey, resonanceLevel: level + 1, copyCost, coinCost, qualityMultiplier: resonanceQualityMultiplier(item) });
    return true;
  }

  if (req.method === "POST" && action === "resonance-all") {
    const inventory = normalizeInventory(account.inventory);
    const coinsBefore = account.coins;
    const operations = resonateAllAvailable(account, inventory);
    account.inventory = inventory;
    account.equipment = normalizeEquipment(account.equipment, inventory);
    account.hp = normalizeAccountHp(account.hp, playerMaxHpForAccount(account.inventory, account.equipment));
    const saved = await writeAccount(account);
    sendJson(res, 200, {
      account: saved,
      operations,
      count: operations.length,
      coinCost: coinsBefore - account.coins,
    });
    return true;
  }

  if (req.method === "POST" && action === "inventory-lock") {
    const body = await readJson(req);
    const itemKey = String(body.itemKey || "");
    const inventory = normalizeInventory(account.inventory);
    const result = toggleInventoryCopyLock(inventory, itemKey, body.copyIndex, body.resonanceLevel ?? null);
    if (!result) return sendError(res, 400, "Item copy not found");
    account.inventory = inventory;
    account.equipment = normalizeEquipment(account.equipment, inventory);
    account.hp = normalizeAccountHp(account.hp, playerMaxHpForAccount(account.inventory, account.equipment));
    const saved = await writeAccount(account);
    sendJson(res, 200, { account: saved, result });
    return true;
  }

  if (req.method === "POST" && action === "blacksmith-smelt") {
    const body = await readJson(req);
    const inventory = normalizeInventory(account.inventory);
    const result = smeltWeaponCopies(account, inventory, Array.isArray(body.selections) ? body.selections : []);
    if (!result) return sendError(res, 400, "No unlocked weapon selected");
    if (result.error) return sendError(res, 400, result.error);
    account.inventory = inventory;
    account.equipment = normalizeEquipment(account.equipment, inventory);
    account.hp = normalizeAccountHp(account.hp, playerMaxHpForAccount(account.inventory, account.equipment));
    const saved = await writeAccount(account);
    sendJson(res, 200, { account: saved, ...result });
    return true;
  }

  if (req.method === "POST" && action === "resonance-transform") {
    const body = await readJson(req);
    const itemKey = String(body.itemKey || "");
    const mode = String(body.mode || "");
    const item = ITEM_DEFINITIONS[itemKey];
    if (!item) return sendError(res, 400, "Unknown item");
    if (itemIsStackable(itemKey)) return sendError(res, 400, "Stacked items cannot transform");

    const level = normalizeResonanceLevel(body.resonanceLevel);
    const inventory = normalizeInventory(account.inventory);
    const entry = normalizeInventoryEntry(inventory[itemKey], INVENTORY_DEFAULT[itemKey], itemKey);
    if (!entry.copies.some((copy) => copyLevel(copy) === level && !copyLocked(copy))) return sendError(res, 400, "Item copy not found");

    if (mode === "promote-quality") {
      if (level < RESONANCE_MAX) return sendError(res, 400, "Only true-name items can be promoted");
      if (!nextItemQuality(itemQuality(item))) return sendError(res, 400, "Item is already highest quality");
    } else if (mode === "reroll-lower") {
      if (level <= 0) return sendError(res, 400, "Only named items can be rerolled");
    } else {
      return sendError(res, 400, "Unknown transform mode");
    }

    const result = transformInventoryEntry(inventory, itemKey, mode, level);
    if (!result) return sendError(res, 400, "No transform candidate");
    account.inventory = inventory;
    account.equipment = normalizeEquipment(account.equipment, inventory);
    account.hp = normalizeAccountHp(account.hp, playerMaxHpForAccount(account.inventory, account.equipment));
    const saved = await writeAccount(account);
    sendJson(res, 200, {
      account: saved,
      mode,
      source: {
        itemKey,
        itemName: item.name,
        quality: itemQuality(item),
        resonanceLevel: level,
      },
      result,
    });
    return true;
  }

  if (req.method === "POST" && action === "resonance-transform-all") {
    const body = await readJson(req);
    const mode = String(body.mode || "");
    if (mode !== "promote-quality") return sendError(res, 400, "Unknown transform mode");
    const inventory = normalizeInventory(account.inventory);
    const operations = promoteAllTrueNameInventoryEntries(inventory);
    account.inventory = inventory;
    account.equipment = normalizeEquipment(account.equipment, inventory);
    account.hp = normalizeAccountHp(account.hp, playerMaxHpForAccount(account.inventory, account.equipment));
    const saved = await writeAccount(account);
    sendJson(res, 200, {
      account: saved,
      mode,
      operations,
      count: operations.length,
    });
    return true;
  }

  if (req.method === "POST" && action === "clear-records") {
    account.records = [];
    const saved = await writeAccount(account);
    sendJson(res, 200, { account: saved });
    return true;
  }

  if (req.method === "DELETE" && !action) {
    await fs.unlink(accountFile(id));
    sendJson(res, 200, { deleted: true });
    return true;
  }

  sendError(res, 405, "Method not allowed");
  return true;
}

async function serveStatic(req, res, url) {
  const requested = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  if (requested.startsWith("/accounts/")) return sendError(res, 403, "Forbidden");
  const filePath = path.normalize(path.join(ROOT, requested));
  if (!filePath.startsWith(ROOT)) return sendError(res, 403, "Forbidden");
  try {
    const data = await fs.readFile(filePath);
    res.writeHead(200, {
      "Content-Type": MIME[path.extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(data);
  } catch (error) {
    if (error.code === "ENOENT") return sendError(res, 404, "Not found");
    throw error;
  }
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
        "Access-Control-Allow-Origin": "*",
      });
      res.end();
      return;
    }
    const url = new URL(req.url, `http://${req.headers.host || "127.0.0.1"}`);
    if (url.pathname.startsWith("/api/")) {
      const handled = await handleApi(req, res, url);
      if (!handled) sendError(res, 404, "Not found");
      return;
    }
    await serveStatic(req, res, url);
  } catch (error) {
    console.error(error);
    sendError(res, 500, "Server error");
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`月下祓行 listening on http://127.0.0.1:${PORT}/`);
});
