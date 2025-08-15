// Placeholder for algebraic unit registry (v0.3+)
export interface AlgUnitDef {
  minimalPolynomial: string; // e.g., "x^2+1" for i
  // Future: rules for simplification/conjugation
}

const algUnits = new Map<string, AlgUnitDef>();

export function registerAlgUnit(name: string, def: AlgUnitDef) {
  algUnits.set(name, def);
}

export function getAlgUnit(name: string): AlgUnitDef | undefined {
  return algUnits.get(name);
}

