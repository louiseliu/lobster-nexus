"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";
import { LobsterSVG } from "@/components/lobster/LobsterSVG";
import { BubbleBackground } from "@/components/lobster/BubbleBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ADMIN_PASSWORD = "0413";

interface SessionState {
  id?: string;
  status: string;
  currentRound: number;
  currentPrompt: string | null;
  roundStartAt: string | null;
  roundDuration: number;
  roundName: string;
  prompts: Record<number, string[]>;
  roundNames: string[];
}

interface Submission {
  id: string;
  round: number;
  userName: string;
  industry: string;
  keyword: string;
  createdAt: string;
}

const ROUND_CONFIGS = [
  { round: 0, name: "准备中", duration: 0 },
  { round: 1, name: "🎯 破冰发问", duration: 180, color: "from-blue-500 to-cyan-500" },
  { round: 2, name: "⚡ 跨界处方", duration: 300, color: "from-orange-500 to-red-500" },
  { round: 3, name: "🤝 行动约定", duration: 120, color: "from-green-500 to-teal-500" },
];

export default function GameAdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [session, setSession] = useState<SessionState | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedPrompts, setSelectedPrompts] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0 });
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("game-admin-auth");
    if (saved === ADMIN_PASSWORD) setAuthed(true);
  }, []);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthed(true);
      localStorage.setItem("game-admin-auth", password);
      toast.success("验证通过 🦞");
    } else {
      toast.error("密码错误");
    }
  };

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch("/api/game/session");
      const data = await res.json();
      setSession(data);
    } catch {
      console.error("Failed to fetch session");
    }
  }, []);

  const fetchSubmissions = useCallback(async () => {
    try {
      const res = await fetch("/api/game/submit");
      const data = await res.json();
      setSubmissions(data.submissions || []);
    } catch {
      console.error("Failed to fetch submissions");
    }
  }, []);

  useEffect(() => {
    if (!authed) return;
    fetchSession();
    fetchSubmissions();
    const interval = setInterval(() => {
      fetchSession();
      fetchSubmissions();
    }, 3000);
    return () => clearInterval(interval);
  }, [authed, fetchSession, fetchSubmissions]);

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

  if (!authed) {
    return (
      <main className="relative min-h-screen overflow-hidden">
        <BubbleBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
          <div className="w-full max-w-sm">
            <div className="text-center mb-8">
              <LobsterSVG size={60} animate />
              <h1 className="text-xl font-bold mt-4 text-gray-800">🎛️ 主持人控制台</h1>
              <p className="text-gray-600 text-sm mt-1">请输入管理密码</p>
            </div>
            <div className="glass-premium rounded-2xl p-6">
              <Input
                type="password"
                placeholder="管理密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="bg-white/50 border-teal-500/20 text-gray-800 text-center h-12 mb-3"
              />
              <Button
                onClick={handleLogin}
                className="w-full lobster-gradient-metallic text-white border-0 h-11 font-bold"
              >
                进入控制台
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const startRound = async (round: number) => {
    if (!session?.prompts[round]) return;
    setLoading(true);
    try {
      const promptIndex = selectedPrompts[round] || 0;
      const prompt = session.prompts[round][promptIndex];
      const config = ROUND_CONFIGS[round];
      await fetch("/api/game/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start_round",
          round,
          prompt,
          duration: config.duration,
        }),
      });
      toast.success(`第${round}轮已开始！`);
      fetchSession();
    } catch {
      toast.error("操作失败");
    } finally {
      setLoading(false);
    }
  };

  const endRound = async () => {
    setLoading(true);
    try {
      await fetch("/api/game/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "end_round" }),
      });
      toast.success("当前轮次已结束");
      fetchSession();
    } catch {
      toast.error("操作失败");
    } finally {
      setLoading(false);
    }
  };

  const resetSession = async () => {
    if (!confirm("确定要重置游戏吗？所有提交记录将被清除。")) return;
    setLoading(true);
    try {
      await fetch("/api/game/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
      toast.success("游戏已重置");
      fetchSession();
      fetchSubmissions();
    } catch {
      toast.error("操作失败");
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
  const roundSubmissions = submissions.filter((s) => s.round === currentRound);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <BubbleBackground />
      <div className="relative z-10 p-6 max-w-4xl mx-auto pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <LobsterSVG size={40} animate />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">🎛️ 主持人控制台</h1>
              <p className="text-gray-600 text-sm">商业盲盒 · 甜力碰撞</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/game/screen" target="_blank">
              <Button size="sm" variant="outline" className="border-red-300/40 text-gray-600 text-xs hover:bg-red-50">
                📺 盲盒大屏
              </Button>
            </Link>
            <Link href="/admin" target="_blank">
              <Button size="sm" variant="outline" className="border-red-300/40 text-gray-600 text-xs hover:bg-red-50">
                ⚙️ 总管理
              </Button>
            </Link>
            <Button
              onClick={resetSession}
              disabled={loading}
              size="sm"
              variant="outline"
              className="border-red-500/30 text-red-600 text-xs hover:bg-red-50/50"
            >
              🔄 重置
            </Button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="glass-premium rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">当前状态</p>
              <p className={`text-lg font-bold ${isPlaying ? "text-green-600" : session?.status === "finished" ? "text-orange-600" : "text-gray-700"}`}>
                {isPlaying ? `第${currentRound}轮进行中` : session?.status === "finished" ? "游戏已结束" : "等待开始"}
              </p>
            </div>
            {isPlaying && (
              <div className="text-right">
                <p className="text-gray-500 text-sm">剩余时间</p>
                <p className={`text-3xl font-mono font-bold ${timeLeft <= 30 ? "text-red-500 animate-pulse" : "text-gray-800"}`}>
                  {formatTime(timeLeft)}
                </p>
              </div>
            )}
            <div className="text-right">
              <p className="text-gray-500 text-sm">提交数</p>
              <p className="text-lg font-bold text-teal-600">{roundSubmissions.length}</p>
            </div>
          </div>

          {isPlaying && session?.currentPrompt && (
            <div className="mt-4 p-4 rounded-xl bg-white/40 border border-white/20">
              <p className="text-gray-500 text-sm mb-1">{ROUND_CONFIGS[currentRound]?.name}</p>
              <p className="text-gray-800 text-lg font-medium">{session.currentPrompt}</p>
            </div>
          )}

          {isPlaying && (
            <Button
              onClick={endRound}
              disabled={loading}
              className="mt-4 bg-orange-500 hover:bg-orange-600 text-white w-full"
            >
              ⏹ 结束当前轮次
            </Button>
          )}
        </div>

        {/* Round Controls */}
        <div className="space-y-4 mb-8">
          {ROUND_CONFIGS.slice(1).map((config) => {
            const roundPrompts = session?.prompts[config.round] || [];
            const isCurrentRound = currentRound === config.round && isPlaying;
            const isCompleted = currentRound > config.round || (session?.status === "finished" && currentRound >= config.round);
            const canStart = !isPlaying && (currentRound < config.round || session?.status !== "playing");

            return (
              <motion.div
                key={config.round}
                className={`glass-premium rounded-2xl p-5 ${isCurrentRound ? "border border-green-500/40 shadow-[0_0_20px_rgba(34,197,94,0.1)]" : isCompleted ? "opacity-60" : ""}`}
                layout
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`font-bold text-lg ${isCurrentRound ? "text-green-600" : "text-gray-800"}`}>
                    {config.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-sm">{Math.floor(config.duration / 60)} 分钟</span>
                    {isCompleted && <span className="text-green-600 text-sm">✅ 已完成</span>}
                    {isCurrentRound && <span className="text-green-600 text-sm animate-pulse">▶ 进行中</span>}
                  </div>
                </div>

                {/* Prompt selector */}
                <div className="space-y-2 mb-4">
                  {roundPrompts.map((prompt, idx) => (
                    <label
                      key={idx}
                      className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                        selectedPrompts[config.round] === idx
                          ? "bg-white/60 border border-teal-500/30"
                          : "bg-white/30 border border-transparent hover:border-teal-500/20"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`round-${config.round}`}
                        checked={selectedPrompts[config.round] === idx}
                        onChange={() => setSelectedPrompts((prev) => ({ ...prev, [config.round]: idx }))}
                        className="mt-1 accent-red-500"
                      />
                      <span className="text-gray-700 text-sm">{prompt}</span>
                    </label>
                  ))}
                </div>

                <Button
                  onClick={() => startRound(config.round)}
                  disabled={loading || isCurrentRound || isPlaying}
                  className={`w-full h-11 font-bold ${
                    isCurrentRound || isPlaying
                      ? "bg-gray-300 text-gray-500"
                      : `bg-gradient-to-r ${config.color} text-white hover:opacity-90`
                  }`}
                >
                  {isCurrentRound ? "进行中..." : `▶ 开始第${config.round}轮`}
                </Button>
              </motion.div>
            );
          })}
        </div>

        {/* Submissions */}
        <div className="glass-premium rounded-2xl p-5">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-800">
            📝 实时提交
            <span className="text-sm text-gray-500 font-normal">({submissions.length} 条)</span>
          </h3>

          <AnimatePresence>
            {submissions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">暂无提交</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {submissions.map((sub) => (
                  <motion.div
                    key={sub.id}
                    className="flex items-start gap-3 p-3 rounded-xl bg-white/40"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white text-xs font-bold">
                      R{sub.round}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-gray-800 text-sm font-medium">{sub.userName}</span>
                        <span className="text-gray-500 text-xs">{sub.industry}</span>
                      </div>
                      <p className="text-gray-700 text-sm">{sub.keyword}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
