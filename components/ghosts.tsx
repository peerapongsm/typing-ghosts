import type { GhostType } from "@/lib/types";

interface GhostSvgProps {
  className?: string;
}

/** กระสือ — cute floating head with a soft glowing wisp trail. Fast, no gore. */
function Krasue({ className }: GhostSvgProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <ellipse cx="50" cy="80" rx="14" ry="16" fill="#ffd6f0" opacity="0.7" />
      <ellipse cx="50" cy="48" rx="30" ry="28" fill="#ffb3e6" />
      <circle cx="38" cy="44" r="7" fill="#3a2a45" />
      <circle cx="62" cy="44" r="7" fill="#3a2a45" />
      <circle cx="40" cy="42" r="2.2" fill="#fff" />
      <circle cx="64" cy="42" r="2.2" fill="#fff" />
      <circle cx="32" cy="56" r="5" fill="#ff8fc9" opacity="0.7" />
      <circle cx="68" cy="56" r="5" fill="#ff8fc9" opacity="0.7" />
      <path d="M42 60 Q50 66 58 60" stroke="#3a2a45" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/** กระหัง — cute ghost with two round basket-like "wings". */
function Krahang({ className }: GhostSvgProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <ellipse cx="18" cy="48" rx="14" ry="18" fill="#bfe0ff" />
      <ellipse cx="82" cy="48" rx="14" ry="18" fill="#bfe0ff" />
      <ellipse cx="50" cy="54" rx="28" ry="30" fill="#8fc7ff" />
      <circle cx="40" cy="50" r="6.5" fill="#22344a" />
      <circle cx="60" cy="50" r="6.5" fill="#22344a" />
      <circle cx="42" cy="48" r="2" fill="#fff" />
      <circle cx="62" cy="48" r="2" fill="#fff" />
      <circle cx="33" cy="62" r="4.5" fill="#5aa8ff" opacity="0.7" />
      <circle cx="67" cy="62" r="4.5" fill="#5aa8ff" opacity="0.7" />
      <path d="M42 66 Q50 72 58 66" stroke="#22344a" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/** ผีตาโบ๋ — classic round white sheet-ghost blob, drawn soft and round, not scary. */
function Phitabo({ className }: GhostSvgProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <path
        d="M50 10 C25 10 14 32 14 55 L14 82 Q20 74 27 82 Q34 90 41 82 Q47 90 53 82 Q59 90 66 82 Q73 74 79 82 L79 55 C79 32 68 10 50 10 Z"
        fill="#f2f0ff"
        stroke="#d7d3f5"
        strokeWidth="2"
      />
      <ellipse cx="38" cy="48" rx="8" ry="10" fill="#7a71b3" />
      <ellipse cx="62" cy="48" rx="8" ry="10" fill="#7a71b3" />
      <path d="M42 66 Q50 60 58 66" stroke="#7a71b3" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/** ผีเปรต — tall, thin, cute: tiny "o" mouth, big gentle eyes, soft pastel. */
function Phipret({ className }: GhostSvgProps) {
  return (
    <svg viewBox="0 0 100 130" className={className} aria-hidden="true">
      <path
        d="M50 8 C33 8 24 26 24 46 L24 112 Q30 105 36 112 Q42 119 48 112 Q54 119 60 112 Q66 105 72 112 L72 46 C72 26 63 8 50 8 Z"
        fill="#ffe6bf"
        stroke="#f0cf98"
        strokeWidth="2"
      />
      <circle cx="40" cy="48" r="6" fill="#7a5a2a" />
      <circle cx="60" cy="48" r="6" fill="#7a5a2a" />
      <circle cx="41.5" cy="46" r="1.8" fill="#fff" />
      <circle cx="61.5" cy="46" r="1.8" fill="#fff" />
      <circle cx="50" cy="66" r="4" fill="#7a5a2a" />
    </svg>
  );
}

/** แม่นาค — boss: soft rounded blob with a gentle flowing-hair silhouette, no horror. */
function Maenak({ className }: GhostSvgProps) {
  return (
    <svg viewBox="0 0 120 140" className={className} aria-hidden="true">
      <path
        d="M60 10 C34 10 24 34 22 58 C18 78 14 100 24 128 Q30 118 38 128 Q44 122 50 128 L50 128 Q56 122 62 128 Q68 122 74 128 Q80 118 86 128 C96 100 92 78 88 58 C86 34 86 10 60 10 Z"
        fill="#ffd3d3"
        stroke="#f0a8a8"
        strokeWidth="2"
      />
      <ellipse cx="60" cy="58" rx="30" ry="26" fill="#fff0f0" />
      <ellipse cx="47" cy="56" rx="7" ry="9" fill="#6b3a3a" />
      <ellipse cx="73" cy="56" rx="7" ry="9" fill="#6b3a3a" />
      <circle cx="49" cy="54" r="2" fill="#fff" />
      <circle cx="75" cy="54" r="2" fill="#fff" />
      <path d="M50 74 Q60 82 70 74" stroke="#6b3a3a" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="38" cy="66" r="5" fill="#ff9a9a" opacity="0.7" />
      <circle cx="82" cy="66" r="5" fill="#ff9a9a" opacity="0.7" />
    </svg>
  );
}

export const GHOST_SVGS: Record<GhostType, (props: GhostSvgProps) => React.JSX.Element> = {
  krasue: Krasue,
  krahang: Krahang,
  phitabo: Phitabo,
  phipret: Phipret,
  maenak: Maenak,
};
