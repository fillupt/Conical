import { ChevronDown } from "lucide-react";
import { useWorkbench } from "@/lib/store";
import { cn } from "@/lib/utils";

export function Guide() {
  const open = useWorkbench((s) => s.showGuide);
  const setOpen = useWorkbench((s) => s.setShowGuide);

  return (
    <section className="rounded-xl bg-surface shadow-[var(--shadow-border)]">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 p-4 text-left"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span className="font-serif text-lg tracking-tight">How to use a JCC</span>
        <ChevronDown
          className={cn(
            "size-5 text-muted transition-transform duration-200 ease-smooth-out",
            open && "rotate-180",
          )}
        />
      </button>
      {open ? (
        <div className="space-y-4 border-t border-border px-4 pb-5 pt-3 text-sm text-muted">
          <p>
            A Jackson cross cylinder is a lens of equal plus and minus power,
            90° apart, with zero spherical equivalent. Flipping it exchanges the
            meridians and asks which blur the patient prefers.
          </p>
          <div>
            <h3 className="mb-1 font-medium text-fg">Axis</h3>
            <p>
              Place the handles on the trial-cylinder axis so the red and white
              dots straddle it at ±45°. Flip. Rotate the cylinder axis toward
              the red (plus) dots of the clearer face — chase the red. Stop when
              both faces look the same.
            </p>
          </div>
          <div>
            <h3 className="mb-1 font-medium text-fg">Power</h3>
            <p>
              Align the dots with the cylinder axis. If the patient prefers red
              on axis, add minus cylinder. Prefer white on axis: take cylinder
              out. Endpoint is equal blur on both flips, with a point focus on
              the retina.
            </p>
          </div>
          <div>
            <h3 className="mb-1 font-medium text-fg">What the plots show</h3>
            <p>
              Residual refraction is patient Rx minus the trial lens minus the
              JCC. The sine wave is power in each meridian. Sturm’s conoid
              places the two focal lines (or a single point) relative to the
              retina. The dashed wave is the other JCC face, so you can see
              which flip leaves less cylinder.
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
