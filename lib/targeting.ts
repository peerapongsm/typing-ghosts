import { matchNextChar, toGraphemes } from "./match";

export interface Ghost {
  id: string;
  word: string;
  /** Distance to the shrine — smaller means nearer. */
  distance: number;
}

export interface TargetingState {
  targetId: string | null;
  progress: number;
}

export interface TargetingResult {
  targetId: string | null;
  progress: number;
  completed: boolean;
}

/**
 * Feed one typed grapheme into the targeting state machine.
 *
 * - No target locked: the first grapheme that matches the start of an
 *   on-screen ghost's word locks that ghost as the target. If several
 *   ghosts share that first grapheme, the nearest one (smallest
 *   `distance`) is locked (spec §1 tiebreak).
 * - Target locked: the grapheme is matched against the target's next
 *   expected grapheme. A wrong grapheme does not reset progress
 *   (spec §1/§5). Completing the word returns `completed: true`; the
 *   caller is expected to remove the ghost and call
 *   `resetAfterComplete()` to unlock for the next target.
 * - If the locked ghost is no longer present (e.g. it already reached
 *   the shrine), the state falls back to unlocked and re-evaluates the
 *   keystroke as a fresh lock attempt.
 */
export function handleInput(
  ghosts: Ghost[],
  state: TargetingState,
  input: string
): TargetingResult {
  const target = state.targetId ? ghosts.find((g) => g.id === state.targetId) : undefined;

  if (!target) {
    return lockNewTarget(ghosts, input);
  }

  const result = matchNextChar(target.word, state.progress, input);
  return { targetId: target.id, progress: result.progress, completed: result.complete };
}

function lockNewTarget(ghosts: Ghost[], input: string): TargetingResult {
  const normalized = input.normalize("NFC");
  const candidates = ghosts.filter((g) => toGraphemes(g.word)[0] === normalized);

  if (candidates.length === 0) {
    return { targetId: null, progress: 0, completed: false };
  }

  const nearest = candidates.reduce((closest, g) =>
    g.distance < closest.distance ? g : closest
  );

  const result = matchNextChar(nearest.word, 0, input);
  return { targetId: nearest.id, progress: result.progress, completed: result.complete };
}

/** State to return to after a word is completed, ready to lock the next target. */
export function resetAfterComplete(): TargetingState {
  return { targetId: null, progress: 0 };
}
