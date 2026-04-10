"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, useMemo } from "react";
import { LobsterSVG } from "./LobsterSVG";
import { soundManager } from "@/lib/sounds";

interface MatchPerson {
  name: string;
  industry: string;
  company: string;
  title: string;
  avatarSeed?: string;
  avatar?: string;
}

interface MatchPair {
  user1: MatchPerson;
  user2: MatchPerson;
}

interface ScreenMatchAnimationProps {
  pairs: MatchPair[];
  onComplete?: () => void;
}

function HUDCorner({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
  const isTop = position.startsWith("t");
  const isLeft = position.endsWith("l");
  return (
    <div
      className="absolute w-12 h-12"
      style={{
        top: isTop ? 0 : undefined,
        bottom: !isTop ? 0 : undefined,
        left: isLeft ? 0 : undefined,
        right: !isLeft ? 0 : undefined,
      }}
    >
      <div
        className="absolute bg-red-400/25"
        style={{
          width: "2px",
          height: "24px",
          top: isTop ? 0 : undefined,
          bottom: !isTop ? 0 : undefined,
          left: isLeft ? 0 : undefined,
          right: !isLeft ? 0 : undefined,
        }}
      />
      <div
        className="absolute bg-red-400/25"
        style={{
          width: "24px",
          height: "2px",
          top: isTop ? 0 : undefined,
          bottom: !isTop ? 0 : undefined,
          left: isLeft ? 0 : undefined,
          right: !isLeft ? 0 : undefined,
        }}
      />
    </div>
  );
}

function EnergyConnection() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id="connectionGrad" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="rgba(220,50,30,0.6)" />
          <stop offset="50%" stopColor="rgba(255,150,50,0.8)" />
          <stop offset="100%" stopColor="rgba(220,50,30,0.6)" />
        </linearGradient>
        <filter id="connectionGlow">
          <feGaussianBlur stdDeviation="0.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <motion.path
        d="M 15 50 Q 35 40, 50 50 Q 65 60, 85 50"
        fill="none"
        stroke="url(#connectionGrad)"
        strokeWidth="0.3"
        filter="url(#connectionGlow)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
      {[20, 35, 50, 65, 80].map((x, i) => (
        <motion.circle
          key={i}
          cx={x}
          cy={50 + (i % 2 === 0 ? -3 : 3)}
          r="0.5"
          fill="#FF9F43"
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 1, 0],
            cx: [x - 5, x + 5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </svg>
  );
}

function ShockwaveEffect() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-red-500/30"
          initial={{ width: 0, height: 0, opacity: 0.8 }}
          animate={{
            width: [0, 600],
            height: [0, 600],
            opacity: [0.6, 0],
            borderWidth: [3, 1],
          }}
          transition={{
            duration: 1.5,
            delay: i * 0.2,
            ease: "easeOut",
          }}
          style={{
            boxShadow: "0 0 30px rgba(220,50,30,0.2), inset 0 0 30px rgba(220,50,30,0.1)",
          }}
        />
      ))}
    </div>
  );
}

function DataStream({ side }: { side: "left" | "right" }) {
  const [chars, setChars] = useState<string[]>([]);

  useEffect(() => {
    setChars(
      Array.from({ length: 12 }, () =>
        String.fromCharCode(0x30a0 + Math.floor(Math.random() * 96))
      )
    );
  }, []);

  if (chars.length === 0) return null;

  return (
    <div
      className="absolute top-0 bottom-0 flex flex-col justify-center gap-1 font-mono text-xs text-red-400/20 overflow-hidden"
      style={{ [side]: "3%", width: "20px" }}
    >
      {chars.map((c, i) => (
        <motion.span
          key={i}
          animate={{ opacity: [0.1, 0.5, 0.1] }}
          transition={{ duration: 1.5, delay: i * 0.12, repeat: Infinity }}
        >
          {c}
        </motion.span>
      ))}
    </div>
  );
}

