"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LobsterSVG } from "@/components/lobster/LobsterSVG";
import { BubbleBackground } from "@/components/lobster/BubbleBackground";
import { ScreenMatchAnimation } from "@/components/lobster/ScreenMatchAnimation";
import { soundManager } from "@/lib/sounds";

interface Participant {
  id: string;
  name: string;
  industry: string;
  company: string;
  title: string;
  avatarSeed?: string;
  avatar?: string;
  checkedIn: boolean;
}

interface MatchPair {
  user1: Participant;
  user2: Participant;
}

type ScreenMode = "checkin-wall" | "countdown" | "matching";

const INDUSTRY_COLORS: Record<string, string> = {
  "科技": "#3B82F6",
  "金融": "#F59E0B",
  "教育": "#8B5CF6",
  "医疗": "#10B981",
  "地产": "#EF4444",
  "文创": "#EC4899",
  "餐饮": "#F97316",
  "零售": "#06B6D4",
  "制造": "#6366F1",
  "服务": "#14B8A6",
};

function getIndustryColor(industry: string): string {
  return INDUSTRY_COLORS[industry] || "#E74C3C";
}

function SystemClock() {
  const [time, setTime] = useState("--:--:--");
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("zh-CN", { hour12: false }));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);
  return <span className="font-mono text-2xl font-bold text-gray-600/50 tabular-nums tracking-wider">{time}</span>;
}

function DataTicker({ industries, checkedIn, total }: { industries: string[]; checkedIn: number; total: number }) {
  const messages = useMemo(() => {
    const rate = total > 0 ? Math.round((checkedIn / total) * 100) : 0;
    const msgs = [
      "🦞 龙虾智脑 v2.6.0",
      `签到率: ${rate}%`,
      `${industries.length} 个行业赛道已连接`,
      "跨界匹配算法: 运行中",
      "缘分引擎: 校准完毕",
      ...industries.map((ind) => `赛道 [${ind}] ✓`),
      "盲盒协议: 已就绪",
      `在线节点: ${checkedIn}`,
    ];
    return msgs.join("    ·    ");
  }, [industries, checkedIn, total]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 h-9 overflow-hidden">
      <div className="absolute inset-0 bg-white/30 backdrop-blur-md border-t border-white/20" />
      <div className="absolute left-0 top-0 bottom-0 w-24 z-10" style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.8) 0%, transparent 100%)" }} />
      <div className="absolute right-0 top-0 bottom-0 w-24 z-10" style={{ background: "linear-gradient(270deg, rgba(255,255,255,0.8) 0%, transparent 100%)" }} />
      <div className="relative h-full flex items-center">
        <div className="animate-data-ticker whitespace-nowrap text-sm font-mono text-gray-500/60 tracking-wider">
          {messages}
        </div>
      </div>
    </div>
  );
}

interface NeuralNode {
  x: number;
  y: number;
  delay: number;
  dur: number;
  connections: number[];
}

