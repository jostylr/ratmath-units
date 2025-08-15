# Unit-Augmented Rational Math Library: Design Specification

## Overview

This library augments a rational math foundation (e.g., [`ratmath`](https://github.com/jostylr/ratmath)) to support **unit-aware numbers**. The system distinguishes between **scientific/physical units** (e.g., meters, kg, m/s²), **algebraic units** (e.g., i, sqrt2, roots), and **symbolic numbers** (e.g., multiples of π, e, or custom constants that do not simplify algebraically but may have useful properties).

The design emphasizes:
- Extensibility (easy to add new unit types or symbolic primitives)
- Transparent unit-aware arithmetic
- Fine-grained control over simplification (auto, manual, or step-by-step)

---

## Core Concepts

### 1. **Base Number**
All values are built atop a **rational number** (from the underlying library). This may be also rational intervals or integers, but that should not matter.

### 2. **Units**

#### a. Scientific Units (sciUnit)
- SI, imperial, derived, or user-defined physical units (e.g., m, kg, s, J).
- Have a dimensional basis (e.g., J = kg·m²/s²).
- May have conversion rules and scaling factors.

#### b. Algebraic Units (algUnit)
- Algebraic roots, imaginary units, or other mathematical primitives (e.g., i, sqrt2, φ).
- Governed by minimal polynomials (e.g., i² + 1 = 0) and explicit algebraic rules.

#### c. Symbolic Numbers / Non-Algebraic Primitives
- Constants such as π, e, γ, or user-defined numbers.
- Not subject to algebraic simplification, but can have known identities or properties (e.g., sin(π) = 0 ).
- **Registry** stores metadata, representations, and optional evaluation approximations. Conceptually these are different from algebraic units in many respects, but they will be treated in the same registry pf units.

---

## Internal Representation

### 1. **Unit Exponent Objects**
- Units are represented as **objects** mapping names to exponents:
  ```js
  // Example: m²/s, i, and sqrt2
  sci: { m: 2, s: -1 }
  alg: { i: 1, sqrt2: 1 }  //i*sqrt(2)
  symb: {pi: 2}  // pi^2
  ```

### 2. **Registries**
- **Scientific Unit Registry (`sciUnitRegistry`)**
  - Conversion factors, canonical representations, metadata
  - Registration API: `Unit.registerSciUnit("lightyear", { m: 1 }, factor)`
- **Algebraic Unit Registry (`algUnitRegistry`)**
  - Name, minimal polynomial, rules for simplification/conjugation
  - Registration API: `Unit.registerAlgUnit("phi", "x^2-x-1", rules)`
- **Symbolic Number Registry (`symNumRegistry`)**
  - Name, metadata, display rules, evaluation approximations (e.g., π ≈ 3.14159)
  - Registration API: `Unit.registerSymNum("pi", { latex: "\\pi" })`

---

## API & User Interface

### 1. **Construction**
```js
let a = Unit(Rational("3/4"), { sci: "m", alg: null, sym: null }); // 3/4 meters
let b = Unit(Rational("2"), { alg: "i" }); // 2i
let c = Unit(Rational("1"), { sym: "pi" }); // π
```
**Convenience methods:**
- `Unit.sci(x, "m^2/s")`
- `Unit.alg(x, "i*sqrt2")`
- `Unit.sym(x, "pi")`
- Or mixed: `Unit(Rational("2"), { sci: "m", alg: "i", sym: "pi" })`

### 2. **Arithmetic**
- `.add()`, `.sub()`, `.mul()`, `.div()`, `.pow()`
- Unit arithmetic respects compatibility:
  - Addition/Subtraction: All scientifc units and primitives must match exactly (otherwise throw). For algebraic units, different units should lead a more complex structure,
  - Multiplication/Division: Combine exponents for units
  - Algebraic simplification invoked according to registry rules.
- **Example:**
  ```js
  Unit.sci(Rational("2"), "m").add(Unit.sci(Rational("3"), "m")); // 5 m
  Unit.alg(Rational("1"), "i").mul(Unit.alg(Rational("1"), "i")); // -1 (auto-simplifies)
  Unit.sym(Rational("2"), "pi").add(Unit.sym(Rational("3"), "pi")); // 5π
  ```

### 3. **Simplification Control**
- **Default:** All operations attempt to simplify units and algebraic/symbolic expressions automatically.
- **Control:**
  - `Unit.setSimplifyMode("auto" | "manual" | "step")`
    - `"auto"`: Always simplify (default)
    - `"manual"`: No automatic simplification; use `.simplify()` explicitly
    - `"step"`: Expose `.simplifyStep()` for exploring intermediate stages
  - Temporarily override simplification for a block (e.g., `Unit.withoutSimplify(fn)`).

### 4. **Symbolic Number Support**
- Symbolic numbers (e.g., multiples of π) are supported alongside units:
  - All arithmetic on symbolic factors is tracked symbolically (e.g., π * π = π²)
  - No further simplification unless user provides explicit rule in registry

### 5. **Conversion**
- `.convertTo(targetUnit)`: Converts scientific units to another compatible form using the registry
- Symbolic and algebraic units are not convertible (unless explicitly allowed)

### 6. **Proxying and Delegation**
- All methods of underlying rational numbers are proxied when units cancel (unitless)
- `.valueOf()`, `.toString()`, and all numeric operations behave as expected

### 7. **Extensibility**
- **Add new scientific units:** `Unit.registerSciUnit(...)`
- **Add new algebraic units:** `Unit.registerAlgUnit(...)`
- **Add new symbolic numbers:** `Unit.registerSymNum(...)`

---

## Examples

```js
let x = Rational("3/4");
let y = Rational("5/2");

let a = Unit.sci(x, "m");        // 3/4 m
let b = Unit.sci(y, "m");        // 5/2 m
let c = Unit.sci(y, "s");        // 5/2 s

let sum = a.add(b);              // 13/4 m (allowed)
let fail = a.add(c);             // Error: incompatible units

let prod = a.mul(c);             // (3/4 * 5/2) m*s

let d = Unit.alg(Rational("2"), "i");      // 2i
let e = Unit.alg(Rational("3"), "i");      // 3i
let sum2 = d.add(e);                      // 5i
let prod2 = d.mul(e);                     // -6 (since i*i = -1)

let f = Unit.sym(Rational("1"), "pi");     // π
let g = Unit.sym(Rational("2"), "pi");     // 2π
let sum3 = f.add(g);                      // 3π
let prod3 = g.mul(g);                     // 4π²
```

### **Disabling Auto-Simplification**
```js
Unit.setSimplifyMode("manual");

let h = Unit.alg(Rational("1"), "i").mul(Unit.alg(Rational("1"), "i"));
// h is i^2, not simplified
h.simplify();  // Now returns -1

Unit.setSimplifyMode("auto"); // Reset
```

### **Step-by-Step Simplification**
```js
Unit.setSimplifyMode("step");

let expr = Unit.alg(Rational("1"), "i").mul(Unit.alg(Rational("1"), "i"));
// expr is i^2, exposes .simplifyStep()
let step1 = expr.simplifyStep(); // Applies minimal polynomial for i
// ... further steps as needed
```

---

## Internals & Registry API

### **Unit Registration**
```js
Unit.registerSciUnit("lightyear", { m: 1 }, 9.4607e15); // meters
Unit.registerAlgUnit("phi", "x^2-x-1", rules);
Unit.registerSymNum("pi", { latex: "\\pi", approx: 3.14159 });
```

### **Internal Representation Example**
```js
{
  value: Rational("2"),
  sci: { m: 1, s: -2 },   // scientific units
  alg: { i: 1 },          // algebraic units
  sym: { pi: 2 },         // symbolic numbers
  // Metadata, registry links, etc.
}
```

---

## Design Summary Table

| **Aspect**            | **Design Decision**                                                            |
|-----------------------|--------------------------------------------------------------------------------|
| Unit Types            | Separate: Scientific, Algebraic, Symbolic                                      |
| Registries            | Distinct: sciUnitRegistry, algUnitRegistry, symNumRegistry                     |
| Representation        | Object with rational value, sci/alg/sym exponent maps                          |
| User Construction     | Factory: `Unit.sci`, `Unit.alg`, `Unit.sym`, or combined                       |
| Arithmetic            | Standard + rules for each type; error on incompatible adds                     |
| Simplification        | Default auto; switchable to manual/step-by-step                                |
| Symbolic Numbers      | Registry-driven, always tracked symbolically                                   |
| Conversion            | Only for scientific units (via registry)                                       |
| Extensibility         | Register new sci/alg/sym types at runtime                                      |
| Delegation            | To underlying rational number if unitless                                      |

---

## Implementation Outline

1. **Tokenization/Parsing**
   - Parse unit strings into `{ m: 1, s: -2 }`, `{ i: 1 }`, `{ pi: 2 }`, etc.

2. **Registry Management**
   - Register sci, alg, and sym types and their rules.

3. **Arithmetic Engine**
   - Implement add, mul, etc. with appropriate compatibility checks and unit algebra. Should implement the methods of ratmath-api.md as a pass-through. Namely, object should have the number and the units. This should be responsible for checking that the operation is compatible with the units and then the underlying number operation should apply. This is responsible for generating the appropriate units.

4. **Simplification Logic**
   - Default auto, but allow manual or step-by-step as per global or context-local setting.

5. **Proxy Layer**
   - Delegate methods to rational value where appropriate.

6. **Conversion Mechanism**
   - Use sciUnitRegistry for converting between scientific units.

---

## Future Directions

- Step-by-step algebraic simplification for educational tooling.
- Pattern-matching and identity handling for symbolic numbers.
- Rich display modes (e.g., LaTeX formatting, unicode).

