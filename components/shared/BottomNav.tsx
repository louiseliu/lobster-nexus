"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const tabs = [
  { href: "/", label: "首页", icon: HomeIcon, activeIcon: HomeActiveIcon },
  { href: "/checkin", label: "签到", icon: CheckinIcon, activeIcon: CheckinActiveIcon },
  { href: "/game", label: "百业盲盒", icon: GameIcon, activeIcon: GameActiveIcon },
  { href: "/blindbox", label: "虾友", icon: BlindboxIcon, activeIcon: BlindboxActiveIcon },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 z-50"
      initial={{ y: 80 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.3 }}
    >
      {/* iOS-style backdrop blur bar */}
      <div
        className="relative"
        style={{
          background: "rgba(255, 255, 255, 0.75)",
          WebkitBackdropFilter: "saturate(180%) blur(20px)",
          backdropFilter: "saturate(180%) blur(20px)",
        }}
      >
        {/* Top hairline */}
        <div className="absolute top-0 left-0 right-0 h-px bg-black/5" />

        <div className="flex items-end justify-around max-w-lg mx-auto px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            const Icon = isActive ? tab.activeIcon : tab.icon;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="relative flex flex-col items-center gap-0.5 w-16 py-1 -mt-0.5 tap-highlight-none"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute -top-1 w-5 h-[3px] rounded-full"
                    style={{ background: "linear-gradient(90deg, #E74C3C, #FF9F43)" }}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <div className="relative w-7 h-7 flex items-center justify-center">
                  <Icon active={isActive} />
                </div>
                <span
                  className={`text-sm leading-tight font-medium transition-colors duration-200 ${
                    isActive ? "text-red-500" : "text-gray-700"
                  }`}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3 10.5L12 3L21 10.5V20C21 20.5523 20.5523 21 20 21H15V15H9V21H4C3.44772 21 3 20.5523 3 20V10.5Z"
        stroke={active ? "#E74C3C" : "#4B5563"}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function HomeActiveIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="home-grad" x1="3" y1="3" x2="21" y2="21">
          <stop offset="0%" stopColor="#E74C3C" />
          <stop offset="100%" stopColor="#FF9F43" />
        </linearGradient>
      </defs>
      <path
        d="M3 10.5L12 3L21 10.5V20C21 20.5523 20.5523 21 20 21H15V15H9V21H4C3.44772 21 3 20.5523 3 20V10.5Z"
        fill={active ? "url(#home-grad)" : "none"}
        stroke={active ? "#E74C3C" : "#4B5563"}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckinIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="3" width="16" height="18" rx="2" stroke={active ? "#E74C3C" : "#4B5563"} strokeWidth="1.8" />
      <path d="M9 12L11 14L15 10" stroke={active ? "#E74C3C" : "#4B5563"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 3V5" stroke={active ? "#E74C3C" : "#4B5563"} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16 3V5" stroke={active ? "#E74C3C" : "#4B5563"} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CheckinActiveIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="checkin-grad" x1="4" y1="3" x2="20" y2="21">
          <stop offset="0%" stopColor="#E74C3C" />
          <stop offset="100%" stopColor="#FF9F43" />
        </linearGradient>
      </defs>
      <rect x="4" y="3" width="16" height="18" rx="2" fill={active ? "url(#checkin-grad)" : "none"} stroke={active ? "#E74C3C" : "#4B5563"} strokeWidth="1.8" />
      <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 3V5" stroke={active ? "#E74C3C" : "#4B5563"} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16 3V5" stroke={active ? "#E74C3C" : "#4B5563"} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function GameIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="18" rx="3" stroke={active ? "#E74C3C" : "#4B5563"} strokeWidth="1.8" />
      <circle cx="8" cy="8" r="1.5" fill={active ? "#E74C3C" : "#4B5563"} />
      <circle cx="12" cy="12" r="1.5" fill={active ? "#E74C3C" : "#4B5563"} />
      <circle cx="16" cy="16" r="1.5" fill={active ? "#E74C3C" : "#4B5563"} />
    </svg>
  );
}

function GameActiveIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="game-grad" x1="3" y1="3" x2="21" y2="21">
          <stop offset="0%" stopColor="#E74C3C" />
          <stop offset="100%" stopColor="#FF9F43" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="18" height="18" rx="3" fill={active ? "url(#game-grad)" : "none"} stroke={active ? "#E74C3C" : "#4B5563"} strokeWidth="1.8" />
      <circle cx="8" cy="8" r="1.5" fill="white" />
      <circle cx="12" cy="12" r="1.5" fill="white" />
      <circle cx="16" cy="16" r="1.5" fill="white" />
    </svg>
  );
}

function BlindboxIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="8" width="18" height="13" rx="2" stroke={active ? "#E74C3C" : "#4B5563"} strokeWidth="1.8" />
      <path d="M12 8V21" stroke={active ? "#E74C3C" : "#4B5563"} strokeWidth="1.8" />
      <path d="M3 13H21" stroke={active ? "#E74C3C" : "#4B5563"} strokeWidth="1.8" />
      <path d="M7.5 8C7.5 8 7.5 3 12 3C16.5 3 16.5 8 16.5 8" stroke={active ? "#E74C3C" : "#4B5563"} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function BlindboxActiveIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="box-grad" x1="3" y1="3" x2="21" y2="21">
          <stop offset="0%" stopColor="#E74C3C" />
          <stop offset="100%" stopColor="#FF9F43" />
        </linearGradient>
      </defs>
      <rect x="3" y="8" width="18" height="13" rx="2" fill={active ? "url(#box-grad)" : "none"} stroke={active ? "#E74C3C" : "#4B5563"} strokeWidth="1.8" />
      <path d="M12 8V21" stroke="rgba(255,255,255,0.3)" strokeWidth="1.8" />
      <path d="M3 13H21" stroke="rgba(255,255,255,0.3)" strokeWidth="1.8" />
      <path d="M7.5 8C7.5 8 7.5 3 12 3C16.5 3 16.5 8 16.5 8" stroke={active ? "#E74C3C" : "#4B5563"} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
