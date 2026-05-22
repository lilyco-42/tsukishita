(function initItemData(root, factory) {
  const data = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = data;
  if (root) root.TSUKISHITA_ITEM_DATA = data;
})(typeof globalThis !== "undefined" ? globalThis : this, () => {
  const categories = [
    { key: "special", name: "特殊道具" },
    { key: "prayer", name: "祈物" },
    { key: "weapon", name: "武器" },
  ];

  const equipmentSlots = [
    { key: "weapon", name: "武器" },
    { key: "prayer", name: "祈物" },
  ];

  const resonanceTiers = [
    { key: "none", label: "無", level: 0 },
    { key: "first", label: "初", level: 1 },
    { key: "second", label: "二", level: 2 },
    { key: "third", label: "三", level: 3 },
    { key: "fourth", label: "四", level: 4 },
    { key: "true", label: "真", level: 5 },
  ];
  const resonanceTierOrder = resonanceTiers.map((tier) => tier.key);
  const resonanceTierLabels = Object.fromEntries(resonanceTiers.map((tier) => [tier.key, tier.label]));
  const resonanceLevelToTierKey = Object.fromEntries(resonanceTiers.map((tier) => [tier.level, tier.key]));
  const resonanceTierKeyToLevel = Object.fromEntries(resonanceTiers.map((tier) => [tier.key, tier.level]));

  const rarityDisplay = {
    white: "白",
    green: "綠",
    blue: "藍",
    purple: "紫",
    gold: "金",
    roseGold: "玫瑰金",
  };

  const resonance = {
    max: 5,
    names: ["初", "二", "三", "四", "真"],
    noneName: "無",
    copyCost: 2,
    coinBase: 5,
    qualityMultipliers: {
      white: 1,
      green: 2,
      blue: 3,
      purple: 5,
      gold: 7,
      roseGold: 10,
    },
    tiers: resonanceTiers,
  };

  function cloneValue(value) {
    if (!value || typeof value !== "object") return value;
    if (Array.isArray(value)) return value.map(cloneValue);
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, cloneValue(entry)]));
  }

  function weaponTier(baseDamage, playerDescription, stats = {}, specialEffects = {}) {
    return {
      baseDamage,
      stats,
      specialEffects,
      playerDescription,
    };
  }

  function prayerTier(playerDescription, stats = {}, specialEffects = {}) {
    return {
      stats,
      specialEffects,
      playerDescription,
    };
  }

  function normalizeResonanceTierKey(value) {
    if (typeof value === "number" && Number.isFinite(value)) {
      const level = Math.max(0, Math.min(resonance.max, Math.floor(value)));
      return resonanceLevelToTierKey[level] || "none";
    }
    const text = String(value || "").trim();
    if (!text) return "none";
    if (resonanceTierKeyToLevel[text] !== undefined) return text;
    const byLabel = resonanceTiers.find((tier) => tier.label === text);
    if (byLabel) return byLabel.key;
    const normalized = text.toLowerCase();
    if (resonanceTierKeyToLevel[normalized] !== undefined) return normalized;
    return "none";
  }

  function normalizeRarity(rarity) {
    if (rarity === "桜") return "roseGold";
    return rarity || "white";
  }

  function normalizeResonanceMap(item) {
    return Object.fromEntries(
      resonanceTierOrder.map((tierKey) => {
        const tier = item.resonance?.[tierKey] || {};
        return [tierKey, {
          ...(item.category === "weapon" ? { baseDamage: Number(tier.baseDamage) } : {}),
          stats: cloneValue(tier.stats || {}),
          specialEffects: cloneValue(tier.specialEffects || {}),
          playerDescription: String(tier.playerDescription || "").trim(),
        }];
      }),
    );
  }

  function defineResonanceItem(item) {
    const normalizedRarity = normalizeRarity(item.rarity);
    const resonanceMap = normalizeResonanceMap(item);
    const baseTier = resonanceMap.none;
    return {
      key: item.key,
      id: item.id || item.key,
      name: item.displayName,
      displayName: item.displayName,
      rarity: normalizedRarity,
      rarityDisplay: rarityDisplay[normalizedRarity] || rarityDisplay.white,
      category: item.category,
      icon: item.icon,
      image: item.image || `./images/items/${item.key}.png`,
      donation: item.donation !== false,
      initial: Boolean(item.initial),
      max: item.max || 1,
      resonance: resonanceMap,
      effect: baseTier.playerDescription,
      damage: item.category === "weapon" ? baseTier.baseDamage : undefined,
    };
  }

  function defineFlatItem(item) {
    const normalizedRarity = normalizeRarity(item.rarity);
    return {
      max: item.max || 1,
      donation: Boolean(item.donation),
      ...item,
      rarity: normalizedRarity,
      rarityDisplay: rarityDisplay[normalizedRarity] || rarityDisplay.white,
      image: item.image || `./images/items/${item.key}.png`,
    };
  }

  const items = [
    defineResonanceItem({
      key: "rottenUchigatana",
      displayName: "朽木打刀",
      rarity: "white",
      category: "weapon",
      icon: "刀",
      initial: true,
      resonance: {
        none: weaponTier(22, "攻擊力 22；初始武器，無特殊效果。"),
        first: weaponTier(26, "攻擊力 26；爆擊傷害 +5%。", { critDamageBonusPct: 5 }),
        second: weaponTier(30, "攻擊力 30；爆擊傷害 +10%。", { critDamageBonusPct: 10 }),
        third: weaponTier(34, "攻擊力 34；爆擊傷害 +15%。", { critDamageBonusPct: 15 }),
        fourth: weaponTier(38, "攻擊力 38；爆擊傷害 +20%。", { critDamageBonusPct: 20 }),
        true: weaponTier(45, "攻擊力 45；爆擊傷害 +20%，爆擊率 +2%。", { critDamageBonusPct: 20, critRateBonusPct: 2 }),
      },
    }),
    defineResonanceItem({
      key: "villageDagger",
      displayName: "村守短刀",
      rarity: "white",
      category: "weapon",
      icon: "短",
      resonance: {
        none: weaponTier(20, "攻擊力 20；攻擊速度 +10%。", { attackSpeedBonusPct: 10 }),
        first: weaponTier(24, "攻擊力 24；攻擊速度 +15%。", { attackSpeedBonusPct: 15 }),
        second: weaponTier(28, "攻擊力 28；攻擊速度 +20%。", { attackSpeedBonusPct: 20 }),
        third: weaponTier(32, "攻擊力 32；攻擊速度 +25%。", { attackSpeedBonusPct: 25 }),
        fourth: weaponTier(36, "攻擊力 36；攻擊速度 +30%。", { attackSpeedBonusPct: 30 }),
        true: weaponTier(42, "攻擊力 42；攻擊速度 +30%，爆擊傷害 +5%。", { attackSpeedBonusPct: 30, critDamageBonusPct: 5 }),
      },
    }),
    defineResonanceItem({
      key: "bronzeTachi",
      displayName: "祭銅太刀",
      rarity: "green",
      category: "weapon",
      icon: "銅",
      resonance: {
        none: weaponTier(27, "攻擊力 27；對「形」階段敵人傷害 +8%。", {}, { shapePhaseAttackBonusPct: 8 }),
        first: weaponTier(33, "攻擊力 33；對「形」階段敵人傷害 +16%。", {}, { shapePhaseAttackBonusPct: 16 }),
        second: weaponTier(39, "攻擊力 39；對「形」階段敵人傷害 +24%。", {}, { shapePhaseAttackBonusPct: 24 }),
        third: weaponTier(45, "攻擊力 45；對「形」階段敵人傷害 +32%。", {}, { shapePhaseAttackBonusPct: 32 }),
        fourth: weaponTier(51, "攻擊力 51；對「形」階段敵人傷害 +40%。", {}, { shapePhaseAttackBonusPct: 40 }),
        true: weaponTier(60, "攻擊力 60；對「形」階段敵人傷害 +40%，爆擊率 +5%。", { critRateBonusPct: 5 }, { shapePhaseAttackBonusPct: 40 }),
      },
    }),
    defineResonanceItem({
      key: "suzuNaginata",
      displayName: "鳴鈴薙刀",
      rarity: "green",
      category: "weapon",
      icon: "薙",
      resonance: {
        none: weaponTier(29, "攻擊力 29；祟抗性 +10%。", { curseResistPct: 10 }),
        first: weaponTier(35, "攻擊力 35；祟抗性 +20%。", { curseResistPct: 20 }),
        second: weaponTier(41, "攻擊力 41；祟抗性 +30%。", { curseResistPct: 30 }),
        third: weaponTier(47, "攻擊力 47；祟抗性 +40%。", { curseResistPct: 40 }),
        fourth: weaponTier(53, "攻擊力 53；祟抗性 +50%。", { curseResistPct: 50 }),
        true: weaponTier(63, "攻擊力 63；祟抗性 +80%。", { curseResistPct: 80 }),
      },
    }),
    defineResonanceItem({
      key: "moonKodachi",
      displayName: "月影小太刀",
      rarity: "blue",
      category: "weapon",
      icon: "月",
      resonance: {
        none: weaponTier(39, "攻擊力 39；遊狀態下傷害 +20%。", { yuuDamageBonusPct: 20 }),
        first: weaponTier(48, "攻擊力 48；遊狀態下傷害 +40%。", { yuuDamageBonusPct: 40 }),
        second: weaponTier(57, "攻擊力 57；遊狀態下傷害 +60%。", { yuuDamageBonusPct: 60 }),
        third: weaponTier(66, "攻擊力 66；遊狀態下傷害 +80%。", { yuuDamageBonusPct: 80 }),
        fourth: weaponTier(75, "攻擊力 75；遊狀態下傷害 +100%。", { yuuDamageBonusPct: 100 }),
        true: weaponTier(90, "攻擊力 90；遊狀態下傷害 +100%，爆擊率 +7%。", { yuuDamageBonusPct: 100, critRateBonusPct: 7 }),
      },
    }),
    defineResonanceItem({
      key: "riftLongBlade",
      displayName: "裂願長刀",
      rarity: "blue",
      category: "weapon",
      icon: "裂",
      resonance: {
        none: weaponTier(36, "攻擊力 36；敵人生命低於 35% 時，攻擊力 +50%。", {}, { enemyHpThresholdAttackBonus: { thresholdPct: 35, attackBonusPct: 50 } }),
        first: weaponTier(45, "攻擊力 45；敵人生命低於 45% 時，攻擊力 +50%。", {}, { enemyHpThresholdAttackBonus: { thresholdPct: 45, attackBonusPct: 50 } }),
        second: weaponTier(54, "攻擊力 54；敵人生命低於 55% 時，攻擊力 +50%。", {}, { enemyHpThresholdAttackBonus: { thresholdPct: 55, attackBonusPct: 50 } }),
        third: weaponTier(63, "攻擊力 63；敵人生命低於 65% 時，攻擊力 +50%。", {}, { enemyHpThresholdAttackBonus: { thresholdPct: 65, attackBonusPct: 50 } }),
        fourth: weaponTier(72, "攻擊力 72；敵人生命低於 75% 時，攻擊力 +50%。", {}, { enemyHpThresholdAttackBonus: { thresholdPct: 75, attackBonusPct: 50 } }),
        true: weaponTier(86, "攻擊力 86；敵人生命低於 75% 時，攻擊力 +50%，爆擊傷害 +50%。", { critDamageBonusPct: 50 }, { enemyHpThresholdAttackBonus: { thresholdPct: 75, attackBonusPct: 50 } }),
      },
    }),
    defineResonanceItem({
      key: "scarletSakuraTachi",
      displayName: "緋櫻太刀",
      rarity: "purple",
      category: "weapon",
      icon: "櫻",
      resonance: {
        none: weaponTier(61, "攻擊力 61；每第三擊釋放小範圍斬擊，造成攻擊力 50% 傷害。", {}, { everyNthAttackWave: { nth: 3, damagePct: 50 } }),
        first: weaponTier(75, "攻擊力 75；每第三擊釋放小範圍斬擊，造成攻擊力 70% 傷害。", {}, { everyNthAttackWave: { nth: 3, damagePct: 70 } }),
        second: weaponTier(89, "攻擊力 89；每第三擊釋放小範圍斬擊，造成攻擊力 90% 傷害。", {}, { everyNthAttackWave: { nth: 3, damagePct: 90 } }),
        third: weaponTier(103, "攻擊力 103；每第三擊釋放小範圍斬擊，造成攻擊力 110% 傷害。", {}, { everyNthAttackWave: { nth: 3, damagePct: 110 } }),
        fourth: weaponTier(117, "攻擊力 117；每第三擊釋放小範圍斬擊，造成攻擊力 130% 傷害。", {}, { everyNthAttackWave: { nth: 3, damagePct: 130 } }),
        true: weaponTier(140, "攻擊力 140；每第三擊釋放小範圍斬擊，造成攻擊力 150% 傷害，爆擊率 +10%。", { critRateBonusPct: 10 }, { everyNthAttackWave: { nth: 3, damagePct: 150 } }),
      },
    }),
    defineResonanceItem({
      key: "formlessBlade",
      displayName: "無相之刃",
      rarity: "purple",
      category: "weapon",
      icon: "相",
      resonance: {
        none: weaponTier(59, "攻擊力 59；對「相」階段的破除速度 +50%。", {}, { phaseBreakSpeedBonus: { phase: "aspect", bonusPct: 50 } }),
        first: weaponTier(73, "攻擊力 73；對「相」階段的破除速度 +55%。", {}, { phaseBreakSpeedBonus: { phase: "aspect", bonusPct: 55 } }),
        second: weaponTier(87, "攻擊力 87；對「相」階段的破除速度 +60%。", {}, { phaseBreakSpeedBonus: { phase: "aspect", bonusPct: 60 } }),
        third: weaponTier(101, "攻擊力 101；對「相」階段的破除速度 +65%。", {}, { phaseBreakSpeedBonus: { phase: "aspect", bonusPct: 65 } }),
        fourth: weaponTier(115, "攻擊力 115；對「相」階段的破除速度 +70%。", {}, { phaseBreakSpeedBonus: { phase: "aspect", bonusPct: 70 } }),
        true: weaponTier(137, "攻擊力 137；對「相」階段的破除速度 +75%，遊狀態下移動速度 +20%。", {}, { phaseBreakSpeedBonus: { phase: "aspect", bonusPct: 75 }, yuuMoveSpeedBonusPct: 20 }),
      },
    }),
    defineResonanceItem({
      key: "severanceNaginata",
      displayName: "斷念薙刀",
      rarity: "gold",
      category: "weapon",
      icon: "斷",
      resonance: {
        none: weaponTier(91, "攻擊力 91；攻擊力加成 +18%。", { attackBonusPct: 18 }),
        first: weaponTier(116, "攻擊力 116；攻擊力加成 +27%。", { attackBonusPct: 27 }),
        second: weaponTier(141, "攻擊力 141；攻擊力加成 +36%。", { attackBonusPct: 36 }),
        third: weaponTier(166, "攻擊力 166；攻擊力加成 +45%。", { attackBonusPct: 45 }),
        fourth: weaponTier(191, "攻擊力 191；攻擊力加成 +54%。", { attackBonusPct: 54 }),
        true: weaponTier(225, "攻擊力 225；攻擊力加成 +60%，爆擊傷害 +50%。", { attackBonusPct: 60, critDamageBonusPct: 50 }),
      },
    }),
    defineResonanceItem({
      key: "tsukishitaHaraiBlade",
      displayName: "月下祓刀",
      rarity: "gold",
      category: "weapon",
      icon: "祓",
      resonance: {
        none: weaponTier(91, "攻擊力 91；戰鬥開始時獲得相當於最大生命 50% 的護盾。", {}, { battleStartShield: { shieldMaxHpPct: 50 } }),
        first: weaponTier(116, "攻擊力 116；戰鬥開始時獲得相當於最大生命 70% 的護盾。", {}, { battleStartShield: { shieldMaxHpPct: 70 } }),
        second: weaponTier(141, "攻擊力 141；戰鬥開始時獲得相當於最大生命 90% 的護盾。", {}, { battleStartShield: { shieldMaxHpPct: 90 } }),
        third: weaponTier(166, "攻擊力 166；戰鬥開始時獲得相當於最大生命 110% 的護盾。", {}, { battleStartShield: { shieldMaxHpPct: 110 } }),
        fourth: weaponTier(191, "攻擊力 191；戰鬥開始時獲得相當於最大生命 130% 的護盾。", {}, { battleStartShield: { shieldMaxHpPct: 130 } }),
        true: weaponTier(225, "攻擊力 225；戰鬥開始時獲得相當於最大生命 150% 的護盾。護盾碎裂時，對執念造成相當於其 50% 防禦力的碎裂傷害。", {}, { battleStartShield: { shieldMaxHpPct: 150, shieldBreakDefenseDamagePct: 50 } }),
      },
    }),
    defineResonanceItem({
      key: "finalMoon",
      displayName: "祓行・終月",
      rarity: "roseGold",
      category: "weapon",
      icon: "終",
      resonance: {
        none: weaponTier(120, "攻擊力 120；在紅圈內連續 10 秒未離場後，每 3 秒攻擊力 +3%。", {}, { circleStayAttackRamp: { staySeconds: 10, intervalSeconds: 3, attackBonusPct: 3 } }),
        first: weaponTier(150, "攻擊力 150；在紅圈內連續 10 秒未離場後，每 3 秒攻擊力 +4%。", {}, { circleStayAttackRamp: { staySeconds: 10, intervalSeconds: 3, attackBonusPct: 4 } }),
        second: weaponTier(180, "攻擊力 180；在紅圈內連續 10 秒未離場後，每 3 秒攻擊力 +5%。", {}, { circleStayAttackRamp: { staySeconds: 10, intervalSeconds: 3, attackBonusPct: 5 } }),
        third: weaponTier(210, "攻擊力 210；在紅圈內連續 10 秒未離場後，每 3 秒攻擊力 +6%。", {}, { circleStayAttackRamp: { staySeconds: 10, intervalSeconds: 3, attackBonusPct: 6 } }),
        fourth: weaponTier(240, "攻擊力 240；在紅圈內連續 10 秒未離場後，每 3 秒攻擊力 +7%。", {}, { circleStayAttackRamp: { staySeconds: 10, intervalSeconds: 3, attackBonusPct: 7 } }),
        true: weaponTier(280, "攻擊力 280；在紅圈內連續 10 秒未離場後，每 3 秒攻擊力 +8%，爆擊傷害 +8%。", { critDamageBonusPct: 8 }, { circleStayAttackRamp: { staySeconds: 10, intervalSeconds: 3, attackBonusPct: 8 } }),
      },
    }),
    defineResonanceItem({
      key: "noWishBlade",
      displayName: "無願之刃",
      rarity: "roseGold",
      category: "weapon",
      icon: "無",
      resonance: {
        none: weaponTier(140, "攻擊力 140；執念攻擊速度與技能頻率降低 10%，玩家免疫執念的攻速干擾。", {}, { enemyActionSlow: { attackSpeedSlowPct: 10, skillRateSlowPct: 10, moveSpeedSlowPct: 10, immuneAttackSpeedInterference: true } }),
        first: weaponTier(170, "攻擊力 170；執念攻擊速度與技能頻率降低 20%，玩家免疫執念的攻速干擾。", {}, { enemyActionSlow: { attackSpeedSlowPct: 20, skillRateSlowPct: 20, moveSpeedSlowPct: 20, immuneAttackSpeedInterference: true } }),
        second: weaponTier(200, "攻擊力 200；執念攻擊速度與技能頻率降低 30%，玩家免疫執念的攻速干擾。", {}, { enemyActionSlow: { attackSpeedSlowPct: 30, skillRateSlowPct: 30, moveSpeedSlowPct: 30, immuneAttackSpeedInterference: true } }),
        third: weaponTier(230, "攻擊力 230；執念攻擊速度與技能頻率降低 40%，玩家免疫執念的攻速干擾。", {}, { enemyActionSlow: { attackSpeedSlowPct: 40, skillRateSlowPct: 40, moveSpeedSlowPct: 40, immuneAttackSpeedInterference: true } }),
        fourth: weaponTier(260, "攻擊力 260；執念攻擊速度與技能頻率降低 50%，玩家免疫執念的攻速干擾。", {}, { enemyActionSlow: { attackSpeedSlowPct: 50, skillRateSlowPct: 50, moveSpeedSlowPct: 50, immuneAttackSpeedInterference: true } }),
        true: weaponTier(280, "攻擊力 280；執念攻擊速度與技能頻率降低 60%，玩家免疫執念的攻速干擾。", {}, { enemyActionSlow: { attackSpeedSlowPct: 60, skillRateSlowPct: 60, moveSpeedSlowPct: 60, immuneAttackSpeedInterference: true } }),
      },
    }),

    defineResonanceItem({
      key: "plainOmamori",
      displayName: "素白御守",
      rarity: "white",
      category: "prayer",
      icon: "守",
      resonance: {
        none: prayerTier("最大生命 +15。", { maxHpFlat: 15 }),
        first: prayerTier("最大生命 +25。", { maxHpFlat: 25 }),
        second: prayerTier("最大生命 +45。", { maxHpFlat: 45 }),
        third: prayerTier("最大生命 +75。", { maxHpFlat: 75 }),
        fourth: prayerTier("最大生命 +135。", { maxHpFlat: 135 }),
        true: prayerTier("最大生命 +235。", { maxHpFlat: 235 }),
      },
    }),
    defineResonanceItem({
      key: "travelerPlaque",
      displayName: "旅人木牌",
      rarity: "white",
      category: "prayer",
      icon: "牌",
      resonance: {
        none: prayerTier("移動速度 +5%。", { moveSpeedBonusPct: 5 }),
        first: prayerTier("移動速度 +10%。", { moveSpeedBonusPct: 10 }),
        second: prayerTier("移動速度 +15%。", { moveSpeedBonusPct: 15 }),
        third: prayerTier("移動速度 +20%。", { moveSpeedBonusPct: 20 }),
        fourth: prayerTier("移動速度 +25%。", { moveSpeedBonusPct: 25 }),
        true: prayerTier("移動速度 +35%。", { moveSpeedBonusPct: 35 }),
      },
    }),
    defineResonanceItem({
      key: "aobaEma",
      displayName: "青葉繪馬",
      rarity: "green",
      category: "prayer",
      icon: "繪",
      resonance: {
        none: prayerTier("戰鬥結束後經驗 +10%，最大生命 +5%。", { expBonusPct: 10, maxHpBonusPct: 5 }),
        first: prayerTier("戰鬥結束後經驗 +15%，最大生命 +10%。", { expBonusPct: 15, maxHpBonusPct: 10 }),
        second: prayerTier("戰鬥結束後經驗 +20%，最大生命 +15%。", { expBonusPct: 20, maxHpBonusPct: 15 }),
        third: prayerTier("戰鬥結束後經驗 +25%，最大生命 +20%。", { expBonusPct: 25, maxHpBonusPct: 20 }),
        fourth: prayerTier("戰鬥結束後經驗 +30%，最大生命 +25%。", { expBonusPct: 30, maxHpBonusPct: 25 }),
        true: prayerTier("戰鬥結束後經驗 +35%，最大生命 +35%。", { expBonusPct: 35, maxHpBonusPct: 35 }),
      },
    }),
    defineResonanceItem({
      key: "smallHaraiBell",
      displayName: "小祓鈴",
      rarity: "green",
      category: "prayer",
      icon: "鈴",
      resonance: {
        none: prayerTier("每 7 秒一次，攻擊後恢復相當於造成傷害 20% 的生命。", {}, { healOnAttack: { cooldownSeconds: 7, healFromDamagePct: 20 } }),
        first: prayerTier("每 7 秒一次，攻擊後恢復相當於造成傷害 30% 的生命。", {}, { healOnAttack: { cooldownSeconds: 7, healFromDamagePct: 30 } }),
        second: prayerTier("每 7 秒一次，攻擊後恢復相當於造成傷害 40% 的生命。", {}, { healOnAttack: { cooldownSeconds: 7, healFromDamagePct: 40 } }),
        third: prayerTier("每 7 秒一次，攻擊後恢復相當於造成傷害 50% 的生命。", {}, { healOnAttack: { cooldownSeconds: 7, healFromDamagePct: 50 } }),
        fourth: prayerTier("每 7 秒一次，攻擊後恢復相當於造成傷害 60% 的生命。", {}, { healOnAttack: { cooldownSeconds: 7, healFromDamagePct: 60 } }),
        true: prayerTier("每 7 秒一次，攻擊後恢復相當於造成傷害 90% 的生命。", {}, { healOnAttack: { cooldownSeconds: 7, healFromDamagePct: 90 } }),
      },
    }),
    defineResonanceItem({
      key: "stillWaterBeads",
      displayName: "靜水念珠",
      rarity: "blue",
      category: "prayer",
      icon: "珠",
      resonance: {
        none: prayerTier("執念移動速度 -10%，並免疫觸碰造成的傷害。", {}, { enemyMoveSpeedSlowPct: 10, touchDamageImmunity: true }),
        first: prayerTier("執念移動速度 -20%，並免疫觸碰造成的傷害。", {}, { enemyMoveSpeedSlowPct: 20, touchDamageImmunity: true }),
        second: prayerTier("執念移動速度 -30%，並免疫觸碰造成的傷害。", {}, { enemyMoveSpeedSlowPct: 30, touchDamageImmunity: true }),
        third: prayerTier("執念移動速度 -40%，並免疫觸碰造成的傷害。", {}, { enemyMoveSpeedSlowPct: 40, touchDamageImmunity: true }),
        fourth: prayerTier("執念移動速度 -50%，並免疫觸碰造成的傷害。", {}, { enemyMoveSpeedSlowPct: 50, touchDamageImmunity: true }),
        true: prayerTier("執念移動速度 -60%，並免疫觸碰造成的傷害。每 15 秒免疫一次傷害。", {}, { enemyMoveSpeedSlowPct: 60, touchDamageImmunity: true, periodicDamageImmunitySeconds: 15 }),
      },
    }),
    defineResonanceItem({
      key: "returnSoulKnot",
      displayName: "返魂結",
      rarity: "blue",
      category: "prayer",
      icon: "結",
      resonance: {
        none: prayerTier("生命低於 25% 時，自動恢復 50% 最大生命，戰鬥中限 1 次。", {}, { autoHealOnLowHp: { thresholdPct: 25, healMaxHpPct: 50, maxTriggers: 1 } }),
        first: prayerTier("生命低於 25% 時，自動恢復 50% 最大生命，戰鬥中限 2 次。", {}, { autoHealOnLowHp: { thresholdPct: 25, healMaxHpPct: 50, maxTriggers: 2 } }),
        second: prayerTier("生命低於 25% 時，自動恢復 50% 最大生命，戰鬥中限 3 次。", {}, { autoHealOnLowHp: { thresholdPct: 25, healMaxHpPct: 50, maxTriggers: 3 } }),
        third: prayerTier("生命低於 25% 時，自動恢復 50% 最大生命，戰鬥中限 4 次。", {}, { autoHealOnLowHp: { thresholdPct: 25, healMaxHpPct: 50, maxTriggers: 4 } }),
        fourth: prayerTier("生命低於 25% 時，自動恢復 50% 最大生命，戰鬥中限 5 次。", {}, { autoHealOnLowHp: { thresholdPct: 25, healMaxHpPct: 50, maxTriggers: 5 } }),
        true: prayerTier("生命低於 25% 時，自動恢復 75% 最大生命，戰鬥中限 5 次。", {}, { autoHealOnLowHp: { thresholdPct: 25, healMaxHpPct: 75, maxTriggers: 5 } }),
      },
    }),
    defineResonanceItem({
      key: "moonSachet",
      displayName: "月見香袋",
      rarity: "purple",
      category: "prayer",
      icon: "香",
      resonance: {
        none: prayerTier("執念進入新階段時，玩家移動速度 +20%。", {}, { phaseTransitionMoveSpeedBonusPct: 20 }),
        first: prayerTier("執念進入新階段時，玩家移動速度 +30%。", {}, { phaseTransitionMoveSpeedBonusPct: 30 }),
        second: prayerTier("執念進入新階段時，玩家移動速度 +40%。", {}, { phaseTransitionMoveSpeedBonusPct: 40 }),
        third: prayerTier("執念進入新階段時，玩家移動速度 +50%。", {}, { phaseTransitionMoveSpeedBonusPct: 50 }),
        fourth: prayerTier("執念進入新階段時，玩家移動速度 +60%。", {}, { phaseTransitionMoveSpeedBonusPct: 60 }),
        true: prayerTier("執念進入新階段後，玩家進入遊狀態直到戰鬥結束；期間遊不消耗勢。", {}, { phaseTransitionMoveSpeedBonusPct: 60, yuuUntilBattleEndOnPhaseShift: true, yuuNoForceDrain: true }),
      },
    }),
    defineResonanceItem({
      key: "obsessionOrb",
      displayName: "破執玉",
      rarity: "purple",
      category: "prayer",
      icon: "玉",
      resonance: {
        none: prayerTier("攻擊力加成 +20%。", { attackBonusPct: 20 }),
        first: prayerTier("攻擊力加成 +30%。", { attackBonusPct: 30 }),
        second: prayerTier("攻擊力加成 +40%。", { attackBonusPct: 40 }),
        third: prayerTier("攻擊力加成 +50%。", { attackBonusPct: 50 }),
        fourth: prayerTier("攻擊力加成 +60%。", { attackBonusPct: 60 }),
        true: prayerTier("攻擊力加成 +70%，爆擊率 +10%。", { attackBonusPct: 70, critRateBonusPct: 10 }),
      },
    }),
    defineResonanceItem({
      key: "kaguraBell",
      displayName: "神樂鈴",
      rarity: "gold",
      category: "prayer",
      icon: "鈴",
      resonance: {
        none: prayerTier("每 3 秒自動產生祓力波動，半徑 80，造成攻擊力 45% 傷害。", {}, { passivePulse: { intervalSeconds: 3, radius: 80, damagePct: 45 } }),
        first: prayerTier("每 3 秒自動產生祓力波動，半徑 85，造成攻擊力 50% 傷害。", {}, { passivePulse: { intervalSeconds: 3, radius: 85, damagePct: 50 } }),
        second: prayerTier("每 3 秒自動產生祓力波動，半徑 90，造成攻擊力 55% 傷害。", {}, { passivePulse: { intervalSeconds: 3, radius: 90, damagePct: 55 } }),
        third: prayerTier("每 3 秒自動產生祓力波動，半徑 95，造成攻擊力 60% 傷害。", {}, { passivePulse: { intervalSeconds: 3, radius: 95, damagePct: 60 } }),
        fourth: prayerTier("每 3 秒自動產生祓力波動，半徑 100，造成攻擊力 65% 傷害。", {}, { passivePulse: { intervalSeconds: 3, radius: 100, damagePct: 65 } }),
        true: prayerTier("每 3 秒自動產生祓力波動，半徑 120，造成攻擊力 70% 傷害。", {}, { passivePulse: { intervalSeconds: 3, radius: 120, damagePct: 70 } }),
      },
    }),
    defineResonanceItem({
      key: "mirrorShard",
      displayName: "御神鏡碎片",
      rarity: "gold",
      category: "prayer",
      icon: "鏡",
      resonance: {
        none: prayerTier("血量歸零時立即恢復滿生命，並獲得 3 秒無敵。", {}, { reviveOnDeath: { reviveHpPct: 100, invulnerabilitySeconds: 3, maxTriggers: 1 } }),
        first: prayerTier("血量歸零時立即恢復滿生命，並獲得 6 秒無敵。", {}, { reviveOnDeath: { reviveHpPct: 100, invulnerabilitySeconds: 6, maxTriggers: 1 } }),
        second: prayerTier("血量歸零時立即恢復滿生命，並獲得 9 秒無敵。", {}, { reviveOnDeath: { reviveHpPct: 100, invulnerabilitySeconds: 9, maxTriggers: 1 } }),
        third: prayerTier("血量歸零時立即恢復滿生命，並獲得 12 秒無敵。", {}, { reviveOnDeath: { reviveHpPct: 100, invulnerabilitySeconds: 12, maxTriggers: 1 } }),
        fourth: prayerTier("血量歸零時立即恢復滿生命，並獲得 12 秒無敵；戰鬥中可觸發 2 次。", {}, { reviveOnDeath: { reviveHpPct: 100, invulnerabilitySeconds: 12, maxTriggers: 2 } }),
        true: prayerTier("血量歸零時立即恢復滿生命，並獲得 12 秒無敵；戰鬥中可觸發 3 次。觸發時釋放半徑 300 的衝擊波，造成攻擊力 300% 傷害。", {}, { reviveOnDeath: { reviveHpPct: 100, invulnerabilitySeconds: 12, maxTriggers: 3, shockwaveRadius: 300, shockwaveDamagePct: 300 } }),
      },
    }),
    defineResonanceItem({
      key: "roseGoldEma",
      displayName: "桜繪馬",
      rarity: "roseGold",
      category: "prayer",
      icon: "桜",
      resonance: {
        none: prayerTier("祈願品質機率：玫瑰金 0.2%，金 0.8%，紫 9%，藍 30%，綠 30%，白 30%。", {}, { shrineWishRateModifier: { roseGold: 0.2, gold: 0.8, purple: 9, blue: 30, green: 30, white: 30 } }),
        first: prayerTier("祈願品質機率：玫瑰金 0.3%，金 1.2%，紫 13.5%，藍 30%，綠 30%，白 25%。", {}, { shrineWishRateModifier: { roseGold: 0.3, gold: 1.2, purple: 13.5, blue: 30, green: 30, white: 25 } }),
        second: prayerTier("祈願品質機率：玫瑰金 0.4%，金 1.6%，紫 18%，藍 30%，綠 30%，白 20%。", {}, { shrineWishRateModifier: { roseGold: 0.4, gold: 1.6, purple: 18, blue: 30, green: 30, white: 20 } }),
        third: prayerTier("祈願品質機率：玫瑰金 0.5%，金 2.0%，紫 22.5%，藍 30%，綠 30%，白 15%。", {}, { shrineWishRateModifier: { roseGold: 0.5, gold: 2.0, purple: 22.5, blue: 30, green: 30, white: 15 } }),
        fourth: prayerTier("祈願品質機率：玫瑰金 0.6%，金 2.4%，紫 27%，藍 30%，綠 30%，白 10%。", {}, { shrineWishRateModifier: { roseGold: 0.6, gold: 2.4, purple: 27, blue: 30, green: 30, white: 10 } }),
        true: prayerTier("祈願品質機率：玫瑰金 0.7%，金 2.8%，紫 31.5%，藍 35%，綠 25%，白 5%。", {}, { shrineWishRateModifier: { roseGold: 0.7, gold: 2.8, purple: 31.5, blue: 35, green: 25, white: 5 } }),
      },
    }),
    defineResonanceItem({
      key: "formlessWishBead",
      displayName: "無相願珠",
      rarity: "roseGold",
      category: "prayer",
      icon: "願",
      resonance: {
        none: prayerTier("「相」與「願」的範圍變成半徑 400，攻擊力加成 +30%。", { attackBonusPct: 30 }, { phaseAreaRadiusModifier: { radius: 400 } }),
        first: prayerTier("「相」與「願」的範圍變成半徑 500，攻擊力加成 +40%。", { attackBonusPct: 40 }, { phaseAreaRadiusModifier: { radius: 500 } }),
        second: prayerTier("「相」與「願」的範圍變成半徑 600，攻擊力加成 +50%。", { attackBonusPct: 50 }, { phaseAreaRadiusModifier: { radius: 600 } }),
        third: prayerTier("「相」與「願」的範圍變成半徑 700，攻擊力加成 +60%。", { attackBonusPct: 60 }, { phaseAreaRadiusModifier: { radius: 700 } }),
        fourth: prayerTier("「相」與「願」的範圍變成半徑 800，攻擊力加成 +70%。", { attackBonusPct: 70 }, { phaseAreaRadiusModifier: { radius: 800 } }),
        true: prayerTier("「相」與「願」的範圍變成半徑 900，攻擊力加成 +80%，爆擊傷害 +20%。", { attackBonusPct: 80, critDamageBonusPct: 20 }, { phaseAreaRadiusModifier: { radius: 900 } }),
      },
    }),

    defineFlatItem({ key: "roughHerb", name: "粗製草藥", rarity: "white", category: "special", icon: "草", effect: "恢復40HP", consumable: true, max: 99, donation: true }),
    defineFlatItem({ key: "clearWaterBamboo", name: "清水竹筒", rarity: "white", category: "special", icon: "水", effect: "減少20%的祟", consumable: true, max: 99, donation: true }),
    defineFlatItem({ key: "haraiPaper", name: "祓紙", rarity: "green", category: "special", icon: "紙", effect: "30秒內傷害+15%", consumable: true, max: 99, donation: true }),
    defineFlatItem({ key: "spiritSalt", name: "靈鹽", rarity: "green", category: "special", icon: "鹽", effect: "讓Boss下一次技能傷害降低90%", consumable: true, max: 99, donation: true }),
    defineFlatItem({ key: "moonDewForce", name: "月露藥・勢", rarity: "green", category: "special", icon: "勢", effect: "恢復50點勢", consumable: true, max: 99, donation: true }),
    defineFlatItem({ key: "evilBreakingTalisman", name: "破邪符", rarity: "blue", category: "special", icon: "符", effect: "立刻打斷小型執念的蓄力並眩暈執念4秒", consumable: true, max: 99, donation: true }),
    defineFlatItem({ key: "shrineSake", name: "神社御酒", rarity: "purple", category: "special", icon: "酒", effect: "恢復大量生命", consumable: true, max: 99, donation: true }),
    defineFlatItem({ key: "calmingIncense", name: "靜心香", rarity: "purple", category: "special", icon: "香", effect: "降低Boss技能頻率40%", consumable: true, max: 99, donation: true }),
    defineFlatItem({ key: "moonPill", name: "月華丹", rarity: "gold", category: "special", icon: "丹", effect: "恢復50%生命並無敵7秒", consumable: true, max: 3, donation: true }),
    defineFlatItem({ key: "returnWishTalisman", name: "返願符", rarity: "roseGold", category: "special", icon: "返", effect: "化解一次相或願階段的執念", consumable: true, max: 3, donation: true }),
    defineFlatItem({ key: "ore", name: "礦石", rarity: "white", category: "special", icon: "礦", effect: "打鐵用的基礎材料。", stackable: true, max: 999999, donation: false }),
    defineFlatItem({ key: "pureIncenseCandle", name: "淨念香燭", rarity: "white", category: "special", icon: "燭", effect: "可在墓碑前結緣，使墓碑成為已解鎖的紀錄物。", consumable: true, max: 99, donation: false, shopInfinite: true }),

    defineFlatItem({ key: "blade", name: "破邪刀", rarity: "white", category: "weapon", icon: "舊", effect: "舊道具：斬擊威力小幅上升", legacy: true, max: 3, damage: 24, damagePerLevel: 0.18 }),
    defineFlatItem({ key: "amulet", name: "鎮祟守", rarity: "white", category: "prayer", icon: "舊", effect: "舊道具：祟累積減緩", legacy: true, max: 3, pollutionReductionPerLevel: 0.16 }),
    defineFlatItem({ key: "armor", name: "守鎧", rarity: "white", category: "special", icon: "舊", effect: "舊道具：受傷減輕", legacy: true, max: 3, armorReductionPerLevel: 0.14 }),
  ];

  const inventoryDefault = Object.fromEntries(items.map((item) => [item.key, item.consumable || item.stackable
    ? { quantity: 0 }
    : { copies: item.initial ? [0] : [] }]));
  const itemMap = Object.fromEntries(items.map((item) => [item.key, item]));

  function getItemResonanceData(itemId, resonanceTier = "none") {
    const item = itemMap[itemId] || null;
    if (!item) return null;
    if (!item.resonance) {
      return {
        id: item.id || item.key,
        key: item.key,
        displayName: item.displayName || item.name,
        name: item.displayName || item.name,
        rarity: item.rarity || "white",
        category: item.category,
        baseDamage: item.category === "weapon" ? Number(item.damage) || 0 : undefined,
        stats: {},
        specialEffects: {},
        playerDescription: item.effect || "無特殊效果",
      };
    }
    const tierKey = normalizeResonanceTierKey(resonanceTier);
    const tierData = item.resonance[tierKey];
    return {
      id: item.id || item.key,
      key: item.key,
      displayName: item.displayName || item.name,
      name: item.displayName || item.name,
      rarity: item.rarity || "white",
      category: item.category,
      icon: item.icon,
      resonanceTier: tierKey,
      resonanceLevel: resonanceTierKeyToLevel[tierKey] || 0,
      resonanceLabel: resonanceTierLabels[tierKey] || resonanceTierLabels.none,
      baseDamage: item.category === "weapon" ? Number(tierData.baseDamage) || 0 : undefined,
      stats: cloneValue(tierData.stats || {}),
      specialEffects: cloneValue(tierData.specialEffects || {}),
      playerDescription: tierData.playerDescription,
    };
  }

  function validateResonanceItems(sourceItems) {
    const errors = [];
    for (const item of sourceItems) {
      if (item.legacy || !["weapon", "prayer"].includes(item.category)) continue;
      if (!item.resonance) {
        errors.push(`${item.name || item.key}: missing resonance data`);
        continue;
      }
      for (const tierKey of resonanceTierOrder) {
        const tier = item.resonance[tierKey];
        if (!tier) {
          errors.push(`${item.name || item.key}: missing resonance tier ${tierKey}`);
          continue;
        }
        if (!tier.playerDescription) errors.push(`${item.name || item.key}: tier ${tierKey} is missing playerDescription`);
        if (item.category === "weapon" && !Number.isFinite(Number(tier.baseDamage))) {
          errors.push(`${item.name || item.key}: tier ${tierKey} is missing baseDamage`);
        }
      }
    }
    return errors;
  }

  const validationErrors = validateResonanceItems(items);
  if (validationErrors.length) {
    throw new Error(`Invalid resonance item data:\n${validationErrors.join("\n")}`);
  }

  return {
    categories,
    equipmentSlots,
    resonance,
    resonanceTierOrder,
    resonanceTierLabels,
    resonanceLevelToTierKey,
    resonanceTierKeyToLevel,
    rarityDisplay,
    items,
    itemMap,
    inventoryDefault,
    getItemResonanceData,
    normalizeResonanceTierKey,
    validateResonanceItems,
    validationErrors,
  };
});
