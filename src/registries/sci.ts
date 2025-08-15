import type { UnitMap } from "../types";

export interface SciUnitDef {
  dims: UnitMap; // dimensional basis (e.g., { m: 1, s: -2 })
  factor: number; // scale to base units of same dims
  aliases?: string[];
}

const sciUnits = new Map<string, SciUnitDef>();

export function registerSciUnit(name: string, def: SciUnitDef) {
  sciUnits.set(name, { ...def, aliases: def.aliases ?? [] });
  for (const a of def.aliases ?? []) sciUnits.set(a, { ...def, aliases: [name, ...(def.aliases ?? [])] });
}

export function getSciUnit(name: string): SciUnitDef | undefined {
  return sciUnits.get(name);
}

// Minimal base units (SI) as placeholders
registerSciUnit("m", { dims: { m: 1 }, factor: 1 });
registerSciUnit("s", { dims: { s: 1 }, factor: 1 });
registerSciUnit("kg", { dims: { kg: 1 }, factor: 1 });

// v0.1: Conversion not implemented; placeholder to extend later
export function canConvertSci(_: UnitMap, __: UnitMap): boolean {
  return false;
}

