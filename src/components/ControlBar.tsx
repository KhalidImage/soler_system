import { BASE_DAYS_PER_SECOND } from "./SolarSystemCanvas";
import { EARTH_YEAR_DAYS } from "../data/bodies";

export const SPEEDS = [1, 5, 10, 25, 50];

interface Props {
  playing: boolean;
  speed: number;
  elapsedDays: number;
  onTogglePlay: () => void;
  onSpeed: (s: number) => void;
  onReset: () => void;
}

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M4.5 2.8a.7.7 0 0 1 1.06-.6l8.2 5.2a.7.7 0 0 1 0 1.2l-8.2 5.2a.7.7 0 0 1-1.06-.6V2.8Z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <rect x="3.4" y="2.6" width="3.4" height="10.8" rx="0.8" />
      <rect x="9.2" y="2.6" width="3.4" height="10.8" rx="0.8" />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
      <path d="M2.8 6.5A5.6 5.6 0 1 1 2.4 9.4" />
      <path d="M2.6 2.8v3.8h3.8" />
    </svg>
  );
}

function formatElapsed(days: number): { y: string; d: string } {
  const y = Math.floor(days / EARTH_YEAR_DAYS);
  const d = Math.floor(days % EARTH_YEAR_DAYS);
  return { y: String(y).padStart(2, "0"), d: String(d).padStart(3, "0") };
}

export default function ControlBar({ playing, speed, elapsedDays, onTogglePlay, onSpeed, onReset }: Props) {
  const { y, d } = formatElapsed(elapsedDays);
  const rate = BASE_DAYS_PER_SECOND * speed;

  return (
    <div className="pointer-events-auto flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md border border-line bg-space-900/90 px-3.5 py-2.5 shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-sm">
      {/* transport */}
      <div className="flex items-center gap-2">
        <button
          onClick={onTogglePlay}
          aria-label={playing ? "Pause simulation" : "Play simulation"}
          className="grid h-9 w-9 place-items-center rounded-sm bg-solar text-space-950 transition hover:bg-[#ffc677] active:scale-95"
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button
          onClick={onReset}
          aria-label="Reset simulation time"
          title="Reset time (R)"
          className="grid h-9 w-9 place-items-center rounded-sm border border-line text-dim transition hover:border-solar/50 hover:text-solar active:scale-95"
        >
          <ResetIcon />
        </button>
      </div>

      <span className="hidden h-6 w-px bg-line sm:block" />

      {/* speed */}
      <div className="flex items-center gap-1.5">
        <span className="mr-1 font-mono text-[10px] tracking-[0.2em] text-faint">SPEED</span>
        {SPEEDS.map((s) => (
          <button
            key={s}
            onClick={() => onSpeed(s)}
            aria-pressed={speed === s}
            className={`rounded-sm border px-2 py-1 font-mono text-[11px] leading-none transition active:scale-95 ${
              speed === s
                ? "border-solar/70 bg-solar/15 text-solar"
                : "border-line text-dim hover:border-solar/40 hover:text-ink"
            }`}
          >
            {s}×
          </button>
        ))}
      </div>

      <span className="hidden h-6 w-px bg-line md:block" />

      {/* clock */}
      <div className="flex items-baseline gap-2 font-mono">
        <span className="text-[10px] tracking-[0.2em] text-faint">T+</span>
        <span className="text-[13px] font-medium tabular-nums text-ink">
          {y}
          <span className="text-faint">y</span> {d}
          <span className="text-faint">d</span>
        </span>
        <span className="hidden text-[10px] tabular-nums text-faint sm:inline">≈ {rate.toLocaleString()} d/s</span>
      </div>
    </div>
  );
}
