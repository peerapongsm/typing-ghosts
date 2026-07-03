/**
 * Grapheme-prefix matcher for Thai typing input.
 *
 * Thai has no dead-key composition like CJK IMEs — every keystroke (or
 * hidden-<input> diff) is already a composed character. Each combining
 * tone mark / vowel sign is its own keystroke and must be compared as
 * its own unit, in the order the player actually types it
 * (e.g. "น้ำ" = น + ้ + ำ, three keystrokes).
 *
 * Deviation from spec §5 ("...ด้วย Intl.Segmenter"): Node's
 * Intl.Segmenter({granularity:"grapheme"}) implements Unicode UAX #29
 * extended grapheme clusters, which merge a Thai base consonant with its
 * combining tone marks/vowel signs into a *single* cluster for rendering
 * purposes — e.g. segmenting "น้ำ" yields ["น้ำ"] (1 cluster), not
 * ["น","้","ำ"] (3). That directly contradicts this file's own required
 * test ("น้ำ" = น+้+ำ ordered). Since Thai text has no NFC-composed forms
 * to begin with (no precomposed codepoint for น้ำ), NFC-normalizing and
 * then splitting by Unicode code point (which still safely handles any
 * astral/surrogate-pair codepoints) reproduces exactly one unit per
 * keystroke, which is what the spec's test actually requires.
 */

export interface MatchResult {
  progress: number;
  correct: boolean;
  complete: boolean;
}

/** Split text into NFC-normalized per-keystroke units, in order. */
export function toGraphemes(text: string): string[] {
  return Array.from(text.normalize("NFC"));
}

/**
 * Attempt to consume one grapheme of input against `word` starting at
 * `progress` (number of graphemes already matched).
 *
 * A wrong character never resets progress — the caller (UI) shows a
 * red-shake on the mistyped letter, and the player simply retries the
 * same expected grapheme next.
 */
export function matchNextChar(word: string, progress: number, input: string): MatchResult {
  const graphemes = toGraphemes(word);

  if (progress >= graphemes.length) {
    return { progress: graphemes.length, correct: false, complete: true };
  }

  const expected = graphemes[progress];
  const normalizedInput = input.normalize("NFC");

  if (normalizedInput === expected) {
    const next = progress + 1;
    return { progress: next, correct: true, complete: next >= graphemes.length };
  }

  return { progress, correct: false, complete: false };
}
