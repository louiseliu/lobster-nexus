"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface LobsterSVGProps {
  className?: string;
  size?: number;
  animate?: boolean;
  intensity?: "low" | "normal" | "high";
}

export function LobsterSVG({
  className = "",
  size = 120,
  animate = true,
  intensity = "normal",
}: LobsterSVGProps) {
  const MotionG = motion.g;

  const glowIntensity = intensity === "high" ? 1.4 : intensity === "low" ? 0.6 : 1;

  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<Array<{ angle: number; radius: number; size: number; speed: number; delay: number }>>([]);

  useEffect(() => {
    setMounted(true);
    setParticles(
      Array.from({ length: 8 }, (_, i) => ({
        angle: (i / 8) * Math.PI * 2,
        radius: 90 + Math.random() * 30,
        size: 1.5 + Math.random() * 2,
        speed: 6 + Math.random() * 4,
        delay: Math.random() * 3,
      }))
    );
  }, []);

  const shouldAnimate = animate && mounted;

  if (!mounted) return null;

  return (
    <motion.svg
      viewBox="0 0 240 280"
      width={size}
      height={size * (280 / 240)}
      className={className}
      initial={shouldAnimate ? { scale: 0.8, opacity: 0 } : undefined}
      animate={shouldAnimate ? { scale: 1, opacity: 1 } : undefined}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <defs>
        {/* Body gradients */}
        <radialGradient id="bodyGrad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#F04A3E" />
          <stop offset="50%" stopColor="#D63031" />
          <stop offset="100%" stopColor="#A01E1E" />
        </radialGradient>
        <radialGradient id="bodyShine" cx="35%" cy="30%" r="40%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        <radialGradient id="clawGrad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#E8453A" />
          <stop offset="60%" stopColor="#D63031" />
          <stop offset="100%" stopColor="#B02020" />
        </radialGradient>
        <linearGradient id="legGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D63031" />
          <stop offset="100%" stopColor="#A01E1E" />
        </linearGradient>

        {/* Energy flow gradient for antennae */}
        <linearGradient id="antennaFlow" x1="0%" y1="100%" x2="100%" y2="0%">
          <motion.stop
            offset="0%"
            stopColor="#D63031"
            animate={shouldAnimate ? { stopColor: ["#D63031", "#FF6B6B", "#D63031"] } : undefined}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.stop
            offset="100%"
            stopColor="#FF9F43"
            animate={shouldAnimate ? { stopColor: ["#FF9F43", "#FFD700", "#FF9F43"] } : undefined}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </linearGradient>

        {/* Bioluminescent body pulse */}
        <radialGradient id="bioGlow" cx="50%" cy="45%" r="50%">
          <motion.stop
            offset="0%"
            stopColor="rgba(255,120,80,0.25)"
            animate={
              animate
                ? { stopColor: ["rgba(255,120,80,0.15)", "rgba(255,120,80,0.35)", "rgba(255,120,80,0.15)"] }
                : undefined
            }
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <stop offset="100%" stopColor="rgba(255,120,80,0)" />
        </radialGradient>

        {/* Claw energy gradient */}
        <radialGradient id="clawEnergy" cx="50%" cy="50%" r="50%">
          <motion.stop
            offset="0%"
            stopColor="rgba(255,200,100,0.5)"
            animate={
              animate
                ? { stopColor: ["rgba(255,200,100,0.3)", "rgba(255,200,100,0.7)", "rgba(255,200,100,0.3)"] }
                : undefined
            }
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <stop offset="100%" stopColor="rgba(255,200,100,0)" />
        </radialGradient>

        {/* Enhanced glow filter */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={3 * glowIntensity} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Soft outer glow */}
        <filter id="softGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation={6 * glowIntensity} result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0  0 0.3 0 0 0  0 0 0.2 0 0  0 0 0 0.6 0"
          />
        </filter>

        {/* Body shadow with glow */}
        <filter id="shadowGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#000" floodOpacity="0.3" />
          <feDropShadow dx="0" dy="0" stdDeviation={8 * glowIntensity} floodColor="#DC3220" floodOpacity="0.15" />
        </filter>

        {/* Particle glow */}
        <filter id="particleGlow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* === AMBIENT GLOW AURA === */}
      {shouldAnimate && (
        <motion.ellipse
          cx="120"
          cy="140"
          rx="100"
          ry="120"
          fill="url(#bioGlow)"
          animate={{
            rx: [100, 110, 100],
            ry: [120, 130, 120],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* === ORBITING ENERGY PARTICLES === */}
      {shouldAnimate &&
        particles.map((p, i) => {
          const cx = 120 + Math.cos(p.angle) * p.radius;
          const cy = 140 + Math.sin(p.angle) * p.radius * 0.7;
          return (
            <motion.circle
              key={`orbit-${i}`}
              r={p.size}
              fill="#FF6B6B"
              filter="url(#particleGlow)"
              animate={{
                cx: [
                  120 + Math.cos(p.angle) * p.radius,
                  120 + Math.cos(p.angle + Math.PI * 0.5) * p.radius,
                  120 + Math.cos(p.angle + Math.PI) * p.radius,
                  120 + Math.cos(p.angle + Math.PI * 1.5) * p.radius,
                  cx,
                ],
                cy: [
                  140 + Math.sin(p.angle) * p.radius * 0.7,
                  140 + Math.sin(p.angle + Math.PI * 0.5) * p.radius * 0.7,
                  140 + Math.sin(p.angle + Math.PI) * p.radius * 0.7,
                  140 + Math.sin(p.angle + Math.PI * 1.5) * p.radius * 0.7,
                  cy,
                ],
                opacity: [0.3, 0.8, 0.3, 0.8, 0.3],
                r: [p.size * 0.5, p.size, p.size * 0.5, p.size, p.size * 0.5],
              }}
              transition={{
                duration: p.speed,
                repeat: Infinity,
                delay: p.delay,
                ease: "linear",
              }}
            />
          );
        })}

      {/* === TAIL === */}
      <MotionG
        animate={shouldAnimate ? { rotate: [0, 3, -3, 0] } : undefined}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "120px 220px" }}
      >
        {/* Tail fan segments with enhanced gradients */}
        <path d="M90 230 Q80 265 65 270 Q78 260 85 235Z" fill="url(#clawGrad)" opacity="0.9" />
        <path d="M105 235 Q100 270 90 278 Q100 265 105 240Z" fill="url(#clawGrad)" opacity="0.9" />
        <path d="M120 238 Q120 275 120 280 Q125 270 125 240Z" fill="#D63031" />
        <path d="M135 235 Q140 270 150 278 Q140 265 135 240Z" fill="url(#clawGrad)" opacity="0.9" />
        <path d="M150 230 Q160 265 175 270 Q162 260 155 235Z" fill="url(#clawGrad)" opacity="0.9" />
        {/* Tail edge glow */}
        {shouldAnimate && (
          <motion.path
            d="M90 230 Q80 265 65 270 M150 230 Q160 265 175 270"
            fill="none"
            stroke="#FF6B6B"
            strokeWidth="1"
            opacity="0.4"
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        {/* Tail base */}
        <ellipse cx="120" cy="230" rx="32" ry="12" fill="url(#bodyGrad)" />
      </MotionG>

      {/* === BODY SEGMENTS === */}
      <g filter="url(#shadowGlow)">
        {/* Abdomen segments */}
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={`seg-${i}`}>
            <ellipse
              cx="120"
              cy={215 - i * 18}
              rx={30 + i * 2}
              ry={10 + i * 0.5}
              fill="url(#bodyGrad)"
              stroke="#8B1A1A"
              strokeWidth="0.5"
            />
            <ellipse
              cx="112"
              cy={213 - i * 18}
              rx={18 + i}
              ry={5}
              fill="url(#bodyShine)"
            />
            {/* Segment bioluminescent edge */}
            {shouldAnimate && (
              <motion.ellipse
                cx="120"
                cy={215 - i * 18}
                rx={30 + i * 2}
                ry={10 + i * 0.5}
                fill="none"
                stroke="#FF6B6B"
                strokeWidth="0.8"
                animate={{ opacity: [0.1, 0.3, 0.1] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
              />
            )}
          </g>
        ))}

        {/* Main carapace */}
        <ellipse cx="120" cy="115" rx="48" ry="42" fill="url(#bodyGrad)" />
        <ellipse cx="120" cy="115" rx="48" ry="42" fill="url(#bodyShine)" />

        {/* Bioluminescent body pulse overlay */}
        {shouldAnimate && (
          <motion.ellipse
            cx="120"
            cy="115"
            rx="48"
            ry="42"
            fill="url(#bioGlow)"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        {/* Carapace detail lines */}
        <path d="M120 75 L120 155" stroke="#8B1A1A" strokeWidth="0.8" opacity="0.4" />
        <path d="M80 105 Q120 95 160 105" fill="none" stroke="#8B1A1A" strokeWidth="0.6" opacity="0.3" />

        {/* Carapace specular highlight */}
        <ellipse cx="108" cy="100" rx="20" ry="12" fill="white" opacity="0.06" />
      </g>

      {/* === WALKING LEGS (4 pairs) === */}
      {([-1, 1] as const).map((side) =>
        [0, 1, 2, 3].map((i) => (
          <motion.line
            key={`leg-${side}-${i}`}
            x1={120 + side * 35}
            y1={150 + i * 16}
            x2={120 + side * 65}
            y2={165 + i * 18}
            stroke="url(#legGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            animate={
              animate
                ? {
                    x2: [120 + side * 65, 120 + side * 68, 120 + side * 65],
                    y2: [165 + i * 18, 168 + i * 18, 165 + i * 18],
                  }
                : undefined
            }
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.15 + (side > 0 ? 0.3 : 0),
            }}
          />
        ))
      )}

      {/* === LEFT CLAW ARM + CLAW === */}
      <MotionG
        animate={shouldAnimate ? { rotate: [0, -12, 0, -5, 0] } : undefined}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "85px 110px" }}
      >
        {/* Arm */}
        <path
          d="M85 110 Q60 85 45 60"
          fill="none"
          stroke="url(#legGrad)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Upper claw */}
        <path
          d="M45 60 Q35 45 20 30 Q15 25 18 20 Q22 22 28 28 Q38 40 45 55Z"
          fill="url(#clawGrad)"
          stroke="#8B1A1A"
          strokeWidth="1"
        />
        {/* Lower claw */}
        <path
          d="M45 60 Q30 55 18 42 Q12 38 15 33 Q20 36 25 40 Q35 50 45 58Z"
          fill="url(#clawGrad)"
          stroke="#8B1A1A"
          strokeWidth="1"
        />
        {/* Claw specular highlight */}
        <path
          d="M40 55 Q35 47 28 38"
          fill="none"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Claw energy glow */}
        {shouldAnimate && (
          <motion.circle
            cx="30"
            cy="35"
            r="12"
            fill="url(#clawEnergy)"
            animate={{ r: [10, 14, 10], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
        {/* Claw teeth */}
        <circle cx="22" cy="28" r="1.5" fill="#8B1A1A" opacity="0.5" />
        <circle cx="18" cy="36" r="1.2" fill="#8B1A1A" opacity="0.5" />
      </MotionG>

      {/* === RIGHT CLAW ARM + CLAW === */}
      <MotionG
        animate={shouldAnimate ? { rotate: [0, 12, 0, 5, 0] } : undefined}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        style={{ transformOrigin: "155px 110px" }}
      >
        {/* Arm */}
        <path
          d="M155 110 Q180 85 195 60"
          fill="none"
          stroke="url(#legGrad)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Upper claw */}
        <path
          d="M195 60 Q205 45 220 30 Q225 25 222 20 Q218 22 212 28 Q202 40 195 55Z"
          fill="url(#clawGrad)"
          stroke="#8B1A1A"
          strokeWidth="1"
        />
        {/* Lower claw */}
        <path
          d="M195 60 Q210 55 222 42 Q228 38 225 33 Q220 36 215 40 Q205 50 195 58Z"
          fill="url(#clawGrad)"
          stroke="#8B1A1A"
          strokeWidth="1"
        />
        {/* Claw specular */}
        <path
          d="M200 55 Q205 47 212 38"
          fill="none"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Claw energy glow */}
        {shouldAnimate && (
          <motion.circle
            cx="210"
            cy="35"
            r="12"
            fill="url(#clawEnergy)"
            animate={{ r: [10, 14, 10], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
          />
        )}
        <circle cx="218" cy="28" r="1.5" fill="#8B1A1A" opacity="0.5" />
        <circle cx="222" cy="36" r="1.2" fill="#8B1A1A" opacity="0.5" />
      </MotionG>

      {/* === ANTENNAE WITH ENERGY FLOW === */}
      {/* Left antenna pair */}
      <motion.path
        d="M105 82 Q85 50 60 20"
        fill="none"
        stroke="url(#antennaFlow)"
        strokeWidth="2.5"
        strokeLinecap="round"
        animate={
          animate
            ? { d: ["M105 82 Q85 50 60 20", "M105 82 Q80 52 55 25", "M105 82 Q85 50 60 20"] }
            : undefined
        }
        transition={{ duration: 2.5, repeat: Infinity }}
      />
      <motion.path
        d="M95 82 Q80 55 55 30"
        fill="none"
        stroke="#C0392B"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.7"
        animate={
          animate
            ? { d: ["M95 82 Q80 55 55 30", "M95 82 Q75 57 48 35", "M95 82 Q80 55 55 30"] }
            : undefined
        }
        transition={{ duration: 3, repeat: Infinity }}
      />
      {/* Right antenna pair */}
      <motion.path
        d="M135 82 Q155 50 180 20"
        fill="none"
        stroke="url(#antennaFlow)"
        strokeWidth="2.5"
        strokeLinecap="round"
        animate={
          animate
            ? {
                d: [
                  "M135 82 Q155 50 180 20",
                  "M135 82 Q160 52 185 25",
                  "M135 82 Q155 50 180 20",
                ],
              }
            : undefined
        }
        transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
      />
      <motion.path
        d="M145 82 Q160 55 185 30"
        fill="none"
        stroke="#C0392B"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.7"
        animate={
          animate
            ? {
                d: [
                  "M145 82 Q160 55 185 30",
                  "M145 82 Q165 57 192 35",
                  "M145 82 Q160 55 185 30",
                ],
              }
            : undefined
        }
        transition={{ duration: 3, repeat: Infinity, delay: 0.7 }}
      />

      {/* Antennae tips - enhanced bioluminescent orbs */}
      <motion.circle
        cx="60"
        cy="20"
        r="5"
        fill="#FF6B6B"
        filter="url(#softGlow)"
        animate={shouldAnimate ? { opacity: [0.4, 1, 0.4], r: [4, 6, 4] } : undefined}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <motion.circle
        cx="60"
        cy="20"
        r="3"
        fill="#FFD700"
        filter="url(#glow)"
        animate={shouldAnimate ? { opacity: [0.6, 1, 0.6], r: [2, 3.5, 2] } : undefined}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <motion.circle
        cx="180"
        cy="20"
        r="5"
        fill="#FF6B6B"
        filter="url(#softGlow)"
        animate={shouldAnimate ? { opacity: [0.4, 1, 0.4], r: [4, 6, 4] } : undefined}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
      />
      <motion.circle
        cx="180"
        cy="20"
        r="3"
        fill="#FFD700"
        filter="url(#glow)"
        animate={shouldAnimate ? { opacity: [0.6, 1, 0.6], r: [2, 3.5, 2] } : undefined}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
      />

      {/* === EYES === */}
      {/* Eye stalks */}
      <ellipse cx="100" cy="90" rx="5" ry="8" fill="#C0392B" />
      <ellipse cx="140" cy="90" rx="5" ry="8" fill="#C0392B" />

      {/* Eyeballs */}
      <circle cx="100" cy="84" r="10" fill="white" stroke="#8B1A1A" strokeWidth="1" />
      <circle cx="140" cy="84" r="10" fill="white" stroke="#8B1A1A" strokeWidth="1" />

      {/* Iris with depth */}
      <motion.circle
        cx="101"
        cy="84"
        r="6"
        fill="#1a0a08"
        animate={shouldAnimate ? { cx: [101, 103, 101, 99, 101] } : undefined}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.circle
        cx="141"
        cy="84"
        r="6"
        fill="#1a0a08"
        animate={shouldAnimate ? { cx: [141, 143, 141, 139, 141] } : undefined}
        transition={{ duration: 4, repeat: Infinity }}
      />

      {/* Iris inner ring */}
      <motion.circle
        cx="101"
        cy="84"
        r="3.5"
        fill="none"
        stroke="#3a1510"
        strokeWidth="0.5"
        animate={shouldAnimate ? { cx: [101, 103, 101, 99, 101] } : undefined}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.circle
        cx="141"
        cy="84"
        r="3.5"
        fill="none"
        stroke="#3a1510"
        strokeWidth="0.5"
        animate={shouldAnimate ? { cx: [141, 143, 141, 139, 141] } : undefined}
        transition={{ duration: 4, repeat: Infinity }}
      />

      {/* Eye highlights - primary */}
      <circle cx="103" cy="81" r="3" fill="white" opacity="0.95" />
      <circle cx="143" cy="81" r="3" fill="white" opacity="0.95" />
      {/* Eye highlights - secondary */}
      <circle cx="98" cy="86" r="1.5" fill="white" opacity="0.5" />
      <circle cx="138" cy="86" r="1.5" fill="white" opacity="0.5" />
      {/* Eye highlights - tertiary sparkle */}
      <circle cx="104" cy="83" r="0.8" fill="white" opacity="0.7" />
      <circle cx="144" cy="83" r="0.8" fill="white" opacity="0.7" />

      {/* === MOUTH (cute smile) === */}
      <path
        d="M108 108 Q120 118 132 108"
        fill="none"
        stroke="#8B1A1A"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Blush marks with glow */}
      <ellipse cx="90" cy="102" rx="7" ry="3.5" fill="#FF6B6B" opacity="0.25" />
      <ellipse cx="150" cy="102" rx="7" ry="3.5" fill="#FF6B6B" opacity="0.25" />
      {shouldAnimate && (
        <>
          <motion.ellipse
            cx="90"
            cy="102"
            rx="7"
            ry="3.5"
            fill="#FF6B6B"
            animate={{ opacity: [0.15, 0.35, 0.15] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.ellipse
            cx="150"
            cy="102"
            rx="7"
            ry="3.5"
            fill="#FF6B6B"
            animate={{ opacity: [0.15, 0.35, 0.15] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
          />
        </>
      )}

      {/* === BODY TEXTURE SPOTS === */}
      {[
        { cx: 108, cy: 125, r: 3 },
        { cx: 132, cy: 120, r: 2.5 },
        { cx: 115, cy: 140, r: 2 },
        { cx: 128, cy: 135, r: 2.5 },
        { cx: 120, cy: 155, r: 2 },
      ].map((spot, i) => (
        <circle
          key={`spot-${i}`}
          cx={spot.cx}
          cy={spot.cy}
          r={spot.r}
          fill="#8B1A1A"
          opacity="0.15"
        />
      ))}

      {/* === BIOLUMINESCENT SPOTS === */}
      {shouldAnimate &&
        [
          { cx: 105, cy: 130, r: 2 },
          { cx: 135, cy: 125, r: 1.8 },
          { cx: 120, cy: 148, r: 1.5 },
          { cx: 112, cy: 165, r: 1.3 },
          { cx: 130, cy: 170, r: 1.5 },
        ].map((spot, i) => (
          <motion.circle
            key={`bio-${i}`}
            cx={spot.cx}
            cy={spot.cy}
            r={spot.r}
            fill="#FF9F43"
            filter="url(#glow)"
            animate={{
              opacity: [0.1, 0.5, 0.1],
              r: [spot.r * 0.6, spot.r * 1.2, spot.r * 0.6],
            }}
            transition={{
              duration: 2 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeInOut",
            }}
          />
        ))}
    </motion.svg>
  );
}
