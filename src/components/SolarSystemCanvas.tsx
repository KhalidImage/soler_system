import { memo, useEffect, useRef } from "react";
import { NEPTUNE_AU, PLANETS, type Planet } from "../data/bodies";

/** Simulated days that elapse per real second at 1× speed. */
export const BASE_DAYS_PER_SECOND = 6;

const TAU = Math.PI * 2;
const SUN_DRAW_RADIUS = 24;

interface Star {
  x: number;
  y: number;
  r: number;
  a: number;
  phase: number;
  speed: number;
}

interface Meteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
}

interface HitZone {
  id: string;
  x: number;
  y: number;
  r: number;
}

interface Props {
  playing: boolean;
  speed: number;
  showOrbits: boolean;
  showLabels: boolean;
  selectedId: string | null;
  resetToken: number;
  onSelect: (id: string | null) => void;
  onTick: (days: number) => void;
}

/** Compress real AU distances so all eight orbits fit on screen. */
function orbitRadius(au: number, maxR: number): number {
  const inner = Math.min(88, maxR * 0.28);
  return inner + (maxR - inner) * Math.pow(au / NEPTUNE_AU, 0.6);
}

function SolarSystemCanvas({
  playing,
  speed,
  showOrbits,
  showLabels,
  selectedId,
  resetToken,
  onSelect,
  onTick,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const propsRef = useRef({ playing, speed, showOrbits, showLabels, selectedId, resetToken });
  propsRef.current = { playing, speed, showOrbits, showLabels, selectedId, resetToken };
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let simDays = 0;
    let lastFrame = performance.now();
    let lastTickAt = 0;
    let lastResetToken = propsRef.current.resetToken;
    let hoverId: string | null = null;
    let stars: Star[] = [];
    let nebula: HTMLCanvasElement | null = null;
    let meteor: Meteor | null = null;
    const pointer = { x: -999, y: -999 };
    const zones: HitZone[] = [];

    /* ---------- scene builders ---------- */

    const buildNebula = () => {
      const c = document.createElement("canvas");
      c.width = Math.max(1, Math.floor(width * dpr));
      c.height = Math.max(1, Math.floor(height * dpr));
      const g = c.getContext("2d");
      if (!g) return null;
      g.scale(dpr, dpr);
      g.fillStyle = "#04070e";
      g.fillRect(0, 0, width, height);

      const blob = (x: number, y: number, r: number, fill: string) => {
        const grad = g.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, fill);
        grad.addColorStop(1, "rgba(0,0,0,0)");
        g.fillStyle = grad;
        g.fillRect(0, 0, width, height);
      };
      blob(width * 0.2, height * 0.16, Math.max(width, height) * 0.55, "rgba(24,42,86,0.5)");
      blob(width * 0.88, height * 0.8, Math.max(width, height) * 0.6, "rgba(12,52,64,0.42)");
      blob(width * 0.65, height * 0.05, Math.max(width, height) * 0.35, "rgba(70,38,20,0.18)");

      // vignette
      const v = g.createRadialGradient(
        width / 2,
        height / 2,
        Math.min(width, height) * 0.35,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.72,
      );
      v.addColorStop(0, "rgba(0,0,0,0)");
      v.addColorStop(1, "rgba(1,3,8,0.6)");
      g.fillStyle = v;
      g.fillRect(0, 0, width, height);
      return c;
    };

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      nebula = buildNebula();
      const count = Math.min(300, Math.floor((width * height) / 6500));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() < 0.85 ? Math.random() * 0.9 + 0.3 : Math.random() * 1.6 + 0.8,
        a: Math.random() * 0.5 + 0.25,
        phase: Math.random() * TAU,
        speed: Math.random() * 1.4 + 0.4,
      }));
    };

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();

    /* ---------- interaction ---------- */

    const hitTest = (x: number, y: number): string | null => {
      for (let i = zones.length - 1; i >= 0; i--) {
        const z = zones[i];
        const rr = Math.max(z.r + 7, 13);
        const dx = x - z.x;
        const dy = y - z.y;
        if (dx * dx + dy * dy <= rr * rr) return z.id;
      }
      return null;
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      hoverId = hitTest(pointer.x, pointer.y);
      canvas.style.cursor = hoverId ? "pointer" : "default";
    };

    const onPointerLeave = () => {
      pointer.x = -999;
      pointer.y = -999;
      hoverId = null;
    };

    const onClick = () => {
      onSelectRef.current(hitTest(pointer.x, pointer.y));
    };

    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);
    canvas.addEventListener("click", onClick);

    /* ---------- drawing helpers ---------- */

    const drawSun = (cx: number, cy: number, t: number) => {
      const r = SUN_DRAW_RADIUS + Math.sin(t * 1.7) * 1.1;
      // corona
      const corona = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, r * 6.5);
      corona.addColorStop(0, "rgba(255,170,80,0.30)");
      corona.addColorStop(0.35, "rgba(255,140,60,0.10)");
      corona.addColorStop(1, "rgba(255,120,50,0)");
      ctx.fillStyle = corona;
      ctx.fillRect(cx - r * 7, cy - r * 7, r * 14, r * 14);

      const body = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.25, r * 0.1, cx, cy, r);
      body.addColorStop(0, "#fff8dc");
      body.addColorStop(0.45, "#ffd88a");
      body.addColorStop(0.85, "#ff9e3d");
      body.addColorStop(1, "#f4772e");
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, TAU);
      ctx.fillStyle = body;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, r + 3.5, 0, TAU);
      ctx.strokeStyle = "rgba(255,190,110,0.28)";
      ctx.lineWidth = 1;
      ctx.stroke();

      zones.push({ id: "sun", x: cx, y: cy, r: r + 4 });
    };

    const drawPlanet = (b: Planet, cx: number, cy: number, maxR: number, t: number) => {
      const p = propsRef.current;
      const orbitR = orbitRadius(b.au, maxR);
      const angle = b.a0 + (simDays * TAU) / b.periodDays;
      const x = cx + Math.cos(angle) * orbitR;
      const y = cy + Math.sin(angle) * orbitR;
      const r = b.drawRadius;
      zones.push({ id: b.id, x, y, r });

      const selected = p.selectedId === b.id;
      const hovered = hoverId === b.id;

      // light comes from the Sun at (cx, cy)
      const dx = cx - x;
      const dy = cy - y;
      const len = Math.hypot(dx, dy) || 1;
      const lx = dx / len;
      const ly = dy / len;

      // rings behind the disc
      if (b.rings) drawRingHalf(b, x, y, r, true);

      const grad = ctx.createRadialGradient(x + lx * r * 0.5, y + ly * r * 0.5, r * 0.12, x, y, r);
      grad.addColorStop(0, b.colors[0]);
      grad.addColorStop(0.55, b.colors[1]);
      grad.addColorStop(1, b.colors[2]);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TAU);
      ctx.fillStyle = grad;
      ctx.fill();

      if (b.banded) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, r, 0, TAU);
        ctx.clip();
        ctx.fillStyle = "rgba(20,10,0,0.16)";
        ctx.fillRect(x - r, y - r * 0.55, r * 2, r * 0.28);
        ctx.fillRect(x - r, y + r * 0.15, r * 2, r * 0.24);
        ctx.fillStyle = "rgba(255,244,220,0.14)";
        ctx.fillRect(x - r, y - r * 0.18, r * 2, r * 0.2);
        ctx.restore();
      }

      if (b.id === "earth") {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, r, 0, TAU);
        ctx.clip();
        ctx.fillStyle = "rgba(88,160,92,0.85)";
        ctx.beginPath();
        ctx.ellipse(x - r * 0.3, y - r * 0.2, r * 0.42, r * 0.3, 0.5, 0, TAU);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x + r * 0.35, y + r * 0.35, r * 0.3, r * 0.22, -0.4, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.beginPath();
        ctx.ellipse(x + r * 0.1, y - r * 0.55, r * 0.5, r * 0.16, 0.2, 0, TAU);
        ctx.fill();
        ctx.restore();
      }

      // rings in front of the disc
      if (b.rings) drawRingHalf(b, x, y, r, false);

      // Earth's Moon
      if (b.hasMoon) {
        const ma = (simDays / 27.3) * TAU;
        const mx = x + Math.cos(ma) * (r + 7);
        const my = y + Math.sin(ma) * (r + 7) * 0.55;
        ctx.beginPath();
        ctx.arc(mx, my, 1.7, 0, TAU);
        ctx.fillStyle = "rgba(206,214,232,0.95)";
        ctx.fill();
      }

      // selection + hover markers
      if (selected) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, r + 9, 0, TAU);
        ctx.setLineDash([4, 5]);
        ctx.lineDashOffset = -t * 22;
        ctx.strokeStyle = b.accent;
        ctx.lineWidth = 1.4;
        ctx.shadowColor = b.accent;
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.restore();
      } else if (hovered) {
        ctx.beginPath();
        ctx.arc(x, y, r + 5.5, 0, TAU);
        ctx.strokeStyle = "rgba(233,239,252,0.55)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // label
      if (p.showLabels || hovered || selected) {
        const strong = hovered || selected;
        ctx.font = `${strong ? 600 : 500} 10px "IBM Plex Mono", monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.strokeStyle = strong ? b.accent : "rgba(142,163,204,0.75)";
        ctx.beginPath();
        ctx.moveTo(x, y - r - 5);
        ctx.lineTo(x, y - r - 10);
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = strong ? "#f2f6ff" : "rgba(178,196,228,0.85)";
        ctx.fillText(b.name.toUpperCase(), x, y - r - 12);
      }
    };

    const drawRingHalf = (b: Planet, x: number, y: number, r: number, back: boolean) => {
      ctx.save();
      ctx.beginPath();
      if (back) ctx.rect(x - r * 3, y - r * 3, r * 6, r * 3);
      else ctx.rect(x - r * 3, y, r * 6, r * 3);
      ctx.clip();
      ctx.translate(x, y);
      ctx.rotate(-0.38);
      ctx.strokeStyle = "rgba(230,203,150,0.55)";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 2.05, r * 0.62, 0, 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = "rgba(214,184,128,0.3)";
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 1.6, r * 0.48, 0, 0, TAU);
      ctx.stroke();
      ctx.restore();
    };

    /* ---------- main loop ---------- */

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - lastFrame) / 1000, 0.1);
      lastFrame = now;
      const t = now / 1000;
      const p = propsRef.current;

      if (p.resetToken !== lastResetToken) {
        lastResetToken = p.resetToken;
        simDays = 0;
        lastTickAt = 0;
      }

      if (p.playing) simDays += dt * BASE_DAYS_PER_SECOND * p.speed;

      zones.length = 0;
      const w = width;
      const h = height;
      const cx = w / 2;
      const cy = h / 2;
      const maxR = Math.min(w, h) / 2 - 34;

      // backdrop
      if (nebula) ctx.drawImage(nebula, 0, 0, w, h);
      else {
        ctx.fillStyle = "#04070e";
        ctx.fillRect(0, 0, w, h);
      }

      // stars
      for (const s of stars) {
        const tw = 0.62 + 0.38 * Math.sin(t * s.speed + s.phase);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, TAU);
        ctx.fillStyle = `rgba(214,226,248,${(s.a * tw).toFixed(3)})`;
        ctx.fill();
      }

      // occasional meteor
      if (!meteor && Math.random() < 0.0028) {
        meteor = {
          x: Math.random() * w * 0.8 + w * 0.15,
          y: Math.random() * h * 0.3,
          vx: -(2.4 + Math.random() * 3),
          vy: 1.4 + Math.random() * 1.6,
          life: 0,
          max: 0.7 + Math.random() * 0.5,
        };
      }
      if (meteor) {
        meteor.life += dt;
        meteor.x += meteor.vx * dt * 90;
        meteor.y += meteor.vy * dt * 90;
        const fade = 1 - meteor.life / meteor.max;
        if (fade <= 0) meteor = null;
        else {
          const tail = 60;
          const grad = ctx.createLinearGradient(
            meteor.x,
            meteor.y,
            meteor.x - meteor.vx * tail * 0.35,
            meteor.y - meteor.vy * tail * 0.35,
          );
          grad.addColorStop(0, `rgba(235,242,255,${0.85 * fade})`);
          grad.addColorStop(1, "rgba(235,242,255,0)");
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(meteor.x, meteor.y);
          ctx.lineTo(meteor.x - meteor.vx * tail * 0.35, meteor.y - meteor.vy * tail * 0.35);
          ctx.stroke();
        }
      }

      if (maxR > 60) {
        // orbit paths
        for (const b of PLANETS) {
          const r = orbitRadius(b.au, maxR);
          const isSel = p.selectedId === b.id;
          const isHov = hoverId === b.id;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, TAU);
          if (isSel) {
            ctx.strokeStyle = b.accent;
            ctx.globalAlpha = 0.5;
            ctx.lineWidth = 1.3;
          } else {
            ctx.strokeStyle = "rgba(148,168,214,1)";
            ctx.globalAlpha = isHov ? 0.34 : 0.15;
            ctx.lineWidth = 1;
          }
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        drawSun(cx, cy, t);
        for (const b of PLANETS) drawPlanet(b, cx, cy, maxR, t);

        // Sun label
        if (p.showLabels) {
          ctx.font = '500 10px "IBM Plex Mono", monospace';
          ctx.textAlign = "center";
          ctx.textBaseline = "bottom";
          ctx.fillStyle = "rgba(255,205,130,0.8)";
          ctx.fillText("SOL", cx, cy - SUN_DRAW_RADIUS - 10);
        }
      }

      if (now - lastTickAt > 120) {
        lastTickAt = now;
        onTickRef.current(simDays);
      }
    };

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}

export default memo(SolarSystemCanvas);
