import { describe, it, expect } from "vitest";
import { handleInput, type Ghost, type TargetingState } from "@/lib/targeting";

function ghost(id: string, word: string, distance: number): Ghost {
  return { id, word, distance };
}

const noTarget: TargetingState = { targetId: null, progress: 0 };

describe("handleInput — locking a target", () => {
  it("locks the nearest ghost when several share the same first character", () => {
    const ghosts = [
      ghost("far", "กระต่าย", 500),
      ghost("near", "กระเป๋า", 120),
      ghost("mid", "กบ", 300),
    ];
    const result = handleInput(ghosts, noTarget, "ก");
    expect(result.targetId).toBe("near");
    expect(result.progress).toBe(1);
    expect(result.completed).toBe(false);
  });

  it("does nothing when the typed char matches no ghost's first letter", () => {
    const ghosts = [ghost("a", "แมว", 200)];
    const result = handleInput(ghosts, noTarget, "z");
    expect(result.targetId).toBeNull();
    expect(result.progress).toBe(0);
  });

  it("ignores untargeted ghosts and only considers the first grapheme", () => {
    const ghosts = [ghost("a", "หมา", 200), ghost("b", "หมู", 50)];
    const result = handleInput(ghosts, noTarget, "ห");
    expect(result.targetId).toBe("b"); // nearer of the two matching "ห"
  });
});

describe("handleInput — typing a locked target", () => {
  it("advances progress on a correct next grapheme", () => {
    const ghosts = [ghost("a", "น้ำ", 200)];
    const locked: TargetingState = { targetId: "a", progress: 1 };
    const result = handleInput(ghosts, locked, "้");
    expect(result).toEqual({ targetId: "a", progress: 2, completed: false });
  });

  it("does not reset progress on a wrong keystroke while locked", () => {
    const ghosts = [ghost("a", "น้ำ", 200)];
    const locked: TargetingState = { targetId: "a", progress: 1 };
    const result = handleInput(ghosts, locked, "x");
    expect(result).toEqual({ targetId: "a", progress: 1, completed: false });
  });

  it("marks completed and keeps targetId when the final grapheme lands", () => {
    const ghosts = [ghost("a", "น้ำ", 200)];
    const locked: TargetingState = { targetId: "a", progress: 2 };
    const result = handleInput(ghosts, locked, "ำ");
    expect(result).toEqual({ targetId: "a", progress: 3, completed: true });
  });

  it("if the locked ghost is gone, unlocks and re-evaluates the keystroke as a fresh lock attempt", () => {
    const ghosts = [ghost("b", "บ้าน", 90)];
    const locked: TargetingState = { targetId: "missing", progress: 1 };
    const result = handleInput(ghosts, locked, "บ");
    expect(result.targetId).toBe("b");
    expect(result.progress).toBe(1);
  });
});

describe("nextState helper — switching target after completion", () => {
  it("resets to no target after a completed word", async () => {
    const { resetAfterComplete } = await import("@/lib/targeting");
    expect(resetAfterComplete()).toEqual({ targetId: null, progress: 0 });
  });
});
