import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as ChevronDown, i as Minus, n as Repeat, r as Plus } from "../_libs/lucide-react.mjs";
import { t as create } from "../_libs/zustand.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-ejQdP1rK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var EPS = 1e-10;
var CLINICAL_EPS = .04;
function snapQuarter(n) {
	return Math.round(n * 4) / 4;
}
function clamp(n, min, max) {
	return Math.min(max, Math.max(min, n));
}
/** Axis in (0, 180], with 180 used instead of 0. */
function normalizeAxis(a) {
	let n = a % 180;
	if (n < 0) n += 180;
	if (n <= EPS || n > 180 - 1e-6) return 180;
	return n;
}
function snapAxis(a) {
	return normalizeAxis(Math.round(normalizeAxis(a)));
}
function qty(n, places = 2) {
	if (!Number.isFinite(n)) return 0;
	const f = 10 ** places;
	return Math.round(n * f) / f;
}
function roundTiny(n) {
	return Math.abs(n) < 1e-8 ? 0 : n;
}
function toPowerVector(rx) {
	const C = rx.cylinder;
	const a2 = 2 * rx.axis * Math.PI / 180;
	return {
		M: rx.sphere + C / 2,
		J0: -C / 2 * Math.cos(a2),
		J45: -C / 2 * Math.sin(a2)
	};
}
function fromPowerVector(v) {
	const mag = Math.hypot(v.J0, v.J45);
	if (mag < EPS) return {
		sphere: roundTiny(v.M),
		cylinder: 0,
		axis: 180
	};
	const cylinder = -2 * mag;
	const sphere = v.M - cylinder / 2;
	const axis = normalizeAxis(Math.atan2(v.J45, v.J0) * 180 / Math.PI / 2);
	return {
		sphere: roundTiny(sphere),
		cylinder: roundTiny(cylinder),
		axis
	};
}
function addRx(a, b) {
	const va = toPowerVector(a);
	const vb = toPowerVector(b);
	return fromPowerVector({
		M: va.M + vb.M,
		J0: va.J0 + vb.J0,
		J45: va.J45 + vb.J45
	});
}
function invertRx(rx) {
	return {
		sphere: -rx.sphere,
		cylinder: -rx.cylinder,
		axis: rx.axis
	};
}
function transposeRx(rx) {
	return {
		sphere: rx.sphere + rx.cylinder,
		cylinder: -rx.cylinder,
		axis: normalizeAxis(rx.axis + 90)
	};
}
function toMinusCyl(rx) {
	return rx.cylinder > EPS ? transposeRx(rx) : rx;
}
function sphericalEquivalent(rx) {
	return rx.sphere + rx.cylinder / 2;
}
/** Power in a given meridian: P(θ) = S + C sin²(θ − α). */
function powerAtMeridian(rx, thetaDeg) {
	const d = (thetaDeg - rx.axis) * Math.PI / 180;
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
function jccRx(trialAxis, mode, power, flip) {
	if (mode === "off" || power <= 0) return null;
	const plus = mode === "axis" ? trialAxis + (flip === 0 ? 45 : -45) : trialAxis + (flip === 0 ? 0 : 90);
	return {
		sphere: power,
		cylinder: -2 * power,
		axis: normalizeAxis(plus)
	};
}
function plusMeridian(trialAxis, mode, flip) {
	if (mode === "axis") return normalizeAxis(trialAxis + (flip === 0 ? 45 : -45));
	return normalizeAxis(trialAxis + (flip === 0 ? 0 : 90));
}
/** Residual refraction still needed after the trial lens (and optional JCC). */
function residualRx(patient, correction, jcc) {
	let r = addRx(patient, invertRx(correction));
	if (jcc) r = addRx(r, invertRx(jcc));
	return toMinusCyl(r);
}
function sturmOf(rx) {
	const a = {
		meridian: normalizeAxis(rx.axis),
		power: rx.sphere
	};
	const b = {
		meridian: normalizeAxis(rx.axis + 90),
		power: rx.sphere + rx.cylinder
	};
	const anterior = a.power <= b.power ? a : b;
	const posterior = a.power <= b.power ? b : a;
	return {
		anterior: {
			...anterior,
			line: normalizeAxis(anterior.meridian + 90)
		},
		posterior: {
			...posterior,
			line: normalizeAxis(posterior.meridian + 90)
		},
		se: sphericalEquivalent(rx),
		interval: Math.abs(rx.cylinder),
		spherical: Math.abs(rx.cylinder) < CLINICAL_EPS
	};
}
function classifyResidual(rx) {
	const p1 = rx.sphere;
	const p2 = rx.sphere + rx.cylinder;
	const z1 = Math.abs(p1) < CLINICAL_EPS;
	const z2 = Math.abs(p2) < CLINICAL_EPS;
	if (Math.abs(rx.cylinder) < .04) {
		if (z1) return "Emmetropia";
		return p1 < 0 ? "Myopia" : "Hyperopia";
	}
	const s1 = z1 ? 0 : Math.sign(p1);
	const s2 = z2 ? 0 : Math.sign(p2);
	if (s1 <= 0 && s2 <= 0 && s1 + s2 < 0) return s1 === 0 || s2 === 0 ? "Simple myopic astigmatism" : "Compound myopic astigmatism";
	if (s1 >= 0 && s2 >= 0 && s1 + s2 > 0) return s1 === 0 || s2 === 0 ? "Simple hyperopic astigmatism" : "Compound hyperopic astigmatism";
	return "Mixed astigmatism";
}
function cylRule(rx) {
	if (Math.abs(rx.cylinder) < .2) return null;
	const minusAxis = rx.cylinder <= 0 ? rx.axis : normalizeAxis(rx.axis + 90);
	const a = minusAxis > 90 ? 180 - minusAxis : minusAxis;
	if (a <= 20 || a >= 160) return "WTR";
	if (Math.abs(minusAxis - 90) <= 20) return "ATR";
	return "oblique";
}
function formatD(n, digits = 2) {
	const v = Number(n.toFixed(digits));
	if (Object.is(v, -0) || Math.abs(v) < 10 ** -(digits + 1)) return 0 .toFixed(digits);
	if (v > 0) return `+${v.toFixed(digits)}`;
	return v.toFixed(digits);
}
function padAxis(a) {
	return snapAxis(a).toString().padStart(3, "0");
}
var JCC_POWERS = [
	.25,
	.5,
	.75,
	1
];
var PRESETS = [
	{
		id: "emmetrope",
		name: "Emmetrope",
		hint: "No error — point focus on the retina",
		patient: {
			sphere: 0,
			cylinder: 0,
			axis: 180
		},
		correction: {
			sphere: 0,
			cylinder: 0,
			axis: 180
		}
	},
	{
		id: "myope",
		name: "Myope",
		hint: "Spherical myope, −2.00 DS",
		patient: {
			sphere: -2,
			cylinder: 0,
			axis: 180
		},
		correction: {
			sphere: 0,
			cylinder: 0,
			axis: 180
		}
	},
	{
		id: "sma",
		name: "Simple myopic",
		hint: "WTR astigmatism, one line on the retina",
		patient: {
			sphere: 0,
			cylinder: -1.5,
			axis: 180
		},
		correction: {
			sphere: 0,
			cylinder: 0,
			axis: 180
		}
	},
	{
		id: "cma",
		name: "Compound myopic",
		hint: "Both lines in front of the retina",
		patient: {
			sphere: -1.5,
			cylinder: -1,
			axis: 180
		},
		correction: {
			sphere: -1.5,
			cylinder: 0,
			axis: 180
		}
	},
	{
		id: "mixed",
		name: "Mixed",
		hint: "One line either side — COLC on the retina if SE is plano",
		patient: {
			sphere: .75,
			cylinder: -2,
			axis: 45
		},
		correction: {
			sphere: 0,
			cylinder: 0,
			axis: 45
		}
	},
	{
		id: "cha",
		name: "Compound hyperopic",
		hint: "Both lines behind the retina",
		patient: {
			sphere: 1.5,
			cylinder: -1,
			axis: 90
		},
		correction: {
			sphere: 0,
			cylinder: 0,
			axis: 90
		}
	},
	{
		id: "axis-off",
		name: "Axis error",
		hint: "Power is right, axis is 20° off — try JCC axis",
		patient: {
			sphere: -1,
			cylinder: -2,
			axis: 180
		},
		correction: {
			sphere: -1,
			cylinder: -2,
			axis: 160
		}
	},
	{
		id: "power-off",
		name: "Power error",
		hint: "Axis is right, cylinder is 0.75 D short — try JCC power",
		patient: {
			sphere: -1,
			cylinder: -1.5,
			axis: 90
		},
		correction: {
			sphere: -1,
			cylinder: -.75,
			axis: 90
		}
	}
];
function boundRx(rx) {
	return {
		sphere: clamp(snapQuarter(rx.sphere), -15, 15),
		cylinder: clamp(snapQuarter(rx.cylinder), -8, 8),
		axis: snapAxis(rx.axis)
	};
}
var useWorkbench = create((set, get) => ({
	patient: {
		sphere: -1,
		cylinder: -2,
		axis: 180
	},
	correction: {
		sphere: -1,
		cylinder: -2,
		axis: 160
	},
	jccMode: "axis",
	jccPower: .25,
	jccFlip: 0,
	holdSe: true,
	showGuide: false,
	activePreset: "axis-off",
	setSphere: (which, next) => set({
		[which]: boundRx({
			...get()[which],
			sphere: next
		}),
		activePreset: null
	}),
	setCylinder: (which, next) => {
		const cur = get()[which];
		const cylinder = clamp(snapQuarter(next), -8, 8);
		let sphere = cur.sphere;
		if (which === "correction" && get().holdSe) sphere = snapQuarter(sphericalEquivalent(cur) - cylinder / 2);
		set({
			[which]: boundRx({
				...cur,
				sphere,
				cylinder
			}),
			activePreset: null
		});
	},
	setAxis: (which, next) => set({
		[which]: boundRx({
			...get()[which],
			axis: next
		}),
		activePreset: null
	}),
	setJccMode: (jccMode) => set({ jccMode }),
	setJccPower: (jccPower) => set({ jccPower }),
	flipJcc: () => set({ jccFlip: get().jccFlip === 0 ? 1 : 0 }),
	setJccFlip: (jccFlip) => set({ jccFlip }),
	setHoldSe: (holdSe) => set({ holdSe }),
	setShowGuide: (showGuide) => set({ showGuide }),
	applyPreset: (id) => {
		const p = PRESETS.find((x) => x.id === id);
		if (!p) return;
		set({
			patient: boundRx(p.patient),
			correction: boundRx(p.correction),
			activePreset: id,
			jccFlip: 0
		});
	},
	matchPatient: () => set({
		correction: { ...get().patient },
		activePreset: null
	}),
	zeroCorrection: () => set({
		correction: {
			sphere: 0,
			cylinder: 0,
			axis: 180
		},
		activePreset: null
	})
}));
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function Guide() {
	const open = useWorkbench((s) => s.showGuide);
	const setOpen = useWorkbench((s) => s.setShowGuide);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-xl bg-surface shadow-[var(--shadow-border)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			className: "flex w-full items-center justify-between gap-3 p-4 text-left",
			"aria-expanded": open,
			onClick: () => setOpen(!open),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-serif text-lg tracking-tight",
				children: "How to use a JCC"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: cn("size-5 text-muted transition-transform duration-200 ease-smooth-out", open && "rotate-180") })]
		}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4 border-t border-border px-4 pb-5 pt-3 text-sm text-muted",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "A Jackson cross cylinder is a lens of equal plus and minus power, 90° apart, with zero spherical equivalent. Flipping it exchanges the meridians and asks which blur the patient prefers." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mb-1 font-medium text-fg",
					children: "Axis"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Place the handles on the trial-cylinder axis so the red and white dots straddle it at ±45°. Flip. Rotate the cylinder axis toward the red (plus) dots of the clearer face — chase the red. Stop when both faces look the same." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mb-1 font-medium text-fg",
					children: "Power"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Align the dots with the cylinder axis. If the patient prefers red on axis, add minus cylinder (this bench holds SE, so sphere steps +0.25 for every −0.50 DC). Prefer white on axis: take cylinder out. Endpoint is equal blur on both flips, with a point focus on the retina." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mb-1 font-medium text-fg",
					children: "What the plots show"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Residual refraction is patient Rx minus the trial lens minus the JCC. The sine wave is power in each meridian. Sturm’s conoid places the two focal lines (or a single point) relative to the retina. The dashed wave is the other JCC face, so you can see which flip leaves less cylinder." })] })
			]
		}) : null]
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 font-medium select-none rounded-md text-sm whitespace-nowrap disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg active:not-disabled:scale-[0.96] transition-[scale,background-color,color,box-shadow] duration-150 ease-out", {
	variants: {
		variant: {
			primary: "bg-accent text-accent-fg hover:bg-accent/90",
			outline: "bg-transparent text-fg shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)] hover:bg-surface-2",
			ghost: "bg-transparent text-muted hover:text-fg hover:bg-surface-2",
			subtle: "bg-surface-2 text-fg hover:bg-border",
			plus: "bg-plus text-fg hover:bg-plus/90"
		},
		size: {
			sm: "h-8 px-3 text-xs",
			md: "h-10 px-4",
			lg: "h-11 px-5",
			icon: "size-11 p-0",
			iconSm: "size-8 p-0"
		}
	},
	defaultVariants: {
		variant: "outline",
		size: "md"
	}
});
function Button({ className, variant, size, asChild, type = "button", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		type: asChild ? void 0 : type,
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
var MODES = [
	{
		id: "off",
		label: "Off"
	},
	{
		id: "axis",
		label: "Axis"
	},
	{
		id: "power",
		label: "Power"
	}
];
function JccPanel() {
	const correction = useWorkbench((s) => s.correction);
	const jccMode = useWorkbench((s) => s.jccMode);
	const jccPower = useWorkbench((s) => s.jccPower);
	const jccFlip = useWorkbench((s) => s.jccFlip);
	const setJccMode = useWorkbench((s) => s.setJccMode);
	const setJccPower = useWorkbench((s) => s.setJccPower);
	const flipJcc = useWorkbench((s) => s.flipJcc);
	const plus = jccMode === "off" ? null : plusMeridian(correction.axis, jccMode, jccFlip);
	const minusMer = plus == null ? null : plus + 90;
	const lens = jccRx(correction.axis, jccMode, jccPower, jccFlip);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "mb-3 flex flex-wrap items-end justify-between gap-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-serif text-lg tracking-tight",
				children: "Cross cylinder"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted",
				children: jccMode === "off" ? "JCC is out of the trial frame" : jccMode === "axis" ? "Handles on the cylinder axis — flip, then chase the red" : "Dots on the cylinder axis — red add, white subtract"
			})] })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-4 md:flex-row md:items-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-3 grid grid-cols-3 gap-1 rounded-lg bg-bg p-1",
						role: "tablist",
						"aria-label": "JCC mode",
						children: MODES.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							role: "tab",
							"aria-selected": jccMode === m.id,
							className: cn("h-10 rounded-md text-sm font-medium transition-[background-color,color] duration-150 ease-out", jccMode === m.id ? "bg-surface-2 text-fg" : "text-muted hover:text-fg"),
							onClick: () => setJccMode(m.id),
							children: m.label
						}, m.id))
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-1",
						children: JCC_POWERS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: jccPower === p ? "primary" : "ghost",
							className: "font-mono tabular-nums",
							onClick: () => setJccPower(p),
							disabled: jccMode === "off",
							children: ["±", p.toFixed(2)]
						}, p))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(JccLens, {
					plus: plus ?? 45,
					flipped: jccFlip === 1,
					inactive: jccMode === "off"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "primary",
							className: "mb-3 w-full",
							onClick: flipJcc,
							disabled: jccMode === "off",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Repeat, {
								className: "size-4",
								strokeWidth: 2
							}), "Flip"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
							className: "grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-xs tabular-nums",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-plus",
									children: "Plus"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: plus == null ? "—" : `${padAxis(plus)}°` }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted",
									children: "Minus"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: minusMer == null ? "—" : `${padAxis(minusMer)}°` }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-subtle",
									children: "Lens"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "truncate text-muted",
									children: lens ? `${formatD(lens.sphere)} / ${formatD(lens.cylinder)} × ${padAxis(lens.axis)}` : "out"
								})
							]
						}),
						plus != null && jccMode !== "off" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-xs text-subtle",
							children: [
								"Other face puts plus at ",
								padAxis((plus ?? 0) + 90),
								"°."
							]
						}) : null
					]
				})
			]
		})]
	});
}
function JccLens({ plus, flipped, inactive }) {
	const rad = plus * Math.PI / 180;
	const cx = 56;
	const cy = 56;
	const r = 36;
	const px = cx + r * Math.cos(rad);
	const py = cy - r * Math.sin(rad);
	const px2 = cx - r * Math.cos(rad);
	const py2 = cy + r * Math.sin(rad);
	const mr = rad + Math.PI / 2;
	const mx = cx + r * Math.cos(mr);
	const my = cy - r * Math.sin(mr);
	const mx2 = cx - r * Math.cos(mr);
	const my2 = cy + r * Math.sin(mr);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 112 112",
		className: cn("size-28 shrink-0 transition-[transform,opacity] duration-200 ease-smooth-out", flipped && "rotate-180", inactive && "opacity-35"),
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx,
				cy,
				r: "48",
				fill: "var(--color-bg)",
				stroke: "var(--color-border)",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx,
				cy,
				r: "40",
				fill: "none",
				stroke: "var(--color-surface-2)",
				strokeWidth: "8"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: px,
				y1: py,
				x2: px2,
				y2: py2,
				stroke: "var(--color-plus)",
				strokeWidth: "2",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: mx,
				y1: my,
				x2: mx2,
				y2: my2,
				stroke: "var(--color-minus-mark)",
				strokeWidth: "2",
				strokeLinecap: "round",
				strokeDasharray: "3 4"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: px,
				cy: py,
				r: "6",
				fill: "var(--color-plus)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: px2,
				cy: py2,
				r: "6",
				fill: "var(--color-plus)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: mx,
				cy: my,
				r: "6",
				fill: "var(--color-minus-mark)",
				stroke: "var(--color-border)",
				strokeWidth: "1"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: mx2,
				cy: my2,
				r: "6",
				fill: "var(--color-minus-mark)",
				stroke: "var(--color-border)",
				strokeWidth: "1"
			})
		]
	});
}
var DOTS = [
	{
		x: 0,
		y: 0
	},
	{
		x: 0,
		y: -34
	},
	{
		x: 0,
		y: 34
	},
	{
		x: 30,
		y: -17
	},
	{
		x: 30,
		y: 17
	},
	{
		x: -30,
		y: -17
	},
	{
		x: -30,
		y: 17
	}
];
function PatientView({ residual }) {
	const sturm = sturmOf(residual);
	const k = 14;
	const rAxis = qty(Math.min(28, k * Math.abs(powerAtMeridian(residual, residual.axis + 90))));
	const rPow = qty(Math.min(28, k * Math.abs(powerAtMeridian(residual, residual.axis))));
	const rot = residual.axis;
	const blurId = (0, import_react.useId)();
	const blur = qty(Math.min(4.5, .9 * Math.hypot(rAxis, rPow) * .12));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mb-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-serif text-lg tracking-tight",
					children: "Retinal image"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted",
					children: "Dot target as the patient sees it. Elongation follows the focal line farther from the retina."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
					viewBox: "0 0 200 200",
					className: "w-full rounded-lg bg-bg",
					role: "img",
					"aria-label": "Simulated retinal blur of a dot target",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("filter", {
						id: blurId,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("feGaussianBlur", { stdDeviation: blur })
					}) }), DOTS.map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
						cx: qty(100 + d.x),
						cy: qty(100 + d.y),
						rx: qty(3.2 + rAxis),
						ry: qty(3.2 + rPow),
						transform: `rotate(${qty(-rot, 1)} ${qty(100 + d.x)} ${qty(100 + d.y)})`,
						fill: "var(--color-fg)",
						fillOpacity: "0.92",
						filter: `url(#${blurId})`
					}, i))]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClockDial, { residual })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 font-mono text-xs tabular-nums text-muted",
				children: [
					"blur ellipse ",
					formatD(rAxis / k),
					" × ",
					formatD(rPow / k),
					" D · line",
					" ",
					padAxis(sturm.anterior.line),
					"° anterior"
				]
			})
		]
	});
}
function ClockDial({ residual }) {
	const spokes = (0, import_react.useMemo)(() => {
		return Array.from({ length: 13 }, (_, i) => {
			const line = i * 15;
			const meridian = line + 90;
			const defocus = Math.abs(powerAtMeridian(residual, meridian));
			return {
				line,
				defocus,
				sharp: Math.max(.12, 1 - defocus / 2.2)
			};
		});
	}, [residual]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 200 200",
		className: "w-full rounded-lg bg-bg",
		role: "img",
		"aria-label": "Astigmatic fan chart",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				x: "100",
				y: "18",
				textAnchor: "middle",
				fontSize: "10",
				fill: "var(--color-subtle)",
				fontFamily: "var(--font-sans)",
				children: "Fan chart"
			}),
			spokes.map((s) => {
				const rad = s.line * Math.PI / 180;
				const x2 = 100 + 78 * Math.cos(rad);
				const y2 = 100 - 78 * Math.sin(rad);
				const x1 = 100 + 10 * Math.cos(rad);
				const y1 = 100 - 10 * Math.sin(rad);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: qty(x1),
					y1: qty(y1),
					x2: qty(x2),
					y2: qty(y2),
					stroke: "var(--color-fg)",
					strokeWidth: qty(1.2 + 2.4 * s.sharp),
					strokeOpacity: qty(.25 + .75 * s.sharp),
					strokeLinecap: "round"
				}, s.line);
			}),
			[
				180,
				0,
				30,
				60,
				90,
				120,
				150
			].map((d) => {
				const rad = d * Math.PI / 180;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
					x: qty(100 + 90 * Math.cos(rad)),
					y: qty(100 - 90 * Math.sin(rad) + 3),
					textAnchor: "middle",
					fontSize: "8",
					fontFamily: "var(--font-mono)",
					fill: "var(--color-subtle)",
					children: d === 0 ? 180 : d
				}, d);
			})
		]
	});
}
var W$1 = 700;
var H$1 = 280;
var PAD = {
	l: 52,
	r: 18,
	t: 22,
	b: 36
};
var innerW = W$1 - PAD.l - PAD.r;
var innerH = H$1 - PAD.t - PAD.b;
function PowerWave({ residual, alt, trialAxis }) {
	const [hover, setHover] = (0, import_react.useState)(null);
	const { ymax, path, altPath, zeroY, seY } = (0, import_react.useMemo)(() => {
		let maxAbs = 1;
		for (let i = 0; i <= 180; i++) {
			const p = powerAtMeridian(residual, i);
			maxAbs = Math.max(maxAbs, Math.abs(p));
			if (alt) maxAbs = Math.max(maxAbs, Math.abs(powerAtMeridian(alt, i)));
		}
		const ymax = Math.max(1, Math.ceil(maxAbs * 2) / 2);
		const xOf = (deg) => qty(PAD.l + deg / 180 * innerW);
		const yOf = (d) => qty(PAD.t + (ymax - d) / (2 * ymax) * innerH);
		const toPath = (rx) => {
			let d = "";
			for (let i = 0; i <= 180; i++) {
				const x = xOf(i);
				const y = yOf(powerAtMeridian(rx, i));
				d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
			}
			return d;
		};
		const se = sphericalEquivalent(residual);
		return {
			ymax,
			path: toPath(residual),
			altPath: alt ? toPath(alt) : null,
			zeroY: yOf(0),
			seY: yOf(se),
			xOf,
			yOf
		};
	}, [residual, alt]);
	const xOf = (deg) => qty(PAD.l + deg / 180 * innerW);
	const yOf = (d) => qty(PAD.t + (ymax - d) / (2 * ymax) * innerH);
	const ticks = [];
	for (let d = -ymax; d <= ymax + 1e-6; d += ymax >= 2 ? 1 : .5) ticks.push(d);
	const hoverX = hover == null ? null : xOf(hover);
	const hoverP = hover == null ? null : powerAtMeridian(residual, hover);
	function pointerMeridian(e) {
		const r = e.currentTarget.getBoundingClientRect();
		const deg = ((e.clientX - r.left) / r.width * W$1 - PAD.l) / innerW * 180;
		if (deg < 0 || deg > 180) return null;
		return Math.round(deg);
	}
	const fillBelow = areaPath(residual, 0, ymax, true);
	const fillAbove = areaPath(residual, 0, ymax, false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mb-3 flex flex-wrap items-end justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-serif text-lg tracking-tight",
					children: "Residual power"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted",
					children: "P(θ) = S + C sin²(θ − α) — one cycle of the double-angle sine wave"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-mono text-xs tabular-nums text-subtle",
					children: [
						"SE ",
						formatD(sphericalEquivalent(residual)),
						" D · amp",
						" ",
						formatD(Math.abs(residual.cylinder) / 2),
						" D"
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
				viewBox: `0 0 ${W$1} ${H$1}`,
				className: "w-full touch-none",
				role: "img",
				"aria-label": "Residual refractive power against meridian",
				onPointerMove: (e) => setHover(pointerMeridian(e)),
				onPointerLeave: () => setHover(null),
				children: [
					ticks.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: PAD.l,
						x2: W$1 - PAD.r,
						y1: yOf(t),
						y2: yOf(t),
						stroke: "var(--color-border)",
						strokeWidth: "1",
						strokeDasharray: t === 0 ? void 0 : "2 4"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
						x: PAD.l - 8,
						y: yOf(t) + 3,
						textAnchor: "end",
						fontSize: "10",
						fontFamily: "var(--font-mono)",
						fill: "var(--color-subtle)",
						children: formatD(t)
					})] }, t)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: PAD.l,
						x2: W$1 - PAD.r,
						y1: zeroY,
						y2: zeroY,
						stroke: "var(--color-fg)",
						strokeOpacity: "0.35",
						strokeWidth: "1.25"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
						x: W$1 - PAD.r,
						y: zeroY - 6,
						textAnchor: "end",
						fontSize: "10",
						fill: "var(--color-muted)",
						fontFamily: "var(--font-sans)",
						children: "retina"
					}),
					Math.abs(sphericalEquivalent(residual)) > .02 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: PAD.l,
						x2: W$1 - PAD.r,
						y1: seY,
						y2: seY,
						stroke: "var(--color-accent)",
						strokeWidth: "1",
						strokeDasharray: "5 4",
						strokeOpacity: "0.7"
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: fillBelow,
						fill: "var(--color-myopic)",
						fillOpacity: "0.12"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: fillAbove,
						fill: "var(--color-hyperopic)",
						fillOpacity: "0.12"
					}),
					altPath ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: altPath,
						fill: "none",
						stroke: "var(--color-muted)",
						strokeWidth: "1.5",
						strokeDasharray: "4 4",
						opacity: "0.7"
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: path,
						fill: "none",
						stroke: "var(--color-fg)",
						strokeWidth: "2.25",
						strokeLinejoin: "round"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeridianMarker, {
						x: xOf(residual.axis),
						y1: PAD.t,
						y2: PAD.t + innerH,
						label: `${padAxis(residual.axis)}`,
						color: "var(--color-accent)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeridianMarker, {
						x: xOf(residual.axis >= 90 ? residual.axis - 90 : residual.axis + 90),
						y1: PAD.t,
						y2: PAD.t + innerH,
						label: `${padAxis(residual.axis + 90)}`,
						color: "var(--color-plus)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeridianMarker, {
						x: xOf(trialAxis),
						y1: PAD.t,
						y2: PAD.t + innerH,
						label: "trial",
						color: "var(--color-subtle)",
						dashed: true
					}),
					[
						0,
						45,
						90,
						135,
						180
					].map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("text", {
						x: xOf(d),
						y: 270,
						textAnchor: "middle",
						fontSize: "10",
						fontFamily: "var(--font-mono)",
						fill: "var(--color-subtle)",
						children: [d, "°"]
					}, d)),
					hover != null && hoverX != null && hoverP != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
							x1: hoverX,
							x2: hoverX,
							y1: PAD.t,
							y2: PAD.t + innerH,
							stroke: "var(--color-fg)",
							strokeOpacity: "0.4"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: hoverX,
							cy: yOf(hoverP),
							r: "4",
							fill: "var(--color-accent)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("text", {
							x: hoverX > W$1 / 2 ? hoverX - 8 : hoverX + 8,
							y: yOf(hoverP) - 10,
							textAnchor: hoverX > W$1 / 2 ? "end" : "start",
							fontSize: "11",
							fontFamily: "var(--font-mono)",
							fill: "var(--color-fg)",
							children: [
								padAxis(hover),
								"° ",
								formatD(hoverP),
								" D"
							]
						})
					] }) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex flex-wrap gap-4 text-xs text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, {
						swatch: "var(--color-fg)",
						label: "This face"
					}),
					alt ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, {
						swatch: "var(--color-muted)",
						dashed: true,
						label: "Other flip"
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, {
						swatch: "var(--color-myopic)",
						label: "Myopic (in front)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, {
						swatch: "var(--color-hyperopic)",
						label: "Hyperopic (behind)"
					})
				]
			})
		]
	});
}
function areaPath(rx, _zero, ymax, belowZero) {
	const xOf = (deg) => qty(PAD.l + deg / 180 * innerW);
	const yOf = (d) => qty(PAD.t + (ymax - d) / (2 * ymax) * innerH);
	const zeroY = yOf(0);
	const pts = [];
	pts.push(`M ${xOf(0)} ${zeroY}`);
	for (let i = 0; i <= 180; i++) {
		const p = powerAtMeridian(rx, i);
		const clipped = belowZero ? Math.min(0, p) : Math.max(0, p);
		pts.push(`L ${xOf(i)} ${yOf(clipped)}`);
	}
	pts.push(`L ${xOf(180)} ${zeroY} Z`);
	return pts.join(" ");
}
function MeridianMarker({ x, y1, y2, label, color, dashed }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
		x1: x,
		x2: x,
		y1,
		y2,
		stroke: color,
		strokeWidth: "1",
		strokeDasharray: dashed ? "2 3" : "2 5",
		strokeOpacity: "0.7"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
		x: x + 4,
		y: y1 + 11,
		fontSize: "9",
		fontFamily: "var(--font-mono)",
		fill: color,
		children: label
	})] });
}
function Legend({ swatch, label, dashed }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "inline-flex items-center gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "inline-block h-px w-5",
			style: { borderTop: `2px ${dashed ? "dashed" : "solid"} ${swatch}` }
		}), label]
	});
}
function eventToAxis(el, clientX, clientY) {
	const r = el.getBoundingClientRect();
	const x = clientX - r.left - r.width / 2;
	const y = clientY - r.top - r.height / 2;
	return snapAxis(Math.atan2(-y, x) * 180 / Math.PI);
}
function AxisDial({ axis, onChange, disabled }) {
	const svgRef = (0, import_react.useRef)(null);
	const dragging = (0, import_react.useRef)(false);
	const update = (0, import_react.useCallback)((e) => {
		const svg = svgRef.current;
		if (!svg || disabled) return;
		onChange(eventToAxis(svg, e.clientX, e.clientY));
	}, [disabled, onChange]);
	function onPointerDown(e) {
		if (disabled || e.button !== 0) return;
		dragging.current = true;
		e.currentTarget.setPointerCapture(e.pointerId);
		update(e);
	}
	function onPointerMove(e) {
		if (!dragging.current) return;
		update(e);
	}
	function onPointerUp() {
		dragging.current = false;
	}
	const rad = normalizeAxis(axis) * Math.PI / 180;
	const cx = 80;
	const cy = 80;
	const r = 58;
	const x1 = cx + r * Math.cos(rad);
	const y1 = cy - r * Math.sin(rad);
	const x2 = cx - r * Math.cos(rad);
	const y2 = cy + r * Math.sin(rad);
	const ticks = [];
	for (let d = 0; d < 180; d += 10) {
		const t = d * Math.PI / 180;
		const major = d % 30 === 0;
		const r1 = major ? 66 : 62;
		const r2 = 70;
		ticks.push(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: cx + r1 * Math.cos(t),
			y1: cy - r1 * Math.sin(t),
			x2: cx + r2 * Math.cos(t),
			y2: cy - r2 * Math.sin(t),
			stroke: "currentColor",
			strokeWidth: major ? 1.5 : 1,
			className: major ? "text-muted" : "text-border"
		}, d));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex flex-col items-center gap-2", disabled && "opacity-40"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			ref: svgRef,
			viewBox: "0 0 160 160",
			className: cn("size-32 touch-none select-none text-fg sm:size-36", disabled ? "pointer-events-none" : "cursor-crosshair"),
			role: "slider",
			"aria-label": "Cylinder axis",
			"aria-valuemin": 1,
			"aria-valuemax": 180,
			"aria-valuenow": snapAxis(axis),
			"aria-disabled": disabled,
			onPointerDown,
			onPointerMove,
			onPointerUp,
			onPointerCancel: onPointerUp,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx,
					cy,
					r: 70,
					fill: "var(--color-bg)",
					stroke: "var(--color-border)",
					strokeWidth: "1"
				}),
				ticks,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
					x: 126,
					y: 83,
					textAnchor: "middle",
					className: "fill-subtle",
					fontSize: "8",
					fontFamily: "var(--font-mono)",
					children: "180"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
					x: cx,
					y: 38,
					textAnchor: "middle",
					className: "fill-subtle",
					fontSize: "8",
					fontFamily: "var(--font-mono)",
					children: "090"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1,
					y1,
					x2,
					y2,
					stroke: "var(--color-accent)",
					strokeWidth: "3",
					strokeLinecap: "round"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: x1,
					cy: y1,
					r: "4.5",
					fill: "var(--color-accent)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: x2,
					cy: y2,
					r: "4.5",
					fill: "var(--color-accent)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx,
					cy,
					r: "3",
					fill: "var(--color-fg)"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "font-mono text-sm tabular-nums text-muted",
			children: [
				"axis ",
				padAxis(axis),
				"°"
			]
		})]
	});
}
function useHold(fn, enabled) {
	const fnRef = (0, import_react.useRef)(fn);
	fnRef.current = fn;
	const timer = (0, import_react.useRef)(null);
	function clear() {
		if (timer.current != null) {
			window.clearTimeout(timer.current);
			timer.current = null;
		}
	}
	function start() {
		if (!enabled) return;
		fnRef.current();
		const loop = (delay) => {
			timer.current = window.setTimeout(() => {
				fnRef.current();
				loop(70);
			}, delay);
		};
		loop(320);
	}
	(0, import_react.useEffect)(() => () => clear(), []);
	return {
		onPointerDown: (e) => {
			if (e.button !== 0) return;
			e.currentTarget.setPointerCapture(e.pointerId);
			start();
		},
		onPointerUp: clear,
		onPointerCancel: clear,
		onLostPointerCapture: clear
	};
}
function Stepper({ label, value, onStep, canDec = true, canInc = true, negative = false, unit }) {
	const dec = useHold(() => onStep(-1), canDec);
	const inc = useHold(() => onStep(1), canInc);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-w-0 flex-1 flex-col items-stretch",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "subtle",
				size: "md",
				"aria-label": `Increase ${label}`,
				disabled: !canInc,
				className: "h-11 w-full px-0 rounded-b-xs",
				...inc,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
					className: "size-4",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("flex min-h-12 flex-col items-center justify-center bg-bg px-1 py-1", "shadow-[var(--shadow-border)]"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("font-mono text-lg tabular-nums tracking-tight sm:text-xl", negative ? "text-plus" : "text-fg"),
					children: value
				}), unit ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs font-medium tracking-wide text-subtle uppercase",
					children: unit
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "subtle",
				size: "md",
				"aria-label": `Decrease ${label}`,
				disabled: !canDec,
				className: "h-11 w-full px-0 rounded-t-xs",
				...dec,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, {
					className: "size-4",
					strokeWidth: 2
				})
			})
		]
	});
}
function RxSep({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "self-center font-mono text-lg text-subtle",
		"aria-hidden": "true",
		children
	});
}
function RxText({ sphere, cylinder, axis, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("font-mono tabular-nums", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: sphere < -.001 ? "text-plus" : void 0,
				children: formatD(sphere)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-subtle",
				children: " DS / "
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: cylinder < -.001 ? "text-plus" : void 0,
				children: formatD(cylinder)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-subtle",
				children: " DC × "
			}),
			padAxis(axis)
		]
	});
}
function RxPanel({ which }) {
	const rx = useWorkbench((s) => s[which]);
	const setSphere = useWorkbench((s) => s.setSphere);
	const setCylinder = useWorkbench((s) => s.setCylinder);
	const setAxis = useWorkbench((s) => s.setAxis);
	const holdSe = useWorkbench((s) => s.holdSe);
	const setHoldSe = useWorkbench((s) => s.setHoldSe);
	const matchPatient = useWorkbench((s) => s.matchPatient);
	const zeroCorrection = useWorkbench((s) => s.zeroCorrection);
	const cylUnused = Math.abs(rx.cylinder) < .01;
	const isCorrection = which === "correction";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mb-3 flex items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-serif text-lg tracking-tight",
					children: which === "patient" ? "Patient" : "Correction"
				}), isCorrection ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: zeroCorrection,
						children: "Plano"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: matchPatient,
						children: "Match patient"
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs text-subtle",
					children: "True refractive error"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-stretch gap-1 sm:gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stepper, {
						label: "Sphere",
						value: formatD(rx.sphere),
						unit: "DS",
						negative: rx.sphere < -.001,
						onStep: (d) => setSphere(which, rx.sphere + d * .25),
						canDec: rx.sphere > -15,
						canInc: rx.sphere < 15
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RxSep, { children: "/" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stepper, {
						label: "Cylinder",
						value: formatD(rx.cylinder),
						unit: "DC",
						negative: rx.cylinder < -.001,
						onStep: (d) => setCylinder(which, rx.cylinder + d * .25),
						canDec: rx.cylinder > -8,
						canInc: rx.cylinder < 8
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RxSep, { children: "×" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stepper, {
						label: "Axis",
						value: padAxis(rx.axis),
						unit: "°",
						onStep: (d) => setAxis(which, rx.axis + d)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-center text-xs text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RxText, { ...rx }), isCorrection && holdSe ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-subtle",
					children: " · SE held"
				}) : null]
			}),
			isCorrection ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "mt-3 flex items-center gap-2 text-xs text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "checkbox",
					className: "size-4 accent-accent",
					checked: holdSe,
					onChange: (e) => setHoldSe(e.target.checked)
				}), "Hold spherical equivalent when cylinder changes"]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("mt-3", cylUnused && "opacity-70"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AxisDial, {
					axis: rx.axis,
					onChange: (a) => setAxis(which, a),
					disabled: false
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-1 flex justify-center gap-1",
					children: [
						-5,
						-1,
						1,
						5
					].map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "ghost",
						className: "min-w-11 font-mono tabular-nums",
						onClick: () => setAxis(which, rx.axis + d),
						children: [d > 0 ? `+${d}` : d, "°"]
					}, d))
				})]
			})
		]
	});
}
var W = 720;
var H = 300;
var LENS_X = 92;
var RETINA_X = 470;
var PX_PER_D = 56;
var Y = 142;
var H_RAY = 42;
var CLAMP_D = 3.2;
function xOfD(d) {
	return qty(RETINA_X + Math.max(-3.2, Math.min(CLAMP_D, d)) * PX_PER_D);
}
function SturmDiagram({ residual }) {
	const sturm = sturmOf(residual);
	const xAnt = xOfD(sturm.anterior.power);
	const xPost = xOfD(sturm.posterior.power);
	const xSe = xOfD(sturm.se);
	const classification = classifyResidual(residual);
	const clipId = "sturm-clip";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mb-3 flex flex-wrap items-end justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-serif text-lg tracking-tight",
					children: "Sturm’s conoid"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted",
					children: "Dioptric space along the eye. Minus sits in front of the retina; plus sits behind it."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-accent",
					children: classification
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
				viewBox: `0 0 ${W} ${H}`,
				className: "w-full",
				role: "img",
				"aria-label": "Optical diagram of Sturm's conoid relative to the retina",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("clipPath", {
						id: clipId,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
							x: LENS_X,
							y: 52,
							width: 620,
							height: 180
						})
					}) }),
					[
						-42,
						0,
						H_RAY
					].map((yy) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: 16,
						x2: LENS_X,
						y1: Y + yy,
						y2: Y + yy,
						stroke: "var(--color-muted)",
						strokeWidth: "1.1",
						strokeOpacity: "0.45"
					}, `in-${yy}`)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
						x: 20,
						y: 88,
						fontSize: "11",
						fill: "var(--color-subtle)",
						fontFamily: "var(--font-serif)",
						fontStyle: "italic",
						children: "∞"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
						cx: LENS_X,
						cy: Y,
						rx: "9",
						ry: 50,
						fill: "var(--color-accent)",
						fillOpacity: "0.14",
						stroke: "var(--color-accent)",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: globePath(),
						fill: "var(--color-surface-2)",
						fillOpacity: "0.25",
						stroke: "var(--color-border)",
						strokeWidth: "1.25"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: RETINA_X,
						x2: RETINA_X,
						y1: 64,
						y2: 220,
						stroke: "var(--color-fg)",
						strokeWidth: "1.75",
						strokeOpacity: "0.9"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
						x: 480,
						y: 60,
						fontSize: "11",
						fill: "var(--color-fg)",
						fontFamily: "var(--font-serif)",
						fontStyle: "italic",
						children: "retina"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
						clipPath: `url(#${clipId})`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Envelope, {
							focusX: xAnt,
							color: "var(--color-myopic)",
							height: H_RAY
						}), !sturm.spherical ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Envelope, {
							focusX: xPost,
							color: "var(--color-hyperopic)",
							height: H_RAY * .62,
							dashed: true
						}) : null]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: 102,
						x2: xOfD(CLAMP_D),
						y1: Y,
						y2: Y,
						stroke: "var(--color-border)",
						strokeWidth: "1",
						strokeDasharray: "2 4"
					}),
					!sturm.spherical && Math.abs(xSe - RETINA_X) > 18 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: xSe,
						cy: Y,
						r: "10",
						fill: "none",
						stroke: "var(--color-accent)",
						strokeWidth: "1.4",
						strokeDasharray: "3 3"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
						x: xSe,
						y: 214,
						textAnchor: "middle",
						fontSize: "10",
						fill: "var(--color-accent)",
						fontFamily: "var(--font-serif)",
						fontStyle: "italic",
						children: "COLC"
					})] }) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Screen, {
						x: xAnt,
						lineDeg: sturm.anterior.line,
						color: "var(--color-myopic)"
					}),
					!sturm.spherical && Math.abs(xPost - xAnt) > 20 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Screen, {
						x: xPost,
						lineDeg: sturm.posterior.line,
						color: "var(--color-hyperopic)"
					}) : null,
					sturm.spherical ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: xAnt,
						cy: Y,
						r: "4",
						fill: "var(--color-accent)"
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DiopterRuler, {})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						k: sturm.spherical ? "Focus" : "Anterior line",
						v: sturm.spherical ? `${formatD(sturm.anterior.power)} D` : `${padAxis(sturm.anterior.line)}°  ·  ${formatD(sturm.anterior.power)} D`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						k: "Posterior line",
						v: sturm.spherical ? "coincides" : `${padAxis(sturm.posterior.line)}°  ·  ${formatD(sturm.posterior.power)} D`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						k: "Interval of Sturm",
						v: `${formatD(sturm.interval)} D`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						k: "Spherical equivalent",
						v: `${formatD(sturm.se)} D`
					})
				]
			})
		]
	});
}
function globePath() {
	const top = 56;
	const bot = 228;
	const bulge = 548;
	return `M ${RETINA_X} ${top} C ${bulge} ${top}, ${bulge} ${bot}, ${RETINA_X} ${bot} L ${RETINA_X} ${top} Z`;
}
function Envelope({ focusX, color, height, dashed }) {
	const dash = dashed ? "5 4" : void 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
		x1: LENS_X,
		y1: qty(Y - height),
		x2: focusX,
		y2: Y,
		stroke: color,
		strokeWidth: "1.35",
		strokeDasharray: dash,
		strokeOpacity: "0.9"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
		x1: LENS_X,
		y1: qty(Y + height),
		x2: focusX,
		y2: Y,
		stroke: color,
		strokeWidth: "1.35",
		strokeDasharray: dash,
		strokeOpacity: "0.9"
	})] });
}
function Screen({ x, lineDeg, color }) {
	const s = 13;
	const rad = lineDeg * Math.PI / 180;
	const dx = qty(10 * Math.cos(rad));
	const dy = qty(10 * Math.sin(rad));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
		x: x - s,
		y: 129,
		width: 26,
		height: 26,
		rx: "3",
		fill: "var(--color-bg)",
		stroke: color,
		strokeWidth: "1.25"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
		x1: x - dx,
		y1: Y + dy,
		x2: x + dx,
		y2: Y - dy,
		stroke: color,
		strokeWidth: "2.4",
		strokeLinecap: "round"
	})] });
}
function DiopterRuler() {
	const ticks = [
		-3,
		-2,
		-1,
		0,
		1,
		2,
		3
	];
	const y = 272;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: xOfD(-3.1),
			x2: xOfD(3.1),
			y1: y,
			y2: y,
			stroke: "var(--color-border)"
		}),
		ticks.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
			x1: xOfD(d),
			x2: xOfD(d),
			y1: 267,
			y2: 277,
			stroke: "var(--color-muted)"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: xOfD(d),
			y: 290,
			textAnchor: "middle",
			fontSize: "10",
			fontFamily: "var(--font-mono)",
			fill: "var(--color-subtle)",
			children: d === 0 ? "0 D" : formatD(d, 0)
		})] }, d)),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: xOfD(-3.1),
			y: 262,
			fontSize: "9",
			fill: "var(--color-subtle)",
			fontFamily: "var(--font-sans)",
			children: "anterior"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: xOfD(3.1),
			y: 262,
			textAnchor: "end",
			fontSize: "9",
			fill: "var(--color-subtle)",
			fontFamily: "var(--font-sans)",
			children: "posterior"
		})
	] });
}
function Stat({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
		className: "text-subtle",
		children: k
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
		className: "font-mono tabular-nums text-fg",
		children: v
	})] });
}
function Workbench() {
	const patient = useWorkbench((s) => s.patient);
	const correction = useWorkbench((s) => s.correction);
	const jccMode = useWorkbench((s) => s.jccMode);
	const jccPower = useWorkbench((s) => s.jccPower);
	const jccFlip = useWorkbench((s) => s.jccFlip);
	const activePreset = useWorkbench((s) => s.activePreset);
	const applyPreset = useWorkbench((s) => s.applyPreset);
	const jcc = jccRx(correction.axis, jccMode, jccPower, jccFlip);
	const residual = residualRx(patient, correction, jcc);
	const alt = jccMode === "off" ? null : residualRx(patient, correction, jccRx(correction.axis, jccMode, jccPower, jccFlip === 0 ? 1 : 0));
	const rule = cylRule(residual);
	const kind = classifyResidual(residual);
	const se = sphericalEquivalent(residual);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "sticky top-0 z-20 border-b border-border bg-bg/95",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex max-w-7xl items-end justify-between gap-4 px-4 py-3 sm:px-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-widest text-accent uppercase",
					children: "Jackson cross cylinder"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-serif text-3xl tracking-tight sm:text-4xl",
					children: "Conoid"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "min-w-0 text-right text-sm sm:text-base",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mr-2 text-xs tracking-wide text-subtle uppercase",
						children: "Residual"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RxText, { ...residual })]
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-4 hidden max-w-2xl text-sm text-muted sm:block",
					children: "Set the script first, then scroll to the cross cylinder. Flip it while watching the conoid and the sine wave."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mb-4 grid gap-4 lg:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RxPanel, { which: "patient" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RxPanel, { which: "correction" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
									className: "mb-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "font-serif text-lg tracking-tight",
										children: "Residual"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs text-subtle",
										children: "Patient minus trial lens minus JCC"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xl tracking-tight sm:text-2xl",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RxText, { ...residual })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-accent",
									children: kind
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
									className: "mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-xs",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-subtle",
											children: "Spherical equivalent"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
											className: cn("font-mono tabular-nums", se < -.001 && "text-plus"),
											children: [formatD(se), " D"]
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-subtle",
											children: "Rule"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											className: "font-mono tabular-nums",
											children: rule ?? "—"
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "col-span-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
												className: "text-subtle",
												children: "Patient"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RxText, { ...patient }) })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "col-span-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
												className: "text-subtle",
												children: "Trial lens"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RxText, { ...correction }) })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "col-span-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
												className: "text-subtle",
												children: "JCC"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: jcc ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RxText, { ...jcc }) : "out" })]
										})
									]
								})
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "sticky top-[3.75rem] z-10 mb-4 bg-bg/95 py-1 sm:top-[4.25rem]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(JccPanel, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 flex flex-col gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SturmDiagram, { residual }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PowerWave, {
							residual,
							alt,
							trialAxis: correction.axis
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PatientView, { residual })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mb-4 rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-3 font-serif text-lg tracking-tight",
						children: "Cases"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-1.5",
						children: PRESETS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: activePreset === p.id ? "primary" : "ghost",
							onClick: () => applyPreset(p.id),
							title: p.hint,
							children: p.name
						}, p.id))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Guide, {})
			]
		})]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Workbench, {});
}
//#endregion
export { Home as component };
