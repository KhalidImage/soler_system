import { useMemo } from "react";
import {
  MERCURY_PERIOD,
  NEPTUNE_AU,
  NEPTUNE_PERIOD,
  PLANETS,
  SUN,
  type Planet,
} from "../data/bodies";

interface Props {
  selectedId: string | null;
  elapsedDays: number;
  onSelect: (id: string) => void;
}

const TAU = Math.PI * 2;
const ORDINALS = ["", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];

function pct(v: number, lo: number, hi: number): number {
  const p = (Math.log(v) - Math.log(lo)) / (Math.log(hi) - Math.log(lo));
  return Math.min(100, Math.max(3, p * 100));
}

function Sphere({ colors, rings, size = 64 }: { colors: [string, string, string]; rings?: boolean; size?: number }) {
  const ringStyle = {
    width: size * 1.9,
    height: size * 0.62,
    transform: "translate(-50%,-50%) rotate(-16deg)",
  } as const;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {rings && (
        <span
          className="absolute left-1/2 top-1/2 rounded-[50%] border-2 border-[#e6cba0]/60"
          style={{ ...ringStyle, boxShadow: "0 0 12px rgba(230,203,160,0.15)" }}
        />
      )}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at 34% 32%, ${colors[0]} 0%, ${colors[1]} 52%, ${colors[2]} 100%)`,
          boxShadow: `0 0 24px ${colors[1]}44, inset -6px -8px 14px rgba(0,0,0,0.45)`,
        }}
      />
      {rings && (
        <span
          className="absolute left-1/2 top-1/2 rounded-[50%] border-2 border-[#e6cba0]/70"
          style={{ ...ringStyle, clipPath: "inset(50% 0 0 0)" }}
        />
      )}
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-line-soft py-[7px]">
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">{label}</span>
      <span className="text-right font-mono text-[12.5px] text-ink">{value}</span>
    </div>
  );
}

function Bar({ label, valueText, widthPct, color }: { label: string; valueText: string; widthPct: number; color: string }) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">{label}</span>
        <span className="font-mono text-[11px] text-dim">{valueText}</span>
      </div>
      <div className="h-[5px] overflow-hidden rounded-full bg-space-700/70">
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-out"
          style={{ width: `${widthPct}%`, background: color, boxShadow: `0 0 10px ${color}66` }}
        />
      </div>
    </div>
  );
}

function OrbitDial({ angle, accent }: { angle: number; accent: string }) {
  const r = 22;
  const C = TAU * r;
  const p = ((angle % TAU) + TAU) % TAU / TAU;
  const deg = Math.round(p * 360);
  return (
    <div className="flex items-center gap-3">
      <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90">
        <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(151,173,222,0.15)" strokeWidth="4" />
        <circle
          cx="28"
          cy="28"
          r={r}
          fill="none"
          stroke={accent}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - p)}
        />
      </svg>
      <div>
        <div className="font-mono text-[20px] leading-none tabular-nums text-ink">{deg}°</div>
        <div className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.18em] text-faint">of current orbit</div>
      </div>
    </div>
  );
}

function PlanetDossier({ planet, elapsedDays }: { planet: Planet; elapsedDays: number }) {
  const angle = planet.a0 + (elapsedDays * TAU) / planet.periodDays;
  return (
    <div key={planet.id} className="anim-fadeup">
      <div className="flex items-start gap-4">
        <Sphere colors={planet.colors} rings={planet.rings} />
        <div className="min-w-0">
          <h2 className="font-display text-[26px] font-bold leading-tight tracking-tight">{planet.name}</h2>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <span
              className="rounded-sm border px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em]"
              style={{ borderColor: `${planet.accent}55`, color: planet.accent }}
            >
              {planet.type}
            </span>
            <span className="rounded-sm border border-line px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-dim">
              {ORDINALS[planet.order]} from Sun
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-md border border-line-soft bg-space-850/80 p-3.5">
        <OrbitDial angle={angle} accent={planet.accent} />
      </div>

      <div className="mt-4">
        <StatRow label="Diameter" value={`${planet.diameterKm.toLocaleString("en-US")} km`} />
        <StatRow label="Distance from Sun" value={`${planet.distanceMkm.toLocaleString("en-US")} M km · ${planet.au.toFixed(2)} AU`} />
        <StatRow label="Orbital period" value={`${planet.periodDays.toLocaleString("en-US")} d · ${planet.periodYears}`} />
        <StatRow label="Length of day" value={planet.rotationText} />
        <StatRow label="Moons" value={String(planet.moons)} />
        <StatRow label="Mean temp" value={planet.tempText} />
        <StatRow label="Orbital velocity" value={`${planet.velocityKmS.toFixed(1)} km/s`} />
      </div>

      <div className="mt-5 flex flex-col gap-3.5">
        <Bar
          label="Diameter · log scale"
          valueText={`${planet.earthMult}× Earth`}
          widthPct={pct(planet.diameterKm, 4879, 139820)}
          color={planet.accent}
        />
        <Bar
          label="Distance · AU"
          valueText={`${((planet.au / NEPTUNE_AU) * 100).toFixed(0)}% of Neptune's`}
          widthPct={(planet.au / NEPTUNE_AU) * 100}
          color={planet.accent}
        />
        <Bar
          label="Year length · log scale"
          valueText={planet.periodYears}
          widthPct={pct(planet.periodDays, MERCURY_PERIOD, NEPTUNE_PERIOD)}
          color={planet.accent}
        />
      </div>

      <div className="mt-5">
        <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-faint">Field note</div>
        <p className="text-[13.5px] leading-relaxed text-dim">{planet.note}</p>
      </div>
    </div>
  );
}

