import { describe, it, expect } from "vitest";
import {
  mulberry32,
  wordSetsForWave,
  generateWaveSchedule,
} from "@/lib/wave";
import type { WordBank } from "@/lib/types";

const bank: WordBank = {
  basic: ["กก", "ขา", "งู", "ปู", "มด", "แมว", "ไก่", "หมา", "บ้าน", "รถ"],
  common: [
    "อากาศ",
    "โรงเรียน",
    "ตลาดสด",
    "รถเมล์",
    "กระเป๋า",
    "โทรศัพท์",
    "คอมพิวเตอร์",
    "อาหารเช้า",
  ],
  hard: [
    "น้ำ",
    "เกี๊ยว",
    "กระเพรา",
    "เศรษฐกิจ",
    "พรรณไม้",
    "ผลไม้",
    "สังเกต",
    "ตำแหน่ง",
  ],
};

describe("mulberry32", () => {
  it("is deterministic for a given seed", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const seqA = [a(), a(), a()];
    const seqB = [b(), b(), b()];
    expect(seqA).toEqual(seqB);
  });

  it("produces different sequences for different seeds", () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    expect(a()).not.toBe(b());
  });

  it("stays within [0, 1)", () => {
    const rand = mulberry32(7);
    for (let i = 0; i < 100; i++) {
      const v = rand();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe("wordSetsForWave", () => {
  it("uses the basic set for waves 1-3", () => {
    expect(wordSetsForWave(1)).toEqual(["basic"]);
    expect(wordSetsForWave(3)).toEqual(["basic"]);
  });

  it("uses the common set for waves 4-6", () => {
    expect(wordSetsForWave(4)).toEqual(["common"]);
    expect(wordSetsForWave(6)).toEqual(["common"]);
  });

  it("mixes all three sets from wave 7 onward", () => {
    expect(wordSetsForWave(7)).toEqual(["basic", "common", "hard"]);
    expect(wordSetsForWave(20)).toEqual(["basic", "common", "hard"]);
  });
});

describe("generateWaveSchedule", () => {
  it("is deterministic for the same wave + seed", () => {
    const s1 = generateWaveSchedule(1, 123, bank);
    const s2 = generateWaveSchedule(1, 123, bank);
    expect(s1).toEqual(s2);
  });

  it("produces a different schedule for a different seed", () => {
    const s1 = generateWaveSchedule(1, 123, bank);
    const s2 = generateWaveSchedule(1, 456, bank);
    expect(s1).not.toEqual(s2);
  });

  it("spawns events with strictly increasing time offsets", () => {
    const events = generateWaveSchedule(2, 1, bank);
    for (let i = 1; i < events.length; i++) {
      expect(events[i].time).toBeGreaterThan(events[i - 1].time);
    }
  });

  it("ends every wave with a แม่นาค boss carrying a multi-word chain", () => {
    const events = generateWaveSchedule(3, 99, bank);
    const boss = events[events.length - 1];
    expect(boss.ghostType).toBe("maenak");
    expect(boss.words.length).toBeGreaterThanOrEqual(2);
  });

  it("only uses words from the basic set in wave 1", () => {
    const events = generateWaveSchedule(1, 5, bank);
    const basicSet = new Set(bank.basic);
    for (const e of events) {
      for (const w of e.words) {
        // basic wave: every non-boss word must come from the basic pool;
        // the boss also draws from the same wave pool.
        expect(basicSet.has(w)).toBe(true);
      }
    }
  });
});
