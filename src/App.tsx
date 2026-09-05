import { useCallback, useEffect, useState } from "react";
import SolarSystemCanvas from "./components/SolarSystemCanvas";
import ControlBar, { SPEEDS } from "./components/ControlBar";
import InfoPanel from "./components/InfoPanel";
import { PLANETS } from "./data/bodies";

function Toggle({
  label,
  on,
  onClick,
  title,
}: {
  label: string;
  on: boolean;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      title={title}
      className={`pointer-events-auto flex items-center gap-2 rounded-sm border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] transition active:scale-95 ${
        on ? "border-line bg-space-900/85 text-ink" : "border-line-soft bg-space-900/60 text-faint hover:text-dim"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${on ? "led bg-icecy text-icecy" : "bg-faint"}`}
        style={on ? { color: "#6fd9e8" } : undefined}
      />
      {label}
    </button>
  );
}

export default function App() {
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(5);
  const [showOrbits, setShowOrbits] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>("earth");
  const [elapsedDays, setElapsedDays] = useState(0);
  const [resetToken, setResetToken] = useState(0);

  const handleSelect = useCallback((id: string | null) => setSelectedId(id), []);
  const handleTick = useCallback((days: number) => setElapsedDays(days), []);
  const togglePlay = useCallback(() => setPlaying((p) => !p), []);
  const handleReset = useCallback(() => {
    setResetToken((t) => t + 1);
    setElapsedDays(0);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName ?? "";
      if (e.key === " ") {
        if (tag === "BUTTON" || tag === "INPUT" || tag === "TEXTAREA") return;
        e.preventDefault();
        setPlaying((p) => !p);
        return;
      }
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      switch (e.key) {
        case "[":
          setSpeed((s) => SPEEDS[Math.max(0, SPEEDS.indexOf(s) - 1)]);
          break;
        case "]":
          setSpeed((s) => SPEEDS[Math.min(SPEEDS.length - 1, SPEEDS.indexOf(s) + 1)]);
          break;
        case "o":
        case "O":
          setShowOrbits((v) => !v);
          break;
        case "l":
        case "L":
          setShowLabels((v) => !v);
          break;
        case "r":
        case "R":
          setResetToken((t) => t + 1);
          setElapsedDays(0);
          break;
        default: {
          const n = parseInt(e.key, 10);
          if (n >= 1 && n <= 8) setSelectedId(PLANETS[n - 1].id);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex h-dvh min-h-[560px] flex-col overflow-hidden bg-space-950 font-display text-ink lg:flex-row">
      {/* ------- orrery viewport ------- */}
      <main className="relative h-[54dvh] shrink-0 lg:h-auto lg:min-h-0 lg:flex-1">
        <SolarSystemCanvas
          playing={playing}
          speed={speed}
          showOrbits={showOrbits}
          showLabels={showLabels}
          selectedId={selectedId}
          resetToken={resetToken}
          onSelect={handleSelect}
          onTick={handleTick}
        />

        {/* title block */}
        <header className="pointer-events-none absolute left-5 top-5 select-none sm:left-6 sm:top-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-icecy">
            Live orrery · 8 planets
          </p>
          <h1 className="mt-1 font-display text-[28px] font-bold leading-none tracking-tight sm:text-[34px]">
            Solar System
          </h1>
          <p className="mt-2 hidden font-mono text-[10.5px] text-dim sm:block">
            orbits √-compressed · bodies enlarged · click any world
          </p>
        </header>

        {/* layer toggles + status */}
        <div className="absolute right-4 top-4 flex flex-col items-end gap-2 sm:right-6 sm:top-6">
          <div className="pointer-events-auto flex items-center gap-1.5 rounded-sm border border-line bg-space-900/85 px-2.5 py-1.5">
            <span
              className={`h-1.5 w-1.5 rounded-full ${playing ? "led bg-solar" : "bg-faint"}`}
              style={playing ? { color: "#ffb454" } : undefined}
            />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
              {playing ? "Sim running" : "Paused"}
            </span>
          </div>
          <div className="flex gap-2">
            <Toggle label="Orbits" on={showOrbits} onClick={() => setShowOrbits((v) => !v)} title="Toggle orbit paths (O)" />
            <Toggle label="Labels" on={showLabels} onClick={() => setShowLabels((v) => !v)} title="Toggle name labels (L)" />
          </div>
        </div>

        {/* transport bar */}
        <div className="pointer-events-none absolute inset-x-3 bottom-3 flex justify-center sm:inset-x-4 sm:bottom-4 sm:justify-start">
          <ControlBar
            playing={playing}
            speed={speed}
            elapsedDays={elapsedDays}
            onTogglePlay={togglePlay}
            onSpeed={setSpeed}
            onReset={handleReset}
          />
        </div>

        {/* shortcut hint */}
        <div className="pointer-events-none absolute bottom-4 right-6 hidden select-none font-mono text-[10px] tracking-[0.14em] text-faint lg:block">
          SPACE play/pause · [ ] speed · 1–8 select · R reset
        </div>
      </main>

      {/* ------- dossier panel ------- */}
      <aside className="relative min-h-0 flex-1 border-t border-line bg-space-900 lg:w-[380px] lg:flex-none lg:border-l lg:border-t-0">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-24"
          style={{ background: "radial-gradient(80% 100% at 50% 0%, rgba(111,217,232,0.06), transparent 70%)" }}
        />
        <InfoPanel selectedId={selectedId} elapsedDays={elapsedDays} onSelect={handleSelect} />
      </aside>
    </div>
  );
}
