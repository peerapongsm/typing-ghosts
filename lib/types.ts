export type GhostType = "krasue" | "krahang" | "phitabo" | "maenak" | "phipret";

export type WordSetName = "basic" | "common" | "hard";

export interface WordBank {
  basic: string[];
  common: string[];
  hard: string[];
}
