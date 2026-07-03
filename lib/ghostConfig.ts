import type { GhostType } from "./types";

export interface GhostConfig {
  label: string;
  /** ms to travel from spawn edge to the shrine. */
  duration: number;
  /** CSS color used for the ghost's word/name label. */
  accent: string;
}

export const GHOST_CONFIG: Record<GhostType, GhostConfig> = {
  krasue: { label: "กระสือ", duration: 6000, accent: "#ff8fd6" },
  krahang: { label: "กระหัง", duration: 9000, accent: "#8fc7ff" },
  phitabo: { label: "ผีตาโบ๋", duration: 13000, accent: "#c9b6ff" },
  phipret: { label: "ผีเปรต", duration: 8000, accent: "#ffd28f" },
  maenak: { label: "แม่นาค", duration: 18000, accent: "#ff8f8f" },
};
