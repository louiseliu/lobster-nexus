"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { LobsterSVG } from "./LobsterSVG";

interface LobsterCheckinProps {
  name: string;
  industry: string;
}

interface ConfettiPiece {
  x: number;
  y: number;
  rotate: number;
  color: string;
  size: number;
  shape: "circle" | "star" | "diamond" | "rect";
  delay: number;
}

function ConfettiShape({ piece }: { piece: ConfettiPiece }) {
  const style: React.CSSProperties = {
    position: "absolute" as const,
    width: piece.size,
    height: piece.size,
    background: piece.color,
  };

  if (piece.shape === "circle") {
    return <div style={{ ...style, borderRadius: "50%" }} />;
  }
  if (piece.shape === "diamond") {
    return <div style={{ ...style, transform: "rotate(45deg)" }} />;
  }
  if (piece.shape === "star") {
    return (
      <svg width={piece.size} height={piece.size} viewBox="0 0 10 10" style={{ position: "absolute" }}>
        <polygon
          points="5,0 6.2,3.5 10,3.5 7,5.8 8.2,10 5,7.5 1.8,10 3,5.8 0,3.5 3.8,3.5"
          fill={piece.color}
        />
      </svg>
    );
  }
  return (
    <div
      style={{
        ...style,
        width: piece.size * 0.5,
        height: piece.size * 1.5,
        borderRadius: "2px",
      }}
    />
  );
}

export function LobsterCheckin({ name, industry }: LobsterCheckinProps) {
  const confetti = useMemo<ConfettiPiece[]>(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        x: (Math.random() - 0.5) * 350,
        y: (Math.random() - 0.5) * 350,
        rotate: Math.random() * 720,
        color: ["#E74C3C", "#FF9F43", "#FFD700", "#FF6B6B", "#FFA502", "#E67E22"][i % 6],
        size: 4 + Math.random() * 8,
        shape: (["circle", "star", "diamond", "rect"] as const)[i % 4],
        delay: Math.random() * 0.3,
      })),
    []
  );

  return (
    <motion.div
      className="flex flex-col items-center py-8 relative"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
    >
      {/* Shockwave rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={`ring-${i}`}
          className="absolute rounded-full border border-red-500/30"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
          initial={{ width: 0, height: 0, opacity: 0.6 }}
          animate={{
            width: [0, 300],
            height: [0, 300],
            opacity: [0.5, 0],
          }}
          transition={{
            duration: 1.5,
            delay: 0.2 + i * 0.25,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Light pillar effect */}
      <motion.div
        className="absolute"
        style={{
          width: "80px",
          height: "300px",
          top: "-100px",
          background:
            "linear-gradient(180deg, rgba(220,50,30,0.3) 0%, rgba(255,150,50,0.15) 30%, transparent 100%)",
          filter: "blur(20px)",
        }}
        initial={{ opacity: 0, scaleY: 0 }}
        animate={{ opacity: [0, 0.8, 0], scaleY: [0, 1, 0.5] }}
        transition={{ duration: 2, ease: "easeOut" }}
      />

      {/* Multi-shape confetti */}
      {confetti.map((piece, i) => (
        <motion.div
          key={i}
          style={{ position: "absolute" }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
          animate={{
            x: piece.x,
            y: piece.y,
            opacity: [1, 1, 0],
            scale: [0, 1.5, 0.5],
            rotate: piece.rotate,
          }}
          transition={{ duration: 1.8, ease: "easeOut", delay: piece.delay }}
        >
          <ConfettiShape piece={piece} />
        </motion.div>
      ))}

      {/* Lobster with bounce */}
      <motion.div
        animate={{
          y: [0, -20, 0, -10, 0],
          scale: [1, 1.05, 1, 1.02, 1],
        }}
        transition={{ duration: 2, repeat: 2, ease: "easeInOut" }}
      >
        <LobsterSVG size={150} animate intensity="high" />
      </motion.div>

      {/* Welcome text with glow */}
      <motion.div
        className="text-center mt-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-white mb-1 text-glow">
          欢迎你，{name}！
        </h2>
        <p className="text-sm text-red-300/80">
          来自 <span className="font-bold text-red-300">{industry}</span> 的龙虾局新伙伴
        </p>
      </motion.div>

      {/* Success badge with premium glass */}
      <motion.div
        className="mt-6 glass-premium rounded-2xl px-6 py-3"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8 }}
      >
        <p className="text-sm text-green-400 font-bold flex items-center gap-2">
          <motion.span
            animate={{
              scale: [1, 1.4, 1],
              filter: [
                "drop-shadow(0 0 0px rgba(74,222,128,0))",
                "drop-shadow(0 0 8px rgba(74,222,128,0.6))",
                "drop-shadow(0 0 0px rgba(74,222,128,0))",
              ],
            }}
            transition={{ duration: 0.5, repeat: 3 }}
          >
            ✅
          </motion.span>
          签到成功
        </p>
      </motion.div>

      <motion.p
        className="text-xs text-gray-500 mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        准备好开启跨界碰撞了吗？🦞
      </motion.p>
    </motion.div>
  );
}
