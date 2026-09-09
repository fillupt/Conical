import { useCallback, useRef, type PointerEvent as ReactPointerEvent } from "react";
import { normalizeAxis, padAxis, snapAxis } from "@/lib/optics";
import { cn } from "@/lib/utils";

type AxisDialProps = {
  axis: number;
  onChange: (axis: number) => void;
  disabled?: boolean;
  jcc?: { plus: number } | null;
};

function eventToAxis(el: SVGSVGElement, clientX: number, clientY: number) {
  const r = el.getBoundingClientRect();
  const x = clientX - r.left - r.width / 2;
  const y = clientY - r.top - r.height / 2;
  // Optometry: 0/180 at 3 o'clock, increasing counter-clockwise
  const deg = (Math.atan2(-y, x) * 180) / Math.PI;
  return snapAxis(deg);
}

export function AxisDial({ axis, onChange, disabled, jcc }: AxisDialProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);

  const update = useCallback(
    (e: ReactPointerEvent) => {
      const svg = svgRef.current;
      if (!svg || disabled) return;
      onChange(eventToAxis(svg, e.clientX, e.clientY));
    },
    [disabled, onChange],
  );

  function onPointerDown(e: ReactPointerEvent<SVGSVGElement>) {
    if (disabled || e.button !== 0) return;
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    update(e);
  }

  function onPointerMove(e: ReactPointerEvent<SVGSVGElement>) {
    if (!dragging.current) return;
    update(e);
  }

  function onPointerUp() {
    dragging.current = false;
  }

  const a = normalizeAxis(axis);
  const rad = (a * Math.PI) / 180;
  const cx = 80;
  const cy = 80;
  const r = 58;
  const x1 = cx + r * Math.cos(rad);
  const y1 = cy - r * Math.sin(rad);
  const x2 = cx - r * Math.cos(rad);
  const y2 = cy + r * Math.sin(rad);

  let jccLines: {
    px: number;
    py: number;
    px2: number;
    py2: number;
    mx: number;
    my: number;
    mx2: number;
    my2: number;
  } | null = null;
  if (jcc) {
    const jr = 44;
    const prad = (jcc.plus * Math.PI) / 180;
    const px = cx + jr * Math.cos(prad);
    const py = cy - jr * Math.sin(prad);
    const px2 = cx - jr * Math.cos(prad);
    const py2 = cy + jr * Math.sin(prad);
    const mrad = prad + Math.PI / 2;
    const mx = cx + jr * Math.cos(mrad);
    const my = cy - jr * Math.sin(mrad);
    const mx2 = cx - jr * Math.cos(mrad);
    const my2 = cy + jr * Math.sin(mrad);
    jccLines = { px, py, px2, py2, mx, my, mx2, my2 };
  }

  const ticks = [];
  for (let d = 0; d < 180; d += 10) {
    const t = (d * Math.PI) / 180;
    const major = d % 30 === 0;
    const r1 = major ? 66 : 62;
    const r2 = 70;
    ticks.push(
      <line
        key={d}
        x1={cx + r1 * Math.cos(t)}
        y1={cy - r1 * Math.sin(t)}
        x2={cx + r2 * Math.cos(t)}
        y2={cy - r2 * Math.sin(t)}
        stroke="currentColor"
        strokeWidth={major ? 1.5 : 1}
        className={major ? "text-muted" : "text-border"}
      />,
    );
  }

  return (
    <div className={cn("flex flex-col items-center gap-2", disabled && "opacity-40")}>
      <svg
        ref={svgRef}
        viewBox="0 0 160 160"
        className={cn(
          "size-32 touch-none select-none text-fg sm:size-36",
          disabled ? "pointer-events-none" : "cursor-crosshair",
        )}
        role="slider"
        aria-label="Cylinder axis"
        aria-valuemin={1}
        aria-valuemax={180}
        aria-valuenow={snapAxis(axis)}
        aria-disabled={disabled}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <circle
          cx={cx}
          cy={cy}
          r={70}
          fill="var(--color-bg)"
          stroke="var(--color-border)"
          strokeWidth="1"
        />
        {ticks}
        <text
          x={cx + 46}
          y={cy + 3}
          textAnchor="middle"
          className="fill-subtle"
          fontSize="8"
          fontFamily="var(--font-mono)"
        >
          180
        </text>
        <text
          x={cx}
          y={cy - 42}
          textAnchor="middle"
          className="fill-subtle"
          fontSize="8"
          fontFamily="var(--font-mono)"
        >
          090
        </text>
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="var(--color-accent)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx={x1} cy={y1} r="4.5" fill="var(--color-accent)" />
        <circle cx={x2} cy={y2} r="4.5" fill="var(--color-accent)" />
        {jccLines ? (
          <g>
            <line
              x1={jccLines.mx}
              y1={jccLines.my}
              x2={jccLines.mx2}
              y2={jccLines.my2}
              stroke="var(--color-minus-mark)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="3 4"
            />
            <line
              x1={jccLines.px}
              y1={jccLines.py}
              x2={jccLines.px2}
              y2={jccLines.py2}
              stroke="var(--color-plus)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx={jccLines.mx} cy={jccLines.my} r="5" fill="var(--color-minus-mark)" stroke="var(--color-border)" strokeWidth="1" />
            <circle cx={jccLines.mx2} cy={jccLines.my2} r="5" fill="var(--color-minus-mark)" stroke="var(--color-border)" strokeWidth="1" />
            <circle cx={jccLines.px} cy={jccLines.py} r="5" fill="var(--color-plus)" />
            <circle cx={jccLines.px2} cy={jccLines.py2} r="5" fill="var(--color-plus)" />
          </g>
        ) : null}
        <circle cx={cx} cy={cy} r="3" fill="var(--color-fg)" />
      </svg>
      <p className="font-mono text-sm tabular-nums text-muted">
        axis {padAxis(axis)}°
      </p>
    </div>
  );
}
