"use client";

import { useState, useEffect, Suspense, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";
import Image from "next/image";
import { BubbleBackground } from "@/components/lobster/BubbleBackground";
import { LobsterSVG } from "@/components/lobster/LobsterSVG";
import { BottomNav } from "@/components/shared/BottomNav";
import { Button } from "@/components/ui/button";
import { parseShrimpTitle } from "@/lib/shrimp-title";

interface ProfileData {
  name: string;
  industry: string;
  company: string;
  title: string;
  avatar?: string;
  checkinCode: string;
  checkedIn?: boolean;
  shrimpGender?: string | null;
  shrimpReason?: string | null;
  shrimpSkills?: string | null;
  shrimpWish?: string | null;
  shrimpTitle?: string | null;
  createdAt?: string | null;
}

const industryColorMap: Record<string, string> = {
  "餐饮美食": "#FF6B6B",
  "文旅策划": "#FF9F43",
  "设计创意": "#A29BFE",
  "自媒体/KOL": "#FD79A8",
  "教育培训": "#FDCB6E",
  "传统企业": "#6C5CE7",
  "科技互联网": "#00B894",
  "医疗健康": "#E17055",
  "金融投资": "#0984E3",
  "法律服务": "#636E72",
  "摄影艺术": "#E84393",
  "零售电商": "#00CEC9",
  "房产家居": "#D63031",
  "体育健身": "#00B894",
  "咨询服务": "#6C5CE7",
  "其他": "#B2BEC3",
};

const shrimpReasons: Record<string, string> = {
  "餐饮美食": "吃虾进修",
  "文旅策划": "灵感采风",
  "设计创意": "灵感充电",
  "自媒体/KOL": "素材狩猎",
  "教育培训": "跨界研修",
  "传统企业": "转型探路",
  "科技互联网": "编程进化",
  "医疗健康": "养生交流",
  "金融投资": "资源对接",
  "法律服务": "合规社交",
  "摄影艺术": "捕捉灵感",
  "零售电商": "流量碰撞",
  "房产家居": "跨界融合",
  "体育健身": "能量补给",
  "咨询服务": "方法论碰撞",
  "其他": "跨界探索",
};

const skillsByIndustry: Record<string, string[]> = {
  "餐饮美食": ["味觉鉴赏 Lv.MAX", "食材鉴定", "菜单设计", "吃货本能"],
  "文旅策划": ["行程规划 Lv.MAX", "故事编织", "打卡雷达", "氛围感知"],
  "设计创意": ["审美暴击 Lv.MAX", "配色直觉", "像素眼", "创意风暴"],
  "自媒体/KOL": ["流量嗅觉 Lv.MAX", "内容灵感", "镜头感", "热点捕捉"],
  "教育培训": ["知识传递 Lv.MAX", "耐心值∞", "逻辑拆解", "启发式提问"],
  "传统企业": ["经验值满级", "资源整合", "稳健经营", "行业洞察"],
  "科技互联网": ["代码编织 Lv.MAX", "Bug感知", "需求翻译", "架构直觉"],
  "医疗健康": ["生命守护 Lv.MAX", "健康雷达", "耐心值∞", "知识储备"],
  "金融投资": ["数字敏感 Lv.MAX", "风险嗅觉", "资本直觉", "趋势预判"],
  "法律服务": ["逻辑严谨 Lv.MAX", "条文速查", "正义感", "谈判术"],
  "摄影艺术": ["光影捕捉 Lv.MAX", "构图直觉", "色彩感知", "美学暴击"],
  "零售电商": ["选品雷达 Lv.MAX", "流量密码", "供应链", "数据思维"],
  "房产家居": ["空间感知 Lv.MAX", "户型直觉", "谈判术", "市场嗅觉"],
  "体育健身": ["体能满级", "毅力∞", "动作标准", "能量爆发"],
  "咨询服务": ["方法论 Lv.MAX", "洞察力", "结构思维", "沟通艺术"],
  "其他": ["跨界潜力 Lv.MAX", "好奇心∞", "学习力", "社交达人"],
};

function ShrimpPixelArt({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style={{ imageRendering: "pixelated" }}>
      {/* Body */}
      <rect x="10" y="8" width="12" height="14" rx="3" fill="#E74C3C" />
      <rect x="12" y="6" width="8" height="4" rx="2" fill="#C0392B" />
      {/* Eyes */}
      <rect x="13" y="10" width="3" height="3" rx="1" fill="white" />
      <rect x="18" y="10" width="3" height="3" rx="1" fill="white" />
      <rect x="14" y="11" width="1.5" height="1.5" fill="#2D3436" />
      <rect x="19" y="11" width="1.5" height="1.5" fill="#2D3436" />
      {/* Mouth */}
      <rect x="14" y="15" width="4" height="1" rx="0.5" fill="#C0392B" />
      {/* Claws */}
      <rect x="5" y="12" width="6" height="3" rx="1.5" fill="#E74C3C" />
      <rect x="21" y="12" width="6" height="3" rx="1.5" fill="#E74C3C" />
      <rect x="4" y="10" width="3" height="3" rx="1" fill="#C0392B" />
      <rect x="25" y="10" width="3" height="3" rx="1" fill="#C0392B" />
      {/* Legs */}
      <rect x="12" y="22" width="2" height="4" rx="1" fill="#E74C3C" />
      <rect x="15" y="22" width="2" height="5" rx="1" fill="#C0392B" />
      <rect x="18" y="22" width="2" height="4" rx="1" fill="#E74C3C" />
      {/* Antenna */}
      <rect x="13" y="4" width="1.5" height="3" rx="0.5" fill="#E74C3C" transform="rotate(-15 13.75 5.5)" />
      <rect x="18" y="4" width="1.5" height="3" rx="0.5" fill="#E74C3C" transform="rotate(15 18.75 5.5)" />
      <circle cx="12.5" cy="3.5" r="1.2" fill="#FF6B6B" />
      <circle cx="20" cy="3.5" r="1.2" fill="#FF6B6B" />
      {/* Cheeks */}
      <rect x="11" y="14" width="2" height="1.5" rx="0.75" fill="#FF9F43" opacity="0.6" />
      <rect x="19" y="14" width="2" height="1.5" rx="0.75" fill="#FF9F43" opacity="0.6" />
    </svg>
  );
}

function ProfileCard({
  data,
  systemPairs,
  exchangedCards,
  cardRef,
  onDownload,
  isOwner = true,
}: {
  data: ProfileData;
  systemPairs: number;
  exchangedCards: number;
  cardRef: React.RefObject<HTMLDivElement | null>;
  onDownload: () => void;
  isOwner?: boolean;
}) {
  const gender = data.shrimpGender || "就是一只虾";

  const color = industryColorMap[data.industry] || "#B2BEC3";

  const userReasons: string[] = (() => {
    if (data.shrimpReason) {
      try { return JSON.parse(data.shrimpReason); } catch { /* fallback */ }
    }
    const fallback = shrimpReasons[data.industry] || "跨界探索";
    return [fallback, "社交破冰", "跨界碰撞", "吃龙虾", "找搭子"];
  })();

  const userSkills: string[] = (() => {
    if (data.shrimpSkills) {
      try { return JSON.parse(data.shrimpSkills); } catch { /* fallback */ }
    }
    return skillsByIndustry[data.industry] || skillsByIndustry["其他"];
  })();

  const userWish = data.shrimpWish || "在龙虾局找到跨界搭子，碰撞出钳所未有的火花！";

  const regDate = data.createdAt ? new Date(data.createdAt) : new Date();
  const healthScore = Math.min(100, (systemPairs * 20 + exchangedCards * 15 + 30));

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 30, rotateX: -10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ type: "spring", stiffness: 80, damping: 15 }}
    >
      <div
        ref={cardRef}
        className="rounded-3xl overflow-hidden relative"
        style={{
          background: "linear-gradient(180deg, #F0FBFB 0%, #E4F6F5 20%, #D4F2F1 40%, #C0ECEB 65%, #94DCDB 100%)",
          boxShadow: "0 12px 40px rgba(100,180,180,0.25), 0 4px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.6)",
          border: "3px solid #5CBCBA",
        }}
      >
        {/* Watermark */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ opacity: 0.03 }}>
          <img src="/claw.png" alt="" width={200} height={200} className="absolute -right-10 top-1/3 object-contain rotate-12" />
          <img src="/claw.png" alt="" width={150} height={150} className="absolute -left-8 bottom-20 object-contain -rotate-12" />
        </div>
        {/* Top bar */}
        <div
          className="px-4 py-3"
          style={{
            background: "linear-gradient(135deg, #C0392B 0%, #E74C3C 30%, #D35400 60%, #E67E22 100%)",
            borderBottom: "2.5px solid #5CBCBA",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/claw.png" alt="龙虾" width={26} height={26} className="object-contain" />
              <div className="flex flex-col">
                <span className="text-white text-base font-black tracking-wider leading-tight">昆明龙虾局</span>
                <span className="text-white/80 text-xs font-bold leading-tight tracking-wide">钳所未有：当龙虾遇上百业盲盒</span>
              </div>
            </div>
            <motion.div
              className="px-3 py-1.5 rounded-full text-sm font-black"
              style={{ background: "rgba(255,255,255,0.95)", color: "#E74C3C", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              我有钳了！
            </motion.div>
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.15)" }} />
            <span className="text-white/70 text-sm font-black tracking-widest">首届 · 2026</span>
            <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.15)" }} />
          </div>
        </div>

        {/* Title section */}
        <div className="px-5 pt-4 pb-2">
          <div className="flex items-start justify-between">
            <div>
              <div>
                <p className="text-sm font-mono tracking-[0.25em] mb-0.5" style={{ color: "#5CBCBA" }}>SHRIMP PROFILE</p>
                <h1
                  className="text-3xl font-black tracking-wider"
                  style={{
                    color: "#2D3436",
                    textShadow: "2px 2px 0 rgba(148,220,219,0.3)",
                    fontFamily: "system-ui",
                  }}
                >
                  虾宝档案
                </h1>
                {data.shrimpTitle && (
                  <motion.p
                    className="text-sm font-bold mt-0.5 tracking-wide"
                    style={{ color: parseShrimpTitle(data.shrimpTitle).rarityColor }}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    「{data.shrimpTitle}」
                  </motion.p>
                )}
              </div>
              {/* Arrow decoration */}
              <div className="flex items-center gap-0.5 mt-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <motion.span
                    key={i}
                    className="text-sm"
                    style={{ color: "#E74C3C" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                  >
                    ›
                  </motion.span>
                ))}
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.span
                    key={`dot-${i}`}
                    className="inline-block w-1 h-1 rounded-full mx-0.5"
                    style={{ background: "#E74C3C" }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1 + i * 0.04 }}
                  />
                ))}
              </div>
            </div>
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              {data.avatar ? (
                <div
                  className="w-20 h-20 rounded-lg overflow-hidden"
                  style={{ border: "3px solid #5CBCBA", boxShadow: "3px 3px 0 rgba(92,188,186,0.3)" }}
                >
                  <img src={data.avatar} alt={data.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div
                  className="w-20 h-20 rounded-lg overflow-hidden flex items-center justify-center"
                  style={{ border: "3px solid #5CBCBA", boxShadow: "3px 3px 0 rgba(92,188,186,0.3)", background: "rgba(255,255,255,0.5)" }}
                >
                  <img src="/claw.png" alt="龙虾" width={68} height={68} className="object-contain" />
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Dashed divider */}
        <div className="mx-4 border-t-2 border-dashed" style={{ borderColor: "#A8DDD9" }} />

        {/* Info fields */}
        <div className="px-5 py-3 space-y-3">
          {/* Name + guardian */}
          <motion.div
            className="flex items-center justify-between"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center gap-2.5">
              <FieldLabel text="虾宝姓名：" />
              <span className="text-xl font-black tracking-wide" style={{ color: "#2D3436" }}>{data.name}</span>
            </div>
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded shrink-0" style={{ background: "rgba(231,76,60,0.06)", border: "1px dashed rgba(231,76,60,0.2)" }}>
              <span className="text-sm font-bold whitespace-nowrap" style={{ color: "#E74C3C" }}>监护人：龙虾局</span>
            </div>
          </motion.div>

          {/* Birth time */}
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <FieldLabel text="出生时间：" />
            <span className="text-sm" style={{ color: "#374151" }}>
              {regDate.getFullYear()}年{regDate.getMonth() + 1}月{regDate.getDate()}日{String(regDate.getHours()).padStart(2, "0")}时{String(regDate.getMinutes()).padStart(2, "0")}分{String(regDate.getSeconds()).padStart(2, "0")}秒
            </span>
          </motion.div>
        </div>

        {/* Dashed divider */}
        <div className="mx-4 border-t-2 border-dashed" style={{ borderColor: "#A8DDD9" }} />

        {/* Gender */}
        <motion.div
          className="px-5 py-3"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
        >
          <FieldLabel text="虾宝性别：" />
          <div className="flex items-center gap-4 mt-2">
            {[
              { value: "男虾虾", emoji: "🦐" },
              { value: "女虾虾", emoji: "🦞" },
              { value: "就是一只虾", emoji: "✨" },
            ].map((opt) => (
              <div key={opt.value} className="flex items-center gap-1.5">
                <div
                  className="w-4 h-4 rounded border-2 flex items-center justify-center"
                  style={{
                    borderColor: gender === opt.value ? "#E74C3C" : "#CCC",
                    background: gender === opt.value ? "#E74C3C" : "white",
                  }}
                >
                  {gender === opt.value && <span className="text-white text-sm">✓</span>}
                </div>
                <span className="text-sm" style={{ color: gender === opt.value ? "#E74C3C" : "#636E72" }}>
                  {opt.emoji} {opt.value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Dashed divider */}
        <div className="mx-4 border-t-2 border-dashed" style={{ borderColor: "#A8DDD9" }} />

        {/* Industry color */}
        <motion.div
          className="px-5 py-3"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9 }}
        >
          <FieldLabel text="虾宝体检：" />
          <div className="mt-2 px-3 py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.6)" }}>
            <div className="flex items-center gap-2.5">
              <div className="w-1.5 self-stretch rounded-full shrink-0" style={{ background: color }} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-bold" style={{ color: "#2D3436" }}>{data.industry}</p>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
                    style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}
                  >
                    {data.industry.charAt(0)}系虾
                  </span>
                </div>
                <p className="text-sm truncate mt-0.5" style={{ color: "#4B5563" }}>{data.title} @ {data.company}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Shrimp entry reason */}
        <motion.div
          className="px-5 py-3"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1 }}
        >
          <FieldLabel text="养虾理由：" />
          <div className="flex flex-wrap gap-2.5 mt-2">
            {userReasons.map((tag, i) => {
              const bgColors = ["#FFB8C6", "#FFD4A8", "#BFDFBF", "#E8B4A0", "#B8D4E8", "#D4C8FF", "#C8E8D4", "#FFE0B8"];
              const rotations = [-2, 1, -1.5, 2, -1];
              return (
                <motion.span
                  key={tag}
                  className="px-3.5 py-1.5 rounded-full text-sm font-bold"
                  style={{
                    background: bgColors[i % bgColors.length],
                    color: "#2D3436",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                    transform: `rotate(${rotations[i % rotations.length]}deg)`,
                  }}
                  initial={{ scale: 0, rotate: rotations[i % rotations.length] * 3 }}
                  animate={{ scale: 1, rotate: rotations[i % rotations.length] }}
                  transition={{ delay: 1.1 + i * 0.08, type: "spring" }}
                  whileHover={{ scale: 1.1, rotate: 0 }}
                >
                  {tag}
                </motion.span>
              );
            })}
          </div>
        </motion.div>

        {/* Dashed divider */}
        <div className="mx-4 border-t-2 border-dashed" style={{ borderColor: "#A8DDD9" }} />

        {/* Skills */}
        <motion.div
          className="px-5 py-3"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.2 }}
        >
          <FieldLabel text="虾宝技能：" />
          <div className="grid grid-cols-2 gap-2.5 mt-2">
            {userSkills.map((skill, i) => (
              <motion.div
                key={skill}
                className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{
                  background: "rgba(255,255,255,0.45)",
                  border: "1px solid rgba(231,76,60,0.12)",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 + i * 0.1 }}
                whileHover={{ scale: 1.03, boxShadow: "0 4px 12px rgba(231,76,60,0.1)" }}
              >
                <span className="text-base">⚡</span>
                <span className="text-sm font-bold" style={{ color: "#C0392B" }}>{skill}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Dashed divider */}
        <div className="mx-4 border-t-2 border-dashed" style={{ borderColor: "#A8DDD9" }} />

        {/* Shrimp life wish (bio) */}
        <motion.div
          className="px-5 py-3"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.5 }}
        >
          <FieldLabel text="虾生遗愿：" />
          <div className="mt-2 px-4 py-3 rounded-xl relative" style={{ background: "rgba(255,255,255,0.4)", border: "1px dashed #A8DDD9" }}>
            <span className="absolute top-1 left-2 text-xl font-serif" style={{ color: "#E74C3C", opacity: 0.3 }}>&ldquo;</span>
            <p className="text-sm italic leading-relaxed px-3" style={{ color: "#374151" }}>
              {userWish}
            </p>
            <span className="absolute bottom-0 right-2 text-xl font-serif" style={{ color: "#E74C3C", opacity: 0.3 }}>&rdquo;</span>
          </div>
        </motion.div>

        {/* Health record */}
        <motion.div
          className="px-5 pt-3 pb-4"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.6 }}
        >
          <div className="flex items-center justify-between">
            <FieldLabel text="健康记录：" />
            <motion.span
              className="text-sm font-black px-3 py-1 rounded-full"
              style={{
                background: healthScore >= 80 ? "linear-gradient(90deg, #00B894, #00CEC9)" : healthScore >= 50 ? "linear-gradient(90deg, #FDCB6E, #FF9F43)" : "linear-gradient(90deg, #E17055, #E74C3C)",
                color: "white",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.6, type: "spring" }}
            >
              社交值 {healthScore}/100
            </motion.span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2.5">
            <StatBlock label="系统配对" value={systemPairs} color="#E74C3C" />
            <StatBlock label="手动交换" value={exchangedCards} color="#FF9F43" />
            <StatBlock label="总人脉" value={systemPairs + exchangedCards} color="#00B894" />
          </div>
          {/* Health bar */}
          <div className="mt-3 h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.06)", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.08)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, #E74C3C, #FF9F43, #00B894)`, boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }}
              initial={{ width: "0%" }}
              animate={{ width: `${healthScore}%` }}
              transition={{ duration: 1.5, delay: 1.8, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        {/* Dashed divider */}
        <div className="mx-4 border-t-2 border-dashed" style={{ borderColor: "#A8DDD9" }} />

        {/* Bottom decoration - shrimp title showcase */}
        {(() => {
          const shrimpInfo = data.shrimpTitle ? parseShrimpTitle(data.shrimpTitle) : null;
          const isSSR = shrimpInfo?.rarity === "SSR";
          const isSR = shrimpInfo?.rarity === "SR";

          return (
            <div className="px-5 pt-4 pb-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-start gap-2 min-w-0 flex-1">
                  <motion.img
                    src="/claw.png"
                    alt="龙虾"
                    width={22}
                    height={22}
                    className="object-contain shrink-0 mt-0.5"
                    style={{ width: "22px", height: "22px" }}
                    animate={isSSR ? { rotate: [0, -10, 10, -5, 0] } : undefined}
                    transition={isSSR ? { duration: 2, repeat: Infinity, repeatDelay: 3 } : undefined}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <motion.p
                        className="text-sm font-black tracking-wide whitespace-nowrap"
                        style={{
                          color: shrimpInfo?.rarityColor || "#5CBCBA",
                          textShadow: shrimpInfo?.rarityGlow || "none",
                        }}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 2 }}
                      >
                        🦞 {data.shrimpTitle || `虾号${data.checkinCode}`}
                      </motion.p>
                      {shrimpInfo && (
                        <motion.span
                          className="text-xs font-black px-1.5 py-0.5 rounded shrink-0"
                          style={{
                            color: "white",
                            background: shrimpInfo.rarityColor,
                            boxShadow: shrimpInfo.rarityGlow,
                          }}
                          initial={{ scale: 0 }}
                          animate={isSSR ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                          transition={isSSR ? { duration: 1.5, repeat: Infinity } : { delay: 2.1, type: "spring" }}
                        >
                          {shrimpInfo.rarity}
                        </motion.span>
                      )}
                    </div>
                  </div>
                </div>
                <motion.div
                  className="shrink-0 mr-2 mb-1"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 2, type: "spring" }}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{
                      border: `2.5px double ${(isSR || isSSR) ? shrimpInfo!.rarityColor : "#E74C3C"}`,
                      color: (isSR || isSSR) ? shrimpInfo!.rarityColor : "#E74C3C",
                      boxShadow: (isSR || isSSR)
                        ? `inset 0 0 0 2px ${shrimpInfo!.rarityColor}30, ${shrimpInfo!.rarityGlow}`
                        : "inset 0 0 0 2px rgba(231,76,60,0.3), 0 2px 8px rgba(231,76,60,0.15)",
                      transform: "rotate(-12deg)",
                    }}
                  >
                    <div className="text-center leading-tight">
                      <p className="text-xs font-black">钳所</p>
                      <p className="text-xs font-black">未有</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          );
        })()}

      </div>

      {/* Download button - only show for own profile */}
      {isOwner && (
        <motion.button
          onClick={onDownload}
          className="w-full mt-4 py-3.5 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2"
          style={{
            background: "linear-gradient(135deg, #E74C3C, #C0392B)",
            boxShadow: "0 4px 16px rgba(231,76,60,0.3)",
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          保存虾宝档案到相册
        </motion.button>
      )}
    </motion.div>
  );
}

