import { Guide } from "@/components/guide";
import { JccPanel } from "@/components/jcc-panel";
import { PatientView } from "@/components/patient-view";
import { PowerWave } from "@/components/power-wave";
import { RxPanel } from "@/components/rx-panel";
import { RxText } from "@/components/stepper";
import { SturmDiagram } from "@/components/sturm-diagram";
import { Button } from "@/components/ui/button";
import {
  classifyResidual,
  cylRule,
  formatD,
  jccRx,
  residualRx,
  sphericalEquivalent,
} from "@/lib/optics";
import { PRESETS, useWorkbench } from "@/lib/store";
import { cn } from "@/lib/utils";

export function Workbench() {
  const patient = useWorkbench((s) => s.patient);
  const correction = useWorkbench((s) => s.correction);
  const jccMode = useWorkbench((s) => s.jccMode);
  const jccPower = useWorkbench((s) => s.jccPower);
  const jccFlip = useWorkbench((s) => s.jccFlip);
  const activePreset = useWorkbench((s) => s.activePreset);
  const applyPreset = useWorkbench((s) => s.applyPreset);

  const jcc = jccRx(correction.axis, jccMode, jccPower, jccFlip);
  const residual = residualRx(patient, correction, jcc);
  const alt =
    jccMode === "off"
      ? null
      : residualRx(
          patient,
          correction,
          jccRx(correction.axis, jccMode, jccPower, jccFlip === 0 ? 1 : 0),
        );
  const rule = cylRule(residual);
  const kind = classifyResidual(residual);
  const se = sphericalEquivalent(residual);

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="sticky top-0 z-20 border-b border-border bg-bg/95">
        <div className="mx-auto flex max-w-7xl items-end justify-between gap-4 px-4 py-3 sm:px-6">
          <div>
            <p className="text-xs font-medium tracking-widest text-accent uppercase">
              Jackson cross cylinder
            </p>
            <h1 className="font-serif text-3xl tracking-tight sm:text-4xl">
              Conoid
            </h1>
          </div>
          <p className="min-w-0 text-right text-sm sm:text-base">
            <span className="mr-2 text-xs tracking-wide text-subtle uppercase">
              Residual
            </span>
            <RxText {...residual} />
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6">
        <p className="mb-4 hidden max-w-2xl text-sm text-muted sm:block">
          Set the script first, then scroll to the cross cylinder. Flip it while
          watching the conoid and the sine wave.
        </p>

        <section className="mb-4 grid gap-4 lg:grid-cols-3">
          <RxPanel which="patient" />
          <RxPanel which="correction" />
          <section className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
            <header className="mb-4">
              <h2 className="font-serif text-lg tracking-tight">Residual</h2>
              <p className="mt-1 text-xs text-subtle">
                Patient minus trial lens minus JCC
              </p>
            </header>
            <p className="text-xl tracking-tight sm:text-2xl">
              <RxText {...residual} />
            </p>
            <p className="mt-2 text-sm text-accent">{kind}</p>
            <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
              <div>
                <dt className="text-subtle">Spherical equivalent</dt>
                <dd
                  className={cn(
                    "font-mono tabular-nums",
                    se < -0.001 && "text-plus",
                  )}
                >
                  {formatD(se)} D
                </dd>
              </div>
              <div>
                <dt className="text-subtle">Rule</dt>
                <dd className="font-mono tabular-nums">{rule ?? "—"}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-subtle">Patient</dt>
                <dd>
                  <RxText {...patient} />
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-subtle">Trial lens</dt>
                <dd>
                  <RxText {...correction} />
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-subtle">JCC</dt>
                <dd>
                  {jcc ? <RxText {...jcc} /> : "out"}
                </dd>
              </div>
            </dl>
          </section>
        </section>

        <div className="sticky top-[3.75rem] z-10 mb-4 bg-bg/95 py-1 sm:top-[4.25rem]">
          <JccPanel />
        </div>

        <div className="mb-4 flex flex-col gap-4">
          <SturmDiagram residual={residual} />
          <PowerWave
            residual={residual}
            alt={alt}
            trialAxis={correction.axis}
          />
          <PatientView residual={residual} />
        </div>

        <section className="mb-4 rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
          <h2 className="mb-3 font-serif text-lg tracking-tight">Cases</h2>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <Button
                key={p.id}
                size="sm"
                variant={activePreset === p.id ? "primary" : "ghost"}
                onClick={() => applyPreset(p.id)}
                title={p.hint}
              >
                {p.name}
              </Button>
            ))}
          </div>
        </section>
        <Guide />
      </div>
    </div>
  );
}
