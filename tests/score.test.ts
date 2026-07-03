import { describe, it, expect } from "vitest";
import {
  initScore,
  onWordComplete,
  onHit,
  computeWpm,
  computeAccuracy,
} from "@/lib/score";

describe("initScore", () => {
  it("starts at zero", () => {
    expect(initScore()).toEqual({
      score: 0,
      combo: 0,
      bestCombo: 0,
      correctKeystrokes: 0,
      totalKeystrokes: 0,
    });
  });
});

describe("onWordComplete", () => {
  it("increases score by word length times combo streak", () => {
    const s0 = initScore();
    const s1 = onWordComplete(s0, 3); // combo becomes 1
    expect(s1.combo).toBe(1);
    expect(s1.score).toBeGreaterThan(0);

    const s2 = onWordComplete(s1, 3); // combo becomes 2, should score more than s1's word alone
    expect(s2.combo).toBe(2);
    expect(s2.score).toBeGreaterThan(s1.score);
  });

  it("tracks the best combo streak reached", () => {
    let s = initScore();
    s = onWordComplete(s, 2);
    s = onWordComplete(s, 2);
    s = onWordComplete(s, 2);
    expect(s.combo).toBe(3);
    expect(s.bestCombo).toBe(3);

    s = onHit(s);
    expect(s.combo).toBe(0);
    expect(s.bestCombo).toBe(3); // best combo persists after a break
  });
});

describe("onHit — combo breaks only when a ghost reaches the shrine", () => {
  it("resets combo to 0", () => {
    let s = initScore();
    s = onWordComplete(s, 4);
    s = onWordComplete(s, 4);
    expect(s.combo).toBe(2);

    s = onHit(s);
    expect(s.combo).toBe(0);
    expect(s.score).toBeGreaterThan(0); // score itself is not wiped, only combo
  });
});

describe("computeWpm", () => {
  it("computes standard words-per-minute (chars / 5 / minutes)", () => {
    // 100 correct characters typed in exactly 1 minute = 20 WPM
    expect(computeWpm(100, 60_000)).toBeCloseTo(20, 5);
  });

  it("returns 0 for zero elapsed time", () => {
    expect(computeWpm(50, 0)).toBe(0);
  });
});

describe("computeAccuracy", () => {
  it("computes percentage of correct keystrokes", () => {
    expect(computeAccuracy(80, 100)).toBe(80);
  });

  it("returns 100 when no keystrokes have been made yet", () => {
    expect(computeAccuracy(0, 0)).toBe(100);
  });
});
