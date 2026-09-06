/** Sphero-cylindrical refraction. Axis is 0–180°, 180 ≡ 0 (horizontal). */
export type Rx = {
  sphere: number;
  cylinder: number;
  axis: number;
};

export type PowerVector = { M: number; J0: number; J45: number };

export type JccMode = "off" | "axis" | "power";

export type SturmFocus = {
  meridian: number;
  power: number;
  line: number;
};

const EPS = 1e-10;
export const CLINICAL_EPS = 0.04;

export function snapQuarter(n: number): number {
  return Math.round(n * 4) / 4;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/** Axis in (0, 180], with 180 used instead of 0. */
export function normalizeAxis(a: number): number {
  let n = a % 180;
  if (n < 0) n += 180;
  if (n <= EPS || n > 180 - 1e-6) return 180;
  return n;
}

export function snapAxis(a: number): number {
  return normalizeAxis(Math.round(normalizeAxis(a)));
}

export function qty(n: number, places = 2): number {
  if (!Number.isFinite(n)) return 0;
  const f = 10 ** places;
  return Math.round(n * f) / f;
}

function roundTiny(n: number): number {
  return Math.abs(n) < 1e-8 ? 0 : n;
}

export function toPowerVector(rx: Rx): PowerVector {
  const C = rx.cylinder;
  const a2 = (2 * rx.axis * Math.PI) / 180;
  return {
    M: rx.sphere + C / 2,
    J0: (-C / 2) * Math.cos(a2),
    J45: (-C / 2) * Math.sin(a2),
  };
}

export function fromPowerVector(v: PowerVector): Rx {
  const mag = Math.hypot(v.J0, v.J45);
  if (mag < EPS) {
    return { sphere: roundTiny(v.M), cylinder: 0, axis: 180 };
  }
  const cylinder = -2 * mag;
  const sphere = v.M - cylinder / 2;
  const axis = normalizeAxis(((Math.atan2(v.J45, v.J0) * 180) / Math.PI) / 2);
  return { sphere: roundTiny(sphere), cylinder: roundTiny(cylinder), axis };
}

export function addRx(a: Rx, b: Rx): Rx {
  const va = toPowerVector(a);
  const vb = toPowerVector(b);
  return fromPowerVector({
    M: va.M + vb.M,
    J0: va.J0 + vb.J0,
    J45: va.J45 + vb.J45,
  });
}

export function invertRx(rx: Rx): Rx {
  return { sphere: -rx.sphere, cylinder: -rx.cylinder, axis: rx.axis };
}

export function transposeRx(rx: Rx): Rx {
  return {
    sphere: rx.sphere + rx.cylinder,
    cylinder: -rx.cylinder,
    axis: normalizeAxis(rx.axis + 90),
  };
}

export function toMinusCyl(rx: Rx): Rx {
  return rx.cylinder > EPS ? transposeRx(rx) : rx;
}

export function toPlusCyl(rx: Rx): Rx {
  return rx.cylinder < -EPS ? transposeRx(rx) : rx;
}

export function sphericalEquivalent(rx: Rx): number {
  return rx.sphere + rx.cylinder / 2;
}

/** Power in a given meridian: P(θ) = S + C sin²(θ − α). */
export function powerAtMeridian(rx: Rx, thetaDeg: number): number {
  const d = ((thetaDeg - rx.axis) * Math.PI) / 180;
  const s = Math.sin(d);
  return rx.sphere + rx.cylinder * s * s;
}

/**
 * JCC as a sphero-cylinder in minus-cyl form.
 * ±P is +P / −2P × (plus meridian).
 *
 * Axis check: plus meridians sit at trial-axis ±45° (the handles align with axis).
 * Power check: plus meridian sits on the trial axis (flip 0) or 90° from it (flip 1).
 */
export function jccRx(
  trialAxis: number,
  mode: JccMode,
  power: number,
  flip: 0 | 1,
): Rx | null {
  if (mode === "off" || power <= 0) return null;
  const plus =
    mode === "axis"
      ? trialAxis + (flip === 0 ? 45 : -45)
      : trialAxis + (flip === 0 ? 0 : 90);
  return {
    sphere: power,
    cylinder: -2 * power,
    axis: normalizeAxis(plus),
  };
}

export function plusMeridian(
  trialAxis: number,
  mode: Exclude<JccMode, "off">,
  flip: 0 | 1,
): number {
  if (mode === "axis") return normalizeAxis(trialAxis + (flip === 0 ? 45 : -45));
  return normalizeAxis(trialAxis + (flip === 0 ? 0 : 90));
}

/** Residual refraction still needed after the trial lens (and optional JCC). */
export function residualRx(patient: Rx, correction: Rx, jcc: Rx | null): Rx {
  let r = addRx(patient, invertRx(correction));
  if (jcc) r = addRx(r, invertRx(jcc));
  return toMinusCyl(r);
}

export function sturmOf(rx: Rx): {
  anterior: SturmFocus;
  posterior: SturmFocus;
  se: number;
  interval: number;
  spherical: boolean;
} {
  const a = { meridian: normalizeAxis(rx.axis), power: rx.sphere };
  const b = {
    meridian: normalizeAxis(rx.axis + 90),
    power: rx.sphere + rx.cylinder,
  };
  // More minus residual = more myopic = anterior focus
  const anterior = a.power <= b.power ? a : b;
  const posterior = a.power <= b.power ? b : a;
  return {
    anterior: {
      ...anterior,
      line: normalizeAxis(anterior.meridian + 90),
    },
    posterior: {
      ...posterior,
      line: normalizeAxis(posterior.meridian + 90),
    },
    se: sphericalEquivalent(rx),
    interval: Math.abs(rx.cylinder),
    spherical: Math.abs(rx.cylinder) < CLINICAL_EPS,
  };
}

export function classifyResidual(rx: Rx): string {
  const p1 = rx.sphere;
  const p2 = rx.sphere + rx.cylinder;
  const z1 = Math.abs(p1) < CLINICAL_EPS;
  const z2 = Math.abs(p2) < CLINICAL_EPS;
  if (Math.abs(rx.cylinder) < CLINICAL_EPS) {
    if (z1) return "Emmetropia";
    return p1 < 0 ? "Myopia" : "Hyperopia";
  }
  const s1 = z1 ? 0 : Math.sign(p1);
  const s2 = z2 ? 0 : Math.sign(p2);
  if (s1 <= 0 && s2 <= 0 && s1 + s2 < 0) {
    return s1 === 0 || s2 === 0
      ? "Simple myopic astigmatism"
      : "Compound myopic astigmatism";
  }
  if (s1 >= 0 && s2 >= 0 && s1 + s2 > 0) {
    return s1 === 0 || s2 === 0
      ? "Simple hyperopic astigmatism"
      : "Compound hyperopic astigmatism";
  }
  return "Mixed astigmatism";
}

export function cylRule(rx: Rx): "WTR" | "ATR" | "oblique" | null {
  if (Math.abs(rx.cylinder) < 0.2) return null;
  const minusAxis = rx.cylinder <= 0 ? rx.axis : normalizeAxis(rx.axis + 90);
  const a = minusAxis > 90 ? 180 - minusAxis : minusAxis;
  // WTR: minus axis near 180; ATR: minus axis near 90
  if (a <= 20 || a >= 160) return "WTR";
  if (Math.abs(minusAxis - 90) <= 20) return "ATR";
  return "oblique";
}

export function formatD(n: number, digits = 2): string {
  const v = Number(n.toFixed(digits));
  if (Object.is(v, -0) || Math.abs(v) < 10 ** -(digits + 1)) {
    return (0).toFixed(digits);
  }
  if (v > 0) return `+${v.toFixed(digits)}`;
  return v.toFixed(digits);
}

export function padAxis(a: number): string {
  const n = snapAxis(a);
  return n.toString().padStart(3, "0");
}

export function formatRx(rx: Rx, digits = 2): string {
  const sph0 = Math.abs(rx.sphere) < CLINICAL_EPS;
  const cyl0 = Math.abs(rx.cylinder) < CLINICAL_EPS;
  if (sph0 && cyl0) return "plano";
  if (cyl0) return `${formatD(rx.sphere, digits)} DS`;
  return `${formatD(rx.sphere, digits)}  /  ${formatD(rx.cylinder, digits)}  ×  ${padAxis(rx.axis)}`;
}

export const SPHERE_MIN = -15;
export const SPHERE_MAX = 15;
export const CYL_MIN = -8;
export const CYL_MAX = 8;
export const JCC_POWERS = [0.25, 0.5, 0.75, 1] as const;