function SunDossier() {
  return (
    <div key="sun" className="anim-fadeup">
      <div className="flex items-start gap-4">
        <Sphere colors={SUN.colors} />
        <div>
          <h2 className="font-display text-[26px] font-bold leading-tight tracking-tight">{SUN.name}</h2>
          <span
            className="mt-1.5 inline-block rounded-sm border px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em]"
            style={{ borderColor: "#ffb45455", color: SUN.accent }}
          >
            {SUN.type}
          </span>
        </div>
      </div>
      <div className="mt-4">
        {SUN.stats.map(([l, v]) => (
          <StatRow key={l} label={l} value={v} />
        ))}
      </div>
      <div className="mt-5">
        <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-faint">Field note</div>
        <p className="text-[13.5px] leading-relaxed text-dim">{SUN.note}</p>
      </div>
    </div>
  );
}

export default function InfoPanel({ selectedId, elapsedDays, onSelect }: Props) {
  const planet = useMemo(() => PLANETS.find((p) => p.id === selectedId) ?? null, [selectedId]);

  return (
    <div className="scroll-slim flex h-full flex-col overflow-y-auto">
      <div className="border-b border-line px-5 pb-4 pt-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-icecy">Mission dossier</p>
        <h1 className="mt-1 font-display text-lg font-semibold tracking-tight text-ink">Body index</h1>
      </div>

      <div className="px-5 pt-4">
        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={() => onSelect("sun")}
            aria-pressed={selectedId === "sun"}
            className={`flex items-center gap-1.5 rounded-sm border px-2 py-1.5 font-mono text-[10.5px] uppercase tracking-wide transition active:scale-[0.97] ${
              selectedId === "sun"
                ? "border-solar/70 bg-solar/10 text-solar"
                : "border-line text-dim hover:border-solar/40 hover:text-ink"
            }`}
          >
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: SUN.accent, boxShadow: `0 0 6px ${SUN.accent}` }} />
            Sol
          </button>
          {PLANETS.map((p) => {
            const active = selectedId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelect(p.id)}
                aria-pressed={active}
                className={`flex items-center gap-1.5 rounded-sm border px-2 py-1.5 font-mono text-[10.5px] uppercase tracking-wide transition active:scale-[0.97] ${
                  active
                    ? "bg-space-700/60 text-ink"
                    : "border-line text-dim hover:text-ink"
                }`}
                style={active ? { borderColor: `${p.accent}88` } : undefined}
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: p.colors[1], boxShadow: active ? `0 0 7px ${p.accent}` : "none" }}
                />
                <span className="truncate">{p.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-5 pb-8 pt-5">
        {selectedId === "sun" ? (
          <SunDossier />
        ) : planet ? (
          <PlanetDossier planet={planet} elapsedDays={elapsedDays} />
        ) : (
          <div className="anim-fadeup rounded-md border border-dashed border-line px-4 py-8 text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-faint">No body tracked</p>
            <p className="mt-2 text-[13px] leading-relaxed text-dim">
              Click a planet in the orrery — or pick one from the index above — to open its dossier.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
