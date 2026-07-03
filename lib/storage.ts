const BEST_KEY = "typing-ghosts:best-score";

/** Read the best score saved on this device. 0 if none / not in a browser. */
export function getBestScore(): number {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(BEST_KEY);
  return raw ? Number(raw) || 0 : 0;
}

/** Save `score` as the new best if it beats the current one. Returns the resulting best. */
export function saveBestScore(score: number): number {
  const best = getBestScore();
  if (score > best) {
    window.localStorage.setItem(BEST_KEY, String(score));
    return score;
  }
  return best;
}
