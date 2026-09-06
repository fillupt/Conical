import { useId, useMemo } from "react";
import { type Rx, formatD, padAxis, powerAtMeridian, qty, sturmOf } from "@/lib/optics";

type PatientViewProps = {
  residual: Rx;
};

const DOTS: { x: number; y: number }[] = [
  { x: 0, y: 0 },
  { x: 0, y: -34 },
  { x: 0, y: 34 },
  { x: 30, y: -17 },
  { x: 30, y: 17 },
  { x: -30, y: -17 },
  { x: -30, y: 17 },
];

export function PatientView({ residual }: PatientViewProps) {
  const sturm = sturmOf(residual);
  const k = 14;
  const rAxis = qty(Math.min(28, k * Math.abs(powerAtMeridian(residual, residual.axis + 90))));
  const rPow = qty(Math.min(28, k * Math.abs(powerAtMeridian(residual, residual.axis))));
  const rot = residual.axis;
  const blurId = useId();
  const blur = qty(Math.min(4.5, 0.9 * Math.hypot(rAxis, rPow) * 0.12));

  return (
    <section className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
      <header className="mb-3">
        <h2 className="font-serif text-lg tracking-tight">Retinal image</h2>
        <p className="text-xs text-muted">
          Dot target as the patient sees it. Elongation follows the focal line
          farther from the retina.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        <svg
          viewBox="0 0 200 200"
          className="w-full rounded-lg bg-bg"
          role="img"
          aria-label="Simulated retinal blur of a dot target"
        >
          <defs>
            <filter id={blurId}>
              <feGaussianBlur stdDeviation={blur} />
            </filter>
          </defs>
          {DOTS.map((d, i) => (
            <ellipse
              key={i}
              cx={qty(100 + d.x)}
              cy={qty(100 + d.y)}
              rx={qty(3.2 + rAxis)}
              ry={qty(3.2 + rPow)}
              transform={`rotate(${qty(-rot, 1)} ${qty(100 + d.x)} ${qty(100 + d.y)})`}
              fill="var(--color-fg)"
              fillOpacity="0.92"
              filter={`url(#${blurId})`}
            />
          ))}
        </svg>
        <ClockDial residual={residual} />
      </div>
      <p className="mt-3 font-mono text-xs tabular-nums text-muted">
        blur ellipse {formatD(rAxis / k)} × {formatD(rPow / k)} D · line{" "}
        {padAxis(sturm.anterior.line)}° anterior
      </p>
    </section>
  );
}

function ClockDial({ residual }: { residual: Rx }) {
  const spokes = useMemo(() => {
    return Array.from({ length: 13 }, (_, i) => {
      const line = i * 15;
      const meridian = line + 90;
      const defocus = Math.abs(powerAtMeridian(residual, meridian));
      const sharp = Math.max(0.12, 1 - defocus / 2.2);
      return { line, defocus, sharp };
    });
  }, [residual]);

  return (
    <svg
      viewBox="0 0 200 200"
      className="w-full rounded-lg bg-bg"
      role="img"
      aria-label="Astigmatic fan chart"
    >
      <text
        x="100"
        y="18"
        textAnchor="middle"
        fontSize="10"
        fill="var(--color-subtle)"
        fontFamily="var(--font-sans)"
      >
        Fan chart
      </text>
      {spokes.map((s) => {
        const rad = (s.line * Math.PI) / 180;
        const x2 = 100 + 78 * Math.cos(rad);
        const y2 = 100 - 78 * Math.sin(rad);
        const x1 = 100 + 10 * Math.cos(rad);
        const y1 = 100 - 10 * Math.sin(rad);
        return (
          <line
            key={s.line}
            x1={qty(x1)}
            y1={qty(y1)}
            x2={qty(x2)}
            y2={qty(y2)}
            stroke="var(--color-fg)"
            strokeWidth={qty(1.2 + 2.4 * s.sharp)}
            strokeOpacity={qty(0.25 + 0.75 * s.sharp)}
            strokeLinecap="round"
          />
        );
      })}
      {[180, 0, 30, 60, 90, 120, 150].map((d) => {
        const rad = (d * Math.PI) / 180;
        return (
          <text
            key={d}
            x={qty(100 + 90 * Math.cos(rad))}
            y={qty(100 - 90 * Math.sin(rad) + 3)}
            textAnchor="middle"
            fontSize="8"
            fontFamily="var(--font-mono)"
            fill="var(--color-subtle)"
          >
            {d === 0 ? 180 : d}
          </text>
        );
      })}
    </svg>
  );
}
