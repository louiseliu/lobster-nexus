"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";

interface CardInfo {
  name: string;
  industry: string;
  company: string;
  title: string;
  bio?: string;
  avatar?: string;
}

interface LobsterClawCardProps {
  card: CardInfo;
  onComplete?: () => void;
  trigger: boolean;
}

export function LobsterClawCard({ card, onComplete, trigger }: LobsterClawCardProps) {
  const [phase, setPhase] = useState<"idle" | "claws-enter" | "card-show" | "done">("idle");

  const sparks = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        x: (Math.random() - 0.5) * 200,
        y: (Math.random() - 0.5) * 150,
        size: 1 + Math.random() * 3,
        color: ["#FFD700", "#FF9F43", "#FF6B6B", "#FFA502"][i % 4],
        delay: Math.random() * 0.3,
        duration: 0.8 + Math.random() * 0.6,
      })),
    []
  );

  useEffect(() => {
    if (!trigger) return;
    setPhase("claws-enter");
    const t1 = setTimeout(() => setPhase("card-show"), 800);
    const t2 = setTimeout(() => {
      setPhase("done");
      onComplete?.();
    }, 3000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [trigger, onComplete]);

  return (
    <div className="relative w-full h-80 flex items-center justify-center overflow-hidden">
      <AnimatePresence>
        {(phase === "claws-enter" || phase === "card-show") && (
          <>
            {/* Left Claw with metallic sheen */}
            <motion.svg
              viewBox="0 0 120 100"
              className="absolute left-0 top-1/2 w-28 h-24 z-20"
              initial={{ x: -120, y: "-50%", rotate: 0 }}
              animate={{
                x: phase === "card-show" ? 20 : -20,
                y: "-50%",
                rotate: phase === "card-show" ? -10 : 0,
              }}
              exit={{ x: -120 }}
              transition={{ type: "spring", stiffness: 120, damping: 15 }}
            >
              <defs>
                <linearGradient id="clawMetalL" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#C0392B" />
                  <stop offset="30%" stopColor="#E74C3C" />
                  <stop offset="50%" stopColor="#FF6B6B" />
                  <stop offset="70%" stopColor="#E74C3C" />
                  <stop offset="100%" stopColor="#A01E1E" />
                </linearGradient>
                <filter id="clawGlowL">
                  <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#E74C3C" floodOpacity="0.4" />
                </filter>
              </defs>
              <path
                d="M120 50 L60 30 L30 10 Q15 5 10 15 L40 30 L20 15 Q10 8 8 20 L50 40 L120 55Z"
                fill="url(#clawMetalL)"
                stroke="#8B1A1A"
                strokeWidth="1.5"
                filter="url(#clawGlowL)"
              />
              {/* Specular highlight */}
              <path
                d="M80 42 L50 28 L35 18"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path d="M10 15 Q0 10 5 0" fill="none" stroke="#E74C3C" strokeWidth="5" strokeLinecap="round" />
              <path d="M8 20 Q-2 15 0 5" fill="none" stroke="#E74C3C" strokeWidth="5" strokeLinecap="round" />
            </motion.svg>

            {/* Right Claw with metallic sheen */}
            <motion.svg
              viewBox="0 0 120 100"
              className="absolute right-0 top-1/2 w-28 h-24 z-20"
              initial={{ x: 120, y: "-50%", rotate: 0 }}
              animate={{
                x: phase === "card-show" ? -20 : 20,
                y: "-50%",
                rotate: phase === "card-show" ? 10 : 0,
              }}
              exit={{ x: 120 }}
              transition={{ type: "spring", stiffness: 120, damping: 15 }}
            >
              <defs>
                <linearGradient id="clawMetalR" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#C0392B" />
                  <stop offset="30%" stopColor="#E74C3C" />
                  <stop offset="50%" stopColor="#FF6B6B" />
                  <stop offset="70%" stopColor="#E74C3C" />
                  <stop offset="100%" stopColor="#A01E1E" />
                </linearGradient>
                <filter id="clawGlowR">
                  <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#E74C3C" floodOpacity="0.4" />
                </filter>
              </defs>
              <path
                d="M0 50 L60 30 L90 10 Q105 5 110 15 L80 30 L100 15 Q110 8 112 20 L70 40 L0 55Z"
                fill="url(#clawMetalR)"
                stroke="#8B1A1A"
                strokeWidth="1.5"
                filter="url(#clawGlowR)"
              />
              <path
                d="M40 42 L70 28 L85 18"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path d="M110 15 Q120 10 115 0" fill="none" stroke="#E74C3C" strokeWidth="5" strokeLinecap="round" />
              <path d="M112 20 Q122 15 120 5" fill="none" stroke="#E74C3C" strokeWidth="5" strokeLinecap="round" />
            </motion.svg>

            {/* Spark particles on claw grab */}
            {phase === "card-show" &&
              sparks.map((spark, i) => (
                <motion.div
                  key={`spark-${i}`}
                  className="absolute rounded-full z-30"
                  style={{
                    left: "50%",
                    top: "50%",
                    width: spark.size,
                    height: spark.size,
                    background: spark.color,
                    boxShadow: `0 0 ${spark.size * 3}px ${spark.color}`,
                  }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                  animate={{
                    x: spark.x,
                    y: spark.y,
                    opacity: [1, 0.8, 0],
                    scale: [0, 1.5, 0],
                  }}
                  transition={{
                    duration: spark.duration,
                    delay: spark.delay,
                    ease: "easeOut",
                  }}
                />
              ))}

            {/* Name Card */}
            {phase === "card-show" && (
              <motion.div
                className="relative z-10 w-64 rounded-2xl p-5 border border-red-500/30"
                initial={{ scale: 0, rotateY: 180, opacity: 0 }}
                animate={{ scale: 1, rotateY: 0, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 12, delay: 0.2 }}
                style={{
                  background: "linear-gradient(135deg, rgba(30,30,40,0.92), rgba(50,30,35,0.88))",
                  boxShadow:
                    "0 0 30px rgba(220,50,30,0.2), 0 0 60px rgba(220,50,30,0.1), inset 0 1px 0 rgba(255,255,255,0.08)",
                }}
              >
                {/* Holographic sweep overlay */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(105deg, transparent 40%, rgba(255,200,100,0.08) 45%, rgba(255,200,100,0.12) 50%, rgba(255,200,100,0.08) 55%, transparent 60%)",
                    }}
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
                  />
                </div>

                <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-red-600/15 to-orange-500/8" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <motion.div
                      className="w-12 h-12 rounded-full lobster-gradient-metallic flex items-center justify-center text-white text-xl font-bold overflow-hidden"
                      style={{ boxShadow: "0 0 15px rgba(220,50,30,0.3)" }}
                      animate={{
                        boxShadow: [
                          "0 0 15px rgba(220,50,30,0.3)",
                          "0 0 25px rgba(220,50,30,0.5)",
                          "0 0 15px rgba(220,50,30,0.3)",
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {card.avatar ? (
                        <img src={card.avatar} alt={card.name} className="w-full h-full object-cover" />
                      ) : (
                        card.name[0]
                      )}
                    </motion.div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{card.name}</h3>
                      <p className="text-xs text-red-300/80">
                        {card.company} · {card.title}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 text-xs border border-red-500/30 animate-glow-pulse">
                      {card.industry}
                    </span>
                  </div>
                  {card.bio && (
                    <p className="text-sm text-gray-300/80 mt-2 italic">&ldquo;{card.bio}&rdquo;</p>
                  )}
                </div>

                {/* Enhanced sparkles */}
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      top: `${15 + Math.random() * 70}%`,
                      left: `${8 + Math.random() * 84}%`,
                      width: 2,
                      height: 2,
                      background: i % 2 === 0 ? "#FFD700" : "#FF6B6B",
                      boxShadow: `0 0 4px ${i % 2 === 0 ? "#FFD700" : "#FF6B6B"}`,
                    }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1.5, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
