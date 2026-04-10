"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LobsterSVG } from "@/components/lobster/LobsterSVG";
import { BubbleBackground } from "@/components/lobster/BubbleBackground";
import { BottomNav } from "@/components/shared/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const industries = [
  "餐饮美食", "文旅策划", "设计创意", "自媒体/KOL",
  "教育培训", "传统企业", "科技互联网", "医疗健康",
  "金融投资", "法律服务", "摄影艺术", "零售电商",
  "房产家居", "体育健身", "咨询服务", "其他",
];

const shrimpReasonOptions = [
  "吃龙虾", "找搭子", "跨界碰撞", "社交破冰",
  "吸取能量", "灵感采集", "资源对接", "纯属看热闹",
];

const shrimpSkillOptions = [
  "吃货本能", "社交达人", "段子手", "摸鱼大师",
  "PPT之王", "演讲控", "技术宅", "创意鬼才",
  "谈判高手", "数据分析", "设计美学", "写作能力",
];

interface FormData {
  name: string;
  phone: string;
  industry: string;
  company: string;
  title: string;
  bio: string;
  avatar: string;
  shrimpGender: string;
  shrimpReason: string[];
  shrimpSkills: string[];
  shrimpWish: string;
}

const requiredFields: (keyof FormData)[] = ["name", "phone", "industry", "company", "title"];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({
    name: "", phone: "", industry: "", company: "",
    title: "", bio: "", avatar: "",
    shrimpGender: "", shrimpReason: [], shrimpSkills: [], shrimpWish: "",
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState<{ name: string; checkinCode: string } | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loginPhone, setLoginPhone] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("图片不能超过 5MB");
      return;
    }

    setUploading(true);
    try {
      const fd = new window.FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        handleChange("avatar", data.url);
        toast.success("靓照上传成功！🦞");
      } else {
        toast.error(data.error || "上传失败");
      }
    } catch {
      toast.error("上传失败");
    } finally {
      setUploading(false);
    }
  };

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

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const filledCount = requiredFields.filter((f) => {
    const v = form[f];
    return typeof v === "string" ? v.trim() !== "" : Array.isArray(v) ? v.length > 0 : false;
  }).length;
  const progress = Math.round((filledCount / requiredFields.length) * 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.industry || !form.company || !form.title) {
      toast.error("请填写所有必填字段 🦞");
      return;
    }
    if (!/^1\d{10}$/.test(form.phone)) {
      toast.error("请输入正确的11位手机号 📱");
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        name: form.name,
        phone: form.phone,
        industry: form.industry,
        company: form.company,
        title: form.title,
        bio: form.bio,
        avatar: form.avatar,
        shrimpGender: form.shrimpGender || null,
        shrimpReason: form.shrimpReason.length > 0 ? JSON.stringify(form.shrimpReason) : null,
        shrimpSkills: form.shrimpSkills.filter((s) => s.trim()).length > 0
          ? JSON.stringify(form.shrimpSkills.filter((s) => s.trim()))
          : null,
        shrimpWish: form.shrimpWish || null,
      };
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });
      const data = await res.json();

      if (res.status === 409) {
        toast.error("该手机号已报名啦！");
        localStorage.setItem("lobster-phone", form.phone);
        setSuccess({ name: data.participant.name, checkinCode: data.participant.checkinCode });
        return;
      }
      if (!res.ok) {
        toast.error(data.error || "报名失败");
        return;
      }

      toast.success("报名成功！🦞");
      localStorage.setItem("lobster-phone", form.phone);
      setSuccess({ name: data.participant.name, checkinCode: data.participant.checkinCode });
    } catch {
      toast.error("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <BubbleBackground />

      <div className="relative z-10 flex flex-col items-center px-5 pt-8 pb-24 max-w-lg mx-auto">
        {/* Header */}
        <Link href="/" className="mb-3">
          <LobsterSVG size={60} animate intensity="high" />
        </Link>
        <motion.h1
          className="text-2xl font-black mb-1 bg-linear-to-r from-red-700 via-red-500 to-red-700 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          🦞 活动报名
        </motion.h1>
        <motion.p
          className="text-sm text-gray-700 mb-6 tracking-wider"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          首届《昆明龙虾局》2026.04.13
        </motion.p>

        <AnimatePresence mode="wait">
          {!success ? (
            <motion.form
              key="form"
              className="w-full space-y-4"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Progress bar */}
              <div className="mb-2">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm text-gray-800 tracking-wider font-medium">填写进度</span>
                  <span className="text-sm text-red-500 font-mono font-bold">{progress}%</span>
                </div>
                <div className="h-1 bg-white/60 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full lobster-gradient-metallic"
                    initial={{ width: "0%" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                    style={{
                      boxShadow: progress === 100
                        ? "0 0 10px rgba(255,159,67,0.5)"
                        : "none",
                    }}
                  />
                </div>
              </div>

              {/* ============================================ */}
              {/* 虾宝档案 - 统一纸质风格卡片 */}
              {/* ============================================ */}
              <motion.div
                className="relative rounded-2xl overflow-hidden"
                style={{
                  background: "linear-gradient(180deg, #E8F8F8 0%, #D4F2F1 40%, #C0ECEB 70%, #94DCDB 100%)",
                  border: "3px solid #5CBCBA",
                  boxShadow: "0 8px 32px rgba(100,180,180,0.2), 0 2px 8px rgba(0,0,0,0.04)",
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {/* Card header */}
                <div
                  className="flex items-center justify-between px-4 py-2.5"
                  style={{ background: "linear-gradient(90deg, #E74C3C, #C0392B, #4A90D9)", borderBottom: "2px solid #5CBCBA" }}
                >
                  <div className="flex items-center gap-2">
                    <img src="/claw.png" alt="龙虾" className="w-6 h-6 object-contain" />
                    <span className="text-white text-sm font-bold tracking-wider">虾宝档案</span>
                  </div>
                  <span className="text-white/80 text-sm">首届《昆明龙虾局》</span>
                </div>

                <div className="px-4 py-4 space-y-4">
                  {/* Avatar Upload - centered */}
                  <div className="flex flex-col items-center">
                    <label className="cursor-pointer group relative">
                      <motion.div
                        className="w-20 h-20 rounded-full overflow-hidden border-2 border-dashed flex items-center justify-center transition-colors"
                        style={{
                          borderColor: form.avatar ? "#E74C3C" : "#A8DDD9",
                          background: form.avatar ? "transparent" : "rgba(255,255,255,0.6)",
                          boxShadow: form.avatar ? "0 0 16px rgba(220,50,30,0.25)" : "none",
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {form.avatar ? (
                          <img src={form.avatar} alt="头像" className="w-full h-full object-cover" />
                        ) : uploading ? (
                          <motion.span className="text-2xl" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>🦞</motion.span>
                        ) : (
                          <div className="flex flex-col items-center text-gray-500 group-hover:text-red-400 transition-colors">
                            <span className="text-xl mb-0.5">📷</span>
                            <span className="text-sm">上传靓照</span>
                          </div>
                        )}
                      </motion.div>
                      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleAvatarUpload} className="hidden" disabled={uploading} />
                      {form.avatar && (
                        <motion.div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-sm" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>✓</motion.div>
                      )}
                    </label>
                  </div>

                  <div className="border-t-2 border-dashed" style={{ borderColor: "#A8DDD9" }} />

                  {/* 基础信息区 */}
                  <div>
                    <ShrimpFieldLabel text="虾宝身份：" />
                    <div className="mt-2 space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="👤 姓名 *"
                          value={form.name}
                          onChange={(e) => handleChange("name", e.target.value)}
                          className="px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
                          style={{ background: "white", border: "1.5px solid #A8DDD9", color: "#2D3436" }}
                          onFocus={(e) => { e.currentTarget.style.borderColor = "#E74C3C"; }}
                          onBlur={(e) => { e.currentTarget.style.borderColor = "#A8DDD9"; }}
                        />
                        <input
                          type="tel"
                          placeholder="📱 手机号 *"
                          value={form.phone}
                          onChange={(e) => handleChange("phone", e.target.value)}
                          maxLength={11}
                          className="px-3 py-2.5 rounded-lg text-sm outline-none transition-all font-mono"
                          style={{ background: "white", border: "1.5px solid #A8DDD9", color: "#2D3436" }}
                          onFocus={(e) => { e.currentTarget.style.borderColor = "#E74C3C"; }}
                          onBlur={(e) => { e.currentTarget.style.borderColor = "#A8DDD9"; }}
                        />
                      </div>
                      <Select value={form.industry} onValueChange={(v) => { if (v) handleChange("industry", v); }}>
                        <SelectTrigger
                          className="h-10 text-sm rounded-lg"
                          style={{ background: "white", border: "1.5px solid #A8DDD9", color: form.industry ? "#2D3436" : "#9CA3AF" }}
                        >
                          <SelectValue placeholder="🏷️ 选择你的行业 *" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200 text-gray-800">
                          {industries.map((ind) => (
                            <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="🏢 公司/品牌 *"
                          value={form.company}
                          onChange={(e) => handleChange("company", e.target.value)}
                          className="px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
                          style={{ background: "white", border: "1.5px solid #A8DDD9", color: "#2D3436" }}
                          onFocus={(e) => { e.currentTarget.style.borderColor = "#E74C3C"; }}
                          onBlur={(e) => { e.currentTarget.style.borderColor = "#A8DDD9"; }}
                        />
                        <input
                          type="text"
                          placeholder="💼 职位 *"
                          value={form.title}
                          onChange={(e) => handleChange("title", e.target.value)}
                          className="px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
                          style={{ background: "white", border: "1.5px solid #A8DDD9", color: "#2D3436" }}
                          onFocus={(e) => { e.currentTarget.style.borderColor = "#E74C3C"; }}
                          onBlur={(e) => { e.currentTarget.style.borderColor = "#A8DDD9"; }}
                        />
                      </div>
                      <div className="relative">
                        <textarea
                          placeholder="✍️ 一句话介绍（选填）"
                          value={form.bio}
                          onChange={(e) => handleChange("bio", e.target.value)}
                          maxLength={100}
                          rows={2}
                          className="w-full px-3 py-2 rounded-lg text-sm resize-none outline-none transition-all"
                          style={{ background: "white", border: "1.5px solid #A8DDD9", color: "#2D3436" }}
                          onFocus={(e) => { e.currentTarget.style.borderColor = "#E74C3C"; }}
                          onBlur={(e) => { e.currentTarget.style.borderColor = "#A8DDD9"; }}
                        />
                        <span className="absolute bottom-1.5 right-2 text-sm" style={{ color: "#9CA3AF" }}>{form.bio.length}/100</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t-2 border-dashed" style={{ borderColor: "#A8DDD9" }} />

                  {/* Shrimp Gender */}
                  <div>
                    <ShrimpFieldLabel text="虾宝性别：" />
                    <div className="flex items-center gap-3 mt-2">
                      {[
                        { value: "男虾虾", emoji: "🦐" },
                        { value: "女虾虾", emoji: "🦞" },
                        { value: "就是一只虾", emoji: "✨" },
                      ].map((opt) => (
                        <motion.button
                          key={opt.value}
                          type="button"
                          onClick={() => handleChange("shrimpGender", opt.value)}
                          className="flex items-center gap-1.5 cursor-pointer"
                          whileTap={{ scale: 0.95 }}
                        >
                          <div
                            className="w-4 h-4 rounded border-2 flex items-center justify-center transition-colors"
                            style={{
                              borderColor: form.shrimpGender === opt.value ? "#E74C3C" : "#CCC",
                              background: form.shrimpGender === opt.value ? "#E74C3C" : "white",
                            }}
                          >
                            {form.shrimpGender === opt.value && <span className="text-white text-sm">✓</span>}
                          </div>
                          <span className="text-sm transition-colors" style={{ color: form.shrimpGender === opt.value ? "#E74C3C" : "#374151" }}>
                            {opt.emoji} {opt.value}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t-2 border-dashed" style={{ borderColor: "#A8DDD9" }} />

                  {/* Shrimp Reason */}
                  <div>
                    <ShrimpFieldLabel text="养虾理由：" />
                    <p className="text-sm mt-1 mb-2" style={{ color: "#4B5563" }}>你为什么来龙虾局？可多选，也可自定义</p>
                    <div className="flex flex-wrap gap-2">
                      {shrimpReasonOptions.map((tag) => {
                        const selected = form.shrimpReason.includes(tag);
                        return (
                          <motion.button
                            key={tag}
                            type="button"
                            onClick={() => {
                              const reasons = selected
                                ? form.shrimpReason.filter((r) => r !== tag)
                                : [...form.shrimpReason, tag];
                              setForm((prev) => ({ ...prev, shrimpReason: reasons }));
                            }}
                            className="px-3 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer"
                            style={{
                              background: selected ? "#E74C3C" : "#FFF",
                              color: selected ? "#FFF" : "#374151",
                              border: `1.5px solid ${selected ? "#E74C3C" : "#DDD"}`,
                              boxShadow: selected ? "0 2px 8px rgba(231,76,60,0.25)" : "none",
                            }}
                            whileTap={{ scale: 0.93 }}
                          >
                            {tag}
                          </motion.button>
                        );
                      })}
                      {form.shrimpReason
                        .filter((r) => !shrimpReasonOptions.includes(r))
                        .map((tag) => (
                          <motion.button
                            key={tag}
                            type="button"
                            onClick={() => {
                              setForm((prev) => ({
                                ...prev,
                                shrimpReason: prev.shrimpReason.filter((r) => r !== tag),
                              }));
                            }}
                            className="px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer"
                            style={{
                              background: "#E74C3C",
                              color: "#FFF",
                              border: "1.5px solid #E74C3C",
                              boxShadow: "0 2px 8px rgba(231,76,60,0.25)",
                            }}
                            whileTap={{ scale: 0.93 }}
                          >
                            {tag} ✕
                          </motion.button>
                        ))}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <input
                        id="custom-reason-input"
                        type="text"
                        placeholder="输入自定义理由，回车添加"
                        className="flex-1 px-3 py-1.5 rounded-full text-sm outline-none focus:ring-1 focus:ring-red-300"
                        style={{ border: "1.5px solid #DDD" }}
                        maxLength={10}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const input = e.target as HTMLInputElement;
                            const val = input.value.trim();
                            if (val && !form.shrimpReason.includes(val)) {
                              setForm((prev) => ({
                                ...prev,
                                shrimpReason: [...prev.shrimpReason, val],
                              }));
                              input.value = "";
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="px-3 py-1.5 rounded-full text-sm font-bold text-white shrink-0"
                        style={{ background: "#E74C3C" }}
                        onClick={() => {
                          const input = document.getElementById("custom-reason-input") as HTMLInputElement;
                          if (!input) return;
                          const val = input.value.trim();
                          if (val && !form.shrimpReason.includes(val)) {
                            setForm((prev) => ({
                              ...prev,
                              shrimpReason: [...prev.shrimpReason, val],
                            }));
                            input.value = "";
                          }
                        }}
                      >
                        + 添加
                      </button>
                    </div>
                  </div>

                  <div className="border-t-2 border-dashed" style={{ borderColor: "#A8DDD9" }} />

                  {/* Shrimp Skills */}
                  <div>
                    <ShrimpFieldLabel text="虾宝技能：" />
                    <p className="text-sm mt-1 mb-2" style={{ color: "#4B5563" }}>选择或自定义你的超能力标签，可多选</p>
                    <div className="flex flex-wrap gap-2">
                      {shrimpSkillOptions.map((tag) => {
                        const selected = form.shrimpSkills.includes(tag);
                        return (
                          <motion.button
                            key={tag}
                            type="button"
                            onClick={() => {
                              const skills = selected
                                ? form.shrimpSkills.filter((s) => s !== tag)
                                : [...form.shrimpSkills, tag];
                              setForm((prev) => ({ ...prev, shrimpSkills: skills }));
                            }}
                            className="px-3 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer"
                            style={{
                              background: selected ? "#5CBCBA" : "#FFF",
                              color: selected ? "#FFF" : "#374151",
                              border: `1.5px solid ${selected ? "#5CBCBA" : "#DDD"}`,
                              boxShadow: selected ? "0 2px 8px rgba(92,188,186,0.25)" : "none",
                            }}
                            whileTap={{ scale: 0.93 }}
                          >
                            {tag}
                          </motion.button>
                        );
                      })}
                      {form.shrimpSkills
                        .filter((s) => !shrimpSkillOptions.includes(s))
                        .map((tag) => (
                          <motion.button
                            key={tag}
                            type="button"
                            onClick={() => {
                              setForm((prev) => ({
                                ...prev,
                                shrimpSkills: prev.shrimpSkills.filter((s) => s !== tag),
                              }));
                            }}
                            className="px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer"
                            style={{
                              background: "#5CBCBA",
                              color: "#FFF",
                              border: "1.5px solid #5CBCBA",
                              boxShadow: "0 2px 8px rgba(92,188,186,0.25)",
                            }}
                            whileTap={{ scale: 0.93 }}
                          >
                            {tag} ✕
                          </motion.button>
                        ))}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <input
                        id="custom-skill-input"
                        type="text"
                        placeholder="输入自定义技能，回车添加"
                        className="flex-1 px-3 py-1.5 rounded-full text-sm outline-none focus:ring-1 focus:ring-teal-300"
                        style={{ border: "1.5px solid #DDD" }}
                        maxLength={10}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const input = e.target as HTMLInputElement;
                            const val = input.value.trim();
                            if (val && !form.shrimpSkills.includes(val)) {
                              setForm((prev) => ({
                                ...prev,
                                shrimpSkills: [...prev.shrimpSkills, val],
                              }));
                              input.value = "";
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="px-3 py-1.5 rounded-full text-sm font-bold text-white shrink-0"
                        style={{ background: "#5CBCBA" }}
                        onClick={() => {
                          const input = document.getElementById("custom-skill-input") as HTMLInputElement;
                          if (!input) return;
                          const val = input.value.trim();
                          if (val && !form.shrimpSkills.includes(val)) {
                            setForm((prev) => ({
                              ...prev,
                              shrimpSkills: [...prev.shrimpSkills, val],
                            }));
                            input.value = "";
                          }
                        }}
                      >
                        + 添加
                      </button>
                    </div>
                  </div>

                  <div className="border-t-2 border-dashed" style={{ borderColor: "#A8DDD9" }} />

                  {/* Shrimp Wish */}
                  <div>
                    <ShrimpFieldLabel text="虾生遗愿：" />
                    <p className="text-sm mt-1 mb-2" style={{ color: "#4B5563" }}>在龙虾局最想实现的一件事</p>
                    <textarea
                      placeholder="例：找到一个跨界合伙人，一起搞事情！"
                      value={form.shrimpWish}
                      onChange={(e) => handleChange("shrimpWish", e.target.value)}
                      maxLength={50}
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg text-sm resize-none outline-none transition-all"
                      style={{ background: "white", border: "1.5px solid #A8DDD9", color: "#2D3436" }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = "#5CBCBA"; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "#A8DDD9"; }}
                    />
                    <p className="text-sm text-right mt-0.5" style={{ color: "#6B7280" }}>{form.shrimpWish.length}/50</p>
                  </div>
                </div>

                {/* Paper card bottom decoration */}
                <div className="px-4 pb-3 flex items-center justify-between">
                  <span className="text-sm font-bold" style={{ color: "#2D8886" }}>🦞 填得越多，档案越完整</span>
                  <span className="text-sm font-bold" style={{ color: "#2D8886" }}>2026 龙虾局</span>
                </div>
              </motion.div>

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="w-full h-13 text-base font-bold lobster-gradient-metallic hover:opacity-90 rounded-xl text-white border-0 mt-4 animate-glow-pulse-intense shadow-[0_6px_24px_rgba(220,50,30,0.3)]"
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
                  "🦞 确认报名"
                )}
              </Button>

              {/* Quick Login */}
              <div className="mt-6 pt-5 border-t border-red-500/10">
                <motion.button
                  type="button"
                  onClick={() => setShowLogin(!showLogin)}
                  className="w-full text-center text-sm text-gray-700 hover:text-red-600 transition-colors cursor-pointer"
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
                      <div className="mt-4 glass-premium rounded-xl p-4">
                        <p className="text-sm text-gray-700 mb-3">输入报名时的手机号</p>
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
                            type="button"
                            onClick={handleQuickLogin}
                            disabled={loginLoading}
                            className="lobster-gradient-metallic text-white border-0 h-11 px-5"
                          >
                            {loginLoading ? "..." : "登录"}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.form>
          ) : (
            <motion.div
              key="success"
              className="w-full flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 120, delay: 0.1 }}
              >
                <LobsterSVG size={120} animate intensity="high" />
              </motion.div>

              <motion.h2
                className="text-2xl font-black mt-4 mb-1 bg-linear-to-r from-red-700 via-red-500 to-red-700 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                报名成功！🎉
              </motion.h2>
              <motion.p
                className="text-gray-700 text-sm mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {success.name}，欢迎加入龙虾局！
              </motion.p>

              <motion.div
                className="glass-premium rounded-2xl w-full overflow-hidden mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="h-1 w-full lobster-gradient-metallic" />
                <div className="p-6 text-center">
                  <p className="text-sm text-gray-700 uppercase tracking-[0.15em] mb-4">你的专属虾号</p>
                  <motion.div
                    className="flex items-center justify-center gap-3 py-3"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6, type: "spring" }}
                  >
                    <span className="text-3xl">🦞</span>
                    <div className="text-left">
                      <p className="text-gray-800 font-bold text-lg">虾号 {success.checkinCode}</p>
                      <p className="text-sm text-gray-700 mt-0.5">活动当天使用手机号签到</p>
                    </div>
                  </motion.div>
                  <motion.div
                    className="mt-3 px-6 py-3.5 rounded-2xl border border-red-300/40 inline-block relative overflow-hidden bg-white/60"
                    style={{ background: "linear-gradient(135deg, rgba(220,50,30,0.08), rgba(255,159,67,0.05))" }}
                    animate={{ boxShadow: ["0 0 15px rgba(220,50,30,0.1)", "0 0 25px rgba(220,50,30,0.15)", "0 0 15px rgba(220,50,30,0.1)"] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <p className="text-red-500 font-mono text-3xl tracking-[0.3em] font-bold">
                      {success.checkinCode}
                    </p>
                  </motion.div>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <span className="w-4 h-px bg-red-500/20" />
                    <p className="text-sm text-gray-700">2026.04.13 14:00 · 斯卡沃里尼昆明店</p>
                    <span className="w-4 h-px bg-red-500/20" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="flex gap-3 w-full"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Link href="/checkin" className="flex-1">
                  <Button variant="outline" className="w-full border-red-500/30 text-gray-800 hover:bg-red-500/10 h-12">
                    🎫 去签到
                  </Button>
                </Link>
                <Button
                  className="flex-1 lobster-gradient-metallic text-white border-0 h-12 shadow-[0_0_15px_rgba(220,50,30,0.15)]"
                  onClick={() => {
                    router.push(`/blindbox?myCode=${success.checkinCode}`);
                  }}
                >
                  🎲 盲盒名片
                </Button>
              </motion.div>

              <motion.div
                className="w-full mt-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <Link href={`/profile?phone=${success.checkinCode}`} className="block">
                  <Button variant="outline" className="w-full border-orange-500/30 text-orange-600 hover:bg-orange-500/10 h-11 text-sm font-medium">
                    🦞 查看虾宝档案
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomNav />
    </main>
  );
}

function ShrimpFieldLabel({ text }: { text: string }) {
  return (
    <span
      className="inline-block px-2 py-0.5 rounded text-sm font-bold"
      style={{
        background: "#E74C3C",
        color: "white",
        boxShadow: "1px 1px 0 rgba(200,50,30,0.3)",
      }}
    >
      {text}
    </span>
  );
}