function NeuralGrid({ count }: { count: number }) {
  const [nodes, setNodes] = useState<NeuralNode[]>([]);

  useEffect(() => {
    const raw = Array.from({ length: Math.min(count * 3, 60) }, () => ({
      x: 5 + Math.random() * 90,
      y: 5 + Math.random() * 90,
      delay: Math.random() * 5,
      dur: 3 + Math.random() * 4,
      connections: [] as number[],
    }));
    for (let i = 0; i < raw.length; i++) {
      for (let j = i + 1; j < Math.min(i + 4, raw.length); j++) {
        const dx = raw[i].x - raw[j].x;
        const dy = raw[i].y - raw[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 25) raw[i].connections.push(j);
      }
    }
    setNodes(raw);
  }, [count]);

  if (nodes.length === 0) return null;

  return (
    <svg className="fixed inset-0 w-full h-full pointer-events-none opacity-15 z-1" preserveAspectRatio="none">
      <defs>
        <radialGradient id="nodeGradLight">
          <stop offset="0%" stopColor="rgba(220,50,30,0.5)" />
          <stop offset="100%" stopColor="rgba(220,50,30,0)" />
        </radialGradient>
      </defs>
      {nodes.map((node, i) =>
        node.connections.map((j) => (
          <motion.line
            key={`l-${i}-${j}`}
            x1={`${node.x}%`}
            y1={`${node.y}%`}
            x2={`${nodes[j].x}%`}
            y2={`${nodes[j].y}%`}
            stroke="rgba(220,50,30,0.06)"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 0.4, 0.4, 0] }}
            transition={{ duration: node.dur, delay: node.delay, repeat: Infinity }}
          />
        ))
      )}
      {nodes.map((node, i) => (
        <motion.circle
          key={`n-${i}`}
          cx={`${node.x}%`}
          cy={`${node.y}%`}
          r="2.5"
          fill="url(#nodeGradLight)"
          animate={{ r: [2, 4, 2], opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: node.dur, delay: node.delay, repeat: Infinity }}
        />
      ))}
    </svg>
  );
}

function AmbientOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none z-1 overflow-hidden">
      <motion.div
        className="absolute rounded-full"
        style={{
          width: "40vw",
          height: "40vw",
          top: "-10%",
          left: "-5%",
          background: "radial-gradient(circle, rgba(220,50,30,0.06) 0%, rgba(220,50,30,0.02) 40%, transparent 70%)",
          filter: "blur(40px)",
        }}
        animate={{
          x: [0, 80, 0],
          y: [0, 40, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: "35vw",
          height: "35vw",
          bottom: "-5%",
          right: "-5%",
          background: "radial-gradient(circle, rgba(255,159,67,0.05) 0%, rgba(255,159,67,0.02) 40%, transparent 70%)",
          filter: "blur(50px)",
        }}
        animate={{
          x: [0, -60, 0],
          y: [0, -30, 0],
          scale: [1.1, 0.95, 1.1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: "25vw",
          height: "25vw",
          top: "40%",
          left: "60%",
          background: "radial-gradient(circle, rgba(92,188,186,0.04) 0%, transparent 60%)",
          filter: "blur(40px)",
        }}
        animate={{
          x: [-40, 40, -40],
          y: [-20, 30, -20],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function MatchCountdown({
  onComplete,
  count,
}: {
  onComplete: () => void;
  count: number;
}) {
  const [sparks, setSparks] = useState<{ left: number; top: number; dur: number; delay: number; size: number }[]>([]);

  useEffect(() => {
    setSparks(
      Array.from({ length: 40 }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        dur: 1 + Math.random() * 2,
        delay: Math.random() * 2,
        size: 2 + Math.random() * 4,
      }))
    );
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, rgba(255,255,255,0.95) 0%, rgba(240,230,225,0.98) 100%)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={`pulse-${i}`}
          className="absolute rounded-full"
          style={{
            border: "2px solid",
            borderImage: "linear-gradient(135deg, rgba(220,50,30,0.3), rgba(255,159,67,0.2)) 1",
            borderRadius: "9999px",
            borderColor: `rgba(220,50,30,${0.15 - i * 0.03})`,
          }}
          animate={{ width: [80, 1000], height: [80, 1000], opacity: [0.4, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.5, ease: "easeOut" }}
        />
      ))}

      <motion.div className="relative z-10 flex flex-col items-center">
        <LobsterSVG size={140} animate intensity="high" />

        <motion.div className="mt-8 text-center">
          <motion.p
            className="text-lg font-mono tracking-[0.5em] mb-2"
            style={{
              background: "linear-gradient(90deg, #E74C3C, #FF9F43)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            钳力碰撞 · 初始化
          </motion.p>
          <motion.p
            className="text-2xl font-black text-gray-700 tracking-[0.3em] mb-8"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            盲盒配对即将开始
          </motion.p>

          <AnimatePresence mode="wait">
            <motion.div
              key={count}
              className="relative"
              initial={{ scale: 3, opacity: 0, rotateX: -90 }}
              animate={{ scale: 1, opacity: 1, rotateX: 0 }}
              exit={{ scale: 0.3, opacity: 0, y: -80 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <span
                className="text-[16rem] font-black tabular-nums leading-none"
                style={{
                  background: "linear-gradient(180deg, #E74C3C 0%, #FF9F43 50%, #FFD700 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 0 60px rgba(220,50,30,0.3))",
                }}
              >
                {count}
              </span>
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 4], opacity: [0.5, 0] }}
                transition={{ duration: 0.8 }}
              >
                <div
                  className="w-48 h-48 rounded-full border-2 border-red-400/30"
                  style={{ boxShadow: "0 0 40px rgba(220,50,30,0.15)" }}
                />
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <motion.div
          className="mt-10 w-[500px] h-2 rounded-full overflow-hidden"
          style={{ background: "rgba(220,50,30,0.08)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: "linear-gradient(90deg, #E74C3C, #FF9F43, #FFD700)",
              boxShadow: "0 0 20px rgba(255,159,67,0.4)",
            }}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 3, ease: "linear" }}
            onAnimationComplete={onComplete}
          />
        </motion.div>
      </motion.div>

      {sparks.map((s, i) => (
        <motion.div
          key={`spark-${i}`}
          className="absolute rounded-full"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            background: ["#FF6B6B", "#FF9F43", "#FFD700", "#E74C3C"][i % 4],
            boxShadow: `0 0 ${s.size * 2}px ${["#FF6B6B", "#FF9F43", "#FFD700", "#E74C3C"][i % 4]}40`,
          }}
          animate={{ scale: [0, 1.5, 0], opacity: [0, 0.7, 0] }}
          transition={{ duration: s.dur, delay: s.delay, repeat: Infinity }}
        />
      ))}
    </motion.div>
  );
}

