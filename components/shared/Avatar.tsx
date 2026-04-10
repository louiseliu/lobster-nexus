"use client";

import { motion } from "framer-motion";

interface AvatarProps {
  name: string;
  avatar?: string | null;
  size?: number;
  className?: string;
  glow?: boolean;
  glowDelay?: number;
}

export function Avatar({
  name,
  avatar,
  size = 40,
  className = "",
  glow = false,
  glowDelay = 0,
}: AvatarProps) {
  const sizeClass = `w-[${size}px] h-[${size}px]`;
  const fontSize = size >= 48 ? "text-xl" : size >= 32 ? "text-sm" : "text-xs";

  const baseProps = {
    className: `rounded-full lobster-gradient-metallic flex items-center justify-center text-white font-bold shrink-0 overflow-hidden ${className}`,
    style: { width: size, height: size },
  };

  const glowAnimation = glow
    ? {
        animate: {
          boxShadow: [
            "0 0 10px rgba(220,50,30,0.2), 0 0 20px rgba(220,50,30,0.1)",
            "0 0 20px rgba(220,50,30,0.4), 0 0 40px rgba(220,50,30,0.2)",
            "0 0 10px rgba(220,50,30,0.2), 0 0 20px rgba(220,50,30,0.1)",
          ],
        },
        transition: { duration: 2, repeat: Infinity, delay: glowDelay },
      }
    : {};

  return (
    <motion.div {...baseProps} {...glowAnimation}>
      {avatar ? (
        <img
          src={avatar}
          alt={name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <span className={fontSize}>{name[0]}</span>
      )}
    </motion.div>
  );
}
