// Placeholder for symbolic number registry (v0.4+)
export interface SymNumDef {
  latex?: string;
  approx?: number;
}

const symNums = new Map<string, SymNumDef>();

export function registerSymNum(name: string, def: SymNumDef) {
  symNums.set(name, def);
}

export function getSymNum(name: string): SymNumDef | undefined {
  return symNums.get(name);
}

