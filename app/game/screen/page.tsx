"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LobsterSVG } from "@/components/lobster/LobsterSVG";
import { BubbleBackground } from "@/components/lobster/BubbleBackground";

interface SessionState {
  status: string;
  currentRound: number;
  currentPrompt: string | null;
  roundStartAt: string | null;
  roundDuration: number;
  roundName: string;
}

interface Submission {
  id: string;
  round: number;
  userName: string;
  industry: string;
  keyword: string;
  createdAt: string;
}

const ROUND_EMOJIS = ["", "🎯", "⚡", "🤝"];
const ROUND_NAMES = ["", "破冰发问", "跨界处方", "行动约定"];

export default function GameScreenPage() {
  const [session, setSession] = useState<SessionState | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [prevRound, setPrevRound] = useState(0);
  const [showTransition, setShowTransition] = useState(false);

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch("/api/game/session");
      const data = await res.json();
      if (data.currentRound !== prevRound && data.currentRound > 0) {
        setShowTransition(true);
        setTimeout(() => setShowTransition(false), 2500);
        setPrevRound(data.currentRound);
      }
      setSession(data);
    } catch {
      console.error("Failed to fetch session");
    }
  }, [prevRound]);

  const fetchSubmissions = useCallback(async () => {
    try {
      const round = session?.currentRound;
      const url = round ? `/api/game/submit?round=${round}` : "/api/game/submit";
      const res = await fetch(url);
      const data = await res.json();
      setSubmissions(data.submissions || []);
    } catch {
      console.error("Failed to fetch submissions");
    }
  }, [session?.currentRound]);

  useEffect(() => {
    fetchSession();
    const interval = setInterval(fetchSession, 2000);
    return () => clearInterval(interval);
  }, [fetchSession]);

  useEffect(() => {
    fetchSubmissions();
    const interval = setInterval(fetchSubmissions, 3000);
    return () => clearInterval(interval);
  }, [fetchSubmissions]);

  useEffect(() => {
    if (!session?.roundStartAt || session.status !== "playing") {
      setTimeLeft(0);
      return;
    }
    const update = () => {
      const elapsed = Math.floor((Date.now() - new Date(session.roundStartAt!).getTime()) / 1000);
      const remaining = Math.max(0, session.roundDuration - elapsed);
      setTimeLeft(remaining);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [session?.roundStartAt, session?.roundDuration, session?.status]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const currentRound = session?.currentRound || 0;
  const isPlaying = session?.status === "playing";
  const isFinished = session?.status === "finished";

  return (
    <main className="min-h-screen overflow-hidden relative">
      <BubbleBackground />

      {/* Round Transition Animation */}
      <AnimatePresence>
        {showTransition && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, rgba(92,188,186,0.98), rgba(45,136,134,0.96))" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-center"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 80 }}
            >
              <motion.span
                className="text-9xl block mb-8"
                animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.8, repeat: 2 }}
              >
                {ROUND_EMOJIS[currentRound]}
              </motion.span>
              <p className="text-5xl font-black tracking-wider text-white drop-shadow-lg">
                {ROUND_NAMES[currentRound]}
              </p>
              <p className="text-2xl text-white/80 mt-3 font-medium">第 {currentRound} 轮</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex flex-col h-screen p-10">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-8 shrink-0">
          <div className="flex items-center gap-5">
            <LobsterSVG size={55} animate />
            <div>
              <h1 className="text-4xl font-black bg-linear-to-r from-red-700 via-red-500 to-red-700 bg-clip-text text-transparent">
                商业盲盒 · 甜力碰撞
              </h1>
              <p className="text-gray-600 text-base mt-1 tracking-widest font-medium">
                钳所未有：当龙虾遇上百业盲盒
              </p>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-right">
              <p className="text-gray-500 text-sm">参与互动</p>
              <p className="text-3xl font-black text-gray-800">{submissions.length}</p>
            </div>
            <button
              onClick={() => window.close()}
              className="px-4 py-2 rounded-xl bg-white/50 text-gray-500 text-sm font-medium hover:bg-white/70 hover:text-red-500 transition-all border border-gray-200/30 opacity-30 hover:opacity-100"
            >
              ✕ 退出
            </button>
            {isPlaying && (
              <motion.div
                className="px-8 py-4 rounded-2xl backdrop-blur-md"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                }}
                animate={{
                  boxShadow: timeLeft <= 30
                    ? ["0 8px 32px rgba(220,50,30,0.2)", "0 8px 48px rgba(220,50,30,0.4)", "0 8px 32px rgba(220,50,30,0.2)"]
                    : "0 8px 32px rgba(0,0,0,0.1)",
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <p className="text-gray-500 text-xs tracking-widest">剩余时间</p>
                <p className={`text-5xl font-mono font-black text-gray-800 ${timeLeft <= 30 ? "animate-pulse text-red-500" : ""}`}>
                  {formatTime(timeLeft)}
                </p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Waiting State */}
          {!isPlaying && !isFinished && (
            <div className="flex-1 flex items-center justify-center">
              <motion.div
                className="text-center"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <LobsterSVG size={140} animate intensity="high" />
                <p className="text-4xl font-black mt-8 text-gray-800">等待主持人开始...</p>
                <p className="text-gray-600 mt-3 text-lg">商业盲盒 · 甜力碰撞即将开始</p>
                <div className="flex items-center justify-center gap-4 mt-8">
                  {[1, 2, 3].map((r) => (
                    <div key={r} className="flex items-center gap-2">
                      <span className="text-2xl">{ROUND_EMOJIS[r]}</span>
                      <span className="text-gray-600 text-lg">{ROUND_NAMES[r]}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}

          {/* Playing State */}
          {isPlaying && session?.currentPrompt && (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Current Prompt */}
              <motion.div
                className="shrink-0 mb-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                key={session.currentPrompt}
              >
                <div className="flex items-center gap-4 mb-5">
                  <span className="text-4xl">{ROUND_EMOJIS[currentRound]}</span>
                  <span className="text-2xl font-black text-gray-800">{ROUND_NAMES[currentRound]}</span>
                  <span className="px-4 py-1.5 rounded-full text-sm font-medium glass-premium text-gray-600">
                    第 {currentRound}/3 轮
                  </span>
                </div>

                <div className="relative rounded-3xl p-10 overflow-hidden glass-premium border border-red-400/15"
                  style={{ boxShadow: "0 16px 48px rgba(0,0,0,0.06)" }}
                >
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: "linear-gradient(105deg, transparent 35%, rgba(255,200,100,0.04) 45%, rgba(255,200,100,0.06) 50%, rgba(255,200,100,0.04) 55%, transparent 65%)",
                    }}
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
                  />
                  <p className="text-4xl font-black text-center leading-relaxed text-gray-800">
                    {session.currentPrompt}
                  </p>
                </div>
              </motion.div>

              {/* Live Submissions */}
              <div className="flex-1 min-h-0 overflow-hidden">
                <p className="text-gray-500 text-sm mb-4 flex items-center gap-2">
                  <motion.span
                    className="w-2.5 h-2.5 rounded-full bg-green-500"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  实时互动 · {submissions.length} 条回答
                </p>
                <div className="flex flex-wrap gap-3 overflow-y-auto max-h-[calc(100%-2rem)]">
                  <AnimatePresence>
                    {submissions.map((sub, i) => (
                      <motion.div
                        key={sub.id}
                        className="px-5 py-3 rounded-2xl glass-premium"
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: i * 0.05, type: "spring" }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-gray-800">{sub.userName}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full text-gray-500 bg-white/30">
                            {sub.industry}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">{sub.keyword}</p>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )}

          {/* Finished State */}
          {isFinished && (
            <div className="flex-1 flex flex-col items-center justify-center">
              <motion.div
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <motion.span
                  className="text-9xl block mb-6"
                  animate={{ rotate: [0, -5, 5, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🦞
                </motion.span>
                <h2 className="text-5xl font-black bg-linear-to-r from-red-700 via-red-500 to-red-700 bg-clip-text text-transparent mb-4">
                  甜力碰撞完成！
                </h2>
                <p className="text-xl text-gray-600 mb-10">共收到 {submissions.length} 条精彩回答</p>

                <div className="flex flex-wrap gap-3 justify-center max-w-5xl">
                  {submissions.map((sub, i) => (
                    <motion.div
                      key={sub.id}
                      className="px-4 py-2.5 rounded-2xl glass-premium"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <span className="text-sm text-gray-800 font-bold">{sub.userName}</span>
                      <span className="text-gray-400 mx-1.5">·</span>
                      <span className="text-sm text-gray-700">{sub.keyword}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {isPlaying && (
          <div className="flex gap-3 mt-6 shrink-0">
            {[1, 2, 3].map((r) => (
              <div key={r} className="flex-1 h-2 rounded-full overflow-hidden bg-white/30">
                <motion.div
                  className="h-full rounded-full bg-red-500"
                  initial={false}
                  animate={{
                    width: r < currentRound
                      ? "100%"
                      : r === currentRound
                        ? `${Math.max(5, ((session?.roundDuration || 1) - timeLeft) / (session?.roundDuration || 1) * 100)}%`
                        : "0%",
                  }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Bottom branding */}
        <div className="flex items-center justify-center gap-3 mt-6 shrink-0">
          <span className="w-12 h-px bg-gray-400/30" />
          <LobsterSVG size={16} animate={false} />
          <span className="text-gray-500 text-sm font-medium tracking-widest">住呀科技 出品 | 首届《昆明龙虾局》</span>
          <LobsterSVG size={16} animate={false} />
          <span className="w-12 h-px bg-gray-400/30" />
        </div>
      </div>
    </main>
  );
}
