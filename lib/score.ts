/**
 * Score/combo/WPM/accuracy tracking (spec §1, §5, §6).
 *
 * Score formula: คะแนน = คำ × ความยาว + combo streak (word length times a
 * base value, plus a bonus that scales with the current combo streak).
 * Combo only breaks when the player is "hit" — i.e. a ghost reaches the
 * shrine and a heart is lost — never on a mistyped keystroke.
 */

export interface ScoreState {
  score: number;
  combo: number;
  bestCombo: number;
  correctKeystrokes: number;
  totalKeystrokes: number;
}

const POINTS_PER_CHAR = 10;
const COMBO_BONUS_PER_STREAK = 5;

export function initScore(): ScoreState {
  return { score: 0, combo: 0, bestCombo: 0, correctKeystrokes: 0, totalKeystrokes: 0 };
}

/** Award points for completing a word of `wordLength` graphemes. */
export function onWordComplete(state: ScoreState, wordLength: number): ScoreState {
  const combo = state.combo + 1;
  const points = wordLength * POINTS_PER_CHAR + combo * COMBO_BONUS_PER_STREAK;
  return {
    ...state,
    score: state.score + points,
    combo,
    bestCombo: Math.max(state.bestCombo, combo),
  };
}

/** A ghost reached the shrine — break the combo, keep the score. */
export function onHit(state: ScoreState): ScoreState {
  return { ...state, combo: 0 };
}

/** Record one keystroke for accuracy tracking. */
export function onKeystroke(state: ScoreState, correct: boolean): ScoreState {
  return {
    ...state,
    correctKeystrokes: state.correctKeystrokes + (correct ? 1 : 0),
    totalKeystrokes: state.totalKeystrokes + 1,
  };
}

/** Standard WPM: (correct characters / 5) / minutes elapsed. */
export function computeWpm(correctChars: number, elapsedMs: number): number {
  if (elapsedMs <= 0) return 0;
  const minutes = elapsedMs / 60_000;
  return correctChars / 5 / minutes;
}

/** Percentage of keystrokes that were correct. Defaults to 100 with no data. */
export function computeAccuracy(correctKeystrokes: number, totalKeystrokes: number): number {
  if (totalKeystrokes === 0) return 100;
  return (correctKeystrokes / totalKeystrokes) * 100;
}
