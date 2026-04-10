"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LobsterSVG } from "@/components/lobster/LobsterSVG";
import { BubbleBackground } from "@/components/lobster/BubbleBackground";
import { Countdown } from "@/components/shared/Countdown";
import { BottomNav } from "@/components/shared/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const highlights = [
  { emoji: "🎲", title: "百业盲盒", desc: "跨界碰撞，强制社交破冰" },
  { emoji: "🧠", title: "龙虾应用", desc: "用龙虾思维，重新理解你的行业" },
  { emoji: "🤝", title: "甜力碰撞", desc: "面对面交流，找到你的跨界搭子" },
];

const schedule = [
  { time: "13:30", title: "嘉宾签到", desc: "签到入场·领取专属虾号", icon: "🎫", duration: "30 分钟" },
  { time: "14:00", title: "入场破冰·盲盒匹配", desc: "百业盲盒配对·找到你的跨界搭子", icon: "🎲", duration: "30 分钟" },
  { time: "14:30", title: "品牌时刻", desc: "斯卡沃里尼 + 问界汽车", icon: "🏢", duration: "10 分钟" },
  { time: "14:40", title: "龙虾应用·主题分享", desc: "龙虾到底能帮你的行业干嘛？", icon: "🦞", duration: "45 分钟" },
  { time: "15:30", title: "现场互动·你的龙虾来咯", desc: "你的痛点，龙虾来接", icon: "🎤", duration: "30 分钟" },
  { time: "16:00", title: "商业盲盒·甜力碰撞", desc: "钳力碰撞·小组共创", icon: "🎁", duration: "60 分钟", highlight: true },
  { time: "17:00", title: "活动搭子·自由交流", desc: "放下手机，面对面社交", icon: "🤝", duration: "30 分钟" },
];

