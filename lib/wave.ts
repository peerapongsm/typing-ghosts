import type { GhostType, WordBank, WordSetName } from "./types";
import { toGraphemes } from "./match";

/**
 * mulberry32 — small, fast, seeded PRNG. Same seed always produces the
 * same sequence, which is what makes wave spawn schedules reproducible
 * (needed for tests and for fair "practice this wave again" replays).
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Word-set progression (spec §3): waves 1-3 draw from the basic set,
 * 4-6 from the common set, and 7+ mix all three sets together.
 */
export function wordSetsForWave(wave: number): WordSetName[] {
  if (wave <= 3) return ["basic"];
  if (wave <= 6) return ["common"];
  return ["basic", "common", "hard"];
}

/** Ghost count ramps up a little every wave. */
export function ghostCountForWave(wave: number): number {
  return 5 + wave * 2;
}

const NON_BOSS_TYPES: GhostType[] = ["krasue", "krahang", "phitabo", "phipret"];
const SPAWN_INTERVAL_MS = 1500;

export interface SpawnEvent {
  time: number;
  ghostType: GhostType;
  /** Words to type in order. Length 1 for normal ghosts, 2+ for the boss chain. */
  words: string[];
}

function poolForWave(wave: number, bank: WordBank): string[] {
  const sets = wordSetsForWave(wave);
  const pool = sets.flatMap((s) => bank[s]);
  return Array.from(new Set(pool));
}

/**
 * Pick a word matching a ghost type's character (spec §2): กระสือ is
 * fast with short words, ผีตาโบ๋/ผีเปรต/แม่นาค lean toward long or
 * tone-mark-heavy words, กระหัง sits in the middle. Word banks are
 * bucketed by grapheme length as a length-based proxy for difficulty.
 */
function pickWordForType(ghostType: GhostType, pool: string[], rand: () => number): string {
  const sorted = [...pool].sort((a, b) => toGraphemes(a).length - toGraphemes(b).length);
  const third = Math.max(1, Math.floor(sorted.length / 3));

  let bucket: string[];
  if (ghostType === "krasue") {
    bucket = sorted.slice(0, third);
  } else if (ghostType === "phitabo" || ghostType === "phipret" || ghostType === "maenak") {
    bucket = sorted.slice(sorted.length - third);
  } else {
    bucket = sorted.slice(third, sorted.length - third) ;
  }
  if (bucket.length === 0) bucket = sorted;

  const idx = Math.floor(rand() * bucket.length);
  return bucket[idx];
}

/** Generate a deterministic spawn schedule for one wave. */
export function generateWaveSchedule(wave: number, seed: number, bank: WordBank): SpawnEvent[] {
  const rand = mulberry32(seed + wave * 1000);
  const pool = poolForWave(wave, bank);
  const count = ghostCountForWave(wave);

  const events: SpawnEvent[] = [];
  for (let i = 0; i < count; i++) {
    const ghostType = NON_BOSS_TYPES[Math.floor(rand() * NON_BOSS_TYPES.length)];
    const word = pickWordForType(ghostType, pool, rand);
    events.push({ time: i * SPAWN_INTERVAL_MS, ghostType, words: [word] });
  }

  // Every wave ends with a แม่นาค boss carrying a multi-word chain (spec §2).
  const bossWords = [
    pickWordForType("maenak", pool, rand),
    pickWordForType("maenak", pool, rand),
  ];
  events.push({
    time: count * SPAWN_INTERVAL_MS + 1000,
    ghostType: "maenak",
    words: bossWords,
  });

  return events;
}
