"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface EnergyOrb {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

interface StarDust {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export function BubbleBackground() {
  const [orbs, setOrbs] = useState<EnergyOrb[]>([]);
  const [mounted, setMounted] = useState(false);
  const [starDust, setStarDust] = useState<StarDust[]>([]);

  useEffect(() => {
    setMounted(true);
    setStarDust(
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 1 + Math.random() * 2.5,
        duration: 3 + Math.random() * 5,
        delay: Math.random() * 6,
      }))
    );
    setOrbs(
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        size: 6 + Math.random() * 16,
        duration: 10 + Math.random() * 14,
        delay: Math.random() * 8,
        opacity: 0.12 + Math.random() * 0.25,
      }))
    );
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Soft wave layers */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute w-[140%] h-[40%] top-[-5%] left-[-20%]"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.08) 30%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.06) 70%, transparent 100%)",
            filter: "blur(60px)",
          }}
          animate={{
            x: ["-10%", "5%", "-10%"],
            rotate: [-3, 2, -3],
            scaleY: [1, 1.15, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[120%] h-[35%] top-[5%] left-[-10%]"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(92,188,186,0.06) 40%, rgba(92,188,186,0.1) 55%, rgba(92,188,186,0.04) 70%, transparent 100%)",
            filter: "blur(80px)",
          }}
          animate={{
            x: ["5%", "-15%", "5%"],
            rotate: [2, -3, 2],
            scaleY: [1.1, 0.9, 1.1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[130%] h-[30%] bottom-[-5%] left-[-15%]"
          style={{
            background:
              "linear-gradient(0deg, transparent 0%, rgba(255,255,255,0.06) 40%, rgba(255,255,255,0.1) 60%, transparent 100%)",
            filter: "blur(70px)",
          }}
          animate={{
            x: ["-5%", "10%", "-5%"],
            scaleY: [1, 1.2, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Ambient gradient orbs */}
      <motion.div
        className="absolute top-[-15%] left-[-8%] w-[55vw] h-[55vw] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.06) 40%, transparent 70%)",
        }}
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-15%] right-[-8%] w-[45vw] h-[45vw] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(92,188,186,0.1) 0%, rgba(92,188,186,0.04) 40%, transparent 70%)",
        }}
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Star dust */}
      {starDust.map((s) => (
        <motion.div
          key={`star-${s.id}`}
          className="absolute rounded-full"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            background: "rgba(255, 255, 255, 0.7)",
            boxShadow: `0 0 ${s.size * 2}px rgba(255, 255, 255, 0.4)`,
          }}
          animate={{
            opacity: [0, 0.8, 0],
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Rising bubbles */}
      {mounted &&
        orbs.map((b) => (
          <motion.div
            key={b.id}
            className="absolute rounded-full"
            style={{
              left: `${b.x}%`,
              bottom: "-5%",
              width: b.size,
              height: b.size,
              background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,${b.opacity}), rgba(255,255,255,${b.opacity * 0.3}) 60%, transparent 100%)`,
              boxShadow: `0 0 ${b.size}px rgba(255,255,255,${b.opacity * 0.3})`,
            }}
            animate={{
              y: [0, -(window?.innerHeight ?? 800) * 1.2],
              opacity: [0, b.opacity, b.opacity * 0.8, 0],
              scale: [0.3, 1, 0.8, 0.3],
            }}
            transition={{
              duration: b.duration,
              delay: b.delay,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        ))}
    </div>
  );
}
