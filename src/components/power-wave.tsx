import { useMemo, useState, type PointerEvent } from "react";
import {
  type Rx,
  formatD,
  padAxis,
  powerAtMeridian,
  qty,
  sphericalEquivalent,
} from "@/lib/optics";

type PowerWaveProps = {
  residual: Rx;
  alt?: Rx | null;
  trialAxis: number;
};

const W = 700;
const H = 280;
const PAD = { l: 52, r: 18, t: 22, b: 36 };
const innerW = W - PAD.l - PAD.r;
const innerH = H - PAD.t - PAD.b;

export function PowerWave({ residual, alt, trialAxis }: PowerWaveProps) {
  const [hover, setHover] = useState<number | null>(null);

  const { ymax, path, altPath, zeroY, seY } = useMemo(() => {
    let maxAbs = 1;
    for (let i = 0; i <= 180; i++) {
      const p = powerAtMeridian(residual, i);
      maxAbs = Math.max(maxAbs, Math.abs(p));
      if (alt) maxAbs = Math.max(maxAbs, Math.abs(powerAtMeridian(alt, i)));
    }
    const ymax = Math.max(1, Math.ceil(maxAbs * 2) / 2);
    const xOf = (deg: number) => qty(PAD.l + (deg / 180) * innerW);
    const yOf = (d: number) => qty(PAD.t + ((ymax - d) / (2 * ymax)) * innerH);
    const toPath = (rx: Rx) => {
      let d = "";
      for (let i = 0; i <= 180; i++) {
        const x = xOf(i);
        const y = yOf(powerAtMeridian(rx, i));
        d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
      }
      return d;
    };
    const se = sphericalEquivalent(residual);
    return {
      ymax,
      path: toPath(residual),
      altPath: alt ? toPath(alt) : null,
      zeroY: yOf(0),
      seY: yOf(se),
      xOf,
      yOf,
    };
  }, [residual, alt]);

  const xOf = (deg: number) => qty(PAD.l + (deg / 180) * innerW);
  const yOf = (d: number) => qty(PAD.t + ((ymax - d) / (2 * ymax)) * innerH);

  const ticks = [];
  for (let d = -ymax; d <= ymax + 1e-6; d += ymax >= 2 ? 1 : 0.5) {
    ticks.push(d);
  }

  const hoverX = hover == null ? null : xOf(hover);
  const hoverP = hover == null ? null : powerAtMeridian(residual, hover);

  function pointerMeridian(e: PointerEvent<SVGSVGElement>) {
    const svg = e.currentTarget;
    const r = svg.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W;
    const deg = ((x - PAD.l) / innerW) * 180;
    if (deg < 0 || deg > 180) return null;
    return Math.round(deg);
  }

  const fillBelow = areaPath(residual, 0, ymax, true);
  const fillAbove = areaPath(residual, 0, ymax, false);

  return (
    <section className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
      <header className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-serif text-lg tracking-tight">Residual power</h2>
          <p className="text-xs text-muted">
            P(θ) = S + C sin²(θ − α) — one cycle of the double-angle sine wave
          </p>
        </div>
        <p className="font-mono text-xs tabular-nums text-subtle">
          SE {formatD(sphericalEquivalent(residual))} D · amp{" "}
          {formatD(Math.abs(residual.cylinder) / 2)} D
        </p>
      </header>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full touch-none"
        role="img"
        aria-label="Residual refractive power against meridian"
        onPointerMove={(e) => setHover(pointerMeridian(e))}
        onPointerLeave={() => setHover(null)}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={PAD.l}
              x2={W - PAD.r}
              y1={yOf(t)}
              y2={yOf(t)}
              stroke="var(--color-border)"
              strokeWidth="1"
              strokeDasharray={t === 0 ? undefined : "2 4"}
            />
            <text
              x={PAD.l - 8}
              y={yOf(t) + 3}
              textAnchor="end"
              fontSize="10"
              fontFamily="var(--font-mono)"
              fill="var(--color-subtle)"
            >
              {formatD(t)}
            </text>
          </g>
        ))}
        <line
          x1={PAD.l}
          x2={W - PAD.r}
          y1={zeroY}
          y2={zeroY}
          stroke="var(--color-fg)"
          strokeOpacity="0.35"
          strokeWidth="1.25"
        />
        <text
          x={W - PAD.r}
          y={zeroY - 6}
          textAnchor="end"
          fontSize="10"
          fill="var(--color-muted)"
          fontFamily="var(--font-sans)"
        >
          retina
        </text>
        {Math.abs(sphericalEquivalent(residual)) > 0.02 ? (
          <line
            x1={PAD.l}
            x2={W - PAD.r}
            y1={seY}
            y2={seY}
            stroke="var(--color-accent)"
            strokeWidth="1"
            strokeDasharray="5 4"
            strokeOpacity="0.7"
          />
        ) : null}
        <path d={fillBelow} fill="var(--color-myopic)" fillOpacity="0.12" />
        <path d={fillAbove} fill="var(--color-hyperopic)" fillOpacity="0.12" />
        {altPath ? (
          <path
            d={altPath}
            fill="none"
            stroke="var(--color-muted)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.7"
          />
        ) : null}
        <path
          d={path}
          fill="none"
          stroke="var(--color-fg)"
          strokeWidth="2.25"
          strokeLinejoin="round"
        />
        <MeridianMarker
          x={xOf(residual.axis)}
          y1={PAD.t}
          y2={PAD.t + innerH}
          label={`${padAxis(residual.axis)}`}
          color="var(--color-accent)"
        />
        <MeridianMarker
          x={xOf(residual.axis >= 90 ? residual.axis - 90 : residual.axis + 90)}
          y1={PAD.t}
          y2={PAD.t + innerH}
          label={`${padAxis(residual.axis + 90)}`}
          color="var(--color-plus)"
        />
        <MeridianMarker
          x={xOf(trialAxis)}
          y1={PAD.t}
          y2={PAD.t + innerH}
          label="trial"
          color="var(--color-subtle)"
          dashed
        />
        {[0, 45, 90, 135, 180].map((d) => (
          <text
            key={d}
            x={xOf(d)}
            y={H - 10}
            textAnchor="middle"
            fontSize="10"
            fontFamily="var(--font-mono)"
            fill="var(--color-subtle)"
          >
            {d}°
          </text>
        ))}
        {hover != null && hoverX != null && hoverP != null ? (
          <g>
            <line
              x1={hoverX}
              x2={hoverX}
              y1={PAD.t}
              y2={PAD.t + innerH}
              stroke="var(--color-fg)"
              strokeOpacity="0.4"
            />
            <circle
              cx={hoverX}
              cy={yOf(hoverP)}
              r="4"
              fill="var(--color-accent)"
            />
            <text
              x={hoverX > W / 2 ? hoverX - 8 : hoverX + 8}
              y={yOf(hoverP) - 10}
              textAnchor={hoverX > W / 2 ? "end" : "start"}
              fontSize="11"
              fontFamily="var(--font-mono)"
              fill="var(--color-fg)"
            >
              {padAxis(hover)}° {formatD(hoverP)} D
            </text>
          </g>
        ) : null}
      </svg>
      <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted">
        <Legend swatch="var(--color-fg)" label="This face" />
        {alt ? <Legend swatch="var(--color-muted)" dashed label="Other flip" /> : null}
        <Legend swatch="var(--color-myopic)" label="Myopic (in front)" />
        <Legend swatch="var(--color-hyperopic)" label="Hyperopic (behind)" />
      </div>
    </section>
  );
}

