"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";
import { BubbleBackground } from "@/components/lobster/BubbleBackground";
import { LobsterSVG } from "@/components/lobster/LobsterSVG";
import { LobsterClawCard } from "@/components/lobster/LobsterClawCard";
import { BottomNav } from "@/components/shared/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { soundManager } from "@/lib/sounds";

interface CardInfo {
  name: string;
  industry: string;
  company: string;
  title: string;
  bio?: string;
  avatarSeed?: string;
  avatar?: string;
  checkinCode?: string;
}

interface SystemPair extends CardInfo {
  round: number;
}

interface MyInfo {
  id: string;
  name: string;
  industry: string;
  company: string;
  title: string;
  checkinCode: string;
  avatar?: string;
  checkedIn?: boolean;
}

function ClawHoldingCard({ card, index }: { card: SystemPair; index: number }) {
  const router = useRouter();
  const [revealed, setRevealed] = useState(false);
  const [sparkles, setSparkles] = useState<{ w: number; h: number; left: number; top: number; y: number; x: number }[]>([]);

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.15, type: "spring", stiffness: 100 }}
    >
      {/* Round badge */}
      <motion.div
        className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 px-3 py-0.5 rounded-full text-sm font-mono border"
        style={{
          background: "linear-gradient(135deg, rgba(231,76,60,0.9), rgba(255,159,67,0.8))",
          borderColor: "rgba(231,76,60,0.5)",
          boxShadow: "0 2px 8px rgba(231,76,60,0.2)",
        }}
      >
        <span className="text-white font-medium">第{card.round}轮配对</span>
      </motion.div>

      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.div
            key="hidden"
            className="glass-premium rounded-2xl p-5 mt-2 border border-red-300/40 cursor-pointer relative overflow-hidden"
            onClick={() => {
              soundManager.playBlindboxOpen();
              setSparkles(
                Array.from({ length: 10 }, () => ({
                  w: 2 + Math.random() * 4,
                  h: 2 + Math.random() * 4,
                  left: 10 + Math.random() * 80,
                  top: 10 + Math.random() * 80,
                  y: -30 - Math.random() * 40,
                  x: (Math.random() - 0.5) * 60,
                }))
              );
              setRevealed(true);
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(220,50,30,0.2)" }}
            whileTap={{ scale: 0.98 }}
            style={{ boxShadow: "0 0 15px rgba(220,50,30,0.1)" }}
          >
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(105deg, transparent 40%, rgba(255,200,100,0.06) 45%, rgba(255,200,100,0.1) 50%, rgba(255,200,100,0.06) 55%, transparent 60%)",
              }}
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
            />
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 shrink-0">
                <motion.svg
                  viewBox="0 0 60 50"
                  className="absolute left-0 top-1/2 w-8 h-7 z-10"
                  style={{ transform: "translateY(-50%)" }}
                  animate={{ rotate: [-5, 5, -5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <defs>
                    <linearGradient id={`clawL-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#C0392B" />
                      <stop offset="50%" stopColor="#E74C3C" />
                      <stop offset="100%" stopColor="#A01E1E" />
                    </linearGradient>
                  </defs>
                  <path d="M55 25 L30 15 L15 5 Q8 2 5 8 L20 15 L10 8 Q5 4 4 10 L25 20 L55 28Z" fill={`url(#clawL-${index})`} stroke="#8B1A1A" strokeWidth="1" />
                </motion.svg>
                <motion.svg
                  viewBox="0 0 60 50"
                  className="absolute right-0 top-1/2 w-8 h-7 z-10"
                  style={{ transform: "translateY(-50%) scaleX(-1)" }}
                  animate={{ rotate: [5, -5, 5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <path d="M55 25 L30 15 L15 5 Q8 2 5 8 L20 15 L10 8 Q5 4 4 10 L25 20 L55 28Z" fill={`url(#clawL-${index})`} stroke="#8B1A1A" strokeWidth="1" />
                </motion.svg>
                <motion.div
                  className="absolute inset-2 rounded-lg lobster-gradient-metallic flex items-center justify-center"
                  animate={{ boxShadow: ["0 0 8px rgba(220,50,30,0.3)", "0 0 16px rgba(220,50,30,0.5)", "0 0 8px rgba(220,50,30,0.3)"] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="text-white text-2xl font-bold">?</span>
                </motion.div>
              </div>
              <div className="flex-1">
                <p className="text-gray-800 font-bold text-sm">你的跨界搭子</p>
                <p className="text-sm text-gray-700 mt-0.5">点击揭晓 TA 是谁 →</p>
                <motion.div className="h-0.5 bg-red-500/20 rounded-full mt-2 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: "linear-gradient(90deg, #E74C3C, #FF9F43)" }}
                    animate={{ width: ["0%", "60%", "30%", "80%", "50%"] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="revealed"
            className="relative mt-2"
            initial={{ opacity: 0, scale: 0.3, rotateY: 180 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ type: "spring", stiffness: 80, damping: 15 }}
          >
            {/* Lobster claw: left */}
            <motion.svg
              viewBox="0 0 120 100"
              className="absolute -left-6 top-1/2 w-16 h-14 z-20"
              style={{ transform: "translateY(-50%)" }}
              initial={{ x: -60 }}
              animate={{ x: 0, rotate: [-3, 3, -3] }}
              transition={{ x: { delay: 0.3, type: "spring" }, rotate: { duration: 3, repeat: Infinity } }}
            >
              <defs>
                <linearGradient id={`clL-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#C0392B" />
                  <stop offset="30%" stopColor="#E74C3C" />
                  <stop offset="50%" stopColor="#FF6B6B" />
                  <stop offset="70%" stopColor="#E74C3C" />
                  <stop offset="100%" stopColor="#A01E1E" />
                </linearGradient>
                <filter id={`clGl-${index}`}>
                  <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#E74C3C" floodOpacity="0.4" />
                </filter>
              </defs>
              <path d="M120 50 L60 30 L30 10 Q15 5 10 15 L40 30 L20 15 Q10 8 8 20 L50 40 L120 55Z" fill={`url(#clL-${index})`} stroke="#8B1A1A" strokeWidth="1.5" filter={`url(#clGl-${index})`} />
              <path d="M80 42 L50 28 L35 18" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" strokeLinecap="round" />
            </motion.svg>

            {/* Lobster claw: right */}
            <motion.svg
              viewBox="0 0 120 100"
              className="absolute -right-6 top-1/2 w-16 h-14 z-20"
              style={{ transform: "translateY(-50%) scaleX(-1)" }}
              initial={{ x: 60 }}
              animate={{ x: 0, rotate: [3, -3, 3] }}
              transition={{ x: { delay: 0.3, type: "spring" }, rotate: { duration: 3, repeat: Infinity } }}
            >
              <path d="M120 50 L60 30 L30 10 Q15 5 10 15 L40 30 L20 15 Q10 8 8 20 L50 40 L120 55Z" fill={`url(#clL-${index})`} stroke="#8B1A1A" strokeWidth="1.5" filter={`url(#clGl-${index})`} />
              <path d="M80 42 L50 28 L35 18" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" strokeLinecap="round" />
            </motion.svg>

            {/* Business Card Style */}
            <div
              className="relative rounded-xl overflow-hidden border border-red-500/30 mx-2 cursor-pointer active:scale-[0.98] transition-transform"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.88) 50%, rgba(255,255,255,0.95) 100%)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.08), 0 0 0 1px rgba(92,188,186,0.2)",
              }}
              onClick={() => {
                if (card.checkinCode) {
                  router.push(`/profile?phone=${card.checkinCode}`);
                }
              }}
            >
              {/* Holographic sweep */}
              <motion.div
                className="absolute inset-0 pointer-events-none z-10"
                style={{
                  background: "linear-gradient(105deg, transparent 35%, rgba(255,200,100,0.06) 45%, rgba(255,200,100,0.1) 50%, rgba(255,200,100,0.06) 55%, transparent 65%)",
                }}
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
              />

              {/* Card top accent line */}
              <div className="h-1 w-full lobster-gradient-metallic" />

              <div className="p-5">
                <div className="flex gap-4">
                  {/* Avatar */}
                  <motion.div
                    className="w-18 h-18 rounded-xl overflow-hidden shrink-0 border border-red-300/40"
                    style={{ width: 72, height: 72, boxShadow: "0 0 20px rgba(220,50,30,0.2)" }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring" }}
                  >
                    {card.avatar ? (
                      <img src={card.avatar} alt={card.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full lobster-gradient-metallic flex items-center justify-center text-white text-2xl font-bold">
                        {card.name[0]}
                      </div>
                    )}
                  </motion.div>

                  {/* Info */}
                  <motion.div
                    className="flex-1 min-w-0"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <h3 className="text-gray-800 font-bold text-xl truncate">{card.name}</h3>
                    <p className="text-red-500/90 text-sm font-medium mt-0.5">{card.title}</p>
                    <p className="text-gray-700 text-sm mt-0.5 truncate">{card.company}</p>
                    <div className="mt-2">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-sm border border-red-500/30 text-white lobster-gradient-metallic bg-clip-padding">
                        {card.industry}
                      </span>
                    </div>
                  </motion.div>
                </div>

                {/* Bio */}
                {card.bio && (
                  <motion.div
                    className="mt-3 pt-3 border-t border-red-500/10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    <p className="text-gray-700 text-sm italic">&ldquo;{card.bio}&rdquo;</p>
                  </motion.div>
                )}

                {/* Bottom branding */}
                <motion.div
                  className="mt-3 flex items-center justify-between"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="flex items-center gap-1.5">
                    <LobsterSVG size={14} animate={false} />
                    <span className="text-sm font-mono text-gray-700">昆明龙虾局 · 跨界搭子</span>
                  </div>
                  <span className="text-sm font-mono text-red-500/30">2026.04.13</span>
                </motion.div>
              </div>
            </div>

            {sparkles.map((s, i) => (
              <motion.div
                key={`sp-${i}`}
                className="absolute rounded-full pointer-events-none z-30"
                style={{
                  width: s.w,
                  height: s.h,
                  background: ["#FFD700", "#FF9F43", "#FF6B6B", "#E74C3C"][i % 4],
                  boxShadow: `0 0 6px ${["#FFD700", "#FF9F43", "#FF6B6B", "#E74C3C"][i % 4]}`,
                  left: `${s.left}%`,
                  top: `${s.top}%`,
                }}
                initial={{ opacity: 1, scale: 0 }}
                animate={{ opacity: [1, 0], scale: [0, 2.5], y: s.y, x: s.x }}
                transition={{ duration: 1.2, delay: 0.2 + i * 0.08 }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function BlindboxContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const myCodeParam = searchParams.get("myCode") || "";

  const [myCode, setMyCode] = useState(myCodeParam);
  const [targetCode, setTargetCode] = useState("");
  const [myInfo, setMyInfo] = useState<MyInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [exchangedCards, setExchangedCards] = useState<CardInfo[]>([]);
  const [systemPairs, setSystemPairs] = useState<SystemPair[]>([]);
  const [newCard, setNewCard] = useState<CardInfo | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const loadMyData = useCallback(async (code: string) => {
    try {
      const res = await fetch(`/api/blindbox?code=${code}`);
      if (res.ok) {
        const data = await res.json();
        setMyInfo(data.me);
        setExchangedCards(data.cards);
        setSystemPairs(data.systemPairs || []);
        localStorage.setItem("lobster-phone", code);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const savedPhone = localStorage.getItem("lobster-phone");
    const initialCode = myCodeParam || savedPhone || "";
    if (initialCode) {
      setMyCode(initialCode);
      loadMyData(initialCode).finally(() => setInitialLoading(false));
    } else {
      setInitialLoading(false);
    }
  }, [myCodeParam, loadMyData]);

  // Auto-refresh system pairs every 10s
  useEffect(() => {
    if (!myInfo) return;
    const interval = setInterval(() => loadMyData(myInfo.checkinCode), 10000);
    return () => clearInterval(interval);
  }, [myInfo, loadMyData]);

  const handleLogin = async () => {
    if (!myCode.trim()) {
      toast.error("请输入你的手机号");
      return;
    }
    await loadMyData(myCode.trim());
    if (!myInfo) {
      const res = await fetch(`/api/blindbox?code=${myCode.trim()}`);
      if (res.ok) {
        const data = await res.json();
        setMyInfo(data.me);
        setExchangedCards(data.cards);
        setSystemPairs(data.systemPairs || []);
      } else {
        toast.error("手机号无效");
      }
    }
  };

  const handleExchange = async () => {
    if (!targetCode.trim()) {
      toast.error("请输入对方的手机号或虾号");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/blindbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ myCode: myInfo?.checkinCode, targetCode: targetCode.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      soundManager.playBlindboxOpen();
      setNewCard(data.card);
      setShowAnimation(true);

      if (!data.alreadyMatched) {
        setExchangedCards((prev) => [data.card, ...prev]);
      }
      setTargetCode("");
    } catch {
      toast.error("网络错误");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <motion.div
        className="w-full space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="glass-premium rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-black/5 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 rounded bg-black/5 animate-pulse" />
              <div className="h-3 w-40 rounded bg-black/5 animate-pulse" />
            </div>
          </div>
          <div className="flex gap-3 mt-4 pt-3 border-t border-white/5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-1 text-center space-y-1.5">
                <div className="h-5 w-8 rounded bg-black/5 animate-pulse mx-auto" />
                <div className="h-3 w-12 rounded bg-black/5 animate-pulse mx-auto" />
              </div>
            ))}
          </div>
        </div>
        <div className="glass-premium rounded-2xl p-5 space-y-3">
          <div className="h-4 w-28 rounded bg-black/5 animate-pulse" />
          <div className="h-12 w-full rounded-lg bg-black/5 animate-pulse" />
        </div>
      </motion.div>
    );
  }

  if (!myInfo) {
    return (
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
          <LobsterSVG size={80} animate intensity="high" />
          <h2 className="text-xl font-black text-gray-800 mt-4 mb-1">
            <span className="bg-linear-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              打开你的盲盒名片
            </span>
          </h2>
          <p className="text-sm text-gray-700 mb-5">输入手机号，开启跨界搭子之旅</p>
          <Input
            type="tel"
            placeholder="手机号"
            value={myCode}
            onChange={(e) => setMyCode(e.target.value)}
            maxLength={11}
            className="bg-white/80 border border-gray-200 h-12 font-mono text-center text-lg text-gray-800 mb-3 focus:shadow-[0_0_15px_rgba(220,50,30,0.1)] focus:border-red-400/50 transition-all"
          />
          <Button
            onClick={handleLogin}
            className="w-full lobster-gradient-metallic text-white border-0 h-12 text-base font-bold shadow-[0_0_20px_rgba(220,50,30,0.2)] hover:shadow-[0_0_30px_rgba(220,50,30,0.3)] transition-shadow"
          >
            🦞 进入盲盒名片
          </Button>
          <p className="text-sm text-gray-700 mt-3">使用你报名时的手机号登录</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="w-full space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* My Card — 名片风格 */}
      <motion.div
        className="glass-premium rounded-2xl overflow-hidden"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="h-1 w-full lobster-gradient-metallic" />
        <div className="p-5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3.5">
              <label className="cursor-pointer relative group">
                <motion.div
                  className="w-14 h-14 rounded-xl lobster-gradient-metallic flex items-center justify-center text-white font-bold text-lg overflow-hidden border border-red-300/40"
                  animate={{ boxShadow: ["0 0 8px rgba(220,50,30,0.15)", "0 0 18px rgba(220,50,30,0.3)", "0 0 8px rgba(220,50,30,0.15)"] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  whileHover={{ scale: 1.06 }}
                >
                  {myInfo.avatar ? (
                    <img src={myInfo.avatar} alt={myInfo.name} className="w-full h-full object-cover" />
                  ) : (
                    myInfo.name[0]
                  )}
                </motion.div>
                <div className="absolute inset-0 rounded-xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-sm">📷</span>
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 5 * 1024 * 1024) {
                      toast.error("图片不能超过 5MB");
                      return;
                    }
                    const fd = new FormData();
                    fd.append("file", file);
                    try {
                      const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
                      const uploadData = await uploadRes.json();
                      if (!uploadRes.ok) { toast.error(uploadData.error); return; }

                      const updateRes = await fetch("/api/update-avatar", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ phone: myInfo.checkinCode, avatar: uploadData.url }),
                      });
                      if (updateRes.ok) {
                        setMyInfo({ ...myInfo, avatar: uploadData.url });
                        toast.success("靓照已更新！🦞");
                      }
                    } catch { toast.error("上传失败"); }
                    e.target.value = "";
                  }}
                  className="hidden"
                />
              </label>
              <div className="min-w-0">
                <p className="text-gray-800 font-bold text-base truncate">{myInfo.name}</p>
                <p className="text-sm text-gray-700 truncate">{myInfo.title} · {myInfo.company}</p>
              </div>
            </div>
            <motion.button
              className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl border border-red-300/40 hover:bg-red-500/10 transition-colors"
              onClick={() => setShowQR(!showQR)}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-lg">{showQR ? "🙈" : "📱"}</span>
              <span className="text-sm text-gray-700">{showQR ? "收起" : "我的号"}</span>
            </motion.button>
          </div>

          {/* Stats bar */}
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5">
            <div className="flex-1 text-center">
              <p className="text-red-500 font-bold text-lg">{systemPairs.length}</p>
              <p className="text-sm text-gray-700">系统配对</p>
            </div>
            <div className="w-px h-8 bg-black/5" />
            <div className="flex-1 text-center">
              <p className="text-orange-500 font-bold text-lg">{exchangedCards.length}</p>
              <p className="text-sm text-gray-700">手动交换</p>
            </div>
            <div className="w-px h-8 bg-black/5" />
            <div className="flex-1 text-center">
              <p className="text-amber-600 font-bold text-lg">{systemPairs.length + exchangedCards.length}</p>
              <p className="text-sm text-gray-700">总人脉</p>
            </div>
          </div>

          {/* Shrimp Profile Entry */}
          <Link href={`/profile?phone=${myInfo.checkinCode}`} className="block mt-3 pt-3 border-t border-white/5">
            <motion.div
              className="flex items-center justify-between px-3 py-2.5 rounded-xl"
              style={{ background: "linear-gradient(135deg, rgba(231,76,60,0.06), rgba(255,140,66,0.04))", border: "1px solid rgba(231,76,60,0.15)" }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">🦞</span>
                <span className="text-sm text-orange-600 font-medium">查看虾宝档案</span>
              </div>
              <span className="text-sm text-gray-700">→</span>
            </motion.div>
          </Link>
        </div>

        <AnimatePresence>
          {showQR && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-col items-center py-5 mx-5 border-t border-red-500/10">
                <p className="text-sm text-gray-700 mb-3">让对方输入你的虾号或手机号来交换名片</p>
                <motion.div
                  className="px-6 py-3.5 rounded-2xl border border-red-300/40 relative overflow-hidden"
                  style={{ background: "linear-gradient(135deg, rgba(231,76,60,0.06) 0%, rgba(255,159,67,0.04) 100%)" }}
                  animate={{ boxShadow: ["0 0 15px rgba(220,50,30,0.1)", "0 0 25px rgba(220,50,30,0.15)", "0 0 15px rgba(220,50,30,0.1)"] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <p className="text-red-500 font-mono text-3xl tracking-[0.2em] font-bold text-center">
                    虾号 {myInfo.checkinCode}
                  </p>
                </motion.div>
                <p className="text-sm text-gray-700 mt-2">面对面分享虾号，解锁更多跨界搭子</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* System Matched Pairs — 龙虾钳子夹名片 */}
      {systemPairs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <motion.span
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🦞
              </motion.span>
              系统配对搭子
            </h3>
            <span className="text-sm text-gray-700 font-mono flex items-center gap-1">
              <motion.span
                className="inline-block w-1.5 h-1.5 rounded-full bg-green-500"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              {systemPairs.length} 位搭子
            </span>
          </div>
          <div className="space-y-5">
            {systemPairs.map((pair, i) => (
              <ClawHoldingCard key={`${pair.name}-${pair.round}-${i}`} card={pair} index={i} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Checkin reminder */}
      {myInfo && !myInfo.checkedIn && (
        <motion.div
          className="rounded-xl overflow-hidden border border-amber-500/20"
          style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.06) 0%, rgba(245,158,11,0.02) 100%)" }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
        >
          <div className="p-4 flex items-center gap-3">
            <motion.span
              className="text-2xl shrink-0"
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ⚠️
            </motion.span>
            <div className="flex-1 min-w-0">
              <p className="text-amber-600 font-bold text-sm">还没签到哦</p>
              <p className="text-sm text-gray-700 mt-0.5">签到后才能交换名片，快去签到吧</p>
            </div>
            <Link href={`/checkin?code=${myInfo.checkinCode}`}>
              <Button
                size="sm"
                className="lobster-gradient-metallic text-white border-0 text-sm shrink-0"
              >
                🎫 去签到
              </Button>
            </Link>
          </div>
        </motion.div>
      )}

      {/* Exchange Input */}
      <motion.div
        className="glass-premium rounded-2xl p-5 relative overflow-hidden"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <motion.div
          className="absolute top-0 right-0 w-24 h-24 pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(220,50,30,0.06) 0%, transparent 70%)" }}
        />
        <div className="flex items-center gap-2 mb-3">
          <motion.span
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-lg"
          >
            🤝
          </motion.span>
          <p className="text-sm font-bold text-gray-800">面对面交换</p>
        </div>
        <p className="text-sm text-gray-700 mb-3">输入对方手机号或虾号，互相解锁名片信息</p>
        <div className="flex gap-2">
          <Input
            type="text"
            inputMode="numeric"
            placeholder="手机号 / 虾号"
            value={targetCode}
            onChange={(e) => setTargetCode(e.target.value.replace(/\D/g, ""))}
            maxLength={11}
            className="bg-white/80 border border-gray-200 h-12 font-mono flex-1 text-gray-800 focus:shadow-[0_0_15px_rgba(220,50,30,0.1)] focus:border-red-400/50 transition-all text-base"
          />
          <Button
            onClick={handleExchange}
            disabled={loading}
            className="lobster-gradient-metallic text-white border-0 h-12 px-6 text-base font-bold shadow-[0_0_15px_rgba(220,50,30,0.15)]"
          >
            {loading ? (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="inline-block"
              >
                🦞
              </motion.span>
            ) : (
              "交换"
            )}
          </Button>
        </div>
      </motion.div>

      {/* Claw Animation */}
      <AnimatePresence>
        {showAnimation && newCard && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md"
            style={{ background: "linear-gradient(135deg, rgba(148,220,219,0.97), rgba(92,188,186,0.95))" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowAnimation(false);
              setNewCard(null);
            }}
          >
            <div className="w-full max-w-sm px-4" onClick={(e) => e.stopPropagation()}>
              <LobsterClawCard
                card={newCard}
                trigger={showAnimation}
                onComplete={() => {
                  setTimeout(() => {
                    setShowAnimation(false);
                    setNewCard(null);
                  }, 2000);
                }}
              />
              <motion.p
                className="text-center text-sm text-white/70 mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
              >
                点击任意处关闭
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exchanged Cards List */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <span className="text-red-400">🤝</span>
            手动交换
          </h3>
          {exchangedCards.length > 0 && (
            <span className="text-sm text-gray-700 font-mono">{exchangedCards.length} 个虾友</span>
          )}
        </div>
        {exchangedCards.length === 0 ? (
          <div className="glass-premium rounded-2xl p-10 text-center relative overflow-hidden">
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(circle at 50% 50%, rgba(220,50,30,0.04) 0%, transparent 60%)" }}
            />
            <LobsterSVG size={50} animate />
            <p className="text-gray-700 text-sm mt-4 font-medium">还没有手动交换的名片</p>
            <p className="text-gray-700 text-sm mt-1">面对面输入对方虾号或手机号来交换吧</p>
          </div>
        ) : (
          <div className="space-y-4">
            {exchangedCards.map((card, i) => (
              <motion.div
                key={`${card.name}-${i}`}
                className="relative rounded-xl overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
                onClick={() => {
                  if (card.checkinCode) {
                    router.push(`/profile?phone=${card.checkinCode}`);
                  }
                }}
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.88) 50%, rgba(255,255,255,0.95) 100%)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.06), 0 0 0 1px rgba(92,188,186,0.2)",
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ scale: 1.02, boxShadow: "0 8px 30px rgba(0,0,0,0.1), 0 0 0 1px rgba(92,188,186,0.3)" }}
              >
                {/* Holographic sweep */}
                <motion.div
                  className="absolute inset-0 pointer-events-none z-10"
                  style={{
                    background: "linear-gradient(105deg, transparent 35%, rgba(255,200,100,0.06) 45%, rgba(255,200,100,0.1) 50%, rgba(255,200,100,0.06) 55%, transparent 65%)",
                  }}
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatDelay: 3 + i * 0.5 }}
                />

                {/* Top accent line */}
                <div className="h-[3px] w-full lobster-gradient-metallic" />

                <div className="p-4">
                  <div className="flex gap-3.5">
                    {/* Avatar — 方形圆角 */}
                    <motion.div
                      className="w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-red-300/40"
                      style={{ boxShadow: "0 0 12px rgba(220,50,30,0.12)" }}
                    >
                      {card.avatar ? (
                        <img src={card.avatar} alt={card.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full lobster-gradient-metallic flex items-center justify-center text-white text-lg font-bold">
                          {card.name[0]}
                        </div>
                      )}
                    </motion.div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-gray-800 font-bold text-base truncate">{card.name}</h4>
                      <p className="text-red-500/80 text-sm font-medium mt-0.5 truncate">{card.title}</p>
                      <p className="text-gray-700 text-sm truncate">{card.company}</p>
                      <div className="mt-1.5">
                        <span className="inline-block px-2 py-0.5 rounded text-sm border border-red-300/40 text-red-600/70 bg-white/60">
                          {card.industry}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  {card.bio && (
                    <div className="mt-3 pt-2.5 border-t border-white/4">
                      <p className="text-sm text-gray-700 italic leading-relaxed">&ldquo;{card.bio}&rdquo;</p>
                    </div>
                  )}

                  {/* Bottom branding */}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <LobsterSVG size={10} animate={false} />
                      <span className="text-sm font-mono text-gray-700">昆明龙虾局</span>
                    </div>
                    <span className="text-sm font-mono text-gray-700/50">虾友 {card.checkinCode || String(exchangedCards.length - i).padStart(2, "0")}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function BlindboxPage() {
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
          🎲 盲盒名片
        </motion.h1>
        <motion.p
          className="text-sm text-gray-700 mb-6 tracking-wider"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          龙虾钳子帮你找到跨界搭子
        </motion.p>

        <Suspense fallback={
          <div className="flex items-center justify-center py-20">
            <LobsterSVG size={60} animate />
          </div>
        }>
          <BlindboxContent />
        </Suspense>

        <BottomNav />
      </div>
    </main>
  );
}
