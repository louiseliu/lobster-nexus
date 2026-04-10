"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";
import { BubbleBackground } from "@/components/lobster/BubbleBackground";
import { LobsterSVG } from "@/components/lobster/LobsterSVG";
import { LobsterCheckin } from "@/components/lobster/LobsterCheckin";
import { BottomNav } from "@/components/shared/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { soundManager } from "@/lib/sounds";

interface ParticipantInfo {
  id: string;
  name: string;
  industry: string;
  company: string;
  title: string;
  checkedIn: boolean;
}

const CHECKIN_OPEN_TIME = new Date("2026-04-13T13:30:00+08:00");

function CheckinContent() {
  const searchParams = useSearchParams();
  const codeFromUrl = searchParams.get("code") || "";

  const [code, setCode] = useState(codeFromUrl);
  const [loading, setLoading] = useState(false);
  const [participant, setParticipant] = useState<ParticipantInfo | null>(null);
  const [justCheckedIn, setJustCheckedIn] = useState(false);
  const [now, setNow] = useState(Date.now());

  const isCheckinOpen = now >= CHECKIN_OPEN_TIME.getTime();

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const savedPhone = localStorage.getItem("lobster-phone");
    const initialCode = codeFromUrl || savedPhone || "";
    if (initialCode) {
      setCode(initialCode);
      handleLookup(initialCode);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codeFromUrl]);

  const handleLookup = async (c: string) => {
    const res = await fetch(`/api/checkin?code=${c}`);
    if (res.ok) {
      const data = await res.json();
      setParticipant(data.participant);
    }
  };

  const handleCheckin = async () => {
    if (!code.trim()) {
      toast.error("请输入手机号");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();

      if (res.status === 409) {
        toast.info("你已经签到过了 🦞");
        setParticipant(data.participant);
        return;
      }
      if (!res.ok) {
        toast.error(data.error || "签到失败");
        return;
      }

      soundManager.playCheckin();
      localStorage.setItem("lobster-phone", code.trim());
      setParticipant(data.participant);
      setJustCheckedIn(true);
    } catch {
      toast.error("网络错误");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 flex flex-col items-center px-5 pt-10 pb-24 max-w-lg mx-auto">
      <Link href="/" className="mb-3">
        <LobsterSVG size={60} animate intensity="high" />
      </Link>
      <motion.h1
        className="text-2xl font-black mb-1 bg-linear-to-r from-red-700 via-red-500 to-red-700 bg-clip-text text-transparent"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        🎫 现场签到
      </motion.h1>
      <motion.p
        className="text-sm text-gray-700 mb-3 tracking-wider"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        请到活动现场签到入场
      </motion.p>
      <motion.div
        className="mb-8 px-4 py-2 rounded-xl border border-red-300/30 bg-white/60"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-sm text-gray-600 text-center">
          📅 签到开放时间：<span className="font-bold text-red-600">4月13日 13:30</span>
        </p>
        {!isCheckinOpen && (
          <motion.p
            className="text-xs text-amber-600 text-center mt-1"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ⏳ 签到尚未开放，请到现场后签到
          </motion.p>
        )}
      </motion.div>

      <AnimatePresence mode="wait">
        {justCheckedIn && participant ? (
          <motion.div
            key="success"
            className="w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <LobsterCheckin name={participant.name} industry={participant.industry} />

            <motion.div
              className="rounded-2xl overflow-hidden mt-6 w-full"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.88))",
                boxShadow: "0 8px 32px rgba(0,0,0,0.08), 0 0 0 1px rgba(92,188,186,0.2)",
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
            >
              <div className="h-1 w-full lobster-gradient-metallic" />
              <div className="p-5">
                <p className="text-sm text-gray-600 mb-3 tracking-wider font-medium">你的身份牌</p>
                <div className="flex items-center gap-4">
                  <motion.div
                    className="w-14 h-14 rounded-xl lobster-gradient-metallic flex items-center justify-center text-white text-xl font-bold"
                    animate={{ boxShadow: ["0 0 10px rgba(220,50,30,0.15)", "0 0 20px rgba(220,50,30,0.3)", "0 0 10px rgba(220,50,30,0.15)"] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  >
                    {participant.name[0]}
                  </motion.div>
                  <div>
                    <p className="text-gray-800 font-bold text-lg">{participant.name}</p>
                    <p className="text-sm text-gray-600 mt-0.5">{participant.title} · {participant.company}</p>
                    <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded text-sm border border-red-300/40 text-red-600/70 bg-red-50">
                      {participant.industry}
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <LobsterSVG size={12} animate={false} />
                    <span className="text-sm font-mono text-gray-500">昆明龙虾局 · 2026.04.13</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="mt-6 flex gap-3 w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
            >
              <Link href={`/blindbox?myCode=${code}`} className="flex-1">
                <Button className="w-full lobster-gradient-metallic text-white border-0 h-12 animate-glow-pulse-intense text-base font-bold">
                  🎲 盲盒名片
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            className="w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {participant && participant.checkedIn ? (
              <div className="rounded-2xl overflow-hidden mb-6" style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.88))",
                boxShadow: "0 8px 32px rgba(0,0,0,0.08), 0 0 0 1px rgba(74,222,128,0.2)",
              }}>
                <div className="h-1 w-full bg-linear-to-r from-green-600 to-green-400" />
                <div className="p-6 text-center">
                  <motion.p
                    className="text-green-600 font-bold mb-2 text-lg"
                    animate={{ textShadow: ["0 0 0px rgba(74,222,128,0)", "0 0 10px rgba(74,222,128,0.3)", "0 0 0px rgba(74,222,128,0)"] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    ✅ 已签到
                  </motion.p>
                  <p className="text-gray-800 text-lg font-bold">{participant.name}</p>
                  <p className="text-sm text-gray-600 mt-1">{participant.title} · {participant.company}</p>
                  <Link href={`/blindbox?myCode=${code}`} className="mt-5 block">
                    <Button className="lobster-gradient-metallic text-white border-0 h-12 w-full text-base font-bold shadow-[0_6px_24px_rgba(220,50,30,0.3)]">
                      🎲 去盲盒名片
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="glass-premium rounded-2xl p-6 w-full mb-4 relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: "radial-gradient(circle at 50% 30%, rgba(220,50,30,0.06) 0%, transparent 60%)" }}
                  />
                  <p className="text-sm text-gray-700 mb-4 flex items-center gap-2 font-medium">
                    📱 输入你报名时的手机号
                  </p>
                  <Input
                    type="tel"
                    placeholder="手机号"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCheckin()}
                    maxLength={11}
                    className="bg-white/80 border border-gray-200 focus:border-red-400/50 w-full h-14 font-mono text-center text-xl text-gray-800 focus:shadow-[0_0_15px_rgba(220,50,30,0.1)] transition-all"
                  />

                  {participant && !participant.checkedIn && (
                    <motion.div
                      className="mt-4 p-4 rounded-xl border border-red-300/40 relative overflow-hidden"
                      style={{ background: "linear-gradient(135deg, rgba(220,50,30,0.06), rgba(255,159,67,0.03))" }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg lobster-gradient-metallic flex items-center justify-center text-white text-sm font-bold shrink-0 border border-red-300/40">
                          {participant.name[0]}
                        </div>
                        <div>
                          <p className="text-gray-800 font-bold text-sm">
                            确认身份：{participant.name}
                          </p>
                          <p className="text-sm text-gray-700 mt-0.5">
                            {participant.title} · {participant.company} · {participant.industry}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                <Button
                  size="lg"
                  onClick={handleCheckin}
                  disabled={loading || !code.trim() || !isCheckinOpen}
                  className="w-full h-14 text-base font-bold lobster-gradient-metallic hover:opacity-90 rounded-xl text-white border-0 animate-glow-pulse-intense shadow-[0_0_20px_rgba(220,50,30,0.15)] disabled:opacity-50 disabled:animate-none"
                >
                  {!isCheckinOpen ? (
                    "⏳ 签到未开放"
                  ) : loading ? (
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="inline-block"
                    >
                      🦞
                    </motion.span>
                  ) : (
                    "🦞 确认签到"
                  )}
                </Button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CheckinPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <BubbleBackground />
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
            <LobsterSVG size={60} animate={false} />
          </motion.div>
        </div>
      }>
        <CheckinContent />
      </Suspense>

      <BottomNav />
    </main>
  );
}