function PairCard({
  person,
  side,
  showReveal,
}: {
  person: MatchPerson;
  side: "left" | "right";
  showReveal: boolean;
}) {
  return (
    <motion.div
      className="glass-premium rounded-3xl p-8 w-[35vw] text-center border border-red-200/40"
      initial={{ x: side === "left" ? -100 : 100, opacity: 0, scale: 0.8 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 80, damping: 15, delay: side === "right" ? 0.15 : 0 }}
      style={{ boxShadow: "0 8px 40px rgba(220,50,30,0.08)" }}
    >
      <motion.div
        className="w-24 h-24 rounded-full lobster-gradient-metallic mx-auto flex items-center justify-center text-white text-4xl font-bold mb-4 overflow-hidden"
        initial={{ rotateY: side === "left" ? 180 : -180 }}
        animate={{ rotateY: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        style={{ boxShadow: "0 0 30px rgba(220,50,30,0.3)" }}
      >
        {showReveal ? (
          person.avatar ? (
            <img src={person.avatar} alt={person.name} className="w-full h-full object-cover" />
          ) : (
            person.name[0]
          )
        ) : (
          "?"
        )}
      </motion.div>
      <AnimatePresence>
        {showReveal && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-3xl font-black text-gray-900">{person.name}</h3>
            <p className="text-base text-gray-600 mt-1 font-medium">{person.company}</p>
            <p className="text-base text-gray-500">{person.title}</p>
            <span className="inline-block mt-3 px-5 py-1.5 rounded-full bg-red-50 text-red-500 text-sm font-bold border border-red-200/50">
              {person.industry}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function PaginationDots({
  total,
  current,
  onSelect,
}: {
  total: number;
  current: number;
  onSelect: (idx: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <motion.button
          key={i}
          onClick={() => onSelect(i)}
          className="relative cursor-pointer"
          whileHover={{ scale: 1.3 }}
          whileTap={{ scale: 0.9 }}
        >
          <motion.div
            className="rounded-full transition-all duration-300"
            style={{
              width: i === current ? 24 : 8,
              height: 8,
              background: i === current
                ? "linear-gradient(90deg, #E74C3C, #FF9F43)"
                : "rgba(0,0,0,0.1)",
              boxShadow: i === current ? "0 0 10px rgba(220,50,30,0.5)" : "none",
            }}
          />
        </motion.button>
      ))}
    </div>
  );
}

function NavArrow({
  direction,
  onClick,
  disabled,
}: {
  direction: "left" | "right";
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className="absolute top-1/2 -translate-y-1/2 z-30 cursor-pointer disabled:cursor-not-allowed disabled:opacity-20"
      style={{ [direction]: "1.5rem" }}
      whileHover={{ scale: disabled ? 1 : 1.15 }}
      whileTap={{ scale: disabled ? 1 : 0.9 }}
    >
      <div className="glass-premium rounded-full w-14 h-14 flex items-center justify-center border border-gray-300/40 hover:border-red-400/50 transition-colors">
        <motion.span
          className="text-2xl text-gray-600"
          animate={!disabled ? { x: direction === "left" ? [-2, 2, -2] : [2, -2, 2] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {direction === "left" ? "‹" : "›"}
        </motion.span>
      </div>
    </motion.button>
  );
}

export function ScreenMatchAnimation({ pairs, onComplete }: ScreenMatchAnimationProps) {
  const [phase, setPhase] = useState<"intro" | "reveal-show" | "browse" | "done">("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showReveal, setShowReveal] = useState(false);
  const [direction, setDirection] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [autoProgress, setAutoProgress] = useState(0);

  const [bgParticles, setBgParticles] = useState<{ left: number; top: number; dur: number; delay: number; color: string }[]>([]);
  const [revealSparks, setRevealSparks] = useState<{ w: number; h: number; x: number; y: number; rotate: number; color: string }[]>([]);

  useEffect(() => {
    const colors = ["#FF9F43", "#E74C3C"];
    setBgParticles(
      Array.from({ length: 30 }, (_, i) => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        dur: 3 + Math.random() * 4,
        delay: Math.random() * 5,
        color: colors[i % 3 === 0 ? 0 : 1],
      }))
    );
  }, []);

  const AUTO_INTERVAL = 6000;

  const goTo = useCallback(
    (idx: number) => {
      if (idx < 0 || idx >= pairs.length) return;
      setDirection(idx > currentIndex ? 1 : -1);
      setShowReveal(false);
      setCurrentIndex(idx);
      setAutoProgress(0);
      soundManager.playScreenTransition();
      setTimeout(() => setShowReveal(true), 600);
    },
    [currentIndex, pairs.length]
  );

  const goToAuto = useCallback(
    (idx: number) => {
      const target = idx >= pairs.length ? 0 : idx;
      setDirection(1);
      setShowReveal(false);
      setCurrentIndex(target);
      setAutoProgress(0);
      soundManager.playScreenTransition();
      setTimeout(() => setShowReveal(true), 600);
    },
    [pairs.length]
  );

  const goPrev = useCallback(() => {
    setAutoPlay(false);
    goTo(currentIndex - 1);
  }, [goTo, currentIndex]);

  const goNext = useCallback(() => {
    setAutoPlay(false);
    if (currentIndex < pairs.length - 1) {
      goTo(currentIndex + 1);
    }
  }, [goTo, currentIndex, pairs.length]);

  const toggleAutoPlay = useCallback(() => {
    setAutoPlay((prev) => !prev);
    setAutoProgress(0);
  }, []);

  // Auto-play timer
  useEffect(() => {
    if (phase !== "browse" || !autoPlay) {
      setAutoProgress(0);
      return;
    }

    const tickMs = 50;
    let elapsed = 0;

    const ticker = setInterval(() => {
      elapsed += tickMs;
      setAutoProgress(elapsed / AUTO_INTERVAL);
      if (elapsed >= AUTO_INTERVAL) {
        goToAuto(currentIndex + 1);
        elapsed = 0;
      }
    }, tickMs);

    return () => clearInterval(ticker);
  }, [phase, autoPlay, currentIndex, goToAuto]);

  useEffect(() => {
    if (phase !== "browse") return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
      else if (e.key === " ") {
        e.preventDefault();
        toggleAutoPlay();
      } else if (e.key === "Escape") {
        setPhase("done");
        onComplete?.();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [phase, goPrev, goNext, toggleAutoPlay, onComplete]);

  useEffect(() => {
    if (!showReveal) return;
    const sparkColors = ["#E74C3C", "#FF9F43", "#FFD700", "#FF6B6B", "#FFA502"];
    setRevealSparks(
      Array.from({ length: 20 }, (_, i) => ({
        w: 2 + Math.random() * 4,
        h: 2 + Math.random() * 4,
        x: (Math.random() - 0.5) * 600,
        y: (Math.random() - 0.5) * 400,
        rotate: Math.random() * 720,
        color: sparkColors[i % 5],
      }))
    );
  }, [showReveal, currentIndex]);

  useEffect(() => {
    const introTimer = setTimeout(() => {
      soundManager.playScreenTransition();
      setPhase("reveal-show");
    }, 2500);
    return () => clearTimeout(introTimer);
  }, []);

  useEffect(() => {
    if (phase === "reveal-show") {
      soundManager.playMatchSuccess();
      setShowReveal(false);
      setCurrentIndex(0);
      const t = setTimeout(() => {
        setShowReveal(true);
        setPhase("browse");
      }, 800);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const currentPair = pairs[currentIndex];

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir >= 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir >= 0 ? -300 : 300,
      opacity: 0,
      scale: 0.9,
    }),
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Ambient Background Effects */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-[10%] left-[10%] w-[30vw] h-[30vw] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(220,50,30,0.06) 0%, transparent 70%)", filter: "blur(40px)" }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-[10%] right-[10%] w-[25vw] h-[25vw] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,159,67,0.05) 0%, transparent 70%)", filter: "blur(40px)" }}
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 5, repeat: Infinity }}
        />

        <div className="absolute inset-8 pointer-events-none">
          <HUDCorner position="tl" />
          <HUDCorner position="tr" />
          <HUDCorner position="bl" />
          <HUDCorner position="br" />
        </div>

        <DataStream side="left" />
        <DataStream side="right" />

        {bgParticles.map((p, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              background: p.color,
              boxShadow: `0 0 4px ${p.color === "#FF9F43" ? "rgba(255,159,67,0.5)" : "rgba(231,76,60,0.5)"}`,
            }}
            animate={{ y: [0, -30, 0], opacity: [0, 0.7, 0], scale: [0, 1, 0] }}
            transition={{ duration: p.dur, delay: p.delay, repeat: Infinity }}
          />
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait" custom={direction}>
        {/* Intro Phase */}
        {phase === "intro" && (
          <motion.div
            key="intro"
            className="relative z-10 flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
          >
            <LobsterSVG size={200} animate intensity="high" />
            <motion.h1
              className="text-5xl font-black mt-6 bg-linear-to-r from-red-400 via-orange-400 to-red-500 bg-clip-text text-transparent text-glow-strong"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🦞 盲盒配对中...
            </motion.h1>
            <p className="text-xl text-gray-600 mt-3">龙虾钳子正在寻找你的跨界搭子</p>
            <div className="flex gap-4 mt-8">
              {[...Array(7)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 rounded-full"
                  style={{ boxShadow: "0 0 10px rgba(231,76,60,0.5)" }}
                  animate={{
                    y: [0, -25, 0],
                    scale: [1, 1.4, 1],
                    backgroundColor: ["#E74C3C", "#FF9F43", "#FFD700", "#FF9F43", "#E74C3C"],
                  }}
                  transition={{ duration: 1.4, delay: i * 0.12, repeat: Infinity }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Browse Phase: 逐组展示配对 */}
        {(phase === "reveal-show" || phase === "browse") && currentPair && (
          <motion.div
            key={`pair-${currentIndex}`}
            className="relative z-10 flex items-center justify-center w-full px-20"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          >
            <EnergyConnection />
            {showReveal && <ShockwaveEffect />}

            {/* Left person */}
            <PairCard person={currentPair.user1} side="left" showReveal={showReveal} />

            {/* Center connection */}
            <motion.div
              className="mx-6 flex flex-col items-center shrink-0"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              <LobsterSVG size={90} animate intensity="high" />
              <motion.div
                className="mt-2 px-5 py-2 rounded-full lobster-gradient-metallic"
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(220,50,30,0.3), 0 0 40px rgba(220,50,30,0.1)",
                    "0 0 40px rgba(220,50,30,0.6), 0 0 80px rgba(220,50,30,0.2)",
                    "0 0 20px rgba(220,50,30,0.3), 0 0 40px rgba(220,50,30,0.1)",
                  ],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <p className="text-white font-bold text-lg">🤝 钳力碰撞</p>
              </motion.div>
            </motion.div>

            {/* Right person */}
            <PairCard person={currentPair.user2} side="right" showReveal={showReveal} />

            {showReveal &&
              revealSparks.map((s, i) => (
                <motion.div
                  key={`spark-${i}`}
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    width: s.w,
                    height: s.h,
                    background: s.color,
                    boxShadow: `0 0 6px ${s.color}`,
                    left: "50%",
                    top: "50%",
                  }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                  animate={{
                    x: s.x,
                    y: s.y,
                    opacity: [1, 0],
                    scale: [0, 2, 0],
                    rotate: s.rotate,
                  }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              ))}
          </motion.div>
        )}

        {/* Done Phase */}
        {phase === "done" && (
          <motion.div
            key="done"
            className="relative z-10 flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <LobsterSVG size={160} animate intensity="high" />
            <h2 className="text-4xl font-black mt-6 bg-linear-to-r from-red-500 via-orange-500 to-red-500 bg-clip-text text-transparent">配对完成！</h2>
            <p className="text-xl text-gray-600 mt-2">
              共 {pairs.length} 组跨界搭子诞生 🦞
            </p>
            <motion.div
              className="mt-8 px-8 py-3 rounded-full lobster-gradient-metallic"
              animate={{
                scale: [1, 1.05, 1],
                boxShadow: [
                  "0 0 20px rgba(220,50,30,0.3)",
                  "0 0 40px rgba(220,50,30,0.5)",
                  "0 0 20px rgba(220,50,30,0.3)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <p className="text-white text-xl font-bold">🎉 钳所未有的碰撞</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation arrows (browse mode only) */}
      {phase === "browse" && pairs.length > 1 && (
        <>
          <NavArrow direction="left" onClick={goPrev} disabled={currentIndex === 0} />
          <NavArrow direction="right" onClick={goNext} disabled={currentIndex === pairs.length - 1} />
        </>
      )}

      {/* Bottom bar: pagination + controls */}
      {(phase === "browse" || phase === "reveal-show") && (
        <motion.div
          className="absolute bottom-8 left-0 right-0 z-30 flex flex-col items-center gap-3"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {/* Auto-play progress bar */}
          {autoPlay && phase === "browse" && (
            <div className="w-64 h-1 bg-gray-300/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  width: `${autoProgress * 100}%`,
                  background: "linear-gradient(90deg, #E74C3C, #FF9F43)",
                  boxShadow: "0 0 8px rgba(255,159,67,0.5)",
                }}
              />
            </div>
          )}

          {/* Group counter */}
          <div className="glass-premium rounded-full px-6 py-2 flex items-center gap-3">
            <span className="text-red-500 font-bold text-xl font-mono">{currentIndex + 1}</span>
            <span className="text-gray-400 text-sm">/</span>
            <span className="text-gray-600 text-lg font-mono">{pairs.length}</span>
            <span className="text-gray-500 text-xs ml-2">组</span>
          </div>

          {/* Pagination dots */}
          {pairs.length <= 20 && (
            <PaginationDots
              total={pairs.length}
              current={currentIndex}
              onSelect={(i) => {
                setAutoPlay(false);
                goTo(i);
              }}
            />
          )}

          {/* Action buttons */}
          {phase === "browse" && (
            <div className="flex gap-3 mt-1">
              <motion.button
                onClick={toggleAutoPlay}
                className={`glass-premium rounded-full px-5 py-2 text-xs font-mono cursor-pointer transition-colors border ${
                  autoPlay
                    ? "text-orange-600 border-orange-400/30 hover:border-orange-500/50"
                    : "text-gray-600 border-gray-300/40 hover:border-red-400/30"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {autoPlay ? "⏸ 暂停轮播" : "▶ 自动轮播"}
              </motion.button>
              <motion.button
                onClick={() => {
                  setPhase("done");
                  onComplete?.();
                }}
                className="glass-premium rounded-full px-5 py-2 text-xs font-mono text-gray-600 border border-gray-300/40 hover:border-red-400/30 cursor-pointer transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                结束展示 ✓
              </motion.button>
            </div>
          )}
        </motion.div>
      )}

      {/* Keyboard hint */}
      {phase === "browse" && (
        <motion.div
          className="absolute top-6 right-6 z-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <div className="glass-premium rounded-xl px-4 py-2 text-xs font-mono text-gray-600 space-y-1">
            <p>← → 手动翻页</p>
            <p>空格 暂停/恢复</p>
            <p>ESC 结束展示</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
