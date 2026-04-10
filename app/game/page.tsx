"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";
import { BubbleBackground } from "@/components/lobster/BubbleBackground";
import { LobsterSVG } from "@/components/lobster/LobsterSVG";
import { BottomNav } from "@/components/shared/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SessionState {
  status: string;
  currentRound: number;
  currentPrompt: string | null;
  roundStartAt: string | null;
  roundDuration: number;
  roundName: string;
}

interface UserInfo {
  name: string;
  industry: string;
}

const ROUND_EMOJIS = ["", "🎯", "⚡", "🤝"];
const ROUND_NAMES = ["", "破冰发问", "跨界处方", "行动约定"];
const ROUND_DESCS = [
  "",
  "和搭子各自说说：你最想让 AI 帮你解决什么？",
  "用你的行业经验，给搭子一个具体建议",
  "确定一个下周就能做的行动",
];

export default function GamePage() {
  const [phone, setPhone] = useState("");
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [session, setSession] = useState<SessionState | null>(null);
  const [keyword, setKeyword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lastRound, setLastRound] = useState(0);

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch("/api/game/session");
      const data = await res.json();
      if (data.currentRound !== lastRound) {
        setSubmitted(false);
        setKeyword("");
        setLastRound(data.currentRound);
      }
      setSession(data);
    } catch {
      console.error("Failed to fetch session");
    }
  }, [lastRound]);

  useEffect(() => {
    const saved = localStorage.getItem("lobster-phone");
    if (saved) setPhone(saved);
  }, []);

  useEffect(() => {
    fetchSession();
    const interval = setInterval(fetchSession, 3000);
    return () => clearInterval(interval);
  }, [fetchSession]);

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

  const joinGame = async () => {
    if (!phone.trim()) {
      toast.error("请输入手机号或虾号");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/blindbox?code=${phone.trim()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.me) {
          setUserInfo({ name: data.me.name, industry: data.me.industry });
          localStorage.setItem("lobster-phone", phone.trim());
          toast.success(`${data.me.name}，欢迎加入！🦞`);
        } else {
          toast.error("未找到注册信息");
        }
      } else {
        toast.error("手机号/虾号无效");
      }
    } catch {
      toast.error("网络错误");
    } finally {
      setLoading(false);
    }
  };

  const submitKeyword = async () => {
    if (!keyword.trim()) {
      toast.error("请输入你的回答");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/game/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), keyword: keyword.trim() }),
      });
      if (res.ok) {
        setSubmitted(true);
        toast.success("提交成功！🎉");
      } else {
        const data = await res.json();
        toast.error(data.error || "提交失败");
      }
    } catch {
      toast.error("网络错误");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const currentRound = session?.currentRound || 0;
  const isPlaying = session?.status === "playing";
  const isFinished = session?.status === "finished";

  return (
    <main className="relative min-h-screen overflow-hidden">
      <BubbleBackground />

      <div className="relative z-10 flex flex-col items-center px-5 pt-8 pb-24 max-w-lg mx-auto">
        {/* Header */}
        <Link href="/" className="mb-3">
          <LobsterSVG size={55} animate intensity="high" />
        </Link>
        <motion.h1
          className="text-2xl font-black mb-1 bg-linear-to-r from-red-700 via-red-500 to-red-700 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          🎲 商业盲盒
        </motion.h1>
        <motion.p
          className="text-sm text-gray-700 mb-6 tracking-wider"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          甜力碰撞 · 跨界创意挑战
        </motion.p>

        {/* Not joined yet */}
        {!userInfo ? (
          <motion.div
            className="w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="glass-premium rounded-2xl p-8 text-center relative overflow-hidden">
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(circle at 50% 30%, rgba(220,50,30,0.08) 0%, transparent 60%)" }}
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
              />

              <div className="mb-6 space-y-3">
                <motion.div
                  className="w-20 h-20 mx-auto rounded-2xl lobster-gradient-metallic flex items-center justify-center"
                  animate={{
                    boxShadow: ["0 0 15px rgba(220,50,30,0.2)", "0 0 30px rgba(220,50,30,0.4)", "0 0 15px rgba(220,50,30,0.2)"],
                    rotate: [0, -3, 3, 0],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <span className="text-4xl">🎲</span>
                </motion.div>
                <h2 className="text-lg font-bold text-gray-800">加入甜力碰撞</h2>
                <p className="text-sm text-gray-700 leading-relaxed">
                  输入手机号或虾号加入互动<br />
                  和搭子一起<span className="text-red-500 font-medium">跨界碰撞</span>！
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { emoji: "🎯", text: "破冰发问" },
                  { emoji: "⚡", text: "跨界处方" },
                  { emoji: "🤝", text: "行动约定" },
                ].map((step, i) => (
                  <motion.div
                    key={i}
                    className="p-2.5 rounded-lg bg-white/30 border border-white/20"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    <span className="text-xl">{step.emoji}</span>
                    <p className="text-sm text-gray-700 mt-1 font-medium">{step.text}</p>
                  </motion.div>
                ))}
              </div>

              <Input
                type="text"
                inputMode="numeric"
                placeholder="手机号 / 虾号"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                maxLength={11}
                onKeyDown={(e) => e.key === "Enter" && joinGame()}
                className="w-full bg-white/50 border border-teal-500/20 text-gray-800 text-center text-lg font-mono tracking-wider mb-4 h-12 focus:border-red-500/40 focus:shadow-[0_0_20px_rgba(220,50,30,0.15)]"
              />

              <Button
                onClick={joinGame}
                disabled={loading}
                className="w-full lobster-gradient-metallic text-white border-0 h-13 text-base font-bold animate-glow-pulse-intense shadow-[0_0_20px_rgba(220,50,30,0.15)]"
              >
                {loading ? "加载中..." : "🦞 加入互动"}
              </Button>
            </div>
          </motion.div>
        ) : (
          /* Joined - Game View */
          <div className="w-full space-y-4">
            {/* User badge */}
            <motion.div
              className="glass-premium rounded-xl p-3 flex items-center gap-3"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-10 h-10 rounded-lg lobster-gradient-metallic flex items-center justify-center text-white font-bold">
                {userInfo.name[0]}
              </div>
              <div className="flex-1">
                <p className="text-gray-800 font-bold text-sm">{userInfo.name}</p>
                <p className="text-gray-600 text-xs">{userInfo.industry}</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs border border-teal-500/30 text-teal-700 bg-teal-50/50">
                已加入
              </span>
            </motion.div>

            {/* Waiting for game */}
            {!isPlaying && !isFinished && (
              <motion.div
                className="glass-premium rounded-2xl p-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <LobsterSVG size={80} animate />
                </motion.div>
                <p className="text-gray-800 font-bold mt-4">等待主持人开始...</p>
                <p className="text-gray-600 text-sm mt-1">准备好和搭子一起碰撞了吗？</p>

                {/* Progress */}
                <div className="flex gap-2 mt-6">
                  {[1, 2, 3].map((r) => (
                    <div key={r} className="flex-1">
                      <div className={`h-1.5 rounded-full ${r <= currentRound ? "bg-red-400" : "bg-gray-300/50"}`} />
                      <p className="text-xs text-gray-500 mt-1">{ROUND_EMOJIS[r]} {ROUND_NAMES[r]}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Active Round */}
            {isPlaying && session?.currentPrompt && (
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={`round-${currentRound}`}
              >
                {/* Round Header + Timer */}
                <div className="glass-premium rounded-2xl p-5 text-center relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: "radial-gradient(circle at 50% 50%, rgba(220,50,30,0.06) 0%, transparent 60%)" }}
                  />

                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-2xl">{ROUND_EMOJIS[currentRound]}</span>
                    <span className="text-lg font-bold text-gray-800">{ROUND_NAMES[currentRound]}</span>
                    <span className="text-sm text-gray-500">第{currentRound}/3轮</span>
                  </div>

                  {/* Timer */}
                  <motion.div
                    className={`text-4xl font-mono font-black my-3 ${timeLeft <= 30 ? "text-red-500" : "text-gray-800"}`}
                    animate={timeLeft <= 30 ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    {formatTime(timeLeft)}
                  </motion.div>

                  {/* Progress */}
                  <div className="flex gap-1.5 mb-3">
                    {[1, 2, 3].map((r) => (
                      <div key={r} className={`flex-1 h-1 rounded-full ${r < currentRound ? "bg-red-400" : r === currentRound ? "bg-red-500" : "bg-gray-300/50"}`} />
                    ))}
                  </div>

                  <p className="text-sm text-gray-600">{ROUND_DESCS[currentRound]}</p>
                </div>

                {/* Prompt Card */}
                <motion.div
                  className="glass-premium rounded-2xl p-6 border border-red-400/20 relative overflow-hidden"
                  style={{ boxShadow: "0 0 20px rgba(220,50,30,0.08)" }}
                  initial={{ rotateY: 180, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 80, delay: 0.3 }}
                >
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: "linear-gradient(105deg, transparent 35%, rgba(255,200,100,0.06) 45%, rgba(255,200,100,0.1) 50%, rgba(255,200,100,0.06) 55%, transparent 65%)",
                    }}
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
                  />
                  <span className="absolute top-3 left-4 text-3xl text-red-400/20 font-serif">&ldquo;</span>
                  <p className="text-gray-800 text-lg font-bold leading-relaxed text-center py-3 px-2">
                    {session.currentPrompt}
                  </p>
                  <span className="absolute bottom-3 right-4 text-3xl text-red-400/20 font-serif">&rdquo;</span>
                </motion.div>

                {/* Submit */}
                <AnimatePresence mode="wait">
                  {!submitted ? (
                    <motion.div
                      key="input"
                      className="glass-premium rounded-2xl p-5"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <p className="text-sm text-gray-700 mb-3 font-medium">💬 分享你的想法</p>
                      <textarea
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="一句话说出你的回答..."
                        maxLength={200}
                        className="w-full bg-white/50 border border-teal-500/20 rounded-xl p-3 text-gray-800 text-sm resize-none h-20 outline-none focus:border-red-500/40 focus:shadow-[0_0_15px_rgba(220,50,30,0.1)] transition-all placeholder:text-gray-400"
                      />
                      <Button
                        onClick={submitKeyword}
                        disabled={loading || !keyword.trim()}
                        className="w-full mt-3 lobster-gradient-metallic text-white border-0 h-11 text-sm font-bold"
                      >
                        {loading ? "提交中..." : "📤 提交到大屏"}
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="submitted"
                      className="glass-premium rounded-2xl p-6 text-center"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <motion.span
                        className="text-4xl block mb-2"
                        animate={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        🦞
                      </motion.span>
                      <p className="text-gray-800 font-bold">已提交！</p>
                      <p className="text-sm text-gray-600 mt-1">你的回答已经在大屏上啦</p>
                      <Button
                        onClick={() => { setSubmitted(false); }}
                        variant="outline"
                        className="mt-3 border-red-400/30 text-red-600 hover:bg-red-50/50 text-sm"
                      >
                        修改回答
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Game Finished */}
            {isFinished && (
              <motion.div
                className="glass-premium rounded-2xl p-8 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <motion.span
                  className="text-6xl block mb-4"
                  animate={{ rotate: [0, -5, 5, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🎉
                </motion.span>
                <h2 className="text-xl font-black text-gray-800 mb-2">甜力碰撞完成！</h2>
                <p className="text-gray-600 text-sm mb-4">
                  希望今天的跨界碰撞，能帮你找到落地方向
                </p>
                <div className="flex gap-1.5">
                  {[1, 2, 3].map((r) => (
                    <div key={r} className="flex-1 h-1.5 rounded-full bg-red-400" />
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-3">3/3 轮全部完成 ✅</p>
              </motion.div>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
