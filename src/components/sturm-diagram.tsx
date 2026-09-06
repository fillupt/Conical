import {
  type Rx,
  classifyResidual,
  formatD,
  padAxis,
  qty,
  sturmOf,
} from "@/lib/optics";

type SturmDiagramProps = {
  residual: Rx;
};

const W = 720;
const H = 300;
const LENS_X = 92;
const RETINA_X = 470;
const PX_PER_D = 56;
const Y = 142;
const H_RAY = 42;
const CLAMP_D = 3.2;
const GLOBE_R = 86;

function xOfD(d: number) {
  const c = Math.max(-CLAMP_D, Math.min(CLAMP_D, d));
  return qty(RETINA_X + c * PX_PER_D);
}

export function SturmDiagram({ residual }: SturmDiagramProps) {
  const sturm = sturmOf(residual);
  const xAnt = xOfD(sturm.anterior.power);
  const xPost = xOfD(sturm.posterior.power);
  const xSe = xOfD(sturm.se);
  const classification = classifyResidual(residual);
  const clipId = "sturm-clip";

  return (
    <section className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
      <header className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-serif text-lg tracking-tight">Sturm’s conoid</h2>
          <p className="text-xs text-muted">
            Dioptric space along the eye. Minus sits in front of the retina;
            plus sits behind it.
          </p>
        </div>
        <p className="text-xs text-accent">{classification}</p>
      </header>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label="Optical diagram of Sturm's conoid relative to the retina"
      >
        <defs>
          <clipPath id={clipId}>
            <rect x={LENS_X} y={Y - 90} width={W - LENS_X - 8} height={180} />
          </clipPath>
        </defs>

        {[-H_RAY, 0, H_RAY].map((yy) => (
          <line
            key={`in-${yy}`}
            x1={16}
            x2={LENS_X}
            y1={Y + yy}
            y2={Y + yy}
            stroke="var(--color-muted)"
            strokeWidth="1.1"
            strokeOpacity="0.45"
          />
        ))}
        <text
          x={20}
          y={Y - H_RAY - 12}
          fontSize="11"
          fill="var(--color-subtle)"
          fontFamily="var(--font-serif)"
          fontStyle="italic"
        >
          ∞
        </text>

        <ellipse
          cx={LENS_X}
          cy={Y}
          rx="9"
          ry={H_RAY + 8}
          fill="var(--color-accent)"
          fillOpacity="0.14"
          stroke="var(--color-accent)"
          strokeWidth="1.5"
        />

        <path
          d={globePath()}
          fill="var(--color-surface-2)"
          fillOpacity="0.25"
          stroke="var(--color-border)"
          strokeWidth="1.25"
        />
        <line
          x1={RETINA_X}
          x2={RETINA_X}
          y1={Y - GLOBE_R + 8}
          y2={Y + GLOBE_R - 8}
          stroke="var(--color-fg)"
          strokeWidth="1.75"
          strokeOpacity="0.9"
        />
        <text
          x={RETINA_X + 10}
          y={Y - GLOBE_R + 4}
          fontSize="11"
          fill="var(--color-fg)"
          fontFamily="var(--font-serif)"
          fontStyle="italic"
        >
          retina
        </text>

        <g clipPath={`url(#${clipId})`}>
          <Envelope
            focusX={xAnt}
            color="var(--color-myopic)"
            height={H_RAY}
          />
          {!sturm.spherical ? (
            <Envelope
              focusX={xPost}
              color="var(--color-hyperopic)"
              height={H_RAY * 0.62}
              dashed
            />
          ) : null}
        </g>

        <line
          x1={LENS_X + 10}
          x2={xOfD(CLAMP_D)}
          y1={Y}
          y2={Y}
          stroke="var(--color-border)"
          strokeWidth="1"
          strokeDasharray="2 4"
        />

        {!sturm.spherical && Math.abs(xSe - RETINA_X) > 18 ? (
          <g>
            <circle
              cx={xSe}
              cy={Y}
              r="10"
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="1.4"
              strokeDasharray="3 3"
            />
            <text
              x={xSe}
              y={Y + 72}
              textAnchor="middle"
              fontSize="10"
              fill="var(--color-accent)"
              fontFamily="var(--font-serif)"
              fontStyle="italic"
            >
              COLC
            </text>
          </g>
        ) : null}

        <Screen
          x={xAnt}
          lineDeg={sturm.anterior.line}
          color="var(--color-myopic)"
        />
        {!sturm.spherical && Math.abs(xPost - xAnt) > 20 ? (
          <Screen
            x={xPost}
            lineDeg={sturm.posterior.line}
            color="var(--color-hyperopic)"
          />
        ) : null}
        {sturm.spherical ? (
          <circle cx={xAnt} cy={Y} r="4" fill="var(--color-accent)" />
        ) : null}

        <DiopterRuler />
      </svg>

      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-4">
        <Stat
          k={sturm.spherical ? "Focus" : "Anterior line"}
          v={
            sturm.spherical
              ? `${formatD(sturm.anterior.power)} D`
              : `${padAxis(sturm.anterior.line)}°  ·  ${formatD(sturm.anterior.power)} D`
          }
        />
        <Stat
          k="Posterior line"
          v={
            sturm.spherical
              ? "coincides"
              : `${padAxis(sturm.posterior.line)}°  ·  ${formatD(sturm.posterior.power)} D`
          }
        />
        <Stat k="Interval of Sturm" v={`${formatD(sturm.interval)} D`} />
        <Stat k="Spherical equivalent" v={`${formatD(sturm.se)} D`} />
      </dl>
    </section>
  );
}

