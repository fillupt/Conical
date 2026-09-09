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
  plusMeridian,
} from "@/lib/optics";
import { useWorkbench } from "@/lib/store";
import { cn } from "@/lib/utils";

type Which = "patient" | "correction";

export function RxPanel({ which }: { which: Which }) {
  const rx = useWorkbench((s) => s[which]);
  const setSphere = useWorkbench((s) => s.setSphere);
  const setCylinder = useWorkbench((s) => s.setCylinder);
  const setAxis = useWorkbench((s) => s.setAxis);
  const matchPatient = useWorkbench((s) => s.matchPatient);
  const zeroCorrection = useWorkbench((s) => s.zeroCorrection);
  const jccMode = useWorkbench((s) => s.jccMode);
  const jccFlip = useWorkbench((s) => s.jccFlip);

  const cylUnused = Math.abs(rx.cylinder) < 0.01;
  const isCorrection = which === "correction";
  const jccOverlay =
    isCorrection && jccMode !== "off"
      ? { plus: plusMeridian(rx.axis, jccMode, jccFlip) }
      : null;

  return (
    <section className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
      <header className="mb-3 flex items-center justify-between gap-2">
        <h2 className="font-serif text-lg tracking-tight">
          {which === "patient" ? "Patient refractive error" : "Current lenses"}
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
        ) : null}
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
      </p>

      <div className={cn("mt-3", cylUnused && "opacity-70")}>
        <AxisDial
          axis={rx.axis}
          onChange={(a) => setAxis(which, a)}
          disabled={false}
          jcc={jccOverlay}
        />
      </div>
      {jccOverlay ? (
        <p className="mt-2 flex items-center justify-center gap-3 text-xs text-subtle">
          <span className="flex items-center gap-1">
            <span className="inline-block size-2 rounded-full bg-plus" />
            plus {padAxis(jccOverlay.plus)}°
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block size-2 rounded-full border border-border bg-[var(--color-minus-mark)]" />
            minus {padAxis(jccOverlay.plus + 90)}°
          </span>
        </p>
      ) : null}
    </section>
  );
}