export default function Home() {
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);
  const [loginPhone, setLoginPhone] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("lobster-phone");
    if (saved) setLoginPhone(saved);
  }, []);

  const handleQuickLogin = async () => {
    if (!loginPhone.trim()) {
      toast.error("请输入手机号");
      return;
    }
    setLoginLoading(true);
    try {
      const res = await fetch(`/api/blindbox?code=${loginPhone.trim()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.me) {
          localStorage.setItem("lobster-phone", loginPhone.trim());
          toast.success(`欢迎回来，${data.me.name}！🦞`);
          router.push(`/blindbox?myCode=${loginPhone.trim()}`);
          return;
        }
      }
      toast.error("手机号未注册，请先报名");
    } catch {
      toast.error("网络错误");
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <BubbleBackground />

      <div className="relative z-10 flex flex-col items-center px-5 pt-12 pb-20 max-w-lg mx-auto">
        {/* Hero */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center text-center mb-8"
        >
          <LobsterSVG size={140} animate intensity="high" />

          <motion.h1
            className="text-3xl sm:text-4xl font-black mt-4 bg-linear-to-r from-red-700 via-red-500 to-red-700 bg-clip-text text-transparent"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            昆明龙虾局
          </motion.h1>

          <motion.p
            className="text-sm text-red-700 mt-2 tracking-widest font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            钳所未有：当龙虾遇上百业盲盒
          </motion.p>

          <motion.div
            className="flex items-center gap-3 mt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <span className="w-6 h-px bg-red-500/30" />
            <p className="text-sm text-gray-700">2026.04.13 · 斯卡沃里尼昆明店</p>
            <span className="w-6 h-px bg-red-500/30" />
          </motion.div>
        </motion.div>

        {/* Countdown */}
        <motion.div
          className="w-full mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-center text-sm text-gray-700 mb-3 tracking-widest font-medium">距离活动开始</p>
          <Countdown />
        </motion.div>

        {/* CTA */}
        <motion.div
          className="w-full mb-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Link href="/register" className="block">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                className="w-full h-14 text-lg font-bold lobster-gradient-metallic hover:opacity-90 transition-opacity animate-glow-pulse-intense rounded-2xl text-white border-0 shadow-[0_6px_24px_rgba(220,50,30,0.35),0_2px_8px_rgba(220,50,30,0.2)]"
              >
                🦞 立即报名
              </Button>
            </motion.div>
          </Link>

          <motion.button
            onClick={() => setShowLogin(!showLogin)}
            className="w-full mt-3 text-center text-sm text-gray-700 hover:text-red-600 transition-colors cursor-pointer py-2"
          >
            已报名？<span className="text-red-500 font-medium underline underline-offset-4">直接登录 →</span>
          </motion.button>

          <AnimatePresence>
            {showLogin && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="glass-premium rounded-xl p-4 mt-1">
                  <p className="text-sm text-gray-700 mb-3 text-center">输入报名时的手机号</p>
                  <div className="flex gap-2">
                    <Input
                      type="tel"
                      placeholder="手机号"
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(e.target.value)}
                      maxLength={11}
                      onKeyDown={(e) => e.key === "Enter" && handleQuickLogin()}
                      className="bg-white/80 border border-gray-200 h-11 font-mono text-center flex-1 text-gray-800 focus:border-red-400/50 focus:shadow-[0_0_15px_rgba(220,50,30,0.1)]"
                    />
                    <Button
                      onClick={handleQuickLogin}
                      disabled={loginLoading}
                      className="lobster-gradient-metallic text-white border-0 h-11 px-6"
                    >
                      {loginLoading ? "..." : "登录"}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Slogan */}
        <motion.div
          className="glass-premium rounded-2xl p-5 w-full text-center mb-6 relative overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(105deg, transparent 35%, rgba(255,200,100,0.04) 45%, rgba(255,200,100,0.06) 50%, rgba(255,200,100,0.04) 55%, transparent 65%)",
            }}
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatDelay: 3 }}
          />
          <span className="absolute top-3 left-5 text-2xl text-red-400/40 font-serif">&ldquo;</span>
          <p className="text-base text-gray-800 italic px-4 font-medium">
            你的行业，加点<span className="text-red-500 font-bold">龙虾</span>会怎样？
          </p>
          <span className="absolute bottom-3 right-5 text-2xl text-red-400/40 font-serif">&rdquo;</span>
        </motion.div>

        {/* Industry ticker */}
        <motion.div
          className="w-full mb-8 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.05 }}
        >
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-10 bg-linear-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-10 bg-linear-to-l from-background to-transparent z-10 pointer-events-none" />
            <motion.div
              className="flex gap-2 whitespace-nowrap"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              {[
                "餐饮美食", "文旅策划", "设计创意", "自媒体/KOL",
                "教育培训", "传统企业", "科技互联网", "医疗健康",
                "金融投资", "法律服务", "摄影艺术", "零售电商",
                "餐饮美食", "文旅策划", "设计创意", "自媒体/KOL",
                "教育培训", "传统企业", "科技互联网", "医疗健康",
                "金融投资", "法律服务", "摄影艺术", "零售电商",
              ].map((tag, i) => (
                <span
                  key={`${tag}-${i}`}
                  className="inline-block px-3.5 py-1.5 rounded-full text-sm border border-red-300/40 text-red-600 bg-white/70 shrink-0 font-medium shadow-sm"
                >
                  {tag}
                </span>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Highlights */}
        <div className="w-full space-y-3 mb-10">
          {highlights.map((item, i) => (
            <motion.div
              key={item.title}
              className="glass-premium rounded-xl p-4 flex items-center gap-4 group cursor-default relative overflow-hidden"
              initial={{ x: i % 2 === 0 ? -40 : 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1.1 + i * 0.15 }}
              whileHover={{ scale: 1.02, boxShadow: "0 4px 24px rgba(0,0,0,0.08), 0 0 0 1px rgba(231,76,60,0.15)" }}
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-red-400 via-red-500 to-red-400 rounded-l-xl" />
              <motion.span
                className="text-3xl ml-1"
                whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.4 }}
              >
                {item.emoji}
              </motion.span>
              <div>
                <h3 className="text-sm font-bold text-gray-800 group-hover:text-red-600 transition-colors">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Schedule */}
        <motion.div
          className="w-full mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <h2 className="text-lg font-black text-gray-800 mb-5 flex items-center justify-center gap-3 tracking-wide">
            <span className="w-12 h-0.5 bg-linear-to-r from-transparent via-red-400 to-red-400 inline-block rounded" />
            <span>活动流程</span>
            <span className="w-12 h-0.5 bg-linear-to-l from-transparent via-red-400 to-red-400 inline-block rounded" />
          </h2>

          <div className="relative pl-7">
            <div className="absolute left-2.5 top-2 bottom-2 w-px bg-linear-to-b from-red-400/60 via-red-400/30 to-transparent" />

            {schedule.map((item, i) => {
              const isHighlight = "highlight" in item && item.highlight;
              const cardContent = (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{item.icon}</span>
                    <span className={`text-sm font-bold ${isHighlight ? "text-red-600" : "text-gray-800"}`}>{item.title}</span>
                    <span className="text-sm font-mono text-red-500/60 ml-auto">{item.duration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-700">{item.desc}</p>
                    <span className="text-sm font-mono text-gray-500 shrink-0 ml-2">{item.time}</span>
                  </div>
                </>
              );

              return (
                <motion.div
                  key={item.time}
                  className="relative mb-4 last:mb-0"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.6 + i * 0.1 }}
                >
                  <motion.div
                    className={`absolute left-[-22px] top-2 w-3.5 h-3.5 rounded-full border-2 ${isHighlight ? "border-red-500 bg-red-500" : "border-red-400 bg-white"}`}
                    animate={{ boxShadow: ["0 0 0px rgba(220,50,30,0)", "0 0 10px rgba(220,50,30,0.35)", "0 0 0px rgba(220,50,30,0)"] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                  />
                  <div className={`glass-premium rounded-lg p-3 ${isHighlight ? "border border-red-400/40 shadow-[0_0_20px_rgba(220,50,30,0.1)]" : ""}`}>
                    {cardContent}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="text-center mt-4 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="w-16 h-px bg-red-400/25" />
            <LobsterSVG size={20} animate={false} />
            <span className="w-16 h-px bg-red-400/25" />
          </div>
          <p className="text-sm text-gray-700">住呀科技 出品 | 首届《昆明龙虾局》</p>
        </motion.div>
      </div>

      <BottomNav />
    </main>
  );
}
