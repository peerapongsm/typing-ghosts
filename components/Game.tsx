"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { toGraphemes } from "@/lib/match";
import { handleInput, resetAfterComplete, type Ghost as TargetGhost, type TargetingState } from "@/lib/targeting";
import { generateWaveSchedule, type SpawnEvent } from "@/lib/wave";
import {
  initScore,
  onHit,
  onKeystroke,
  onWordComplete,
  computeWpm,
  computeAccuracy,
  type ScoreState,
} from "@/lib/score";
import { getBestScore, saveBestScore } from "@/lib/storage";
import { GHOST_CONFIG } from "@/lib/ghostConfig";
import { GHOST_SVGS } from "@/components/ghosts";
import type { GhostType, WordBank } from "@/lib/types";

import basicWords from "@/data/words/basic.json";
import commonWords from "@/data/words/common.json";
import hardWords from "@/data/words/hard.json";

const WORD_BANK: WordBank = { basic: basicWords, common: commonWords, hard: hardWords };

const START_HEARTS = 3;
const SPAWN_RADIUS = 45; // % distance from shrine at spawn
const ARRIVE_RADIUS = 8; // % distance from shrine when the ghost "reaches" it

interface RuntimeGhost {
  id: string;
  type: GhostType;
  words: string[];
  wordIndex: number;
  spawnTime: number;
  duration: number;
  angleDeg: number;
}

