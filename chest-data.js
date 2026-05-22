const TSUKISHITA_CHEST_DATA = (() => {
  const dailyCount = 20;

  const spawnPoints = [
    { id: "chest-001", sceneX: -13.37, sceneZ: 1.29, rotation: 6.228, scale: 1.04 },
    { id: "chest-002", sceneX: 14.41, sceneZ: -16.07, rotation: 4.601, scale: 1.106 },
    { id: "chest-003", sceneX: -3.04, sceneZ: -10.13, rotation: 4.148, scale: 1.039 },
    { id: "chest-004", sceneX: 22.23, sceneZ: -1.2, rotation: 0.42, scale: 0.922 },
    { id: "chest-005", sceneX: -17.75, sceneZ: -10.49, rotation: 0.789, scale: 1.004 },
    { id: "chest-006", sceneX: 20.59, sceneZ: -22.35, rotation: 3.878, scale: 0.961 },
    { id: "chest-007", sceneX: -11.43, sceneZ: -11.66, rotation: 2.203, scale: 1.046 },
    { id: "chest-008", sceneX: 11.68, sceneZ: -25.01, rotation: 0.321, scale: 0.901 },
    { id: "chest-009", sceneX: 13.11, sceneZ: 12.74, rotation: 2.297, scale: 1.125 },
    { id: "chest-010", sceneX: -18.27, sceneZ: 2.01, rotation: 0.147, scale: 1.124 },
    { id: "chest-011", sceneX: 27.42, sceneZ: 18.69, rotation: 2.443, scale: 0.964 },
    { id: "chest-012", sceneX: 19.51, sceneZ: -12.48, rotation: 4.564, scale: 1.045 },
    { id: "chest-013", sceneX: -19.43, sceneZ: 4.8, rotation: 2.651, scale: 0.969 },
    { id: "chest-014", sceneX: 8.15, sceneZ: 19.35, rotation: 4.358, scale: 1.125 },
    { id: "chest-015", sceneX: 18.4, sceneZ: -18.87, rotation: 3.846, scale: 0.926 },
    { id: "chest-016", sceneX: -14.23, sceneZ: -3.11, rotation: 5.827, scale: 0.919 },
    { id: "chest-017", sceneX: -6.79, sceneZ: 17.05, rotation: 3.823, scale: 0.98 },
    { id: "chest-018", sceneX: -24.72, sceneZ: -2.55, rotation: 3.14, scale: 1.061 },
    { id: "chest-019", sceneX: -20.48, sceneZ: -0.5, rotation: 3.077, scale: 0.938 },
    { id: "chest-020", sceneX: -21.33, sceneZ: -4.96, rotation: 3.203, scale: 0.965 },
    { id: "chest-021", sceneX: -17.22, sceneZ: 5.48, rotation: 1.953, scale: 1.072 },
    { id: "chest-022", sceneX: -23.64, sceneZ: 7.31, rotation: 4.208, scale: 1.006 },
    { id: "chest-023", sceneX: 27.24, sceneZ: 13.43, rotation: 0.854, scale: 0.923 },
    { id: "chest-024", sceneX: -29.07, sceneZ: 11.5, rotation: 0.063, scale: 0.981 },
    { id: "chest-025", sceneX: -22.63, sceneZ: 13.89, rotation: 0.522, scale: 1.134 },
    { id: "chest-026", sceneX: -17.25, sceneZ: -14.94, rotation: 4.005, scale: 1.036 },
    { id: "chest-027", sceneX: 29.42, sceneZ: -6.1, rotation: 6.222, scale: 1.002 },
    { id: "chest-028", sceneX: 20.95, sceneZ: -8.07, rotation: 3.491, scale: 1.039 },
    { id: "chest-029", sceneX: 16.65, sceneZ: 10.16, rotation: 4.149, scale: 1.093 },
    { id: "chest-030", sceneX: 10.39, sceneZ: 18.74, rotation: 5.609, scale: 1.084 },
    { id: "chest-031", sceneX: 20, sceneZ: 13.21, rotation: 2.306, scale: 0.907 },
    { id: "chest-032", sceneX: -4.49, sceneZ: 17.2, rotation: 5.102, scale: 1.069 },
    { id: "chest-033", sceneX: 2.62, sceneZ: -20.38, rotation: 4.218, scale: 0.964 },
    { id: "chest-034", sceneX: 24.21, sceneZ: 13.59, rotation: 3.661, scale: 0.978 },
    { id: "chest-035", sceneX: -4.55, sceneZ: -21.24, rotation: 3.797, scale: 0.956 },
    { id: "chest-036", sceneX: 25.12, sceneZ: -11.3, rotation: 1.599, scale: 0.935 },
    { id: "chest-037", sceneX: -9.96, sceneZ: -22.21, rotation: 5.121, scale: 1.059 },
    { id: "chest-038", sceneX: -14.26, sceneZ: -12.82, rotation: 4.664, scale: 0.915 },
    { id: "chest-039", sceneX: -29.93, sceneZ: -4.94, rotation: 3.016, scale: 1.032 },
    { id: "chest-040", sceneX: 25.05, sceneZ: 4.69, rotation: 6.035, scale: 0.953 },
    { id: "chest-041", sceneX: -6.44, sceneZ: 21.52, rotation: 2.636, scale: 0.992 },
    { id: "chest-042", sceneX: -9.56, sceneZ: 20.19, rotation: 0.437, scale: 0.905 },
    { id: "chest-043", sceneX: -21.36, sceneZ: 10.37, rotation: 4.585, scale: 1.076 },
    { id: "chest-044", sceneX: -7.29, sceneZ: 27.44, rotation: 3.96, scale: 1.024 },
    { id: "chest-045", sceneX: -11.32, sceneZ: -16.44, rotation: 3.77, scale: 0.912 },
    { id: "chest-046", sceneX: -25.23, sceneZ: -10.83, rotation: 4.791, scale: 0.938 },
    { id: "chest-047", sceneX: 24.77, sceneZ: -14.01, rotation: 5.92, scale: 1.101 },
    { id: "chest-048", sceneX: -9.22, sceneZ: -10.61, rotation: 1.891, scale: 1.027 },
    { id: "chest-049", sceneX: 8.62, sceneZ: 12.96, rotation: 4.965, scale: 0.959 },
    { id: "chest-050", sceneX: 1.25, sceneZ: 16.79, rotation: 0.464, scale: 1.02 },
    { id: "chest-051", sceneX: -8.53, sceneZ: 23.98, rotation: 0.316, scale: 1.084 },
    { id: "chest-052", sceneX: 0.82, sceneZ: 21.85, rotation: 3.7, scale: 1.042 },
    { id: "chest-053", sceneX: 8.44, sceneZ: 24.06, rotation: 0.414, scale: 1.095 },
    { id: "chest-054", sceneX: 0.33, sceneZ: 27.12, rotation: 3.448, scale: 1.105 },
    { id: "chest-055", sceneX: -26.86, sceneZ: 5.3, rotation: 5.446, scale: 1.015 },
    { id: "chest-056", sceneX: -13.49, sceneZ: -5.71, rotation: 2.166, scale: 0.99 },
    { id: "chest-057", sceneX: 8.68, sceneZ: -25.93, rotation: 0.957, scale: 1.01 },
    { id: "chest-058", sceneX: 21.59, sceneZ: 20.46, rotation: 5.304, scale: 0.92 },
    { id: "chest-059", sceneX: -21.62, sceneZ: 2.91, rotation: 3.142, scale: 0.924 },
    { id: "chest-060", sceneX: 27.03, sceneZ: -2.35, rotation: 1.951, scale: 0.939 },
    { id: "chest-061", sceneX: -4.87, sceneZ: -16.66, rotation: 1.054, scale: 1.112 },
    { id: "chest-062", sceneX: 5.23, sceneZ: -24.63, rotation: 4.046, scale: 1.07 },
    { id: "chest-063", sceneX: 4.35, sceneZ: 14.98, rotation: 1.207, scale: 1.009 },
    { id: "chest-064", sceneX: 22.23, sceneZ: -10.85, rotation: 1.056, scale: 1.096 },
    { id: "chest-065", sceneX: -20.42, sceneZ: 8.29, rotation: 1.203, scale: 1.083 },
    { id: "chest-066", sceneX: 16.57, sceneZ: -24.55, rotation: 0.148, scale: 1.132 },
    { id: "chest-067", sceneX: 27.08, sceneZ: 9.52, rotation: 3.938, scale: 1.076 },
    { id: "chest-068", sceneX: -17.28, sceneZ: 8.78, rotation: 4.329, scale: 1.087 },
    { id: "chest-069", sceneX: 19.84, sceneZ: 5.88, rotation: 1.066, scale: 1.086 },
    { id: "chest-070", sceneX: 5.09, sceneZ: 20.9, rotation: 2.852, scale: 1.009 },
    { id: "chest-071", sceneX: -13.72, sceneZ: -22.18, rotation: 0.983, scale: 1.028 },
    { id: "chest-072", sceneX: -26.1, sceneZ: 14.43, rotation: 0.744, scale: 0.998 },
    { id: "chest-073", sceneX: 9.08, sceneZ: -22.79, rotation: 4.303, scale: 1.061 },
    { id: "chest-074", sceneX: 17.92, sceneZ: 19.49, rotation: 3.569, scale: 1.12 },
    { id: "chest-075", sceneX: 25.91, sceneZ: 7.51, rotation: 4.864, scale: 1.008 },
    { id: "chest-076", sceneX: -0.23, sceneZ: -20.12, rotation: 2.001, scale: 0.914 },
    { id: "chest-077", sceneX: 3.58, sceneZ: 25.29, rotation: 4.628, scale: 0.954 },
    { id: "chest-078", sceneX: -26.88, sceneZ: 11.09, rotation: 0.742, scale: 1.034 },
    { id: "chest-079", sceneX: 25.64, sceneZ: -24.19, rotation: 4.283, scale: 0.954 },
    { id: "chest-080", sceneX: 13.54, sceneZ: -18.23, rotation: 3.657, scale: 1.022 },
    { id: "chest-081", sceneX: -1.65, sceneZ: 9.08, rotation: 2.846, scale: 0.947 },
    { id: "chest-082", sceneX: -1.65, sceneZ: 23.92, rotation: 1.296, scale: 1.101 },
    { id: "chest-083", sceneX: -26.16, sceneZ: 17.28, rotation: 4.435, scale: 0.916 },
    { id: "chest-084", sceneX: 5.75, sceneZ: -21.16, rotation: 5.204, scale: 0.977 },
    { id: "chest-085", sceneX: 8.15, sceneZ: 17.01, rotation: 3.376, scale: 1.009 },
    { id: "chest-086", sceneX: -1.9, sceneZ: 19.1, rotation: 1.854, scale: 1.089 },
    { id: "chest-087", sceneX: 10.75, sceneZ: -19.54, rotation: 3.173, scale: 0.941 },
    { id: "chest-088", sceneX: -24.43, sceneZ: 2.52, rotation: 6.033, scale: 1.002 },
    { id: "chest-089", sceneX: 6.3, sceneZ: 26.76, rotation: 4.163, scale: 0.971 },
    { id: "chest-090", sceneX: -13.94, sceneZ: 19.44, rotation: 1.157, scale: 1.073 },
    { id: "chest-091", sceneX: 25.88, sceneZ: -18.23, rotation: 2.339, scale: 0.95 },
    { id: "chest-092", sceneX: 21.46, sceneZ: -16.2, rotation: 4.795, scale: 1.065 },
    { id: "chest-093", sceneX: 24.89, sceneZ: 18.18, rotation: 1.049, scale: 1.01 },
    { id: "chest-094", sceneX: 0.74, sceneZ: 9.9, rotation: 2.998, scale: 1.093 },
    { id: "chest-095", sceneX: 24.84, sceneZ: 0.44, rotation: 4.858, scale: 1.134 },
    { id: "chest-096", sceneX: -27.26, sceneZ: -6.53, rotation: 3.327, scale: 1.038 },
    { id: "chest-097", sceneX: 19.48, sceneZ: -25.42, rotation: 0.998, scale: 0.923 },
    { id: "chest-098", sceneX: 0.56, sceneZ: -17.64, rotation: 0.296, scale: 0.952 },
    { id: "chest-099", sceneX: -13.86, sceneZ: -10.27, rotation: 5.662, scale: 1.028 },
    { id: "chest-100", sceneX: -7.27, sceneZ: -24.74, rotation: 4.127, scale: 1.032 },
  ];

  function currentDayKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function hashDayKey(dayKey) {
    let hash = 2166136261;
    for (let index = 0; index < dayKey.length; index += 1) {
      hash ^= dayKey.charCodeAt(index);
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

  function activeChestIdsForDay(dayKey = currentDayKey()) {
    const pool = spawnPoints.map((point) => point.id);
    const rng = makeSeededRng(hashDayKey(dayKey));
    for (let index = pool.length - 1; index > 0; index -= 1) {
      const pick = Math.floor(rng() * (index + 1));
      [pool[index], pool[pick]] = [pool[pick], pool[index]];
    }
    return pool.slice(0, dailyCount);
  }

  return {
    dailyCount,
    spawnPoints,
    spawnMap: Object.fromEntries(spawnPoints.map((point) => [point.id, point])),
    currentDayKey,
    activeChestIdsForDay,
  };
})();

if (typeof globalThis !== "undefined") globalThis.TSUKISHITA_CHEST_DATA = TSUKISHITA_CHEST_DATA;
if (typeof window !== "undefined") window.TSUKISHITA_CHEST_DATA = TSUKISHITA_CHEST_DATA;
if (typeof module !== "undefined" && module.exports) module.exports = TSUKISHITA_CHEST_DATA;
