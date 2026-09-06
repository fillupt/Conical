import { AxisDial } from "@/components/axis-dial";
import { RxSep, RxText, Stepper } from "@/components/stepper";
import { Button } from "@/components/ui/button";
import {
  CYL_MAX,
  CYL_MIN,
  SPHERE_MAX,
  SPHERE_MIN,
  formatD,
  padAxis,
} from "@/lib/optics";
import { useWorkbench } from "@/lib/store";
import { cn } from "@/lib/utils";

type Which = "patient" | "correction";

export function RxPanel({ which }: { which: Which }) {
  const rx = useWorkbench((s) => s[which]);
  const setSphere = useWorkbench((s) => s.setSphere);
  const setCylinder = useWorkbench((s) => s.setCylinder);
  const setAxis = useWorkbench((s) => s.setAxis);
  const holdSe = useWorkbench((s) => s.holdSe);
  const setHoldSe = useWorkbench((s) => s.setHoldSe);
  const matchPatient = useWorkbench((s) => s.matchPatient);
  const zeroCorrection = useWorkbench((s) => s.zeroCorrection);

  const cylUnused = Math.abs(rx.cylinder) < 0.01;
  const isCorrection = which === "correction";

  return (
    <section className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
      <header className="mb-3 flex items-center justify-between gap-2">
        <h2 className="font-serif text-lg tracking-tight">
          {which === "patient" ? "Patient" : "Correction"}
        </h2>
        {isCorrection ? (
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={zeroCorrection}>
              Plano
            </Button>
            <Button size="sm" variant="ghost" onClick={matchPatient}>
              Match patient
            </Button>
          </div>
        ) : (
          <span className="text-xs text-subtle">True refractive error</span>
        )}
      </header>

      <div className="flex items-stretch gap-1 sm:gap-2">
        <Stepper
          label="Sphere"
          value={formatD(rx.sphere)}
          unit="DS"
          negative={rx.sphere < -0.001}
          onStep={(d) => setSphere(which, rx.sphere + d * 0.25)}
          canDec={rx.sphere > SPHERE_MIN}
          canInc={rx.sphere < SPHERE_MAX}
        />
        <RxSep>/</RxSep>
        <Stepper
          label="Cylinder"
          value={formatD(rx.cylinder)}
          unit="DC"
          negative={rx.cylinder < -0.001}
          onStep={(d) => setCylinder(which, rx.cylinder + d * 0.25)}
          canDec={rx.cylinder > CYL_MIN}
          canInc={rx.cylinder < CYL_MAX}
        />
        <RxSep>×</RxSep>
        <Stepper
          label="Axis"
          value={padAxis(rx.axis)}
          unit="°"
          onStep={(d) => setAxis(which, rx.axis + d)}
        />
      </div>
      <p className="mt-2 text-center text-xs text-muted">
        <RxText {...rx} />
        {isCorrection && holdSe ? (
          <span className="text-subtle"> · SE held</span>
        ) : null}
      </p>

      {isCorrection ? (
        <label className="mt-3 flex items-center gap-2 text-xs text-muted">
          <input
            type="checkbox"
            className="size-4 accent-accent"
            checked={holdSe}
            onChange={(e) => setHoldSe(e.target.checked)}
          />
          Hold spherical equivalent when cylinder changes
        </label>
      ) : null}

      <div className={cn("mt-3", cylUnused && "opacity-70")}>
        <AxisDial
          axis={rx.axis}
          onChange={(a) => setAxis(which, a)}
          disabled={false}
        />
        <div className="mt-1 flex justify-center gap-1">
          {([-5, -1, 1, 5] as const).map((d) => (
            <Button
              key={d}
              size="sm"
              variant="ghost"
              className="min-w-11 font-mono tabular-nums"
              onClick={() => setAxis(which, rx.axis + d)}
            >
              {d > 0 ? `+${d}` : d}°
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}
