import { Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  JCC_POWERS,
  type JccMode,
  formatD,
  jccRx,
  padAxis,
  plusMeridian,
} from "@/lib/optics";
import { useWorkbench } from "@/lib/store";
import { cn } from "@/lib/utils";

const MODES: { id: JccMode; label: string }[] = [
  { id: "off", label: "Off" },
  { id: "axis", label: "Axis" },
  { id: "power", label: "Power" },
];

export function JccPanel() {
  const correction = useWorkbench((s) => s.correction);
  const jccMode = useWorkbench((s) => s.jccMode);
  const jccPower = useWorkbench((s) => s.jccPower);
  const jccFlip = useWorkbench((s) => s.jccFlip);
  const setJccMode = useWorkbench((s) => s.setJccMode);
  const setJccPower = useWorkbench((s) => s.setJccPower);
  const flipJcc = useWorkbench((s) => s.flipJcc);

  const plus =
    jccMode === "off"
      ? null
      : plusMeridian(correction.axis, jccMode, jccFlip);
  const minusMer = plus == null ? null : plus + 90;
  const lens = jccRx(correction.axis, jccMode, jccPower, jccFlip);

  return (
    <section className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
      <header className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-serif text-lg tracking-tight">Cross cylinder</h2>
          <p className="mt-1 text-xs text-muted">
            {jccMode === "off"
              ? "JCC is out of the trial frame"
              : jccMode === "axis"
                ? "Handles on the cylinder axis — flip, then chase the red"
                : "Dots on the cylinder axis — red add, white subtract"}
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="min-w-0 flex-1">
          <div
            className="mb-3 grid grid-cols-3 gap-1 rounded-lg bg-bg p-1"
            role="tablist"
            aria-label="JCC mode"
          >
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={jccMode === m.id}
                className={cn(
                  "h-10 rounded-md text-sm font-medium transition-[background-color,color] duration-150 ease-out",
                  jccMode === m.id
                    ? "bg-surface-2 text-fg"
                    : "text-muted hover:text-fg",
                )}
                onClick={() => setJccMode(m.id)}
              >
                {m.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1">
            {JCC_POWERS.map((p) => (
              <Button
                key={p}
                size="sm"
                variant={jccPower === p ? "primary" : "ghost"}
                className="font-mono tabular-nums"
                onClick={() => setJccPower(p)}
                disabled={jccMode === "off"}
              >
                ±{p.toFixed(2)}
              </Button>
            ))}
          </div>
        </div>

        <JccLens
          plus={plus ?? 45}
          flipped={jccFlip === 1}
          inactive={jccMode === "off"}
        />

        <div className="min-w-0 flex-1">
          <Button
            variant="primary"
            className="mb-3 w-full"
            onClick={flipJcc}
            disabled={jccMode === "off"}
          >
            <Repeat className="size-4" strokeWidth={2} />
            Flip
          </Button>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-xs tabular-nums">
            <dt className="text-plus">Plus</dt>
            <dd>{plus == null ? "—" : `${padAxis(plus)}°`}</dd>
            <dt className="text-muted">Minus</dt>
            <dd>{minusMer == null ? "—" : `${padAxis(minusMer)}°`}</dd>
            <dt className="text-subtle">Lens</dt>
            <dd className="truncate text-muted">
              {lens
                ? `${formatD(lens.sphere)} / ${formatD(lens.cylinder)} × ${padAxis(lens.axis)}`
                : "out"}
            </dd>
          </dl>
          {plus != null && jccMode !== "off" ? (
            <p className="mt-2 text-xs text-subtle">
              Other face puts plus at {padAxis((plus ?? 0) + 90)}°.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function JccLens({
  plus,
  flipped,
  inactive,
}: {
  plus: number;
  flipped: boolean;
  inactive: boolean;
}) {
  const rad = (plus * Math.PI) / 180;
  const cx = 56;
  const cy = 56;
  const r = 36;
  const px = cx + r * Math.cos(rad);
  const py = cy - r * Math.sin(rad);
  const px2 = cx - r * Math.cos(rad);
  const py2 = cy + r * Math.sin(rad);
  const mr = rad + Math.PI / 2;
  const mx = cx + r * Math.cos(mr);
  const my = cy - r * Math.sin(mr);
  const mx2 = cx - r * Math.cos(mr);
  const my2 = cy + r * Math.sin(mr);

  return (
    <svg
      viewBox="0 0 112 112"
      className={cn(
        "size-28 shrink-0 transition-[transform,opacity] duration-200 ease-smooth-out",
        flipped && "rotate-180",
        inactive && "opacity-35",
      )}
      aria-hidden="true"
    >
      <circle
        cx={cx}
        cy={cy}
        r="48"
        fill="var(--color-bg)"
        stroke="var(--color-border)"
        strokeWidth="1.5"
      />
      <circle
        cx={cx}
        cy={cy}
        r="40"
        fill="none"
        stroke="var(--color-surface-2)"
        strokeWidth="8"
      />
      <line
        x1={px}
        y1={py}
        x2={px2}
        y2={py2}
        stroke="var(--color-plus)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1={mx}
        y1={my}
        x2={mx2}
        y2={my2}
        stroke="var(--color-minus-mark)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="3 4"
      />
      <circle cx={px} cy={py} r="6" fill="var(--color-plus)" />
      <circle cx={px2} cy={py2} r="6" fill="var(--color-plus)" />
      <circle
        cx={mx}
        cy={my}
        r="6"
        fill="var(--color-minus-mark)"
        stroke="var(--color-border)"
        strokeWidth="1"
      />
      <circle
        cx={mx2}
        cy={my2}
        r="6"
        fill="var(--color-minus-mark)"
        stroke="var(--color-border)"
        strokeWidth="1"
      />
    </svg>
  );
}