type Screen = "start" | "playing" | "gameover";

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function Game() {
  const [screen, setScreen] = useState<Screen>("start");
  const [hearts, setHearts] = useState(START_HEARTS);
  const [wave, setWave] = useState(1);
  const [score, setScore] = useState<ScoreState>(initScore());
  const [best, setBest] = useState(0);
  const [announcement, setAnnouncement] = useState<{ type: GhostType; nonce: number } | null>(null);
  const [wrongFlash, setWrongFlash] = useState<{ id: string; nonce: number } | null>(null);
  const [finalStats, setFinalStats] = useState<{ wpm: number; accuracy: number } | null>(null);
  const [comboBurst, setComboBurst] = useState<{ nonce: number } | null>(null);
  const prevComboRef = useRef(0);

  const [, bump] = useReducer((c: number) => c + 1, 0);

  const ghostsRef = useRef<RuntimeGhost[]>([]);
  const targetRef = useRef<TargetingState>({ targetId: null, progress: 0 });
  const screenRef = useRef<Screen>("start");
  const seedRef = useRef(0);
  const startTimeRef = useRef(0);
  const encounteredRef = useRef<Set<GhostType>>(new Set());

  const spawnTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const arrivalTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const waveTotalRef = useRef(0);
  const spawnedCountRef = useRef(0);
  const resolvedCountRef = useRef(0);

  const hiddenInputRef = useRef<HTMLInputElement | null>(null);
  const processCharRef = useRef<(ch: string) => void>(() => {});

  useEffect(() => {
    setBest(getBestScore());
  }, []);

  // Design-review aid: ?screenshot=play auto-starts the run so headless
  // capture tools can land on the arena without simulating a click.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (new URLSearchParams(window.location.search).get("screenshot") === "play") {
      startGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function clearAllTimers() {
    spawnTimeoutsRef.current.forEach(clearTimeout);
    spawnTimeoutsRef.current = [];
    arrivalTimeoutsRef.current.forEach(clearTimeout);
    arrivalTimeoutsRef.current.clear();
  }

  function startGame() {
    ghostsRef.current = [];
    targetRef.current = { targetId: null, progress: 0 };
    encounteredRef.current = new Set();
    seedRef.current = Math.floor(Math.random() * 1_000_000_000);
    startTimeRef.current = Date.now();
    waveTotalRef.current = 0;
    spawnedCountRef.current = 0;
    resolvedCountRef.current = 0;
    clearAllTimers();

    setHearts(START_HEARTS);
    setScore(initScore());
    setWave(1);
    setFinalStats(null);
    setAnnouncement(null);
    setWrongFlash(null);
    setComboBurst(null);
    prevComboRef.current = 0;
    screenRef.current = "playing";
    setScreen("playing");
    bump();

    setTimeout(() => hiddenInputRef.current?.focus(), 50);
  }

  function endGame(finalScore: ScoreState) {
    clearAllTimers();
    screenRef.current = "gameover";
    setScreen("gameover");
    const elapsed = Date.now() - startTimeRef.current;
    const wpm = computeWpm(finalScore.correctKeystrokes, elapsed);
    const accuracy = computeAccuracy(finalScore.correctKeystrokes, finalScore.totalKeystrokes);
    setFinalStats({ wpm, accuracy });
    setBest(saveBestScore(finalScore.score));
  }

  function spawnGhost(event: SpawnEvent) {
    const id = makeId();
    const ghost: RuntimeGhost = {
      id,
      type: event.ghostType,
      words: event.words,
      wordIndex: 0,
      spawnTime: Date.now(),
      duration: GHOST_CONFIG[event.ghostType].duration,
      angleDeg: Math.random() * 360,
    };
    ghostsRef.current = [...ghostsRef.current, ghost];
    spawnedCountRef.current += 1;

    if (!encounteredRef.current.has(event.ghostType)) {
      encounteredRef.current.add(event.ghostType);
      setAnnouncement({ type: event.ghostType, nonce: Date.now() });
    }

    const t = setTimeout(() => handleArrival(id), ghost.duration);
    arrivalTimeoutsRef.current.set(id, t);
    bump();
  }

  function handleArrival(id: string) {
    arrivalTimeoutsRef.current.delete(id);
    const wasPresent = ghostsRef.current.some((g) => g.id === id);
    ghostsRef.current = ghostsRef.current.filter((g) => g.id !== id);
    if (!wasPresent) return;
    resolvedCountRef.current += 1;

    if (targetRef.current.targetId === id) {
      targetRef.current = resetAfterComplete();
    }

    setScore((prev) => onHit(prev));
    setHearts((prev) => Math.max(0, prev - 1));

    maybeAdvanceWave();
    bump();
  }

  function resolveGhostDefeated(id: string) {
    const t = arrivalTimeoutsRef.current.get(id);
    if (t) clearTimeout(t);
    arrivalTimeoutsRef.current.delete(id);
    ghostsRef.current = ghostsRef.current.filter((g) => g.id !== id);
    resolvedCountRef.current += 1;
    maybeAdvanceWave();
  }

  function maybeAdvanceWave() {
    if (
      waveTotalRef.current > 0 &&
      spawnedCountRef.current === waveTotalRef.current &&
      resolvedCountRef.current === waveTotalRef.current
    ) {
      setTimeout(() => {
        if (screenRef.current === "playing") setWave((w) => w + 1);
      }, 1500);
    }
  }

  function computeDistance(g: RuntimeGhost): number {
    return g.duration - (Date.now() - g.spawnTime);
  }

  function triggerWrongFlash(id: string) {
    setWrongFlash({ id, nonce: Date.now() });
  }

  function processChar(rawChar: string) {
    if (screenRef.current !== "playing") return;
    const ghosts = ghostsRef.current;
    const targetingGhosts: TargetGhost[] = ghosts.map((g) => ({
      id: g.id,
      word: g.words[g.wordIndex],
      distance: computeDistance(g),
    }));

    const prevTarget = targetRef.current;
    const result = handleInput(targetingGhosts, prevTarget, rawChar);
    const prevProgress = prevTarget.targetId === result.targetId ? prevTarget.progress : 0;
    const correct = result.targetId !== null && result.progress > prevProgress;

    setScore((prev) => onKeystroke(prev, correct));

    if (!correct && result.targetId !== null) {
      triggerWrongFlash(result.targetId);
    }

    if (result.completed) {
      const ghost = ghosts.find((g) => g.id === result.targetId);
      if (ghost) {
        const finishedWord = ghost.words[ghost.wordIndex];
        setScore((prev) => onWordComplete(prev, toGraphemes(finishedWord).length));

        if (ghost.wordIndex + 1 < ghost.words.length) {
          ghost.wordIndex += 1;
          targetRef.current = { targetId: ghost.id, progress: 0 };
        } else {
          resolveGhostDefeated(ghost.id);
          targetRef.current = resetAfterComplete();
        }
      }
    } else {
      targetRef.current = { targetId: result.targetId, progress: result.progress };
    }

    bump();
  }

  processCharRef.current = processChar;

  // Wave spawn scheduling.
  useEffect(() => {
    if (screen !== "playing") return;
    const schedule = generateWaveSchedule(wave, seedRef.current, WORD_BANK);
    waveTotalRef.current = schedule.length;
    spawnedCountRef.current = 0;
    resolvedCountRef.current = 0;

    const timeouts = schedule.map((event) => setTimeout(() => spawnGhost(event), event.time));
    spawnTimeoutsRef.current = timeouts;
    return () => {
      timeouts.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wave, screen]);

  // Game-over watcher.
  useEffect(() => {
    if (screen === "playing" && hearts <= 0) {
      setScore((prev) => {
        endGame(prev);
        return prev;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hearts, screen]);

  // Combo streak firework burst.
  useEffect(() => {
    if (screen === "playing" && score.combo > 1 && score.combo > prevComboRef.current) {
      setComboBurst({ nonce: Date.now() });
    }
    prevComboRef.current = score.combo;
  }, [score.combo, screen]);

  // Visual animation loop (position only; game logic runs on timeouts above).
  useEffect(() => {
    if (screen !== "playing") return;
    let raf: number;
    function loop() {
      bump();
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [screen]);

  // Desktop keydown input.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (screenRef.current !== "playing") return;
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        processCharRef.current(e.key);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function onHiddenInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    e.target.value = "";
    for (const ch of toGraphemes(value)) {
      processCharRef.current(ch);
    }
  }

  function focusHiddenInput() {
    hiddenInputRef.current?.focus();
  }

  if (screen === "start") {
    return <StartScreen best={best} onStart={startGame} />;
  }

  if (screen === "gameover") {
    return (
      <GameOverScreen
        score={score.score}
        best={best}
        wave={wave}
        wpm={finalStats?.wpm ?? 0}
        accuracy={finalStats?.accuracy ?? 0}
        onRestart={startGame}
      />
    );
  }

  const ghosts = ghostsRef.current;
  const target = targetRef.current;

  return (
    <div className="game-screen" onClick={focusHiddenInput}>
      <input
        ref={hiddenInputRef}
        className="hidden-input"
        type="text"
        inputMode="text"
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        onChange={onHiddenInputChange}
        aria-label="พิมพ์คำภาษาไทยเพื่อไล่ผี"
      />

      <Hud hearts={hearts} score={score.score} combo={score.combo} wave={wave} comboBurst={comboBurst} />

      <div className="arena">
        <div className="arena-fog" aria-hidden="true" />
        <div className="shrine" aria-hidden="true">
          <ShrineIcon />
        </div>
        {ghosts.map((g) => {
          const t = Math.min(1, (Date.now() - g.spawnTime) / g.duration);
          const radius = SPAWN_RADIUS * (1 - t) + ARRIVE_RADIUS * t;
          const rad = (g.angleDeg * Math.PI) / 180;
          const left = 50 + radius * Math.cos(rad);
          const top = 50 + radius * Math.sin(rad);
          const isTarget = target.targetId === g.id;
          const progress = isTarget ? target.progress : 0;
          const shake = wrongFlash?.id === g.id;
          const GhostSvg = GHOST_SVGS[g.type];
          const glowStyle = {
            left: `${left}%`,
            top: `${top}%`,
            "--ghost-glow": GHOST_CONFIG[g.type].accent,
          } as React.CSSProperties;
          return (
            <div
              key={g.id}
              className={`ghost${isTarget ? " ghost-locked" : ""}`}
              style={glowStyle}
            >
              <GhostSvg className="ghost-svg" />
              <WordLabel
                word={g.words[g.wordIndex]}
                progress={progress}
                shake={shake}
                shakeNonce={wrongFlash?.nonce ?? 0}
                accent={GHOST_CONFIG[g.type].accent}
              />
              {g.words.length > 1 && (
                <div className="chain-badge">
                  {g.wordIndex + 1}/{g.words.length}
                </div>
              )}
            </div>
          );
        })}

        {announcement && (
          <div className="announcement" key={announcement.nonce}>
            <strong>{GHOST_CONFIG[announcement.type].label}</strong> โผล่มาแล้ว!
          </div>
        )}
      </div>
    </div>
  );
}

function WordLabel({
  word,
  progress,
  shake,
  shakeNonce,
  accent,
}: {
  word: string;
  progress: number;
  shake: boolean;
  shakeNonce: number;
  accent: string;
}) {
  const graphemes = toGraphemes(word);
  return (
    <div className="word-label" style={{ borderColor: accent }}>
      {graphemes.map((g, i) => {
        const isTyped = i < progress;
        const isNext = i === progress;
        const cls = isTyped ? "char-done" : isNext && shake ? "char-shake" : "char-pending";
        return (
          <span className={cls} key={isNext && shake ? `${i}-${shakeNonce}` : i}>
            {g}
          </span>
        );
      })}
    </div>
  );
}

function Hud({
  hearts,
  score,
  combo,
  wave,
  comboBurst,
}: {
  hearts: number;
  score: number;
  combo: number;
  wave: number;
  comboBurst: { nonce: number } | null;
}) {
  return (
    <div className="hud">
      <div className="hud-hearts" aria-label={`หัวใจ ${hearts} ดวง`}>
        {Array.from({ length: START_HEARTS }, (_, i) => (
          <span key={i} className={i < hearts ? "heart-full" : "heart-empty"}>
            {i < hearts ? "♥" : "♡"}
          </span>
        ))}
      </div>
      <div className="hud-score">คะแนน {score.toLocaleString("th-TH")}</div>
      <div className="hud-combo-wrap">
        <div className="hud-combo">คอมโบ {combo}</div>
        {comboBurst && (
          <div className="combo-burst" key={comboBurst.nonce} aria-hidden="true">
            {Array.from({ length: 8 }, (_, i) => (
              <span className="spark" style={{ "--i": i } as React.CSSProperties} key={i} />
            ))}
          </div>
        )}
      </div>
      <div className="hud-wave">ด่าน {wave}</div>
    </div>
  );
}

function ShrineIcon() {
  return (
    <svg viewBox="0 0 100 116" className="shrine-svg">
      {/* Thai gable roof, curved finials */}
      <path d="M50 4 L54 14 L46 14 Z" fill="#ffd76a" />
      <path d="M16 40 L50 12 L84 40 Z" fill="#b3392f" stroke="#7a2020" strokeWidth="1.5" />
      <path d="M16 40 Q10 44 8 52" stroke="#7a2020" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M84 40 Q90 44 92 52" stroke="#7a2020" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* house body */}
      <rect x="26" y="40" width="48" height="22" rx="2" fill="#8a2f2f" stroke="#ffd76a" strokeWidth="1.5" />
      <rect x="42" y="46" width="16" height="16" fill="#ffb347" opacity="0.9" />
      {/* single central pillar (ศาลพระภูมิ) */}
      <rect x="45" y="62" width="10" height="34" fill="#8a5a2a" />
      {/* offering platform */}
      <rect x="14" y="96" width="72" height="9" rx="2" fill="#c9a876" stroke="#8a6a3a" strokeWidth="1" />
      {/* candle */}
      <rect x="66" y="90" width="4" height="8" fill="#f4ead0" />
      <path className="candle-flame" d="M68 84 Q71 88 68 92 Q65 88 68 84 Z" fill="#ffcf6b" />
    </svg>
  );
}

function StartScreen({ best, onStart }: { best: number; onStart: () => void }) {
  return (
    <div className="menu-screen">
      <h1>พิมพ์ไล่ผี</h1>
      <p className="subtitle">Typing of the Ghosts</p>
      <p className="instructions">
        ผีลอยเข้ามาหาศาล พิมพ์คำใต้ตัวผีให้จบก่อนมันถึงตัว
        <br />
        พิมพ์ผิดไม่เป็นไร แค่พิมพ์ตัวที่ถูกต่อไปได้เลย
        <br />
        ปล่อยผีเข้าศาล 3 ครั้ง = จบเกม
      </p>
      {best > 0 && <p className="best-line">คะแนนสูงสุด: {best.toLocaleString("th-TH")}</p>}
      <button className="primary-button" onClick={onStart}>
        เริ่มเกม
      </button>
    </div>
  );
}

function GameOverScreen({
  score,
  best,
  wave,
  wpm,
  accuracy,
  onRestart,
}: {
  score: number;
  best: number;
  wave: number;
  wpm: number;
  accuracy: number;
  onRestart: () => void;
}) {
  const isNewBest = score >= best && score > 0;
  return (
    <div className="menu-screen">
      <h1>ผีบุกศาลสำเร็จ</h1>
      <p className="subtitle">จบเกมที่ด่าน {wave}</p>
      <div className="stats-grid">
        <div className="stat">
          <div className="stat-value">{score.toLocaleString("th-TH")}</div>
          <div className="stat-label">คะแนน{isNewBest ? " (สถิติใหม่!)" : ""}</div>
        </div>
        <div className="stat">
          <div className="stat-value">{wpm.toFixed(0)}</div>
          <div className="stat-label">คำ/นาที (WPM)</div>
        </div>
        <div className="stat">
          <div className="stat-value">{accuracy.toFixed(0)}%</div>
          <div className="stat-label">ความแม่นยำ</div>
        </div>
        <div className="stat">
          <div className="stat-value">{best.toLocaleString("th-TH")}</div>
          <div className="stat-label">คะแนนสูงสุด</div>
        </div>
      </div>
      <button className="primary-button" onClick={onRestart}>
        เล่นอีกครั้ง
      </button>
    </div>
  );
}
