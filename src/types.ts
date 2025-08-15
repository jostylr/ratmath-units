export type UnitMap = Record<string, number>;

export interface UnitFactors {
  sci: UnitMap;
  alg: UnitMap;
  sym: UnitMap;
}

export type SimplifyMode = "auto" | "manual" | "step";

export interface NumericAdapter<T> {
  add(a: T, b: T): T;
  sub(a: T, b: T): T;
  mul(a: T, b: T): T;
  div(a: T, b: T): T;
  pow(a: T, n: number): T; // integer powers only
}

export const NumberAdapter: NumericAdapter<number> = {
  add: (a, b) => a + b,
  sub: (a, b) => a - b,
  mul: (a, b) => a * b,
  div: (a, b) => a / b,
  pow: (a, n) => {
    if (!Number.isInteger(n)) throw new Error("Exponent must be integer");
    return a ** n;
  },
};

export function cloneMap(m: UnitMap): UnitMap {
  return Object.fromEntries(Object.entries(m).filter(([, exp]) => exp !== 0));
}

export function addMaps(a: UnitMap, b: UnitMap): UnitMap {
  const out: UnitMap = { ...a };
  for (const [k, v] of Object.entries(b)) out[k] = (out[k] ?? 0) + v;
  for (const k of Object.keys(out)) if (out[k] === 0) delete out[k];
  return out;
}

export function scaleMap(a: UnitMap, s: number): UnitMap {
  const out: UnitMap = {};
  for (const [k, v] of Object.entries(a)) {
    const nv = v * s;
    if (!Number.isFinite(nv)) throw new Error("Non-finite unit exponent");
    if (nv !== 0) out[k] = nv;
  }
  return out;
}

export function mapsEqual(a: UnitMap, b: UnitMap): boolean {
  const ak = Object.keys(a).sort();
  const bk = Object.keys(b).sort();
  if (ak.length !== bk.length) return false;
  return ak.every((k, i) => k === bk[i] && a[k] === b[k]);
}

