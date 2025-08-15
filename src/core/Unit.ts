import { NumberAdapter, addMaps, cloneMap, mapsEqual, scaleMap } from "../types";
import type { NumericAdapter, SimplifyMode, UnitMap, UnitFactors } from "../types";
import { parseUnitString } from "../parser/unitString";

export class Unit<T = number> {
  readonly value: T;
  readonly sci: UnitMap;
  readonly alg: UnitMap;
  readonly sym: UnitMap;

  private static simplifyMode: SimplifyMode = "auto";
  private static adapter: NumericAdapter<any> = NumberAdapter;

  constructor(value: T, factors?: Partial<UnitFactors>) {
    this.value = value;
    this.sci = cloneMap(factors?.sci ?? {});
    this.alg = cloneMap(factors?.alg ?? {});
    this.sym = cloneMap(factors?.sym ?? {});
  }

  // Global settings
  static setSimplifyMode(mode: SimplifyMode) {
    this.simplifyMode = mode;
  }

  static getSimplifyMode(): SimplifyMode {
    return this.simplifyMode;
  }

  static setNumericAdapter(adapter: NumericAdapter<any>) {
    this.adapter = adapter;
  }

  static sci<T = number>(value: T, unit?: string | UnitMap) {
    const sciMap = typeof unit === "string" ? parseUnitString(unit) : cloneMap(unit ?? {});
    return new Unit<T>(value, { sci: sciMap });
  }

  static alg<T = number>(value: T, unit?: string | UnitMap) {
    const algMap = typeof unit === "string" ? parseUnitString(unit) : cloneMap(unit ?? {});
    return new Unit<T>(value, { alg: algMap });
  }

  static sym<T = number>(value: T, unit?: string | UnitMap) {
    const symMap = typeof unit === "string" ? parseUnitString(unit) : cloneMap(unit ?? {});
    return new Unit<T>(value, { sym: symMap });
  }

  private assertAddCompatible(other: Unit<T>) {
    if (!mapsEqual(this.sci, other.sci) || !mapsEqual(this.alg, other.alg) || !mapsEqual(this.sym, other.sym)) {
      throw new Error("Incompatible units for addition/subtraction");
    }
  }

  add(other: Unit<T>): Unit<T> {
    this.assertAddCompatible(other);
    const v = Unit.adapter.add(this.value, other.value);
    return new Unit<T>(v, { sci: this.sci, alg: this.alg, sym: this.sym });
  }

  sub(other: Unit<T>): Unit<T> {
    this.assertAddCompatible(other);
    const v = Unit.adapter.sub(this.value, other.value);
    return new Unit<T>(v, { sci: this.sci, alg: this.alg, sym: this.sym });
  }

  mul(other: Unit<T>): Unit<T> {
    const v = Unit.adapter.mul(this.value, other.value);
    const sci = addMaps(this.sci, other.sci);
    const alg = addMaps(this.alg, other.alg);
    const sym = addMaps(this.sym, other.sym);
    return new Unit<T>(v, { sci, alg, sym });
  }

  div(other: Unit<T>): Unit<T> {
    const v = Unit.adapter.div(this.value, other.value);
    const sci = addMaps(this.sci, scaleMap(other.sci, -1));
    const alg = addMaps(this.alg, scaleMap(other.alg, -1));
    const sym = addMaps(this.sym, scaleMap(other.sym, -1));
    return new Unit<T>(v, { sci, alg, sym });
  }

  pow(n: number): Unit<T> {
    if (!Number.isInteger(n)) throw new Error("Exponent must be integer");
    if (n === 0) {
      // value^0 == 1, units^0 == unitless
      const one = Unit.adapter.div(this.value as any, this.value as any); // crude 1 for number adapter
      return new Unit<T>(one, { sci: {}, alg: {}, sym: {} });
    }
    const vpow = n >= 0 ? Unit.adapter.pow(this.value as any, Math.abs(n)) : Unit.adapter.div((1 as any), Unit.adapter.pow(this.value as any, Math.abs(n)));
    const s = scaleMap(this.sci, n);
    const a = scaleMap(this.alg, n);
    const y = scaleMap(this.sym, n);
    return new Unit<T>(vpow, { sci: s, alg: a, sym: y });
  }

  // v0.1: no conversion, only identity
  convertTo(target: string | UnitMap): Unit<T> {
    const u = typeof target === "string" ? parseUnitString(target) : target;
    if (!mapsEqual(this.sci, u)) throw new Error("Conversion not implemented (v0.1): units must match");
    return this;
  }

  isUnitless(): boolean {
    return Object.keys(this.sci).length === 0 && Object.keys(this.alg).length === 0 && Object.keys(this.sym).length === 0;
  }

  toString(): string {
    const units: string[] = [];
    const pushMap = (m: UnitMap) => {
      for (const k of Object.keys(m).sort()) {
        const e = m[k];
        units.push(e === 1 ? k : `${k}^${e}`);
      }
    };
    pushMap(this.sci);
    pushMap(this.alg);
    pushMap(this.sym);
    const unitStr = units.join("*");
    return unitStr ? `${this.value} ${unitStr}` : String(this.value);
  }
}

