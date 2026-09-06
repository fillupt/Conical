import { Minus, Plus } from "lucide-react";
import { useEffect, useRef, type PointerEvent } from "react";
import { Button } from "@/components/ui/button";
import { formatD, padAxis, type Rx } from "@/lib/optics";
import { cn } from "@/lib/utils";

type StepperProps = {
  label: string;
  value: string;
  onStep: (dir: -1 | 1) => void;
  canDec?: boolean;
  canInc?: boolean;
  negative?: boolean;
  unit?: string;
};

function useHold(fn: () => void, enabled: boolean) {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const timer = useRef<number | null>(null);

  function clear() {
    if (timer.current != null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  }

  function start() {
    if (!enabled) return;
    fnRef.current();
    const loop = (delay: number) => {
      timer.current = window.setTimeout(() => {
        fnRef.current();
        loop(70);
      }, delay);
    };
    loop(320);
  }

  useEffect(() => () => clear(), []);

  return {
    onPointerDown: (e: PointerEvent<HTMLButtonElement>) => {
      if (e.button !== 0) return;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      start();
    },
    onPointerUp: clear,
    onPointerCancel: clear,
    onLostPointerCapture: clear,
  };
}

export function Stepper({
  label,
  value,
  onStep,
  canDec = true,
  canInc = true,
  negative = false,
  unit,
}: StepperProps) {
  const dec = useHold(() => onStep(-1), canDec);
  const inc = useHold(() => onStep(1), canInc);

  return (
    <div className="flex min-w-0 flex-1 flex-col items-stretch">
      <Button
        variant="subtle"
        size="md"
        aria-label={`Increase ${label}`}
        disabled={!canInc}
        className="h-11 w-full px-0 rounded-b-xs"
        {...inc}
      >
        <Plus className="size-4" strokeWidth={2} />
      </Button>
      <div
        className={cn(
          "flex min-h-12 flex-col items-center justify-center bg-bg px-1 py-1",
          "shadow-[var(--shadow-border)]",
        )}
      >
        <span
          className={cn(
            "font-mono text-lg tabular-nums tracking-tight sm:text-xl",
            negative ? "text-plus" : "text-fg",
          )}
        >
          {value}
        </span>
        {unit ? (
          <span className="text-xs font-medium tracking-wide text-subtle uppercase">
            {unit}
          </span>
        ) : null}
      </div>
      <Button
        variant="subtle"
        size="md"
        aria-label={`Decrease ${label}`}
        disabled={!canDec}
        className="h-11 w-full px-0 rounded-t-xs"
        {...dec}
      >
        <Minus className="size-4" strokeWidth={2} />
      </Button>
    </div>
  );
}

export function RxSep({ children }: { children: string }) {
  return (
    <span
      className="self-center font-mono text-lg text-subtle"
      aria-hidden="true"
    >
      {children}
    </span>
  );
}

export function RxText({
  sphere,
  cylinder,
  axis,
  className,
}: Rx & { className?: string }) {
  return (
    <span className={cn("font-mono tabular-nums", className)}>
      <span className={sphere < -0.001 ? "text-plus" : undefined}>
        {formatD(sphere)}
      </span>
      <span className="text-subtle"> DS / </span>
      <span className={cylinder < -0.001 ? "text-plus" : undefined}>
        {formatD(cylinder)}
      </span>
      <span className="text-subtle"> DC × </span>
      {padAxis(axis)}
    </span>
  );
}
