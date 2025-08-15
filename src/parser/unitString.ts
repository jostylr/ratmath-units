import type { UnitMap } from "../types";

// Very small parser for strings like: "m^2/s*kg" or "m*s^-2"
export function parseUnitString(s?: string | null): UnitMap {
  const out: UnitMap = {};
  if (!s) return out;
  const input = s.replace(/\s+/g, "");
  if (input === "") return out;

  // Tokenize by * and /, keeping operator as sign for exponent
  let sign = 1; // 1 for numerator, -1 for denominator
  let i = 0;
  while (i < input.length) {
    const ch = input[i];
    if (ch === "*") {
      sign = 1;
      i++;
      continue;
    }
    if (ch === "/") {
      sign = -1;
      i++;
      continue;
    }
    // parse unit name [a-zA-Z_][a-zA-Z0-9_]*
    const m = /[a-zA-Z_][a-zA-Z0-9_]*/.exec(input.slice(i));
    if (!m) throw new Error(`Invalid unit at index ${i} in ${s}`);
    const name = m[0];
    i += name.length;
    // optional exponent ^-?\d+
    let exp = 1;
    if (input[i] === "^") {
      i++;
      const em = /^-?\d+/.exec(input.slice(i));
      if (!em) throw new Error(`Invalid exponent after ^ at index ${i} in ${s}`);
      exp = parseInt(em[0], 10);
      i += em[0].length;
    }
    out[name] = (out[name] ?? 0) + sign * exp;
    if (out[name] === 0) delete out[name];
  }
  return out;
}

