import { useId } from "react";
import type { GhostType } from "@/lib/types";

interface GhostSvgProps {
  className?: string;
}

/** กระสือ — floating head trailing a comet-tail of glowing light. Fast, cute, no gore. */
function Krasue({ className }: GhostSvgProps) {
  const id = useId();
  return (
    <svg viewBox="0 0 100 110" className={className} aria-hidden="true">
      <defs>
        <radialGradient id={`${id}-body`} cx="42%" cy="38%" r="65%">
          <stop offset="0%" stopColor="#ffe6f8" />
          <stop offset="100%" stopColor="#ff8fd6" />
        </radialGradient>
        <radialGradient id={`${id}-trail`}>
          <stop offset="0%" stopColor="#ff9ee0" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#ff9ee0" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* drifting wisps of light, overlapping soft blobs (not a stick) trailing below the head */}
      <ellipse cx="44" cy="70" rx="16" ry="13" fill={`url(#${id}-trail)`} />
      <ellipse cx="56" cy="86" rx="11" ry="10" fill={`url(#${id}-trail)`} />
      <ellipse cx="47" cy="100" rx="6.5" ry="6.5" fill={`url(#${id}-trail)`} />
      <circle cx="50" cy="46" r="30" fill={`url(#${id}-body)`} />
      <circle cx="38" cy="42" r="6.5" fill="#3a2a45" />
      <circle cx="62" cy="42" r="6.5" fill="#3a2a45" />
      <circle cx="40.2" cy="39.8" r="2" fill="#fff" />
      <circle cx="64.2" cy="39.8" r="2" fill="#fff" />
      <circle cx="31" cy="53" r="4.5" fill="#ff6ec7" opacity="0.7" />
      <circle cx="69" cy="53" r="4.5" fill="#ff6ec7" opacity="0.7" />
      <path d="M42 58 Q50 64 58 58" stroke="#3a2a45" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/** กระหัง — bird-winged head with basket-weave "wings", cyan lantern glow. */
function Krahang({ className }: GhostSvgProps) {
  const id = useId();
  return (
    <svg viewBox="0 0 110 100" className={className} aria-hidden="true">
      <defs>
        <radialGradient id={`${id}-body`} cx="42%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#ecf8ff" />
          <stop offset="100%" stopColor="#8fc7ff" />
        </radialGradient>
      </defs>
      {/* winnowing-basket wings */}
      <g opacity="0.95">
        <ellipse cx="16" cy="46" rx="15" ry="20" fill="#bfe0ff" />
        <path
          d="M6 40 L26 40 M6 46 L26 46 M6 52 L26 52 M8 34 L8 58 M16 32 L16 60 M24 34 L24 58"
          stroke="#6fb3f5"
          strokeWidth="1.4"
          opacity="0.6"
        />
        <ellipse cx="94" cy="46" rx="15" ry="20" fill="#bfe0ff" />
        <path
          d="M84 40 L104 40 M84 46 L104 46 M84 52 L104 52 M86 34 L86 58 M94 32 L94 60 M102 34 L102 58"
          stroke="#6fb3f5"
          strokeWidth="1.4"
          opacity="0.6"
        />
      </g>
      <circle cx="55" cy="52" r="27" fill={`url(#${id}-body)`} />
      <circle cx="45" cy="49" r="6" fill="#22344a" />
      <circle cx="65" cy="49" r="6" fill="#22344a" />
      <circle cx="46.8" cy="47" r="1.8" fill="#fff" />
      <circle cx="66.8" cy="47" r="1.8" fill="#fff" />
      <circle cx="38" cy="60" r="4" fill="#5aa8ff" opacity="0.7" />
      <circle cx="72" cy="60" r="4" fill="#5aa8ff" opacity="0.7" />
      <path d="M47 65 Q55 71 63 65" stroke="#22344a" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/** ผีตาโบ๋ — classic round pale sheet-ghost blob, moonlit and soft, not scary. */
function Phitabo({ className }: GhostSvgProps) {
  const id = useId();
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <defs>
        <radialGradient id={`${id}-body`} cx="45%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fdfcff" />
          <stop offset="100%" stopColor="#e3ddff" />
        </radialGradient>
      </defs>
      <path
        d="M50 8 C24 8 13 31 13 55 L13 84 Q19 76 26 84 Q33 92 40 84 Q46 92 52 84 Q58 92 65 84 Q72 76 79 84 L79 55 C79 31 68 8 50 8 Z"
        fill={`url(#${id}-body)`}
        stroke="#c9c0f2"
        strokeWidth="2"
      />
      <ellipse cx="38" cy="47" rx="8" ry="10" fill="#786fb0" />
      <ellipse cx="62" cy="47" rx="8" ry="10" fill="#786fb0" />
      <circle cx="40" cy="44" r="2" fill="#fff" />
      <circle cx="64" cy="44" r="2" fill="#fff" />
      <path d="M42 65 Q50 59 58 65" stroke="#786fb0" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="27" cy="58" r="4.5" fill="#c9b6ff" opacity="0.6" />
      <circle cx="73" cy="58" r="4.5" fill="#c9b6ff" opacity="0.6" />
    </svg>
  );
}

/** ผีเปรต — tall, thin, warm amber wanderer with a tiny "o" mouth and gentle eyes. */
function Phipret({ className }: GhostSvgProps) {
  const id = useId();
  return (
    <svg viewBox="0 0 100 140" className={className} aria-hidden="true">
      <defs>
        <radialGradient id={`${id}-body`} cx="42%" cy="25%" r="75%">
          <stop offset="0%" stopColor="#fff3d9" />
          <stop offset="100%" stopColor="#ffcf85" />
        </radialGradient>
      </defs>
      <path
        d="M50 6 C31 6 21 26 21 48 L21 120 Q28 112 35 120 Q42 128 49 120 Q55 128 61 120 Q68 128 75 120 L75 48 C75 26 65 6 50 6 Z"
        fill={`url(#${id}-body)`}
        stroke="#e8b667"
        strokeWidth="2"
      />
      <circle cx="39" cy="50" r="6.5" fill="#7a5222" />
      <circle cx="61" cy="50" r="6.5" fill="#7a5222" />
      <circle cx="41" cy="47.5" r="1.9" fill="#fff" />
      <circle cx="63" cy="47.5" r="1.9" fill="#fff" />
      <ellipse cx="50" cy="70" rx="4.5" ry="5.5" fill="#7a5222" />
      <circle cx="30" cy="62" r="4" fill="#ffb763" opacity="0.7" />
      <circle cx="70" cy="62" r="4" fill="#ffb763" opacity="0.7" />
    </svg>
  );
}

/** แม่นาค — boss: long flowing hair silhouette gives it unmistakable presence, crimson glow. */
function Maenak({ className }: GhostSvgProps) {
  const id = useId();
  return (
    <svg viewBox="0 0 130 150" className={className} aria-hidden="true">
      <defs>
        <radialGradient id={`${id}-face`} cx="45%" cy="32%" r="70%">
          <stop offset="0%" stopColor="#fff5f5" />
          <stop offset="100%" stopColor="#ffdada" />
        </radialGradient>
      </defs>
      {/* long flowing hair, draping past the body — the boss silhouette cue */}
      <path
        d="M65 14 C40 16 24 34 20 60 C16 84 10 108 18 138 Q24 126 30 138 Q34 128 40 138 C34 112 34 90 40 68 C44 50 54 40 65 40 C76 40 86 50 90 68 C96 90 96 112 90 138 Q96 128 100 138 Q106 126 112 138 C120 108 114 84 110 60 C106 34 90 16 65 14 Z"
        fill="#2a1830"
        opacity="0.92"
      />
      {/* body/robe */}
      <path
        d="M65 30 C48 30 38 48 37 66 C35 88 33 106 40 130 Q48 120 55 130 L75 130 Q82 120 90 130 C97 106 95 88 93 66 C92 48 82 30 65 30 Z"
        fill="#ffd3d3"
      />
      <ellipse cx="65" cy="62" rx="26" ry="24" fill={`url(#${id}-face)`} />
      <ellipse cx="54" cy="60" rx="6.5" ry="8.5" fill="#6b2a2a" />
      <ellipse cx="76" cy="60" rx="6.5" ry="8.5" fill="#6b2a2a" />
      <circle cx="56" cy="57.5" r="2" fill="#fff" />
      <circle cx="78" cy="57.5" r="2" fill="#fff" />
      <path d="M56 78 Q65 85 74 78" stroke="#6b2a2a" strokeWidth="3.2" fill="none" strokeLinecap="round" />
      <circle cx="44" cy="70" r="5" fill="#ff8f8f" opacity="0.7" />
      <circle cx="86" cy="70" r="5" fill="#ff8f8f" opacity="0.7" />
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
