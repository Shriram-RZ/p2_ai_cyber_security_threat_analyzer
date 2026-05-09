"use client";
import { motion } from "framer-motion";

/**
 * Animated, GPU-friendly cyber background.
 * Layered grid + radial holographic blooms + scanning beam + floating particles.
 */
export function CyberBackdrop({
  variant = "full",
}: {
  variant?: "full" | "soft";
}) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* base radial blooms */}
      <div className="absolute inset-0 bg-radial" />
      {/* moving grid */}
      <div className="absolute inset-0 grid-bg [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_85%)] animate-gridShift" />
      {/* horizontal scan line */}
      {variant === "full" && (
        <motion.div
          initial={{ y: "-20%", opacity: 0 }}
          animate={{ y: "120%", opacity: [0, 0.8, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyber-cyan/70 to-transparent blur-[1px]"
        />
      )}
      {/* corner glow */}
      <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-cyber-purple/20 blur-[120px]" />
      <div className="absolute -bottom-40 -right-40 w-[520px] h-[520px] rounded-full bg-cyber-cyan/15 blur-[120px]" />
      {/* floating particles */}
      {variant === "full" && <FloatingParticles count={26} />}
      {/* vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_55%,rgba(0,0,0,0.55))]" />
    </div>
  );
}

function FloatingParticles({ count = 20 }: { count?: number }) {
  const items = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: Math.random() * 2.5 + 0.6,
    delay: Math.random() * 6,
    duration: 8 + Math.random() * 12,
  }));
  return (
    <div className="absolute inset-0">
      {items.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full bg-cyber-cyan/60 shadow-[0_0_8px_rgba(34,211,238,0.7)]"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{ y: [0, -40, 0], opacity: [0.2, 0.9, 0.2] }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}
