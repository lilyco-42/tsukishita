(function (root, factory) {
  const progression = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = progression;
  } else {
    root.TSUKISHITA_PROGRESSION = progression;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const stageNames = ["初段", "二段", "三段", "四段", "五段", "六段", "七段", "八段", "九段", "十段"];
  const plaqueExperience = {
    "(無)": 0,
    荒壱: 5,
    荒弐: 10,
    澄壱: 20,
    澄弐: 30,
    巧壱: 50,
    巧弐: 60,
    妙壱: 80,
    妙弐: 90,
    粋壱: 110,
    粋弐: 130,
    雅壱: 170,
    雅弐: 190,
    極: 300,
  };

  const pathRequirements = [
    ["荒", 1, 0],
    ["荒", 2, 10],
    ["荒", 3, 30],
    ["荒", 4, 100],
    ["荒", 5, 300],
    ["荒", 6, 500],
    ["荒", 7, 700],
    ["荒", 8, 900],
    ["荒", 9, 1100],
    ["荒", 10, 1300],
    ["澄", 1, 2000],
    ["澄", 2, 2400],
    ["澄", 3, 2800],
    ["澄", 4, 3200],
    ["澄", 5, 3600],
    ["澄", 6, 4000],
    ["澄", 7, 4400],
    ["澄", 8, 4800],
    ["澄", 9, 5200],
    ["澄", 10, 5600],
    ["巧", 1, 6000],
    ["巧", 2, 6600],
    ["巧", 3, 7200],
    ["巧", 4, 7800],
    ["巧", 5, 8400],
    ["巧", 6, 9000],
    ["巧", 7, 9600],
    ["巧", 8, 10200],
    ["巧", 9, 10800],
    ["巧", 10, 11400],
    ["妙", 1, 14000],
    ["妙", 2, 15000],
    ["妙", 3, 16000],
    ["妙", 4, 17000],
    ["妙", 5, 18000],
    ["妙", 6, 19000],
    ["妙", 7, 20000],
    ["妙", 8, 21000],
    ["妙", 9, 22000],
    ["妙", 10, 23000],
    ["粋", 1, 28000],
    ["粋", 2, 29600],
    ["粋", 3, 31200],
    ["粋", 4, 32800],
    ["粋", 5, 34400],
    ["粋", 6, 36000],
    ["粋", 7, 37600],
    ["粋", 8, 39200],
    ["粋", 9, 40800],
    ["粋", 10, 42400],
    ["雅", 1, 50000],
    ["雅", 2, 53500],
    ["雅", 3, 57000],
    ["雅", 4, 60500],
    ["雅", 5, 64000],
    ["雅", 6, 67500],
    ["雅", 7, 71000],
    ["雅", 8, 74500],
    ["雅", 9, 78000],
    ["雅", 10, 81500],
    ["極", 1, 110000],
    ["極", 2, 120000],
    ["極", 3, 130000],
    ["極", 4, 140000],
    ["極", 5, 150000],
    ["極", 6, 160000],
    ["極", 7, 170000],
    ["極", 8, 180000],
    ["極", 9, 190000],
    ["極", 10, 200000],
  ].map(([realm, level, required], index) => ({
    realm,
    level,
    required,
    index,
    label: `${realm}・${stageNames[level - 1]}`,
  }));

  function normalizeExperience(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return 0;
    return Math.max(0, Math.floor(numeric));
  }

  function requiredForPathRank(rank) {
    const found = pathRequirements.find((entry) => entry.label === rank);
    return found ? found.required : 0;
  }

  function rankAtExperience(experience) {
    const totalExp = normalizeExperience(experience);
    let current = pathRequirements[0];
    for (const entry of pathRequirements) {
      if (entry.required > totalExp) break;
      current = entry;
    }
    return current;
  }

  function progressForExperience(experience) {
    const totalExp = normalizeExperience(experience);
    const current = rankAtExperience(totalExp);
    const next = pathRequirements[current.index + 1] || null;
    const currentRequired = current.required;
    const nextRequired = next ? next.required : current.required;
    const levelRequired = next ? nextRequired - currentRequired : 0;
    const levelExp = next ? Math.max(0, totalExp - currentRequired) : 0;
    const progress = next && levelRequired > 0 ? Math.min(1, levelExp / levelRequired) : 1;

    return {
      totalExp,
      rank: current.label,
      rankIndex: current.index,
      currentRequired,
      nextRank: next ? next.label : current.label,
      nextRequired,
      levelExp,
      levelRequired,
      progress,
      maxed: !next,
    };
  }

  function progressForAccount(account) {
    if (!account) return progressForExperience(0);
    if (Number.isFinite(Number(account.experience))) {
      return progressForExperience(account.experience);
    }
    return progressForExperience(requiredForPathRank(account.pathRank));
  }

  function expForPlaque(rankName, victory) {
    if (!victory) return plaqueExperience["(無)"];
    return plaqueExperience[rankName] ?? plaqueExperience["(無)"];
  }

  return {
    plaqueExperience,
    pathRequirements,
    expForPlaque,
    normalizeExperience,
    progressForAccount,
    progressForExperience,
    rankAtExperience,
    requiredForPathRank,
  };
});
