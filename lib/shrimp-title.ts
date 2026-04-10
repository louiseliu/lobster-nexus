const FLAVORS = [
  "蒜蓉", "麻辣", "十三香", "芝士", "黑胡椒",
  "冰镇", "爆炒", "清蒸", "油焖", "椒盐",
  "咖喱", "酱爆", "葱烧", "糖醋", "烧烤",
  "白灼", "避风塘", "奶油", "藤椒", "酸菜",
] as const;

const PERSONALITIES = [
  "暴走", "佛系", "社恐", "话痨", "卷王",
  "摸鱼", "干饭", "追梦", "躺平", "内卷",
  "凡尔赛", "显眼包", "i人", "e人", "脆皮",
  "养生", "夜猫", "早起", "氛围感", "松弛",
] as const;

const SHRIMP_RANKS = [
  "虾将", "虾兵", "虾仙", "虾侠", "虾帝",
  "虾圣", "虾神", "虾王", "虾霸", "虾童",
] as const;

export type ShrimpRarity = "N" | "R" | "SR" | "SSR";

const RARITY_CONFIG: Record<ShrimpRarity, { label: string; color: string; glow: string; bg: string }> = {
  N:   { label: "普通",   color: "#636E72", glow: "none",                                    bg: "rgba(99,110,114,0.08)" },
  R:   { label: "稀有",   color: "#0984E3", glow: "0 0 8px rgba(9,132,227,0.3)",              bg: "rgba(9,132,227,0.08)" },
  SR:  { label: "超稀有", color: "#6C5CE7", glow: "0 0 12px rgba(108,92,231,0.4)",             bg: "rgba(108,92,231,0.08)" },
  SSR: { label: "传说",   color: "#FDCB6E", glow: "0 0 16px rgba(253,203,110,0.5), 0 0 32px rgba(253,203,110,0.2)", bg: "linear-gradient(135deg, rgba(253,203,110,0.12), rgba(225,112,85,0.08))" },
};

const SSR_COMBOS = new Set([
  "避风塘·卷王·虾帝",
  "十三香·显眼包·虾神",
  "麻辣·暴走·虾霸",
  "冰镇·佛系·虾圣",
  "蒜蓉·干饭·虾王",
  "芝士·凡尔赛·虾帝",
  "咖喱·追梦·虾神",
  "藤椒·e人·虾霸",
]);

const SR_RANKS = new Set(["虾帝", "虾圣", "虾神"]);
const SR_PERSONALITIES = new Set(["显眼包", "凡尔赛", "暴走"]);

function simpleHash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function getRarity(title: string, rank: string, personality: string): ShrimpRarity {
  if (SSR_COMBOS.has(title)) return "SSR";
  if (SR_RANKS.has(rank) && SR_PERSONALITIES.has(personality)) return "SR";
  if (SR_RANKS.has(rank) || SR_PERSONALITIES.has(personality)) return "R";
  return "N";
}

export interface ShrimpTitleResult {
  title: string;
  rarity: ShrimpRarity;
  rarityLabel: string;
  rarityColor: string;
  rarityGlow: string;
  rarityBg: string;
}

/**
 * 基于种子字符串（手机号或用户ID）确定性地生成虾宝花名。
 * 同一个种子永远返回相同的花名和稀有度。
 */
export function generateShrimpTitle(seed: string): string {
  const h = simpleHash(seed);
  const flavorIdx = h % FLAVORS.length;
  const personalityIdx = Math.floor(h / FLAVORS.length) % PERSONALITIES.length;
  const rankIdx = Math.floor(h / (FLAVORS.length * PERSONALITIES.length)) % SHRIMP_RANKS.length;

  return `${FLAVORS[flavorIdx]}·${PERSONALITIES[personalityIdx]}·${SHRIMP_RANKS[rankIdx]}`;
}

export function parseShrimpTitle(title: string): ShrimpTitleResult {
  const parts = title.split("·");
  const personality = parts[1] || "";
  const rank = parts[2] || "";
  const rarity = getRarity(title, rank, personality);
  const config = RARITY_CONFIG[rarity];

  return {
    title,
    rarity,
    rarityLabel: config.label,
    rarityColor: config.color,
    rarityGlow: config.glow,
    rarityBg: config.bg,
  };
}
