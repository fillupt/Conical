import { Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JCC_POWERS, type JccMode } from "@/lib/optics";
import { useWorkbench } from "@/lib/store";
import { cn } from "@/lib/utils";

const MODES: { id: JccMode; label: string }[] = [
  { id: "off", label: "Off" },
  { id: "axis", label: "Axis" },
  { id: "power", label: "Power" },
];

export function JccPanel() {
  const jccMode = useWorkbench((s) => s.jccMode);
  const jccPower = useWorkbench((s) => s.jccPower);
  const setJccMode = useWorkbench((s) => s.setJccMode);
  const setJccPower = useWorkbench((s) => s.setJccPower);
  const flipJcc = useWorkbench((s) => s.flipJcc);

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
        <Button
          variant="primary"
          onClick={flipJcc}
          disabled={jccMode === "off"}
        >
          <Repeat className="size-4" strokeWidth={2} />
          Flip
        </Button>
      </header>

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
    </section>
  );
}