function globePath() {
  const top = Y - GLOBE_R;
  const bot = Y + GLOBE_R;
  const bulge = RETINA_X + 78;
  return `M ${RETINA_X} ${top} C ${bulge} ${top}, ${bulge} ${bot}, ${RETINA_X} ${bot} L ${RETINA_X} ${top} Z`;
}

function Envelope({
  focusX,
  color,
  height,
  dashed,
}: {
  focusX: number;
  color: string;
  height: number;
  dashed?: boolean;
}) {
  const dash = dashed ? "5 4" : undefined;
  return (
    <g>
      <line
        x1={LENS_X}
        y1={qty(Y - height)}
        x2={focusX}
        y2={Y}
        stroke={color}
        strokeWidth="1.35"
        strokeDasharray={dash}
        strokeOpacity="0.9"
      />
      <line
        x1={LENS_X}
        y1={qty(Y + height)}
        x2={focusX}
        y2={Y}
        stroke={color}
        strokeWidth="1.35"
        strokeDasharray={dash}
        strokeOpacity="0.9"
      />
    </g>
  );
}

function Screen({
  x,
  lineDeg,
  color,
}: {
  x: number;
  lineDeg: number;
  color: string;
}) {
  const s = 13;
  const rad = (lineDeg * Math.PI) / 180;
  const dx = qty((s - 3) * Math.cos(rad));
  const dy = qty((s - 3) * Math.sin(rad));
  return (
    <g>
      <rect
        x={x - s}
        y={Y - s}
        width={s * 2}
        height={s * 2}
        rx="3"
        fill="var(--color-bg)"
        stroke={color}
        strokeWidth="1.25"
      />
      <line
        x1={x - dx}
        y1={Y + dy}
        x2={x + dx}
        y2={Y - dy}
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </g>
  );
}

function DiopterRuler() {
  const ticks = [-3, -2, -1, 0, 1, 2, 3];
  const y = H - 28;
  return (
    <g>
      <line
        x1={xOfD(-3.1)}
        x2={xOfD(3.1)}
        y1={y}
        y2={y}
        stroke="var(--color-border)"
      />
      {ticks.map((d) => (
        <g key={d}>
          <line
            x1={xOfD(d)}
            x2={xOfD(d)}
            y1={y - 5}
            y2={y + 5}
            stroke="var(--color-muted)"
          />
          <text
            x={xOfD(d)}
            y={y + 18}
            textAnchor="middle"
            fontSize="10"
            fontFamily="var(--font-mono)"
            fill="var(--color-subtle)"
          >
            {d === 0 ? "0 D" : formatD(d, 0)}
          </text>
        </g>
      ))}
      <text
        x={xOfD(-3.1)}
        y={y - 10}
        fontSize="9"
        fill="var(--color-subtle)"
        fontFamily="var(--font-sans)"
      >
        anterior
      </text>
      <text
        x={xOfD(3.1)}
        y={y - 10}
        textAnchor="end"
        fontSize="9"
        fill="var(--color-subtle)"
        fontFamily="var(--font-sans)"
      >
        posterior
      </text>
    </g>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-subtle">{k}</dt>
      <dd className="font-mono tabular-nums text-fg">{v}</dd>
    </div>
  );
}