function MatchButton({
  onClick,
  checkedInCount,
  round,
}: {
  onClick: () => void;
  checkedInCount: number;
  round: number;
}) {
  return (
    <motion.div
      className="fixed bottom-14 left-1/2 -translate-x-1/2 z-40"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
    >
      <motion.button
        onClick={onClick}
        disabled={checkedInCount < 2}
        className="relative group cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          className="absolute -inset-6 rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(220,50,30,0.15) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        <motion.div
          className="absolute -inset-2 rounded-full"
          style={{ border: "2px solid rgba(220,50,30,0.15)" }}
          animate={{
            boxShadow: [
              "0 0 20px rgba(220,50,30,0.1)",
              "0 0 50px rgba(220,50,30,0.25)",
              "0 0 20px rgba(220,50,30,0.1)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        <div className="relative px-16 py-6 rounded-full lobster-gradient-metallic overflow-hidden shadow-2xl shadow-red-500/20">
          <motion.div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.15) 45%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.15) 55%, transparent 65%)",
            }}
            animate={{ x: ["-200%", "200%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative flex items-center gap-5">
            <motion.span
              className="text-4xl"
              animate={{ rotate: [0, -15, 15, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              🎲
            </motion.span>
            <div className="text-left">
              <p className="text-white font-black text-2xl leading-tight tracking-wider">
                🦞 开始配对
              </p>
              <p className="text-white/60 text-sm font-mono tracking-widest">
                第{round}轮 · {checkedInCount}人就绪
              </p>
            </div>
          </div>
        </div>
      </motion.button>
    </motion.div>
  );
}

function NodeCard({ p, index }: { p: Participant; index: number }) {
  const color = getIndustryColor(p.industry);
  const floatDelay = index * 0.3;
  const floatDuration = 4 + (index % 3);

  return (
    <motion.div
      key={p.id}
      className="glass-premium rounded-2xl p-5 w-[200px] text-center relative overflow-hidden"
      style={{
        boxShadow: `0 4px 24px rgba(0,0,0,0.04), 0 0 0 1px ${color}10`,
      }}
      initial={{ opacity: 0, scale: 0, rotate: -10, filter: "blur(10px)" }}
      animate={{
        opacity: 1,
        scale: 1,
        rotate: 0,
        filter: "blur(0px)",
        y: [0, -4, 0, 4, 0],
      }}
      transition={{
        opacity: { delay: index * 0.06, duration: 0.5 },
        scale: { delay: index * 0.06, duration: 0.6, type: "spring" },
        rotate: { delay: index * 0.06, duration: 0.6 },
        filter: { delay: index * 0.06, duration: 0.4 },
        y: { delay: floatDelay, duration: floatDuration, repeat: Infinity, ease: "easeInOut" },
      }}
      whileHover={{
        scale: 1.08,
        boxShadow: `0 12px 40px ${color}20, 0 0 0 2px ${color}30`,
      }}
    >
      <motion.div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, ${color}60, ${color}20)` }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: index * 0.06 + 0.3, duration: 0.4 }}
      />

      <div className="flex justify-center mb-1.5">
        <motion.div
          className="w-2 h-2 rounded-full"
          style={{ background: color }}
          animate={{ opacity: [0.5, 1, 0.5], boxShadow: [`0 0 4px ${color}40`, `0 0 10px ${color}60`, `0 0 4px ${color}40`] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.1 }}
        />
        <span className="text-xs font-bold ml-1.5" style={{ color }}>在线</span>
      </div>

      <motion.div
        className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-white text-2xl font-bold mb-3 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${color}, ${color}CC)`,
          boxShadow: `0 4px 16px ${color}30`,
        }}
      >
        {p.avatar ? (
          <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
        ) : (
          p.name[0]
        )}
        <motion.div
          className="absolute inset-[-2px] rounded-full"
          style={{ border: `2px solid ${color}20`, borderTopColor: `${color}50` }}
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>

      <p className="text-gray-900 font-black text-base truncate">{p.name}</p>
      <p className="text-sm text-gray-700 truncate font-medium mt-0.5">{p.company}</p>
      <span
        className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold border"
        style={{
          background: `${color}12`,
          color: color,
          borderColor: `${color}30`,
        }}
      >
        {p.industry}
      </span>
    </motion.div>
  );
}

function LiveCounter({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <motion.p
        className="text-5xl font-black tabular-nums leading-none"
        style={{
          background: "linear-gradient(180deg, #E74C3C, #FF9F43)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          filter: "drop-shadow(0 2px 8px rgba(220,50,30,0.15))",
        }}
        key={value}
        initial={{ scale: 1.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {value}
      </motion.p>
      <p className="text-sm text-gray-500 mt-1 font-medium tracking-wider">{label}</p>
    </div>
  );
}

export default function ScreenPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [mode, setMode] = useState<ScreenMode>("checkin-wall");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [matchPairs, setMatchPairs] = useState<MatchPair[]>([]);
  const [round, setRound] = useState(1);
  const [countdown, setCountdown] = useState(3);

  const fetchParticipants = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users", {
        headers: { "x-admin-password": password },
      });
      if (res.ok) {
        const data = await res.json();
        setParticipants(data.participants);
      }
    } catch {
      // ignore
    }
  }, [password]);

  useEffect(() => {
    if (!authed) return;
    fetchParticipants();
    const interval = setInterval(fetchParticipants, 5000);
    return () => clearInterval(interval);
  }, [authed, fetchParticipants]);

  const handleLogin = () => {
    setAuthed(true);
    soundManager.init();
  };

  const startMatchSequence = () => {
    setCountdown(3);
    setMode("countdown");
    soundManager.playDrumRoll();

    setTimeout(() => {
      soundManager.playCountdownTick();
      setCountdown(3);
    }, 0);

    setTimeout(() => {
      soundManager.playCountdownTick();
      setCountdown(2);
    }, 1000);

    setTimeout(() => {
      soundManager.playCountdownTick();
      setCountdown(1);
    }, 2000);
  };

  const executeMatch = async () => {
    soundManager.playCountdownFinal();
    try {
      const res = await fetch("/api/admin/match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({ round }),
      });
      const data = await res.json();
      if (res.ok && data.pairs.length > 0) {
        setMatchPairs(data.pairs);
        setTimeout(() => setMode("matching"), 600);
      } else {
        setMode("checkin-wall");
      }
    } catch {
      setMode("checkin-wall");
    }
  };

  const checkedInList = participants.filter((p) => p.checkedIn);
  const industries = [...new Set(checkedInList.map((p) => p.industry))];

  if (!authed) {
    return (
      <main className="min-h-screen overflow-hidden relative flex items-center justify-center">
        <BubbleBackground />
        <AmbientOrbs />

        <motion.div
          className="relative z-10 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <LobsterSVG size={120} animate intensity="high" />
          <h1
            className="text-5xl font-black mt-6 mb-2 tracking-wider"
            style={{
              background: "linear-gradient(135deg, #E74C3C, #FF9F43, #FFD700, #FF9F43, #E74C3C)",
              backgroundSize: "200% 200%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "metallic-shift 3s ease-in-out infinite",
            }}
          >
            昆明龙虾局
          </h1>
          <p className="text-lg font-mono text-gray-500 tracking-[0.3em] mb-8">跨界匹配控制台 · 大屏投影</p>
          <motion.div
            className="glass-premium rounded-3xl p-8 w-80 mx-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <input
              type="password"
              placeholder="管理密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="block w-full px-5 py-4 rounded-xl bg-white/50 border border-red-200/30 text-gray-800 text-center text-xl mb-5 outline-none focus:border-red-400/50 focus:shadow-[0_0_24px_rgba(220,50,30,0.1)] font-mono tracking-wider transition-all"
            />
            <button
              onClick={handleLogin}
              className="w-full px-8 py-4 rounded-xl lobster-gradient-metallic text-white font-bold text-xl shadow-xl shadow-red-500/15 hover:shadow-2xl hover:shadow-red-500/25 transition-shadow"
            >
              进入大屏
            </button>
          </motion.div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden relative">
      <BubbleBackground />
      <AmbientOrbs />
      <NeuralGrid count={checkedInList.length} />

      {/* Control bar - subtle, top-left, hover to reveal */}
      <motion.div
        className="fixed top-3 left-3 z-50 flex gap-1.5 opacity-10 hover:opacity-100 transition-opacity duration-500"
      >
        <button
          onClick={() => setMode("checkin-wall")}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
            mode === "checkin-wall" ? "lobster-gradient-metallic text-white" : "bg-white/70 text-gray-500 hover:text-gray-700"
          }`}
        >
          签到墙
        </button>
        <button
          onClick={() => setRound((r) => r + 1)}
          className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-white/70 text-gray-500 hover:text-gray-700"
        >
          轮{round}
        </button>
        <button
          onClick={fetchParticipants}
          className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-white/70 text-gray-500 hover:text-gray-700"
        >
          刷新
        </button>
        <button
          onClick={() => {
            setAuthed(false);
            setPassword("");
            setParticipants([]);
          }}
          className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
        >
          退出投屏
        </button>
      </motion.div>

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-40 pointer-events-none">
        <div className="flex items-center justify-between px-8 py-4">
          {/* Left: Clock & status */}
          <motion.div
            className="flex items-center gap-4 pointer-events-auto"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div
              className="w-3 h-3 rounded-full bg-green-500"
              animate={{ opacity: [0.4, 1, 0.4], boxShadow: ["0 0 6px rgba(34,197,94,0.3)", "0 0 16px rgba(34,197,94,0.6)", "0 0 6px rgba(34,197,94,0.3)"] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <SystemClock />
          </motion.div>

          {/* Center: Title */}
          <motion.div
            className="text-center flex items-center gap-5"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <LobsterSVG size={48} animate />
            <div>
              <h1
                className="text-3xl font-black tracking-wider"
                style={{
                  background: "linear-gradient(135deg, #E74C3C, #FF9F43, #FFD700, #FF9F43, #E74C3C)",
                  backgroundSize: "200% 200%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  animation: "metallic-shift 3s ease-in-out infinite",
                }}
              >
                昆明龙虾局
              </h1>
              <p className="text-sm font-mono text-gray-500 tracking-[0.3em] mt-0.5">钳所未有 · 跨界匹配引擎</p>
            </div>
          </motion.div>

          {/* Right: Counters */}
          <motion.div
            className="glass-premium rounded-2xl px-6 py-3 pointer-events-auto"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <LiveCounter value={checkedInList.length} label="已签到" />
          </motion.div>
        </div>

        <div className="h-px w-full bg-linear-to-r from-transparent via-red-300/20 to-transparent" />
      </div>

      {/* Industry tags bar */}
      {mode === "checkin-wall" && industries.length > 0 && (
        <motion.div
          className="fixed bottom-12 left-0 right-0 z-30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <div className="flex justify-center gap-3 px-8 flex-wrap">
            {industries.map((ind, i) => {
              const count = checkedInList.filter((p) => p.industry === ind).length;
              const color = getIndustryColor(ind);
              return (
                <motion.div
                  key={ind}
                  className="px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm"
                  style={{
                    background: `${color}10`,
                    color: color,
                    border: `1px solid ${color}25`,
                    boxShadow: `0 2px 12px ${color}10`,
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2 + i * 0.08, type: "spring" }}
                >
                  {ind}
                  <span className="ml-1.5 font-bold">{count}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Data ticker */}
      <DataTicker industries={industries} checkedIn={checkedInList.length} total={participants.length} />

      {/* Main content */}
      <AnimatePresence mode="wait">
        {mode === "checkin-wall" && (
          <motion.div
            key="wall"
            className="pt-20 px-8 pb-36"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex flex-wrap gap-4 justify-center max-w-[1500px] mx-auto">
              <AnimatePresence>
                {checkedInList.map((p, i) => (
                  <NodeCard key={p.id} p={p} index={i} />
                ))}
              </AnimatePresence>
            </div>

            {checkedInList.length === 0 && (
              <div className="flex flex-col items-center justify-center h-[60vh]">
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <LobsterSVG size={200} animate intensity="high" />
                </motion.div>
                <motion.div className="mt-10 text-center">
                  <motion.h2
                    className="text-3xl font-black text-gray-700 mb-3"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    等待嘉宾签到中...
                  </motion.h2>
                  <p className="text-lg font-mono text-gray-400 tracking-widest">
                    扫描二维码 · 开启跨界之旅
                  </p>
                  <motion.div
                    className="mt-6 flex items-center justify-center gap-2"
                    animate={{ opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2.5 h-2.5 rounded-full bg-red-400/40"
                        animate={{ scale: [1, 1.4, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </motion.div>
                </motion.div>
              </div>
            )}

            <MatchButton
              onClick={startMatchSequence}
              checkedInCount={checkedInList.length}
              round={round}
            />
          </motion.div>
        )}

        {mode === "countdown" && (
          <MatchCountdown
            key="countdown"
            count={countdown}
            onComplete={executeMatch}
          />
        )}

        {mode === "matching" && matchPairs.length > 0 && (
          <motion.div
            key="matching"
            className="h-screen w-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ScreenMatchAnimation
              pairs={matchPairs}
              onComplete={() => {
                setTimeout(() => {
                  setMode("checkin-wall");
                  setRound((r) => r + 1);
                }, 4000);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