function FieldLabel({ text }: { text: string }) {
  return (
    <span
      className="inline-block px-2 py-0.5 rounded text-sm font-bold shrink-0"
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

function StatBlock({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center p-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.8)" }}>
      <motion.p
        className="text-xl font-black"
        style={{ color }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.8, type: "spring" }}
      >
        {value}
      </motion.p>
      <p className="text-sm font-medium" style={{ color: "#4B5563" }}>{label}</p>
    </div>
  );
}

function ProfileContent() {
  const searchParams = useSearchParams();
  const phoneParam = searchParams.get("phone") || "";

  const [phone, setPhone] = useState("");
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [systemPairs, setSystemPairs] = useState(0);
  const [exchangedCards, setExchangedCards] = useState(0);
  const [loading, setLoading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      toast.loading("正在生成图片...");

      const node = cardRef.current;
      const { domToPng } = await import("modern-screenshot");

      const allEls = [node, ...Array.from(node.querySelectorAll("*"))];
      const saved = new Map<Element, { transform: string; opacity: string }>();

      allEls.forEach((el) => {
        if (!(el instanceof HTMLElement)) return;
        saved.set(el, {
          transform: el.style.transform,
          opacity: el.style.opacity,
        });
        const cs = window.getComputedStyle(el);
        el.style.transform = cs.transform;
        el.style.opacity = cs.opacity;
      });

      const dataUrl = await domToPng(node, {
        scale: 3,
        backgroundColor: "#94DCDB",
        style: {
          animation: "none",
          transition: "none",
        },
      });

      saved.forEach(({ transform, opacity }, el) => {
        if (el instanceof HTMLElement) {
          el.style.transform = transform;
          el.style.opacity = opacity;
        }
      });

      toast.dismiss();
      const link = document.createElement("a");
      link.download = `虾宝档案-${profileData?.name || "我的"}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("档案已保存！发朋友圈去得瑟吧 🦞");
    } catch (err) {
      console.error("Screenshot failed:", err);
      toast.dismiss();
      toast.error("生成图片失败，请截图保存");
    }
  }, [profileData?.name]);

  const loadProfile = useCallback(async (code: string, saveToLocal = false) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/blindbox?code=${code}`);
      if (res.ok) {
        const data = await res.json();
        if (data.me) {
          setProfileData(data.me);
          setSystemPairs(data.systemPairs?.length || 0);
          setExchangedCards(data.cards?.length || 0);
          if (saveToLocal) {
            localStorage.setItem("lobster-phone", code);
          }
        } else {
          toast.error("手机号未注册");
        }
      } else {
        toast.error("手机号无效");
      }
    } catch {
      toast.error("网络错误");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("lobster-phone");
    if (phoneParam) {
      setPhone(phoneParam);
      loadProfile(phoneParam, false);
    } else if (saved) {
      setPhone(saved);
      loadProfile(saved, false);
    }
  }, [phoneParam, loadProfile]);

  if (!profileData) {
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
          <Image src="/claw.png" alt="龙虾" width={80} height={80} className="object-contain mx-auto" />
          <h2 className="text-lg font-bold text-gray-800 mt-4 mb-1">查看虾宝档案</h2>
          <p className="text-sm text-gray-700 mb-5">输入手机号，查看你的专属虾宝档案</p>
          <input
            type="tel"
            placeholder="手机号"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={11}
            onKeyDown={(e) => e.key === "Enter" && loadProfile(phone.trim(), true)}
            className="w-full px-4 py-3.5 rounded-xl bg-white/50 border border-teal-500/20 text-gray-800 text-center text-lg font-mono tracking-wider mb-4 outline-none focus:border-red-500/40 focus:shadow-[0_0_20px_rgba(220,50,30,0.15)] transition-all placeholder:text-gray-400 placeholder:text-sm placeholder:font-sans placeholder:tracking-normal"
          />
          <Button
            onClick={() => loadProfile(phone.trim(), true)}
            disabled={loading}
            className="w-full lobster-gradient-metallic text-white border-0 h-12 text-base font-bold"
          >
            {loading ? "查询中..." : "🦞 查看虾宝档案"}
          </Button>
        </div>
      </motion.div>
    );
  }

  const savedPhone = typeof window !== "undefined" ? localStorage.getItem("lobster-phone") : null;
  const isOwner = !phoneParam || phoneParam === savedPhone;

  return (
    <ProfileCard
      data={profileData}
      systemPairs={systemPairs}
      exchangedCards={exchangedCards}
      cardRef={cardRef}
      onDownload={handleDownload}
      isOwner={isOwner}
    />
  );
}

export default function ProfilePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <BubbleBackground />
      <div className="relative z-10 flex flex-col items-center px-5 pt-8 pb-24 max-w-lg mx-auto">
        <Link href="/" className="mb-3">
          <LobsterSVG size={55} animate intensity="high" />
        </Link>
        <motion.h1
            className="text-2xl font-black mb-1 bg-linear-to-r from-red-700 via-red-500 to-red-700 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          🦞 虾宝档案
        </motion.h1>
        <motion.p
          className="text-sm text-gray-700 mb-6 tracking-wider"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          你的专属龙虾局身份卡
        </motion.p>

        <Suspense fallback={
          <div className="flex items-center justify-center py-20">
            <LobsterSVG size={60} animate />
          </div>
        }>
          <ProfileContent />
        </Suspense>
      </div>

      <BottomNav />
    </main>
  );
}
