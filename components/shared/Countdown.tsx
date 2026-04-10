"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EVENT_DATE = new Date("2026-04-13T13:30:00+08:00");

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(): TimeLeft {
  const diff = EVENT_DATE.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="relative w-[52px] h-[56px] sm:w-[60px] sm:h-[64px] rounded-xl overflow-hidden"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.95) 50%, rgba(255,255,255,0.9) 100%)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8), 0 0 15px rgba(92,188,186,0.1)",
          border: "1px solid rgba(92,188,186,0.25)",
        }}
      >
        {/* Fold line */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-px h-px bg-black/10 z-10" />
        <div className="absolute left-0 right-0 top-1/2 translate-y-px h-px bg-white/50 z-10" />

        {/* Number with flip animation */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={value}
            initial={{ rotateX: -80, opacity: 0, y: -4 }}
            animate={{ rotateX: 0, opacity: 1, y: 0 }}
            exit={{ rotateX: 80, opacity: 0, y: 4 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute inset-0 flex items-center justify-center"
            style={{ perspective: "100px" }}
          >
            <span className="text-2xl sm:text-3xl font-black font-mono text-red-500 tabular-nums" style={{ textShadow: "0 0 12px rgba(220,50,30,0.25)" }}>
              {String(value).padStart(2, "0")}
            </span>
          </motion.div>
        </AnimatePresence>

        {/* Subtle top highlight */}
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-linear-to-b from-white/30 to-transparent pointer-events-none" />
      </div>
      <span className="text-sm text-gray-700 mt-1.5 tracking-[0.15em] font-medium">{label}</span>
    </div>
  );
}

function ColonSeparator({ delay = 0 }: { delay?: number }) {
  return (
    <div className="flex flex-col items-center gap-1.5 mt-[-18px]">
      <motion.div
        className="w-1.5 h-1.5 rounded-full bg-red-500/60"
        animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
        transition={{ duration: 1, repeat: Infinity, delay }}
      />
      <motion.div
        className="w-1.5 h-1.5 rounded-full bg-red-500/60"
        animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
        transition={{ duration: 1, repeat: Infinity, delay: delay + 0.15 }}
      />
    </div>
  );
}

export function Countdown() {
  const [time, setTime] = useState<TimeLeft>(getTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isOver = time.days === 0 && time.hours === 0 && time.minutes === 0 && time.seconds === 0;

  if (isOver) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center"
      >
        <p className="text-2xl font-bold text-red-400 text-glow-strong">🦞 活动进行中！</p>
      </motion.div>
    );
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3 justify-center">
      <TimeBlock value={time.days} label="天" />
      <ColonSeparator delay={0} />
      <TimeBlock value={time.hours} label="时" />
      <ColonSeparator delay={0.25} />
      <TimeBlock value={time.minutes} label="分" />
      <ColonSeparator delay={0.5} />
      <TimeBlock value={time.seconds} label="秒" />
    </div>
  );
}
