"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";
import { BubbleBackground } from "@/components/lobster/BubbleBackground";
import { LobsterSVG } from "@/components/lobster/LobsterSVG";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Participant {
  id: string;
  name: string;
  phone: string;
  industry: string;
  company: string;
  title: string;
  checkedIn: boolean;
  checkinTime: string | null;
  checkinCode: string;
  createdAt: string;
  avatar?: string;
}

interface Stats {
  total: number;
  checkedIn: number;
  industries: string[];
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"all" | "checkedin" | "pending">("all");
  const [search, setSearch] = useState("");
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = useCallback(async (pwd?: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        headers: { "x-admin-password": pwd || password },
      });
      if (!res.ok) {
        toast.error("密码错误或获取失败");
        return;
      }
      const data = await res.json();
      setParticipants(data.participants);
      setStats(data.stats);
      setAuthed(true);
      setLastUpdate(new Date());
    } catch {
      toast.error("网络错误");
    } finally {
      setLoading(false);
    }
  }, [password]);

  useEffect(() => {
    if (!authed) return;
    const interval = setInterval(() => fetchData(), 10000);
    return () => clearInterval(interval);
  }, [authed, fetchData]);

  const handleLogin = () => {
    if (!password.trim()) {
      toast.error("请输入管理密码");
      return;
    }
    fetchData();
  };

  const handleExportCSV = () => {
    if (participants.length === 0) {
      toast.error("暂无数据可导出");
      return;
    }
    const headers = ["姓名", "手机号", "行业", "公司", "职位", "签到状态", "签到时间", "报名时间"];
    const rows = participants.map((p) => [
      p.name,
      p.phone,
      p.industry,
      p.company,
      p.title,
      p.checkedIn ? "已签到" : "未签到",
      p.checkinTime ? new Date(p.checkinTime).toLocaleString("zh-CN") : "",
      new Date(p.createdAt).toLocaleString("zh-CN"),
    ]);
    const bom = "\uFEFF";
    const csv = bom + [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `龙虾局报名数据_${new Date().toLocaleDateString("zh-CN").replace(/\//g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("导出成功！");
  };

  const handleMatch = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({ round: 1 }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error);
        return;
      }
      toast.success(`成功配对 ${data.totalPairs} 组！`);
    } catch {
      toast.error("配对失败");
    } finally {
      setLoading(false);
    }
  };

  const filtered = participants
    .filter((p) => {
      if (tab === "checkedin") return p.checkedIn;
      if (tab === "pending") return !p.checkedIn;
      return true;
    })
    .filter((p) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.company.toLowerCase().includes(q) ||
        p.industry.toLowerCase().includes(q)
      );
    });

  if (!authed) {
    return (
      <main className="relative min-h-screen overflow-hidden">
        <BubbleBackground />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-5 max-w-lg mx-auto">
          <LobsterSVG size={80} animate intensity="high" />
          <motion.h1
            className="text-2xl font-black mt-4 mb-1 bg-linear-to-r from-red-400 via-orange-400 to-red-500 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            管理后台
          </motion.h1>
          <motion.p
            className="text-xs text-gray-400 mb-6 tracking-wider"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            昆明龙虾局 · 管理员入口
          </motion.p>
          <motion.div
            className="w-full glass-premium rounded-2xl p-6 relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(circle at 50% 30%, rgba(220,50,30,0.06) 0%, transparent 60%)" }}
            />
            <Input
              type="password"
              placeholder="管理密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="glass border-red-500/20 h-12 mb-3 focus:shadow-[0_0_20px_rgba(220,50,30,0.2)] focus:border-red-500/40 transition-all"
            />
            <Button
              onClick={handleLogin}
              disabled={loading}
              className="w-full lobster-gradient-metallic text-white border-0 h-12 text-base font-bold shadow-[0_0_20px_rgba(220,50,30,0.15)]"
            >
              {loading ? (
                <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="inline-block">🦞</motion.span>
              ) : "🔐 登录"}
            </Button>
          </motion.div>
        </div>
      </main>
    );
  }

  const checkedInCount = participants.filter((p) => p.checkedIn).length;
  const checkinRate = participants.length > 0 ? Math.round((checkedInCount / participants.length) * 100) : 0;

  return (
    <main className="relative min-h-screen overflow-hidden">
      <BubbleBackground />
      <div className="relative z-10 px-4 pt-6 pb-20 max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3">
            <LobsterSVG size={36} animate={false} />
            <div>
              <h1 className="text-lg font-black bg-linear-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">龙虾局管理</h1>
              <p className="text-xs text-gray-500 font-mono">ADMIN PANEL</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/game/admin" target="_blank">
              <Button size="sm" className="lobster-gradient-metallic text-white border-0 text-xs shadow-[0_0_15px_rgba(220,50,30,0.15)]">
                🎲 商业盲盒
              </Button>
            </Link>
            <Link href="/admin/screen" target="_blank">
              <Button size="sm" variant="outline" className="border-red-300/40 text-gray-600 text-xs hover:bg-red-50">
                📺 签到大屏
              </Button>
            </Link>
            <Link href="/game/screen" target="_blank">
              <Button size="sm" variant="outline" className="border-red-300/40 text-gray-600 text-xs hover:bg-red-50">
                📺 盲盒大屏
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        {stats && (
          <motion.div
            className="grid grid-cols-3 gap-3 mb-5"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="glass-premium rounded-xl p-4 text-center relative overflow-hidden">
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(circle at 50% 30%, rgba(255,255,255,0.03) 0%, transparent 60%)" }}
              />
              <p className="text-2xl font-black text-gray-800">{stats.total}</p>
              <p className="text-xs text-gray-500 mt-1">总报名</p>
            </div>
            <div className="glass-premium rounded-xl p-4 text-center relative overflow-hidden">
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(circle at 50% 30%, rgba(74,222,128,0.05) 0%, transparent 60%)" }}
              />
              <motion.p
                className="text-2xl font-black text-green-400"
                animate={{ textShadow: ["0 0 0px rgba(74,222,128,0)", "0 0 12px rgba(74,222,128,0.4)", "0 0 0px rgba(74,222,128,0)"] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {stats.checkedIn}
              </motion.p>
              <p className="text-xs text-gray-500 mt-1">已签到</p>
            </div>
            <div className="glass-premium rounded-xl p-4 text-center relative overflow-hidden">
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(circle at 50% 30%, rgba(220,50,30,0.05) 0%, transparent 60%)" }}
              />
              <p className="text-2xl font-black text-red-500">{stats.total - stats.checkedIn}</p>
              <p className="text-xs text-gray-500 mt-1">未签到</p>
            </div>
          </motion.div>
        )}

        {/* Industry distribution */}
        {stats && stats.industries.length > 0 && (
          <motion.div
            className="glass-premium rounded-xl p-4 mb-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            <p className="text-xs text-gray-500 mb-3 flex items-center gap-1.5">
              <span>📊</span> 行业分布
            </p>
            <div className="space-y-2">
              {(() => {
                const industryCounts = stats.industries
                  .map((ind) => ({
                    name: ind,
                    count: participants.filter((p) => p.industry === ind).length,
                  }))
                  .sort((a, b) => b.count - a.count);
                const max = Math.max(...industryCounts.map((i) => i.count), 1);

                return industryCounts.map((ind, i) => (
                  <motion.div
                    key={ind.name}
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.03 }}
                  >
                    <span className="text-xs text-gray-400 w-20 shrink-0 truncate text-right">{ind.name}</span>
                    <div className="flex-1 h-4 bg-gray-200/50 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: "linear-gradient(90deg, #E74C3C, #FF9F43)" }}
                        initial={{ width: "0%" }}
                        animate={{ width: `${(ind.count / max) * 100}%` }}
                        transition={{ duration: 0.8, delay: 0.3 + i * 0.05, ease: "easeOut" }}
                      />
                    </div>
                    <span className="text-xs text-red-400 font-mono font-bold w-6 text-right">{ind.count}</span>
                  </motion.div>
                ));
              })()}
            </div>
          </motion.div>
        )}

        {/* Checkin rate bar */}
        {stats && (
          <motion.div
            className="glass-premium rounded-xl p-3 mb-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-500">签到进度</span>
              <span className="text-xs text-green-400 font-mono font-bold">{checkinRate}%</span>
            </div>
            <div className="h-1.5 bg-gray-200/50 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #22C55E, #4ADE80)" }}
                initial={{ width: "0%" }}
                animate={{ width: `${checkinRate}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          className="flex gap-2 mb-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            onClick={() => fetchData()}
            variant="outline"
            size="sm"
            className="border-red-300/40 text-gray-600 text-xs hover:bg-red-50"
          >
            🔄 刷新
          </Button>
          {lastUpdate && (
            <div className="flex items-center gap-1.5 ml-auto">
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-green-500"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-xs text-gray-600 font-mono">
                自动刷新中 · {lastUpdate.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
            </div>
          )}
          <Button
            onClick={handleMatch}
            size="sm"
            className="lobster-gradient-metallic text-white border-0 text-xs"
            disabled={loading}
          >
            🎲 发起盲盒配对
          </Button>
          <Button
            onClick={handleExportCSV}
            variant="outline"
            size="sm"
            className="border-red-300/40 text-gray-600 text-xs hover:bg-red-50"
          >
            📊 导出CSV
          </Button>
        </motion.div>

        {/* Search + Tabs */}
        <motion.div
          className="mb-4 space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <Input
            type="search"
            placeholder="🔍 搜索姓名、手机号、公司、行业..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass border-red-500/15 h-10 text-sm focus:border-red-500/30 transition-all"
          />
          <div className="flex gap-1.5">
            {(["all", "checkedin", "pending"] as const).map((t) => {
              const count = t === "all" ? participants.length
                : t === "checkedin" ? checkedInCount
                : participants.length - checkedInCount;
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    tab === t
                      ? "text-white"
                      : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                  }`}
                >
                  {tab === t && (
                    <motion.div
                      layoutId="admin-tab"
                      className="absolute inset-0 lobster-gradient-metallic rounded-lg"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10">
                    {t === "all" ? "全部" : t === "checkedin" ? "已签到" : "未签到"}
                    <span className="ml-1 opacity-70">{count}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Participant List */}
        <AnimatePresence mode="popLayout">
          <div className="space-y-2">
            {filtered.map((p, i) => (
              <motion.div
                key={p.id}
                className="glass-premium rounded-xl overflow-hidden"
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.02 }}
                whileHover={{ scale: 1.01, boxShadow: "0 0 20px rgba(220,50,30,0.08)" }}
              >
                <div className={`h-0.5 w-full ${p.checkedIn ? "bg-green-500/40" : "bg-gray-300/50"}`} />
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg lobster-gradient-metallic flex items-center justify-center text-white text-sm font-bold shrink-0 overflow-hidden border border-red-500/20">
                        {p.avatar ? (
                          <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          p.name[0]
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-gray-800 font-bold text-sm truncate">{p.name}</p>
                          <Badge
                            variant={p.checkedIn ? "default" : "secondary"}
                            className={`text-xs shrink-0 py-0 h-4 ${p.checkedIn ? "bg-green-100 text-green-600 border-green-300/50" : "bg-gray-100 text-gray-500 border-gray-300/30"}`}
                          >
                            {p.checkedIn ? "已签到" : "未签到"}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{p.title} · {p.company}</p>
                        <span className="inline-block mt-0.5 px-1.5 py-0 rounded text-xs border border-red-200/40 text-red-500/70">{p.industry}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <p className="text-xs text-gray-500 font-mono">{p.phone.replace(/(\d{3})(\d{4})(\d{4})/, "$1****$3")}</p>
                      {p.checkinTime && (
                        <p className="text-xs text-green-600/60 font-mono mt-0.5">
                          {new Date(p.checkinTime).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="glass-premium rounded-xl p-10 text-center mt-4">
            <LobsterSVG size={50} animate />
            <p className="text-gray-500 text-sm mt-3">{search ? "没有找到匹配的人" : "暂无数据"}</p>
          </div>
        )}

        {/* Count footer */}
        {filtered.length > 0 && (
          <motion.p
            className="text-center text-xs text-gray-600 mt-4 font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            显示 {filtered.length} / {participants.length} 人
          </motion.p>
        )}
      </div>
    </main>
  );
}