function areaPath(rx: Rx, _zero: number, ymax: number, belowZero: boolean) {
  const xOf = (deg: number) => qty(PAD.l + (deg / 180) * innerW);
  const yOf = (d: number) => qty(PAD.t + ((ymax - d) / (2 * ymax)) * innerH);
  const zeroY = yOf(0);
  const pts: string[] = [];
  pts.push(`M ${xOf(0)} ${zeroY}`);
  for (let i = 0; i <= 180; i++) {
    const p = powerAtMeridian(rx, i);
    const clipped = belowZero ? Math.min(0, p) : Math.max(0, p);
    pts.push(`L ${xOf(i)} ${yOf(clipped)}`);
  }
  pts.push(`L ${xOf(180)} ${zeroY} Z`);
  return pts.join(" ");
}

function MeridianMarker({
  x,
  y1,
  y2,
  label,
  color,
  dashed,
}: {
  x: number;
  y1: number;
  y2: number;
  label: string;
  color: string;
  dashed?: boolean;
}) {
  return (
    <g>
      <line
        x1={x}
        x2={x}
        y1={y1}
        y2={y2}
        stroke={color}
        strokeWidth="1"
        strokeDasharray={dashed ? "2 3" : "2 5"}
        strokeOpacity="0.7"
      />
      <text
        x={x + 4}
        y={y1 + 11}
        fontSize="9"
        fontFamily="var(--font-mono)"
        fill={color}
      >
        {label}
      </text>
    </g>
  );
}

function Legend({
  swatch,
  label,
  dashed,
}: {
  swatch: string;
  label: string;
  dashed?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="inline-block h-px w-5"
        style={{
          borderTop: `2px ${dashed ? "dashed" : "solid"} ${swatch}`,
        }}
      />
      {label}
    </span>
  );
}
