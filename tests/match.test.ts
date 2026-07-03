import { describe, it, expect } from "vitest";
import { toGraphemes, matchNextChar } from "@/lib/match";

describe("toGraphemes", () => {
  it("splits น้ำ into น, ้, ำ in order", () => {
    expect(toGraphemes("น้ำ")).toEqual(["น", "้", "ำ"]);
  });

  it("normalizes to NFC before segmenting", () => {
    // decomposed form (base + combining mark) should segment the same as
    // the precomposed/NFC form.
    const decomposed = "น" + "้" + "ำ"; // already NFC-safe Thai combos
    expect(toGraphemes(decomposed)).toEqual(["น", "้", "ำ"]);
  });
});

describe("matchNextChar", () => {
  it("advances progress one grapheme at a time in order for น้ำ", () => {
    const word = "น้ำ";
    let r = matchNextChar(word, 0, "น");
    expect(r).toEqual({ progress: 1, correct: true, complete: false });

    r = matchNextChar(word, r.progress, "้");
    expect(r).toEqual({ progress: 2, correct: true, complete: false });

    r = matchNextChar(word, r.progress, "ำ");
    expect(r).toEqual({ progress: 3, correct: true, complete: true });
  });

  it("does NOT reset progress on a wrong character", () => {
    const word = "น้ำ";
    let r = matchNextChar(word, 0, "น");
    expect(r.progress).toBe(1);

    // wrong char: should not reset progress back to 0
    r = matchNextChar(word, r.progress, "x");
    expect(r).toEqual({ progress: 1, correct: false, complete: false });

    // player retries with the correct next grapheme, continues from where they left off
    r = matchNextChar(word, r.progress, "้");
    expect(r).toEqual({ progress: 2, correct: true, complete: false });
  });

  it("reports complete once all graphemes are matched", () => {
    const word = "แมว";
    let progress = 0;
    for (const g of ["แ", "ม", "ว"]) {
      const r = matchNextChar(word, progress, g);
      progress = r.progress;
    }
    expect(progress).toBe(3);
    expect(matchNextChar(word, progress, "ก").complete).toBe(true);
  });

  it("returns complete:true and does not advance past word length", () => {
    const word = "ไก่";
    const graphemes = toGraphemes(word);
    let progress = 0;
    for (const g of graphemes) {
      progress = matchNextChar(word, progress, g).progress;
    }
    const r = matchNextChar(word, progress, "ก");
    expect(r).toEqual({ progress: graphemes.length, correct: false, complete: true });
  });
});
