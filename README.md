# ratmath-units

Unit-augmented rational math library in TypeScript. Designed to pair with a Rational math core (e.g., RatMath) and provide unit-aware arithmetic across scientific, algebraic, and symbolic factors.

- ESM-first; works in Bun, Node (>=18), and browsers.
- Bun test runner for fast local testing.
- v0.1 focuses on scientific units and basic arithmetic; conversion and algebraic/symbolic simplification come later.

## Install

This repo is scaffolded for development with Bun and TypeScript. Build emits ESM and type declarations.

## Usage (dev via Bun)

```ts
import { Unit } from "./src"; // from package consumers: import { Unit } from "ratmath-units";

const a = Unit.sci(2, "m");
const b = Unit.sci(3, "m");
const sum = a.add(b); // 5 m

const velocity = Unit.sci(10, "m").div(Unit.sci(2, "s")); // 5 m/s
console.log(String(velocity)); // "5 m*s^-1"
```

## Build

- Build: `bun run build` (emits to `dist/`)
- Test: `bun test`

## Notes

- Numeric core: For now Unit operates on JavaScript numbers. A future version will delegate to a Rational core (RatMath) by adapting value operations.
- Conversion: Not implemented in v0.1; structure is in place to add it.

## License

TBD

