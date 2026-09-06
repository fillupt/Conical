import { create } from "zustand";
import {
  type JccMode,
  type Rx,
  CYL_MAX,
  CYL_MIN,
  SPHERE_MAX,
  SPHERE_MIN,
  clamp,
  snapAxis,
  snapQuarter,
  sphericalEquivalent,
} from "@/lib/optics";

export type Preset = {
  id: string;
  name: string;
  hint: string;
  patient: Rx;
  correction: Rx;
};

export const PRESETS: Preset[] = [
  {
    id: "emmetrope",
    name: "Emmetrope",
    hint: "No error — point focus on the retina",
    patient: { sphere: 0, cylinder: 0, axis: 180 },
    correction: { sphere: 0, cylinder: 0, axis: 180 },
  },
  {
    id: "myope",
    name: "Myope",
    hint: "Spherical myope, −2.00 DS",
    patient: { sphere: -2, cylinder: 0, axis: 180 },
    correction: { sphere: 0, cylinder: 0, axis: 180 },
  },
  {
    id: "sma",
    name: "Simple myopic",
    hint: "WTR astigmatism, one line on the retina",
    patient: { sphere: 0, cylinder: -1.5, axis: 180 },
    correction: { sphere: 0, cylinder: 0, axis: 180 },
  },
  {
    id: "cma",
    name: "Compound myopic",
    hint: "Both lines in front of the retina",
    patient: { sphere: -1.5, cylinder: -1, axis: 180 },
    correction: { sphere: -1.5, cylinder: 0, axis: 180 },
  },
  {
    id: "mixed",
    name: "Mixed",
    hint: "One line either side — COLC on the retina if SE is plano",
    patient: { sphere: 0.75, cylinder: -2, axis: 45 },
    correction: { sphere: 0, cylinder: 0, axis: 45 },
  },
  {
    id: "cha",
    name: "Compound hyperopic",
    hint: "Both lines behind the retina",
    patient: { sphere: 1.5, cylinder: -1, axis: 90 },
    correction: { sphere: 0, cylinder: 0, axis: 90 },
  },
  {
    id: "axis-off",
    name: "Axis error",
    hint: "Power is right, axis is 20° off — try JCC axis",
    patient: { sphere: -1, cylinder: -2, axis: 180 },
    correction: { sphere: -1, cylinder: -2, axis: 160 },
  },
  {
    id: "power-off",
    name: "Power error",
    hint: "Axis is right, cylinder is 0.75 D short — try JCC power",
    patient: { sphere: -1, cylinder: -1.5, axis: 90 },
    correction: { sphere: -1, cylinder: -0.75, axis: 90 },
  },
];

type Fields = "patient" | "correction";

type WorkbenchState = {
  patient: Rx;
  correction: Rx;
  jccMode: JccMode;
  jccPower: number;
  jccFlip: 0 | 1;
  holdSe: boolean;
  showGuide: boolean;
  activePreset: string | null;
  setSphere: (which: Fields, next: number) => void;
  setCylinder: (which: Fields, next: number) => void;
  setAxis: (which: Fields, next: number) => void;
  setJccMode: (mode: JccMode) => void;
  setJccPower: (p: number) => void;
  flipJcc: () => void;
  setJccFlip: (f: 0 | 1) => void;
  setHoldSe: (v: boolean) => void;
  setShowGuide: (v: boolean) => void;
  applyPreset: (id: string) => void;
  matchPatient: () => void;
  zeroCorrection: () => void;
};

function boundRx(rx: Rx): Rx {
  return {
    sphere: clamp(snapQuarter(rx.sphere), SPHERE_MIN, SPHERE_MAX),
    cylinder: clamp(snapQuarter(rx.cylinder), CYL_MIN, CYL_MAX),
    axis: snapAxis(rx.axis),
  };
}

export const useWorkbench = create<WorkbenchState>((set, get) => ({
  patient: { sphere: -1, cylinder: -2, axis: 180 },
  correction: { sphere: -1, cylinder: -2, axis: 160 },
  jccMode: "axis",
  jccPower: 0.25,
  jccFlip: 0,
  holdSe: true,
  showGuide: false,
  activePreset: "axis-off",

  setSphere: (which, next) =>
    set({
      [which]: boundRx({ ...get()[which], sphere: next }),
      activePreset: null,
    }),

  setCylinder: (which, next) => {
    const cur = get()[which];
    const cylinder = clamp(snapQuarter(next), CYL_MIN, CYL_MAX);
    let sphere = cur.sphere;
    if (which === "correction" && get().holdSe) {
      const se = sphericalEquivalent(cur);
      sphere = snapQuarter(se - cylinder / 2);
    }
    set({
      [which]: boundRx({ ...cur, sphere, cylinder }),
      activePreset: null,
    });
  },

  setAxis: (which, next) =>
    set({
      [which]: boundRx({ ...get()[which], axis: next }),
      activePreset: null,
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
      jccFlip: 0,
    });
  },

  matchPatient: () =>
    set({
      correction: { ...get().patient },
      activePreset: null,
    }),

  zeroCorrection: () =>
    set({
      correction: { sphere: 0, cylinder: 0, axis: 180 },
      activePreset: null,
    }),
}));
