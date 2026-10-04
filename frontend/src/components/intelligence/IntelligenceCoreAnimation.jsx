/**
 * IntelligenceCoreAnimation.jsx
 * A lightweight, restrained 3D-like CSS/SVG animated centerpiece for the
 * Intelligence Center hero. Represents: Student Data + Analytics + ML = Intelligence.
 * Uses pure CSS animations — no Three.js — for performance in a data-heavy page.
 */

import React, { useEffect, useRef } from 'react';

export function IntelligenceCoreAnimation({ riskMetrics, evaluated }) {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;

    const nodes = [
      { label: 'Students', angle: 0, r: 80, color: '#38bdf8' },
      { label: 'Analytics', angle: (Math.PI * 2) / 3, r: 80, color: '#a78bfa' },
      { label: 'ML Model', angle: (Math.PI * 4) / 3, r: 80, color: '#34d399' },
    ];

    let t = 0;
    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Outer glow ring
      const outerGrad = ctx.createRadialGradient(cx, cy, 55, cx, cy, 110);
      outerGrad.addColorStop(0, 'rgba(56,189,248,0.04)');
      outerGrad.addColorStop(1, 'rgba(56,189,248,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, 105, 0, Math.PI * 2);
      ctx.fillStyle = outerGrad;
      ctx.fill();

      // Orbit ring
      ctx.beginPath();
      ctx.arc(cx, cy, 80, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(56,189,248,0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Inner orbit ring
      ctx.beginPath();
      ctx.arc(cx, cy, 45, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(167,139,250,0.10)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Lines from center to nodes
      nodes.forEach((node) => {
        const angle = node.angle + t * 0.3;
        const nx = cx + Math.cos(angle) * node.r;
        const ny = cy + Math.sin(angle) * node.r;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(nx, ny);
        ctx.strokeStyle = node.color + '30';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Orbiting nodes
      nodes.forEach((node) => {
        const angle = node.angle + t * 0.3;
        const nx = cx + Math.cos(angle) * node.r;
        const ny = cy + Math.sin(angle) * node.r;

        // Glow
        const grd = ctx.createRadialGradient(nx, ny, 0, nx, ny, 18);
        grd.addColorStop(0, node.color + 'CC');
        grd.addColorStop(1, node.color + '00');
        ctx.beginPath();
        ctx.arc(nx, ny, 18, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Dot
        ctx.beginPath();
        ctx.arc(nx, ny, 5, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
      });

      // Floating particles
      for (let i = 0; i < 18; i++) {
        const pAngle = (i / 18) * Math.PI * 2 + t * (i % 2 === 0 ? 0.15 : -0.1);
        const pr = 115 + Math.sin(t * 2 + i) * 8;
        const px = cx + Math.cos(pAngle) * pr;
        const py = cy + Math.sin(pAngle) * pr;
        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(148,163,184,${0.2 + 0.15 * Math.sin(t + i)})`;
        ctx.fill();
      }

      // Center core pulsing
      const pulse = 0.85 + 0.15 * Math.sin(t * 2);
      const coreGrd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30 * pulse);
      coreGrd.addColorStop(0, 'rgba(56,189,248,0.9)');
      coreGrd.addColorStop(0.5, 'rgba(99,102,241,0.6)');
      coreGrd.addColorStop(1, 'rgba(99,102,241,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, 30 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = coreGrd;
      ctx.fill();

      // Core dot
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#e0f2fe';
      ctx.fill();

      t += 0.008;
      animFrameRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div className="flex items-center justify-center gap-8 md:gap-12">
      {/* Canvas Animation */}
      <div className="relative shrink-0">
        <canvas
          ref={canvasRef}
          width={260}
          height={260}
          className="opacity-90"
          style={{ filter: 'blur(0px)' }}
        />
        {/* Center label overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center mt-1">
            <div className="text-[10px] font-bold text-sky-300/70 tracking-widest uppercase">
              Intelligence
            </div>
            <div className="text-[9px] text-slate-400/60 mt-0.5">Core</div>
          </div>
        </div>
      </div>

      {/* Node Labels */}
      <div className="space-y-4 hidden sm:block">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
          <div>
            <p className="text-xs font-semibold text-sky-300">Student Data</p>
            <p className="text-[10px] text-slate-400">{evaluated} evaluated via ML</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.8)]" />
          <div>
            <p className="text-xs font-semibold text-violet-300">Academic Analytics</p>
            <p className="text-[10px] text-slate-400">Live PostgreSQL data</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <div>
            <p className="text-xs font-semibold text-emerald-300">ML Risk Model</p>
            <p className="text-[10px] text-slate-400">Random Forest · ROC-AUC 0.97</p>
          </div>
        </div>
        <div className="pt-2 border-t border-white/5">
          <div className="flex gap-3 text-[10px]">
            {riskMetrics.high > 0 && (
              <span className="text-red-400 font-semibold">{riskMetrics.high} HIGH</span>
            )}
            {riskMetrics.medium > 0 && (
              <span className="text-amber-400 font-semibold">{riskMetrics.medium} MEDIUM</span>
            )}
            {riskMetrics.low > 0 && (
              <span className="text-emerald-400 font-semibold">{riskMetrics.low} LOW</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
