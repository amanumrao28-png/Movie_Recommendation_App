import React, { useMemo } from 'react';

/**
 * Cinematic animated background with GPU-friendly blurred gradient blobs
 * and subtle floating light particles.
 */
const BackgroundGlow = () => {
  // Memoize randomized light motes to prevent re-calculations during renders
  const particles = useMemo(() => [
    { id: 1, left: '12%', top: '25%', size: 'w-1 h-1', anim: 'animate-particle-1', color: 'bg-red-400' },
    { id: 2, left: '28%', top: '70%', size: 'w-1.5 h-1.5', anim: 'animate-particle-2', color: 'bg-yellow-300' },
    { id: 3, left: '45%', top: '35%', size: 'w-1 h-1', anim: 'animate-particle-3', color: 'bg-purple-300' },
    { id: 4, left: '62%', top: '80%', size: 'w-1.5 h-1.5', anim: 'animate-particle-1', color: 'bg-rose-400' },
    { id: 5, left: '78%', top: '20%', size: 'w-1 h-1', anim: 'animate-particle-2', color: 'bg-amber-300' },
    { id: 6, left: '88%', top: '65%', size: 'w-1.5 h-1.5', anim: 'animate-particle-3', color: 'bg-indigo-300' },
    { id: 7, left: '18%', top: '90%', size: 'w-1 h-1', anim: 'animate-particle-2', color: 'bg-red-400' },
    { id: 8, left: '52%', top: '15%', size: 'w-1.5 h-1.5', anim: 'animate-particle-1', color: 'bg-amber-200' },
  ], []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
    >
      {/* 1. Deep Midnight Base Vignette */}
      <div className="absolute inset-0 bg-[#06080f] -z-20" />

      {/* 2. Top-Left Deep Violet & Indigo Radial Glow Blob */}
      <div
        className="absolute -top-32 -left-32 w-[32rem] h-[32rem] md:w-[44rem] md:h-[44rem] rounded-full bg-gradient-to-br from-purple-950/25 via-indigo-950/20 to-transparent blur-[120px] animate-ambient-drift -z-10"
        style={{ willChange: 'transform' }}
      />

      {/* 3. Top-Right Crimson Cinematic Flare Blob */}
      <div
        className="absolute top-10 -right-32 w-[28rem] h-[28rem] md:w-[40rem] md:h-[40rem] rounded-full bg-gradient-to-bl from-red-950/25 via-rose-950/20 to-transparent blur-[120px] animate-ambient-drift-reverse -z-10"
        style={{ willChange: 'transform' }}
      />

      {/* 4. Center-Left Deep Navy Pool */}
      <div
        className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[34rem] h-[34rem] rounded-full bg-blue-950/15 blur-[140px] pointer-events-none -z-10"
      />

      {/* 5. Bottom Warm Gold / Amber Cinematic Glow */}
      <div
        className="absolute -bottom-40 right-1/4 w-[30rem] h-[30rem] md:w-[38rem] md:h-[38rem] rounded-full bg-gradient-to-t from-amber-950/15 via-rose-950/10 to-transparent blur-[120px] animate-ambient-drift -z-10"
        style={{ willChange: 'transform' }}
      />

      {/* 6. Subtle Floating Ambient Particles / Light Motes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        {particles.map((p) => (
          <div
            key={p.id}
            className={`absolute rounded-full ${p.size} ${p.color} ${p.anim} shadow-[0_0_8px_rgba(255,255,255,0.8)]`}
            style={{
              left: p.left,
              top: p.top,
            }}
          />
        ))}
      </div>

      {/* 7. Subtle Edge Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(6,8,15,0.6)_100%)] pointer-events-none" />
    </div>
  );
};

export default BackgroundGlow;
