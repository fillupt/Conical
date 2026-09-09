import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Guide } from "@/components/guide";
import { JccPanel } from "@/components/jcc-panel";
import { PatientView } from "@/components/patient-view";
import { PowerWave } from "@/components/power-wave";
import { RxPanel } from "@/components/rx-panel";
import { RxText } from "@/components/stepper";
import { SturmDiagram } from "@/components/sturm-diagram";
import { Button } from "@/components/ui/button";
import { jccRx, residualRx } from "@/lib/optics";
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
  const [showPatientView, setShowPatientView] = useState(false);

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

        <section className="mb-4 grid gap-4 lg:grid-cols-2">
          <RxPanel which="patient" />
          <RxPanel which="correction" />
        </section>

        <div className="sticky top-[3.75rem] z-10 mb-4 bg-bg/95 py-1 sm:top-[4.25rem]">
          <JccPanel />
        </div>

        <div className="mb-4 grid gap-4 xl:grid-cols-2">
          <SturmDiagram residual={residual} />
          <PowerWave
            residual={residual}
            alt={alt}
            trialAxis={correction.axis}
          />
        </div>

        <section className="mb-4 rounded-xl bg-surface shadow-[var(--shadow-border)]">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-3 p-4 text-left"
            aria-expanded={showPatientView}
            onClick={() => setShowPatientView(!showPatientView)}
          >
            <span className="font-serif text-lg tracking-tight">
              Show patient view
            </span>
            <ChevronDown
              className={cn(
                "size-5 text-muted transition-transform duration-200 ease-smooth-out",
                showPatientView && "rotate-180",
              )}
            />
          </button>
          {showPatientView ? (
            <div className="border-t border-border p-4 pt-3">
              <PatientView residual={residual} />
            </div>
          ) : null}
        </section>

        <Guide />
      </div>
    </div>
  );
}
